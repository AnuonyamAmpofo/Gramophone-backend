const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin'); // Adjust the path as needed
require('dotenv').config();

(async () => {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const password = 'Ampofo1345'; // Replace with the actual password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
        username: 'Ampofo3',
        password: hashedPassword,
        name: 'Ampofo2 Amo-Mensah',
    });

    await admin.save();
    console.log('Admin saved with hashed password:', hashedPassword);

    mongoose.connection.close();
})();
