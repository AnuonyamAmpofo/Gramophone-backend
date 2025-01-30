const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin'); // Adjust the path as needed
require('dotenv').config();

(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const password = ''; // Replace with the actual password
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new Admin({
        username: 'Ampofo',
        password: hashedPassword,
        name: 'Ampofo Amo-Mensah',
    });

    await admin.save();
    console.log('Admin saved with hashed password');

    mongoose.connection.close();
})();
