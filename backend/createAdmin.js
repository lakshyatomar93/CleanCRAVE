const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = await User.findOneAndUpdate(
      { email: "admin@foodfit.com" },
      {
        $set: {
          name: "FoodFit Admin",
          password: hashedPassword,
          role: "admin",
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log("Admin account ready!");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createAdmin();