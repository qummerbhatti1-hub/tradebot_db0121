import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Initialize Firebase Admin
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    // Check if it's base64 encoded
    if (!sa.trim().startsWith('{')) {
      try {
        sa = Buffer.from(sa, 'base64').toString('utf8');
      } catch (e) {
        console.warn("FIREBASE_SERVICE_ACCOUNT is not JSON and failed base64 decoding.");
      }
    }
    serviceAccount = JSON.parse(sa);
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT not found in environment. Using default credentials if available.");
  }
} catch (err) {
  console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", err);
}

let db: admin.firestore.Firestore;
try {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
    });
    console.log("Firebase Admin initialized with service account.");
  } else {
    admin.initializeApp();
    console.log("Firebase Admin initialized with default credentials.");
  }
  db = admin.firestore();
} catch (err) {
  console.error("CRITICAL: Firebase Admin initialization failed! The app will not work without Firebase credentials.");
  console.error(err);
  // Create a proxy or a dummy db object to prevent crashes on startup
  // In a real app, you'd handle this more gracefully in the routes
  db = {
    collection: () => ({
      doc: () => ({ get: () => Promise.resolve({ exists: false }), set: () => Promise.resolve(), update: () => Promise.resolve() }),
      where: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }), limit: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }) }),
      limit: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }),
      add: () => Promise.resolve({ id: "dummy" })
    }),
    runTransaction: () => Promise.resolve(),
    batch: () => ({ delete: () => {}, commit: () => Promise.resolve() })
  } as any;
}

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Seed initial packages if empty
const seedDatabase = async () => {
  try {
    const packagesRef = db.collection("packages");
    const snapshot = await packagesRef.limit(1).get();
    
    if (snapshot.empty) {
      console.log("Seeding initial packages...");
      await packagesRef.add({ name: "Basic Plan", min_amount: 10, duration_days: 7, daily_profit_percent: 2, active: 1 });
      await packagesRef.add({ name: "Premium Plan", min_amount: 50, duration_days: 14, daily_profit_percent: 3, active: 1 });
    }

    // Seed admin if not exists
    const adminRef = db.collection("users").where("role", "==", "admin");
    const adminSnapshot = await adminRef.limit(1).get();
    
    if (adminSnapshot.empty) {
      console.log("Seeding admin user...");
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      await db.collection("users").add({
        name: "Admin",
        email: "admin@tradebot.com",
        password: hashedPassword,
        role: "admin",
        referral_code: "ADMIN001",
        balance: 0,
        notification_settings: {
          email_profit: true,
          email_trade: true,
          email_system: true,
          push_profit: false,
          push_trade: false,
          push_system: false
        },
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
};

seedDatabase();

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    firebase: admin.apps.length > 0 ? "connected" : "disconnected",
    time: new Date().toISOString()
  });
});

// Email Configuration
console.log("Initializing Email Transporter with user:", process.env.EMAIL_USER);
if (!process.env.EMAIL_PASS) {
  console.error("EMAIL_PASS is missing from environment variables!");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim().replace(/\s/g, "") : undefined,
  },
  debug: true, // Enable debug output
  logger: true // Log information to console
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP Connection Error Details:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
};

