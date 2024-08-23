const mongoose = require('mongoose');
const xlsx = require('xlsx');
require('dotenv').config();

const mongoDBUri = process.env.MONGODB_URI;
mongoose.connect(mongoDBUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
    importData();
});

const studentSchema = new mongoose.Schema({
    studentID: { type: String, unique: true, required: true },
    studentName: { type: String },
    email: { type: String },
    contact: [String], // Updated to an array of strings
    instrument: { type: String },
    schedule: [{
        day: String,
        time: String,
    }]     
});

const Student = mongoose.model('Student', studentSchema);

function parseSchedule(scheduleStr) {
    console.log('Parsing schedule:', scheduleStr);  // Logging input
    if (!scheduleStr) return null; // Return null if scheduleStr is empty or null
    
    // Split the schedule string by '/'
    const scheduleArray = scheduleStr.split('/').map(s => s.trim());
    
    return scheduleArray.map(session => {
        // Split by ' at ' to separate day and time
        const [day, time] = session.split(' at ').map(s => s ? s.trim() : s);
        return {
            day: day || 'Unknown',  // Default to 'Unknown' if day is not provided
            time: time || 'N/A'     // Default to 'N/A' if time is not provided
        };
    });
}

function parseContact(contactStr) {
    if (typeof contactStr !== 'string') {
        console.error(`Expected a string but received ${typeof contactStr}:`, contactStr);
        contactStr = String(contactStr);  // Convert to string if it's not already
    }

    if (!contactStr) return [];
    return contactStr.split('/').map(contact => contact.trim());
}

async function importData() {
    try {
        const workbook = xlsx.readFile('C:/Users/Admin/Desktop/NEW ENROLEMENT 24.xlsx');
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const promises = data.map(async (row) => {
            console.log('Processing row:', row);  // Log the row to inspect the data
            const schedule = parseSchedule(row['SCHEDULE']);
            console.log('Parsed schedule:', schedule);  // Log the parsed schedule

            const student = new Student({
                studentID: row['STUDENT ID'],
                studentName: row['STUDENT NAME'],
                email: row['MAIL'],
                contact: parseContact(row['CONTACT']),
                instrument: row['INSTRUMENT'],
                schedule: schedule
            });
            try {
                const savedStudent = await student.save();
                console.log(`Inserted: ${row['STUDENT NAME']}`, savedStudent.schedule);  // Log the saved student's schedule
            } catch (err) {
                if (err.code === 11000) {
                    console.log(`Skipping duplicate: ${row['STUDENT NAME']}`);
                } else {
                    console.error(`Error inserting ${row['STUDENT NAME']}: `, err);
                }
            }
        });

        await Promise.all(promises);
        console.log('Data import complete');
    } catch (err) {
        console.error('Error importing data:', err);
    } finally {
        await mongoose.disconnect();
    }
}