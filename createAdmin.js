"use strict";

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Admin = require('./models/Admin'); 

dotenv.config();

const createAdmin = async () => {
    const username = "AmpTesting"; 
    const password = "AmpTestPass1"; 
    const name = "AmpTest"; 
    try {
        
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Connected to MongoDB");


        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists!");
            return;
        }

        console.log("📝 Plain-text Password before hashing:", password);
        // const hashedPassword = await bcrypt.hash(password, 10);
        // console.log(" Hashed Password:", password);

        
        const newAdmin = new Admin({ username, password: password });
        await newAdmin.save();

        console.log(`✅ Admin created successfully! Username: ${username}`);
    } catch (error) {
        console.error("❌ Error creating admin:", error);
    } finally {
        
        await mongoose.connection.close();
        console.log("🔌 Disconnected from MongoDB");
    }
};

// Run the function
createAdmin();