// Profit Calculation Logic (Simplified - runs on user dashboard load)
const updateProfits = async (userId: string) => {
  const now = new Date();
  const activeInvestmentsRef = db.collection("investments")
    .where("user_id", "==", userId)
    .where("status", "==", "active");
  
  const snapshot = await activeInvestmentsRef.get();

  for (const doc of snapshot.docs) {
    const inv = { id: doc.id, ...doc.data() } as any;
    const lastCalc = inv.last_profit_calc.toDate();
    const endDate = inv.end_date.toDate();
    
    // Calculate days passed since last calculation
    const diffTime = Math.abs(now.getTime() - lastCalc.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
      const dailyProfit = inv.amount * (inv.daily_profit / 100);
      const totalProfitToAdd = dailyProfit * diffDays;

      await db.runTransaction(async (transaction) => {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data() as any;

        // Add profit to user balance
        transaction.update(userRef, { balance: userData.balance + totalProfitToAdd });
        
        // Record transaction
        const transRef = db.collection("transactions").doc();
        transaction.set(transRef, {
          user_id: userId,
          type: "profit",
          amount: totalProfitToAdd,
          description: `Daily profit from ${inv.package_id}`,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Trigger Notification (Async)
        sendNotification(userId, 'profit', 'Profit Alert!', `You have earned $${totalProfitToAdd.toFixed(2)} profit from your investment.`);

        // Update last calc date
        transaction.update(doc.ref, { last_profit_calc: admin.firestore.Timestamp.fromDate(now) });

        // Check if investment ended
        if (now >= endDate) {
          transaction.update(doc.ref, { status: "completed" });
          // Return capital
          transaction.update(userRef, { balance: userData.balance + totalProfitToAdd + inv.amount });
          
          const capitalTransRef = db.collection("transactions").doc();
          transaction.set(capitalTransRef, {
            user_id: userId,
            type: "capital_return",
            amount: inv.amount,
            description: `Capital return from ${inv.package_id}`,
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    }
  }
};

// Helper to sanitize Firestore data for client
const sanitizeData = (data: any) => {
  const sanitized = { ...data };
  for (const key in sanitized) {
    if (sanitized[key] instanceof admin.firestore.Timestamp) {
      sanitized[key] = sanitized[key].toDate().toISOString();
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  return sanitized;
};

// Helper to send notifications
const sendNotification = async (userId: string, type: 'profit' | 'trade' | 'system', subject: string, message: string) => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return;
    const userData = userDoc.data() as any;
    const settings = userData.notification_settings || {
      email_profit: true, email_trade: true, email_system: true,
      push_profit: false, push_trade: false, push_system: false
    };

    // Email Notification
    if (settings[`email_${type}`]) {
      await transporter.sendMail({
        from: `"TradeBot Notifications" <${process.env.EMAIL_USER}>`,
        to: userData.email,
        subject: subject,
        text: message,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #0a0a0a; color: white; border-radius: 10px;">
            <h2 style="color: #fbbf24;">${subject}</h2>
            <p>${message}</p>
            <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="color: #71717a; font-size: 12px;">You received this because of your notification settings. You can change them in your profile.</p>
          </div>
        `,
      });
    }

    // Push Notification (FCM Placeholder - requires device tokens)
    if (settings[`push_${type}`] && userData.fcm_token) {
      const pushMessage = {
        notification: { title: subject, body: message },
        token: userData.fcm_token
      };
      await admin.messaging().send(pushMessage);
    }
  } catch (err) {
    console.error("Notification Error:", err);
  }
};

// --- AUTH ROUTES ---
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Delete old OTPs for this email
    const otpsRef = db.collection("otps").where("email", "==", email);
    const snapshot = await otpsRef.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // Store new OTP
    await db.collection("otps").add({
      email,
      otp,
      expires_at: admin.firestore.Timestamp.fromDate(expiresAt),
      verified: 0
    });

    // Send Email
    await transporter.sendMail({
      from: `"TradeBot Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Registration OTP",
      text: `Your OTP for registration is: ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0a0a0a; color: white; border-radius: 10px;">
          <h2 style="color: #fbbf24;">Email Verification</h2>
          <p>Your OTP for registration is:</p>
          <div style="font-size: 32px; font-bold; letter-spacing: 5px; color: #fbbf24; margin: 20px 0;">${otp}</div>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #71717a; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err: any) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send OTP. Please check email configuration." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, referralCode, otp } = req.body;

  try {
    // Verify OTP
    const otpRef = db.collection("otps")
      .where("email", "==", email)
      .where("otp", "==", otp)
      .where("expires_at", ">", admin.firestore.Timestamp.now());
    
    const otpSnapshot = await otpRef.get();
    if (otpSnapshot.empty) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Check if user exists
    const userRef = db.collection("users").where("email", "==", email);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = {
      name,
      email,
      password: hashedPassword,
      referral_code: myReferralCode,
      referred_by: referralCode || null,
      role: "user",
      balance: 0,
      notification_settings: {
        email_profit: true,
        email_trade: true,
        email_system: true,
        push_profit: false,
        push_trade: false,
        push_system: false
      },
      created_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("users").add(newUser);
    
    // Delete OTP after successful registration
    const batch = db.batch();
    otpSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.json({ success: true, userId: docRef.id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const userRef = db.collection("users").where("email", "==", email);
  const snapshot = await userRef.get();

  if (snapshot.empty) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const userDoc = snapshot.docs[0];
  const user = { id: userDoc.id, ...userDoc.data() } as any;

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, balance: user.balance } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// --- USER ROUTES ---
app.get("/api/user/profile", authenticate, async (req: any, res) => {
  await updateProfits(req.user.id);
  const userDoc = await db.collection("users").doc(req.user.id).get();
  if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
  const user = sanitizeData({ id: userDoc.id, ...userDoc.data() });
  delete user.password;
  res.json(user);
});

app.get("/api/user/stats", authenticate, async (req: any, res) => {
  const investmentsRef = db.collection("investments").where("user_id", "==", req.user.id).where("status", "==", "active");
  const investmentsSnapshot = await investmentsRef.get();
  let activeInvestment = 0;
  investmentsSnapshot.forEach(doc => activeInvestment += doc.data().amount);

  const transactionsRef = db.collection("transactions").where("user_id", "==", req.user.id);
  const transactionsSnapshot = await transactionsRef.get();
  let totalProfit = 0;
  let referralBonus = 0;
  
  transactionsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.type === "profit") totalProfit += data.amount;
    if (data.type === "referral") referralBonus += data.amount;
  });

  res.json({
    activeInvestment,
    totalProfit,
    referralBonus
  });
});

app.get("/api/packages", authenticate, async (req, res) => {
  const packagesRef = db.collection("packages").where("active", "==", 1);
  const snapshot = await packagesRef.get();
  const packages = snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }));
  res.json(packages);
});

app.post("/api/invest", authenticate, async (req: any, res) => {
  const { packageId, amount } = req.body;
  
  try {
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection("users").doc(req.user.id);
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data() as any;

      const pkgRef = db.collection("packages").doc(packageId);
      const pkgDoc = await transaction.get(pkgRef);
      const pkgData = pkgDoc.data() as any;

      if (!pkgDoc.exists) throw new Error("Package not found");
      if (amount < pkgData.min_amount) throw new Error(`Minimum amount is $${pkgData.min_amount}`);
      if (userData.balance < amount) throw new Error("Insufficient balance");

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + pkgData.duration_days);

      // Deduct balance
      transaction.update(userRef, { balance: userData.balance - amount });

      // Create investment
      const invRef = db.collection("investments").doc();
      transaction.set(invRef, {
        user_id: req.user.id,
        package_id: packageId,
        amount: amount,
        daily_profit: pkgData.daily_profit_percent,
        start_date: admin.firestore.FieldValue.serverTimestamp(),
        end_date: admin.firestore.Timestamp.fromDate(endDate),
        last_profit_calc: admin.firestore.FieldValue.serverTimestamp(),
        status: "active"
      });

      // Record transaction
      const transRef = db.collection("transactions").doc();
      transaction.set(transRef, {
        user_id: req.user.id,
        type: "investment",
        amount: amount,
        description: `Investment in ${pkgData.name}`,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Trigger Notification (Async)
      sendNotification(req.user.id, 'trade', 'New Investment!', `You have successfully invested $${amount} in the ${pkgData.name}.`);

      // Referral Bonus (5%)
      if (userData.referred_by) {
        const referrersRef = db.collection("users").where("referral_code", "==", userData.referred_by);
        const referrerSnapshot = await transaction.get(referrersRef);
        
        if (!referrerSnapshot.empty) {
          const referrerDoc = referrerSnapshot.docs[0];
          const referrerData = referrerDoc.data() as any;
          const bonus = amount * 0.05;
          
          transaction.update(referrerDoc.ref, { balance: referrerData.balance + bonus });
          
          const bonusTransRef = db.collection("transactions").doc();
          transaction.set(bonusTransRef, {
            user_id: referrerDoc.id,
            type: "referral",
            amount: bonus,
            description: `Referral bonus from user ID ${req.user.id}`,
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/deposit", authenticate, async (req: any, res) => {
  const { amount, method, proofImg } = req.body;
  await db.collection("deposits").add({
    user_id: req.user.id,
    amount,
    method,
    proof_img: proofImg,
    status: "pending",
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });
  res.json({ success: true });
});

app.post("/api/withdraw", authenticate, async (req: any, res) => {
  const { amount, method, accountDetails } = req.body;
  
  try {
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection("users").doc(req.user.id);
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data() as any;

      if (userData.balance < amount) throw new Error("Insufficient balance");
      if (amount < 10) throw new Error("Minimum withdrawal is $10");

      transaction.update(userRef, { balance: userData.balance - amount });
      
      const withdrawRef = db.collection("withdrawals").doc();
      transaction.set(withdrawRef, {
        user_id: req.user.id,
        amount,
        method,
        account_details: accountDetails,
        status: "pending",
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/user/deposits", authenticate, async (req: any, res) => {
  const snapshot = await db.collection("deposits")
    .where("user_id", "==", req.user.id)
    .orderBy("created_at", "desc")
    .get();
  const deposits = snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }));
  res.json(deposits);
});

app.get("/api/user/withdrawals", authenticate, async (req: any, res) => {
  const snapshot = await db.collection("withdrawals")
    .where("user_id", "==", req.user.id)
    .orderBy("created_at", "desc")
    .get();
  const withdrawals = snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }));
  res.json(withdrawals);
});

app.get("/api/transactions", authenticate, async (req: any, res) => {
  const transactionsRef = db.collection("transactions")
    .where("user_id", "==", req.user.id)
    .orderBy("created_at", "desc");
  const snapshot = await transactionsRef.get();
  const transactions = snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }));
  res.json(transactions);
});

app.get("/api/user/notifications/settings", authenticate, async (req: any, res) => {
  const userDoc = await db.collection("users").doc(req.user.id).get();
  if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
  const data = userDoc.data() as any;
  res.json(data.notification_settings || {
    email_profit: true, email_trade: true, email_system: true,
    push_profit: false, push_trade: false, push_system: false
  });
});

app.put("/api/user/notifications/settings", authenticate, async (req: any, res) => {
  const settings = req.body;
  await db.collection("users").doc(req.user.id).update({ notification_settings: settings });
  res.json({ success: true });
});

// --- ADMIN ROUTES ---
app.get("/api/admin/stats", authenticate, isAdmin, async (req, res) => {
  const usersSnapshot = await db.collection("users").where("role", "==", "user").get();
  const depositsSnapshot = await db.collection("deposits").where("status", "==", "approved").get();
  const withdrawalsSnapshot = await db.collection("withdrawals").where("status", "==", "approved").get();
  const investmentsSnapshot = await db.collection("investments").where("status", "==", "active").get();

  let totalDeposits = 0;
  depositsSnapshot.forEach(doc => totalDeposits += doc.data().amount);

  let totalWithdrawals = 0;
  withdrawalsSnapshot.forEach(doc => totalWithdrawals += doc.data().amount);

  let activeInvestments = 0;
  investmentsSnapshot.forEach(doc => activeInvestments += doc.data().amount);

  res.json({
    totalUsers: usersSnapshot.size,
    totalDeposits,
    totalWithdrawals,
    activeInvestments
  });
});

app.get("/api/admin/users", authenticate, isAdmin, async (req, res) => {
  const snapshot = await db.collection("users").get();
  const users = snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }));
  res.json(users);
});

app.get("/api/admin/deposits", authenticate, isAdmin, async (req, res) => {
  const snapshot = await db.collection("deposits").orderBy("created_at", "desc").get();
  const deposits = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const userDoc = await db.collection("users").doc(data.user_id).get();
    deposits.push(sanitizeData({ id: doc.id, ...data, user_name: userDoc.exists ? (userDoc.data() as any).name : "Unknown" }));
  }
  res.json(deposits);
});

app.post("/api/admin/deposits/:id/approve", authenticate, isAdmin, async (req, res) => {
  try {
    await db.runTransaction(async (transaction) => {
      const depositRef = db.collection("deposits").doc(req.params.id);
      const depositDoc = await transaction.get(depositRef);
      const depositData = depositDoc.data() as any;

      if (!depositDoc.exists || depositData.status !== 'pending') throw new Error("Invalid deposit");

      const userRef = db.collection("users").doc(depositData.user_id);
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data() as any;

      transaction.update(depositRef, { status: 'approved' });
      transaction.update(userRef, { balance: userData.balance + depositData.amount });
      
      const transRef = db.collection("transactions").doc();
      transaction.set(transRef, {
        user_id: depositData.user_id,
        type: 'deposit',
        amount: depositData.amount,
        description: "Deposit approved",
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Trigger Notification (Async)
      sendNotification(depositData.user_id, 'system', 'Deposit Approved!', `Your deposit of $${depositData.amount} has been approved and added to your balance.`);
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/admin/deposits/:id/reject", authenticate, isAdmin, async (req, res) => {
  await db.collection("deposits").doc(req.params.id).update({ status: 'rejected' });
  res.json({ success: true });
});

app.get("/api/admin/withdrawals", authenticate, isAdmin, async (req, res) => {
  const snapshot = await db.collection("withdrawals").orderBy("created_at", "desc").get();
  const withdrawals = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const userDoc = await db.collection("users").doc(data.user_id).get();
    withdrawals.push(sanitizeData({ id: doc.id, ...data, user_name: userDoc.exists ? (userDoc.data() as any).name : "Unknown" }));
  }
  res.json(withdrawals);
});

app.post("/api/admin/withdrawals/:id/approve", authenticate, isAdmin, async (req, res) => {
  await db.collection("withdrawals").doc(req.params.id).update({ status: 'approved' });
  res.json({ success: true });
});

app.post("/api/admin/withdrawals/:id/reject", authenticate, isAdmin, async (req, res) => {
  try {
    await db.runTransaction(async (transaction) => {
      const withdrawalRef = db.collection("withdrawals").doc(req.params.id);
      const withdrawalDoc = await transaction.get(withdrawalRef);
      const withdrawalData = withdrawalDoc.data() as any;

      if (!withdrawalDoc.exists || withdrawalData.status !== 'pending') throw new Error("Invalid withdrawal");

      const userRef = db.collection("users").doc(withdrawalData.user_id);
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data() as any;

      transaction.update(withdrawalRef, { status: 'rejected' });
      transaction.update(userRef, { balance: userData.balance + withdrawalData.amount });
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/admin/packages", authenticate, isAdmin, async (req, res) => {
  const snapshot = await db.collection("packages").get();
  const packages = snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }));
  res.json(packages);
});

app.post("/api/admin/packages", authenticate, isAdmin, async (req, res) => {
  const { name, min_amount, duration_days, daily_profit_percent } = req.body;
  const docRef = await db.collection("packages").add({
    name,
    min_amount,
    duration_days,
    daily_profit_percent,
    active: 1
  });
  res.json({ success: true, id: docRef.id });
});

app.put("/api/admin/packages/:id", authenticate, isAdmin, async (req, res) => {
  const { name, min_amount, duration_days, daily_profit_percent, active } = req.body;
  await db.collection("packages").doc(req.params.id).update({
    name,
    min_amount,
    duration_days,
    daily_profit_percent,
    active
  });
  res.json({ success: true });
});

app.delete("/api/admin/packages/:id", authenticate, isAdmin, async (req, res) => {
  const pkgRef = db.collection("packages").doc(req.params.id);
  const pkgDoc = await pkgRef.get();
  if (!pkgDoc.exists) return res.status(404).json({ error: "Package not found" });
  const data = pkgDoc.data() as any;
  const newStatus = data.active === 1 ? 0 : 1;
  await pkgRef.update({ active: newStatus });
  res.json({ success: true, active: newStatus });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer();
