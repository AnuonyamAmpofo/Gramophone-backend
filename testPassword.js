const bcrypt = require('bcrypt');

// Example hashed password from MongoDB
const hashedPassword = '$2b$10$H4tgXjJmYF4jRKa2dmC2VujE7/t3l9u5WjWl0kqWuJPQx00T2u8ni';

// Password provided during login
const providedPassword = 'Theophil123'; 

// Compare the provided password with the hashed password
bcrypt.compare(providedPassword, hashedPassword, (err, isMatch) => {
    if (err) {
        console.error('Error comparing passwords:', err);
    } else if (isMatch) {
        console.log('Password matches!');
    } else {
        console.log('Password mismatch');
    }
});







// const newPassword = 'Newpass3'; // The password you want to hash
// const saltRounds = 10;

// bcrypt.hash(newPassword, saltRounds, (err, hash) => {
//     if (err) {
//         console.error('Error hashing password:', err);
//     } else {
//         console.log('New hashed password:', hash);
//     }
// });
