const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const admin = require("../config/firebaseAdmin");

// ============================================================
// JWT
// ============================================================

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ============================================================
// EMAIL TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// ============================================================
// GENERATE OTP
// ============================================================

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================================
// SEND EMAIL OTP
// ============================================================

const sendEmailOtp = async (
  email,
  otp,
  subject = "CleanCRAVE Email Verification"
) => {
  await transporter.sendMail({
    from: `"CleanCRAVE" <${process.env.EMAIL_USER}>`,
    to: email,

    subject,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        background: #f7f8f5;
      ">

        <div style="
          background: white;
          border-radius: 20px;
          padding: 30px;
          text-align: center;
        ">

          <h1 style="
            color: #16a34a;
            margin-bottom: 10px;
          ">
            CleanCRAVE
          </h1>

          <p style="
            color: #555;
            font-size: 16px;
          ">
            Your verification code is:
          </p>

          <div style="
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #111;
            margin: 25px 0;
          ">
            ${otp}
          </div>

          <p style="
            color: #777;
            font-size: 14px;
          ">
            This OTP will expire in 10 minutes.
          </p>

          <p style="
            color: #999;
            font-size: 12px;
            margin-top: 25px;
          ">
            If you did not request this code, you can safely ignore this email.
          </p>

        </div>

      </div>
    `,
  });
};

// ============================================================
// USER RESPONSE
// ============================================================

const getUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,

    // Kept for compatibility with existing users.
    phone: user.phone,

    age: user.age,
    gender: user.gender,
    height: user.height,
    weight: user.weight,

    activityLevel: user.activityLevel,
    foodPreference: user.foodPreference,
    goal: user.goal,
    dailyBudget: user.dailyBudget,

    role: user.role,

    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,

    authProvider: user.authProvider,
  };
};

// ============================================================
// REGISTER USER
//
// Registration flow:
//
// 1. User submits registration form.
// 2. Account is created with emailVerified = false.
// 3. Email OTP is sent.
// 4. User verifies OTP.
// 5. JWT is generated after verification.
// ============================================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      height,
      weight,
      activityLevel,
      foodPreference,
      goal,
      dailyBudget,
    } = req.body;

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ----------------------------------------------------------
    // EMAIL VALIDATION
    // ----------------------------------------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    // ----------------------------------------------------------
    // PASSWORD VALIDATION
    // ----------------------------------------------------------

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters.",
      });
    }

    // ----------------------------------------------------------
    // CHECK EXISTING EMAIL
    // ----------------------------------------------------------

    const existingEmail = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "An account with this email already exists.",
      });
    }

    // ----------------------------------------------------------
    // HASH PASSWORD
    // ----------------------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // ----------------------------------------------------------
    // GENERATE REGISTRATION OTP
    // ----------------------------------------------------------

    const otp = generateOtp();

    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ----------------------------------------------------------
    // CREATE USER
    // ----------------------------------------------------------

    const user = await User.create({
      name: name.trim(),

      email: cleanEmail,

      password: hashedPassword,

      age:
        age !== undefined
          ? Number(age)
          : undefined,

      gender,

      height:
        height !== undefined
          ? Number(height)
          : undefined,

      weight:
        weight !== undefined
          ? Number(weight)
          : undefined,

      activityLevel,

      foodPreference,

      goal,

      dailyBudget:
        dailyBudget !== undefined
          ? Number(dailyBudget)
          : 300,

      role: "user",

      emailVerified: false,

      phoneVerified: false,

      emailOtp: otp,

      emailOtpExpires: otpExpires,

      emailOtpAttempts: 0,

      authProvider: "password",
    });

    // ----------------------------------------------------------
    // SEND REGISTRATION EMAIL OTP
    // ----------------------------------------------------------

    try {
      await sendEmailOtp(
        cleanEmail,
        otp,
        "Verify your CleanCRAVE account"
      );
    } catch (emailError) {
      console.error(
        "EMAIL OTP ERROR:",
        emailError
      );

      // Delete incomplete account if email cannot be sent.
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        message:
          "We could not send the verification email. Please check the email configuration and try again.",
      });
    }

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(201).json({
      success: true,

      requiresEmailVerification: true,

      message:
        "Registration successful. Please verify your email using the OTP sent to your Gmail.",

      email: user.email,
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message:
        "Server error during registration.",
    });
  }
};

// ============================================================
// VERIFY REGISTRATION EMAIL
// ============================================================

const verifyRegistrationEmail = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message:
          "Email and OTP are required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (!user) {
      return res.status(404).json({
        message:
          "Account not found.",
      });
    }

    // ----------------------------------------------------------
    // ALREADY VERIFIED
    // ----------------------------------------------------------

    if (user.emailVerified) {
      const token =
        generateToken(user);

      return res.status(200).json({
        success: true,

        message:
          "Email is already verified.",

        token,

        user:
          getUserResponse(user),
      });
    }

    // ----------------------------------------------------------
    // OTP ATTEMPTS
    // ----------------------------------------------------------

    if (
      user.emailOtpAttempts >= 5
    ) {
      return res.status(429).json({
        message:
          "Too many incorrect OTP attempts. Please request a new OTP.",
      });
    }

    // ----------------------------------------------------------
    // OTP EXPIRATION
    // ----------------------------------------------------------

    if (
      !user.emailOtpExpires ||
      user.emailOtpExpires < new Date()
    ) {
      return res.status(400).json({
        message:
          "This OTP has expired. Please request a new OTP.",
      });
    }

    // ----------------------------------------------------------
    // OTP VALIDATION
    // ----------------------------------------------------------

    if (
      user.emailOtp !== otp.trim()
    ) {
      user.emailOtpAttempts += 1;

      await user.save();

      return res.status(400).json({
        message:
          "Incorrect OTP. Please check your email and try again.",
      });
    }

    // ----------------------------------------------------------
    // EMAIL VERIFIED
    // ----------------------------------------------------------

    user.emailVerified = true;

    user.emailOtp = "";

    user.emailOtpExpires = null;

    user.emailOtpAttempts = 0;

    await user.save();

    // ----------------------------------------------------------
    // GENERATE JWT
    // ----------------------------------------------------------

    const token =
      generateToken(user);

    return res.status(200).json({
      success: true,

      message:
        "Email verified successfully. Welcome to CleanCRAVE!",

      token,

      user:
        getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "VERIFY EMAIL ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while verifying email.",
    });
  }
};

// ============================================================
// RESEND REGISTRATION OTP
// ============================================================

const resendRegistrationOtp = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message:
          "Email is required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (!user) {
      return res.status(404).json({
        message:
          "Account not found.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message:
          "This email is already verified.",
      });
    }

    const otp =
      generateOtp();

    user.emailOtp = otp;

    user.emailOtpExpires =
      new Date(
        Date.now() + 10 * 60 * 1000
      );

    user.emailOtpAttempts = 0;

    await user.save();

    await sendEmailOtp(
      cleanEmail,
      otp,
      "Your new CleanCRAVE verification code"
    );

    return res.status(200).json({
      success: true,

      message:
        "A new verification OTP has been sent to your email.",
    });
  } catch (error) {
    console.error(
      "RESEND OTP ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to resend OTP.",
    });
  }
};

// ============================================================
// NORMAL LOGIN
//
// NORMAL USER:
// Email + password -> JWT
//
// ADMIN:
// Email + password -> Admin email OTP
//                  -> OTP verification
//                  -> JWT
// ============================================================

const loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // ----------------------------------------------------------
    // PASSWORD CHECK
    // ----------------------------------------------------------

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account does not have a password login. Please use Google login.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // ----------------------------------------------------------
    // ADMIN LOGIN
    //
    // Admin must verify email OTP before JWT is issued.
    // ----------------------------------------------------------

    if (user.role === "admin") {
      const otp = generateOtp();

      const otpExpires = new Date(
        Date.now() + 10 * 60 * 1000
      );

      user.emailOtp = otp;
      user.emailOtpExpires = otpExpires;
      user.emailOtpAttempts = 0;

      await user.save();

      try {
        await sendEmailOtp(
          user.email,
          otp,
          "CleanCRAVE Admin Login Verification Code"
        );
      } catch (emailError) {
        console.error(
          "ADMIN LOGIN EMAIL ERROR:",
          emailError
        );

        // Do not leave a usable OTP if email failed.
        user.emailOtp = "";
        user.emailOtpExpires = null;
        user.emailOtpAttempts = 0;

        await user.save();

        return res.status(500).json({
          message:
            "We could not send the admin verification email. Please check the email configuration.",
        });
      }

      return res.status(200).json({
        success: true,

        requiresAdminEmailOtp: true,

        message:
          "Admin login verified. A verification OTP has been sent to your email.",

        email: user.email,
      });
    }

    // ----------------------------------------------------------
    // NORMAL USER EMAIL VERIFICATION
    // ----------------------------------------------------------

    if (!user.emailVerified) {
      return res.status(403).json({
        message:
          "Please verify your email before logging in.",

        requiresEmailVerification: true,

        email: user.email,
      });
    }

    // ----------------------------------------------------------
    // NORMAL USER DIRECT LOGIN
    // ----------------------------------------------------------

    const token =
      generateToken(user);

    return res.status(200).json({
      success: true,

      message:
        "Login successful.",

      token,

      user:
        getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Server error during login.",
    });
  }
};

// ============================================================
// VERIFY ADMIN LOGIN EMAIL OTP
// ============================================================

const verifyAdminLoginOtp = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message:
          "Email and OTP are required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (!user) {
      return res.status(404).json({
        message:
          "Admin account not found.",
      });
    }

    // ----------------------------------------------------------
    // MAKE SURE THIS IS AN ADMIN
    // ----------------------------------------------------------

    if (user.role !== "admin") {
      return res.status(403).json({
        message:
          "Admin verification is only available for admin accounts.",
      });
    }

    // ----------------------------------------------------------
    // OTP ATTEMPTS
    // ----------------------------------------------------------

    if (
      user.emailOtpAttempts >= 5
    ) {
      return res.status(429).json({
        message:
          "Too many incorrect OTP attempts. Please request a new OTP.",
      });
    }

    // ----------------------------------------------------------
    // OTP EXPIRATION
    // ----------------------------------------------------------

    if (
      !user.emailOtpExpires ||
      user.emailOtpExpires < new Date()
    ) {
      return res.status(400).json({
        message:
          "Admin verification OTP has expired. Please request a new OTP.",
      });
    }

    // ----------------------------------------------------------
    // OTP VALIDATION
    // ----------------------------------------------------------

    if (
      user.emailOtp !== otp.trim()
    ) {
      user.emailOtpAttempts += 1;

      await user.save();

      return res.status(400).json({
        message:
          "Incorrect admin verification OTP.",
      });
    }

    // ----------------------------------------------------------
    // ADMIN EMAIL VERIFIED
    // ----------------------------------------------------------

    user.emailVerified = true;

    user.emailOtp = "";

    user.emailOtpExpires = null;

    user.emailOtpAttempts = 0;

    await user.save();

    // ----------------------------------------------------------
    // GENERATE JWT ONLY AFTER OTP VERIFICATION
    // ----------------------------------------------------------

    const token =
      generateToken(user);

    return res.status(200).json({
      success: true,

      message:
        "Admin email verified successfully. Login successful.",

      token,

      user:
        getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "ADMIN OTP VERIFY ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while verifying admin email.",
    });
  }
};

// ============================================================
// RESEND ADMIN LOGIN OTP
// ============================================================

const resendAdminLoginOtp = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message:
          "Email is required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (!user) {
      return res.status(404).json({
        message:
          "Admin account not found.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message:
          "This account is not an admin account.",
      });
    }

    const otp =
      generateOtp();

    user.emailOtp = otp;

    user.emailOtpExpires =
      new Date(
        Date.now() + 10 * 60 * 1000
      );

    user.emailOtpAttempts = 0;

    await user.save();

    try {
      await sendEmailOtp(
        cleanEmail,
        otp,
        "Your new CleanCRAVE Admin Login Code"
      );
    } catch (emailError) {
      console.error(
        "ADMIN RESEND EMAIL ERROR:",
        emailError
      );

      user.emailOtp = "";
      user.emailOtpExpires = null;
      user.emailOtpAttempts = 0;

      await user.save();

      return res.status(500).json({
        message:
          "Unable to send admin verification OTP.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "A new admin verification OTP has been sent to your email.",
    });
  } catch (error) {
    console.error(
      "ADMIN RESEND OTP ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to resend admin verification OTP.",
    });
  }
};

// ============================================================
// FIREBASE AUTH
//
// GOOGLE ONLY
//
// Phone Firebase login has been removed.
// ============================================================

const firebaseAuth = async (
  req,
  res
) => {
  try {
    const {
      firebaseToken,
      name,
    } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        message:
          "Firebase authentication token is required.",
      });
    }

    const decodedToken =
      await admin.verifyIdToken(
        firebaseToken
      );

    const firebaseUid =
      decodedToken.uid;

    const firebaseEmail =
      decodedToken.email
        ?.toLowerCase()
        .trim() || "";

    // ----------------------------------------------------------
    // ONLY GOOGLE IS ACCEPTED
    // ----------------------------------------------------------

    const provider =
      decodedToken.firebase
        ?.sign_in_provider;

    if (provider !== "google.com") {
      return res.status(400).json({
        message:
          "Only Google login is supported.",
      });
    }

    // ----------------------------------------------------------
    // FIND EXISTING USER
    // ----------------------------------------------------------

    let user =
      await User.findOne({
        $or: [
          ...(firebaseEmail
            ? [
                {
                  email:
                    firebaseEmail,
                },
              ]
            : []),

          {
            firebaseUid,
          },
        ],
      });

    // ----------------------------------------------------------
    // NEW GOOGLE USER
    // ----------------------------------------------------------

    if (!user) {
      return res.status(200).json({
        success: true,

        isNewUser: true,

        requiresSetup: true,

        message:
          "Google verification successful. Please complete your CleanCRAVE profile.",

        firebaseUser: {
          firebaseUid,

          name:
            decodedToken.name ||
            name ||
            "",

          email:
            firebaseEmail,

          emailVerified:
            decodedToken.email_verified ===
            true,

          authProvider:
            "google",
        },
      });
    }

    // ----------------------------------------------------------
    // EXISTING USER
    // ----------------------------------------------------------

    user.firebaseUid =
      firebaseUid;

    if (firebaseEmail) {
      user.email =
        firebaseEmail;

      user.emailVerified =
        true;
    }

    if (name?.trim()) {
      user.name =
        name.trim();
    }

    if (
      decodedToken.email_verified
    ) {
      user.emailVerified = true;
    }

    await user.save();

    // ----------------------------------------------------------
    // LOGIN
    // ----------------------------------------------------------

    const token =
      generateToken(user);

    return res.status(200).json({
      success: true,

      message:
        "Firebase authentication successful.",

      token,

      user:
        getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "FIREBASE AUTH ERROR:",
      error
    );

    return res.status(401).json({
      message:
        "Firebase authentication failed.",
    });
  }
};

// ============================================================
// FIREBASE SETUP
//
// GOOGLE NEW USER ONLY
//
// PHONE NUMBER IS NOT REQUIRED
// ============================================================

const firebaseSetup = async (
  req,
  res
) => {
  try {
    const {
      firebaseToken,
      name,
      email,
      password,
      age,
      gender,
      height,
      weight,
      activityLevel,
      foodPreference,
      goal,
      dailyBudget,
    } = req.body;

    // ----------------------------------------------------------
    // FIREBASE TOKEN
    // ----------------------------------------------------------

    if (!firebaseToken) {
      return res.status(400).json({
        message:
          "Firebase authentication token is required.",
      });
    }

    // ----------------------------------------------------------
    // BASIC INFORMATION
    // ----------------------------------------------------------

    if (!name?.trim()) {
      return res.status(400).json({
        message:
          "Name is required.",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message:
          "Email is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        message:
          "Password is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters.",
      });
    }

    // ----------------------------------------------------------
    // VERIFY FIREBASE TOKEN
    // ----------------------------------------------------------

    const decodedToken =
      await admin.verifyIdToken(
        firebaseToken
      );

    const firebaseUid =
      decodedToken.uid;

    const cleanEmail =
      email.trim().toLowerCase();

    // ----------------------------------------------------------
    // MAKE SURE THIS IS GOOGLE
    // ----------------------------------------------------------

    const provider =
      decodedToken.firebase
        ?.sign_in_provider;

    if (provider !== "google.com") {
      return res.status(400).json({
        message:
          "Only Google account setup is supported.",
      });
    }

    // ----------------------------------------------------------
    // FIREBASE UID ALREADY EXISTS
    // ----------------------------------------------------------

    const existingFirebaseUser =
      await User.findOne({
        firebaseUid,
      });

    if (existingFirebaseUser) {
      return res.status(400).json({
        message:
          "This Firebase account is already connected to CleanCRAVE.",
      });
    }

    // ----------------------------------------------------------
    // EMAIL ALREADY EXISTS
    // ----------------------------------------------------------

    const existingEmail =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingEmail) {
      return res.status(400).json({
        message:
          "This email is already registered.",
      });
    }

    // ----------------------------------------------------------
    // HASH PASSWORD
    // ----------------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // ----------------------------------------------------------
    // CREATE GOOGLE USER
    // ----------------------------------------------------------

    const user =
      await User.create({
        name:
          name.trim(),

        email:
          cleanEmail,

        password:
          hashedPassword,

        firebaseUid,

        authProvider:
          "google-password",

        emailVerified:
          decodedToken.email_verified ===
          true,

        phoneVerified:
          false,

        age:
          age !== undefined
            ? Number(age)
            : undefined,

        gender,

        height:
          height !== undefined
            ? Number(height)
            : undefined,

        weight:
          weight !== undefined
            ? Number(weight)
            : undefined,

        activityLevel,

        foodPreference,

        goal,

        dailyBudget:
          dailyBudget !== undefined
            ? Number(dailyBudget)
            : 300,

        role: "user",
      });

    // ----------------------------------------------------------
    // JWT
    // ----------------------------------------------------------

    const token =
      generateToken(user);

    return res.status(201).json({
      success: true,

      message:
        "CleanCRAVE account created successfully.",

      token,

      user:
        getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "FIREBASE SETUP ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message:
        "Server error while creating Firebase account.",
    });
  }
};

// ============================================================
// FORGOT PASSWORD
//
// OTP IS REQUIRED HERE
// ============================================================

const forgotPassword = async (
  req,
  res
) => {
  try {
    const { email } =
      req.body;

    if (!email) {
      return res.status(400).json({
        message:
          "Email is required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    // Do not reveal whether account exists.
    if (!user) {
      return res.status(200).json({
        success: true,

        message:
          "If an account exists with this email, a reset OTP has been sent.",
      });
    }

    const otp =
      generateOtp();

    user.resetOtp =
      otp;

    user.resetOtpExpires =
      new Date(
        Date.now() + 10 * 60 * 1000
      );

    user.resetOtpAttempts = 0;

    await user.save();

    await sendEmailOtp(
      cleanEmail,
      otp,
      "Your CleanCRAVE password reset code"
    );

    return res.status(200).json({
      success: true,

      requiresOtp: true,

      message:
        "Password reset OTP has been sent to your email.",

      email:
        cleanEmail,
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to send password reset OTP.",
    });
  }
};

// ============================================================
// RESET PASSWORD
// ============================================================

const resetPassword = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (
      !email ||
      !otp ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Email, OTP and new password are required.",
      });
    }

    if (
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message:
          "New password must contain at least 6 characters.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid password reset request.",
      });
    }

    // ----------------------------------------------------------
    // OTP ATTEMPTS
    // ----------------------------------------------------------

    if (
      user.resetOtpAttempts >= 5
    ) {
      return res.status(429).json({
        message:
          "Too many incorrect OTP attempts. Please request a new OTP.",
      });
    }

    // ----------------------------------------------------------
    // OTP EXPIRATION
    // ----------------------------------------------------------

    if (
      !user.resetOtpExpires ||
      user.resetOtpExpires < new Date()
    ) {
      return res.status(400).json({
        message:
          "Password reset OTP has expired.",
      });
    }

    // ----------------------------------------------------------
    // OTP VALIDATION
    // ----------------------------------------------------------

    if (
      user.resetOtp !==
      otp.trim()
    ) {
      user.resetOtpAttempts += 1;

      await user.save();

      return res.status(400).json({
        message:
          "Incorrect password reset OTP.",
      });
    }

    // ----------------------------------------------------------
    // CHANGE PASSWORD
    // ----------------------------------------------------------

    user.password =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.resetOtp = "";

    user.resetOtpExpires = null;

    user.resetOtpAttempts = 0;

    await user.save();

    return res.status(200).json({
      success: true,

      message:
        "Password changed successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to reset password.",
    });
  }
};

// ============================================================
// UPDATE PROFILE
//
// Phone is intentionally not included.
// ============================================================

const updateProfile = async (
  req,
  res
) => {
  try {
    const userId =
      req.user.userId;

    const {
      name,
      email,
      age,
      gender,
      height,
      weight,
      activityLevel,
      foodPreference,
      goal,
      dailyBudget,
    } = req.body;

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

    if (!name?.trim()) {
      return res.status(400).json({
        message:
          "Name is required.",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message:
          "Email is required.",
      });
    }

    const cleanEmail =
      email.trim().toLowerCase();

    // ----------------------------------------------------------
    // EMAIL DUPLICATE CHECK
    // ----------------------------------------------------------

    const existingUser =
      await User.findOne({
        email: cleanEmail,

        _id: {
          $ne: userId,
        },
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Email is already being used.",
      });
    }

    // ----------------------------------------------------------
    // UPDATE USER
    // ----------------------------------------------------------

    const user =
      await User.findByIdAndUpdate(
        userId,

        {
          name:
            name.trim(),

          email:
            cleanEmail,

          age:
            age !== undefined
              ? Number(age)
              : undefined,

          gender,

          height:
            height !== undefined
              ? Number(height)
              : undefined,

          weight:
            weight !== undefined
              ? Number(weight)
              : undefined,

          activityLevel,

          foodPreference,

          goal,

          dailyBudget:
            dailyBudget !== undefined
              ? Number(dailyBudget)
              : undefined,
        },

        {
          new: true,
          runValidators: true,
        }
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Profile updated successfully.",

      user:
        getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Email is already being used.",
      });
    }

    return res.status(500).json({
      message:
        "Server error.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  registerUser,
  verifyRegistrationEmail,
  resendRegistrationOtp,

  loginUser,
  verifyAdminLoginOtp,
  resendAdminLoginOtp,

  firebaseAuth,
  firebaseSetup,

  forgotPassword,
  resetPassword,

  updateProfile,
};