"use strict";

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Admin = require('./models/Admin'); // Adjust the path if necessary

dotenv.config(); // Load environment variables

const verifyPassword = async () => {
    const username = "AmpTesting"; // Use the admin username
    const enteredPassword = "AmpTestPass1"; // Try different passwords

    try {
        // ✅ Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Connected to MongoDB");

        // ✅ Fetch the stored admin
        const admin = await Admin.findOne({ username });
        if (!admin) {
            console.log("❌ Admin not found!");
            return;
        }

        console.log("🔑 Entered Password:", enteredPassword);
        console.log("🗄️ Stored Hashed Password:", admin.password);

        // ✅ Compare entered password with the stored hash
        const isMatch = await bcrypt.compare(enteredPassword, admin.password);
        console.log("🔍 Password Match Result:", isMatch);

        if (isMatch) {
            console.log("✅ Password is correct!");
        } else {
            console.log("❌ Password is incorrect!");
        }
    } catch (error) {
        console.error("❌ Error verifying password:", error);
    } finally {
        // ✅ Close the database connection safely
        await mongoose.connection.close();
        console.log("🔌 Disconnected from MongoDB");
    }
};

// Run the function
verifyPassword();
