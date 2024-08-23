const mongoose = require("mongoose");
const xlsx = require("xlsx");
require("dotenv").config();

const mongoDBUri = process.env.MONGODB_URI;
mongoose.connect(mongoDBUri);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
  importInstructorData();
});

const instructorSchema = new mongoose.Schema({
  instructorID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  instrument: [String],
  // email: {type: String},
  // contact: [String],
});

const Instructor = mongoose.model("Instructor", instructorSchema);

// function parseContact(contactStr){
//     if(typeof contactStr !== 'string'){
//         console.error(`Expected a string but received ${typeof contactStr}:`, contactStr);
//         contactStr = String(contactStr); //To convert to string if it's not already
//     }
//     if (!contactStr) return null; //return Null if the contact section is not filled.
//     return contactStr;
// }

async function importInstructorData() {
  try {
    const workbook = xlsx.readFile(
      "C:/Users/Admin/Desktop/NEW ENROLEMENT 24.xlsx"
    );
    const sheetName = workbook.SheetNames[1];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const promises = data.map(async (row) => {
      const instructor = new Instructor({
        instructorID: row["INSTRUCTOR ID"],
        name: row["INSTRUCTOR NAME"],
        instrument: row["INSTRUMENT"].split("/"),
        // email: row['EMAIL'],
        // contact: parseContact(row['CONTACT']),
      });
      try {
        await instructor.save();
        console.log(`Inserted: ${row["INSTRUCTOR NAME"]}`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`Skipping duplicate: ${row["INSTRUCTOR NAME"]}`);
        } else {
          console.error(`Error inserting ${row["INSTRUCTOR NAME"]}: `, err);
        }
      }
    });

    await Promise.all(promises);
    console.log("Instructor data import complete");
  } catch (err) {
    console.error("Error importing instructor data:", err);
  } finally {
    await mongoose.disconnect();
  }
}
