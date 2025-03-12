const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const Comment = require('../models/Comment');
const Admin = require('../models/Admin');
const multer = require('multer');
const bcrypt = require('bcrypt');
const upload = multer();

const formatTimeTo12Hour = (time) => {
  const [hour, minute] = time.split(":");
  let hour12 = ((+hour + 11) % 12) + 1;
  const ampm = +hour >= 12 ? "PM" : "AM";
  return `${hour12}:${minute}${ampm}`;
};

const AdminController = {
  addStudent: async (req, res) => {
    const { studentName, email, contact, instrument, schedule } = req.body;
  
    try {
      // Find the student with the largest studentID
      const lastStudent = await Student.findOne().sort({ studentID: -1 }).limit(1);
  
      // Generate the new studentID by incrementing the highest existing studentID
      const newStudentID = lastStudent ? (parseInt(lastStudent.studentID, 10) + 1).toString().padStart(4, '0') : '0001';
  
      // Create the new student with the generated ID
      const newStudent = new Student({
        studentID: newStudentID,
        studentName,
        email,
        contact,
        instrument,
        schedule
      });
  
      await newStudent.save();
      res.status(201).json({ message: 'Student added successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to add student', error: err.message });
    }
  },  
  updateStudent: async (req, res) => {
    const { studentID } = req.params;
    const updateData = req.body;
    try {
      const updatedStudent = await Student.findOneAndUpdate({ studentID }, updateData, { new: true });
      if (!updatedStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json({ message: 'Student updated successfully', updatedStudent });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update student', error: err.message });
    }
  },
  viewStudents: async (req, res) => {
    try {
      const students = await Student.find();
      res.status(200).json(students);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve students', error: err.message });
    }
  },
  viewStudent: async (req, res) => {
    const { studentID } = req.params;
    try {
      const student = await Student.findOne({ studentID });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json(student);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve student', error: err.message });
    }
  },
  deleteStudent: async (req, res) => {
    const { studentID } = req.params;

    try {
        // Step 1: Delete the student document
        const deletedStudent = await Student.findOneAndDelete({ studentID });
        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Step 2: Find all courses referencing the student in their sessions
        const coursesWithStudent = await Course.find({ "sessions.studentID": studentID });

        // Log the courses found
        console.log("Courses containing the student:", coursesWithStudent);

        // Step 3: Remove the student's sessions from all matching courses
        const updateCourses = await Course.updateMany(
            { "sessions.studentID": studentID }, // Match courses where the session contains the studentID
            { $pull: { sessions: { studentID } } } // Remove all matching sessions
        );

        // Step 4: Respond with a success message
        res.status(200).json({
            message: 'Student and associated sessions deleted successfully',
            deletedStudent,
            updatedCourses: updateCourses.modifiedCount, // Number of courses updated
            coursesWithStudent // Optional: include the courses in the response
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete student and associated sessions', error: err.message });
    }
},
  assignStudent: async (req, res) => {
    const { studentName, studentID, instrument, instructorID, day, time} = req.body;
  
    // Log the incoming request parameters
    console.log("Received parameters:", { studentID, instrument, instructorID, day });
  
    if (!studentID || !instrument || !instructorID || !day || !time) {
      return res.status(400).send({ error: 'Missing required fields' });
    }
  
    try {
      // Log the query criteria to ensure it matches what you expect
      console.log("Searching for course with criteria:", { day, instrument, instructorID });
  
      // Find the course with matching day, instrument, and instructorID
      const course = await Course.findOne({ day, instrument, instructorID });
  
      if (!course) {
        console.log("Course not found with provided criteria.");  // Log if course is not found
        return res.status(404).send({ error: 'Course not found' });
      }
  
      // Check if the student is already in the course
      const existingSession = course.sessions.find(session => session.studentID === studentID);
      if (existingSession) {
        console.log("Student already assigned to this course.");
        return res.status(400).send({ error: 'Student is already assigned to this course' });
      }

      const formattedTime = formatTimeTo12Hour(time);
  
      // Add the student to the course's sessions array
      course.sessions.push({
        studentID,
        studentName,
        time: formattedTime,   // You can customize how the time is added
      });
  
      // Save the updated course
      await course.save();

      const student = await Student.findOne({studentID});
    
        // Log the student object
        console.log("Student found:", student);
        
        if (student) {
          // Log the current schedule
          console.log("Current Student Schedule:", student.schedule);

          const existingSchedule = student.schedule.find(
            (schedule) => schedule.day === day && schedule.time === formattedTime
          );

          if (!existingSchedule) {
            // Log the addition to the schedule
            console.log(`Adding to schedule: Day: ${day}, Time: ${formattedTime}`);
            student.schedule.push({ day, time: formattedTime });
            await student.save();
          } else {
            console.log("Schedule entry already exists, not adding.");
          }

          // Log the updated schedule
          console.log("Updated Student Schedule:", student.schedule);
        } else {
          console.log("No student found with the provided ID.");
        }

  
      res.status(200).send({ message: 'Student assigned successfully' });
    } catch (error) {
      console.error("Error assigning student:", error);
      res.status(500).send({ error: 'Failed to assign student' });
    }
  },
  

  findCourseInstructorDayInstrument: async (req, res) => {
    const { instructorID } = req.params;
    const { day, instrument } = req.query;
  
    try {
      const course = await Course.findOne({
        instructorID,
        day,
        instrument
      });
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  findInstructorInstrument: async (req, res) => {
    console.log("Instructor find endpoint hit");
    const instrument = req.query.instrument;
    
    if (!instrument) {
        return res.status(400).send({ error: 'Instrument is required' });
    }
    
    try {
        const instructors = await Instructor.find({ instrument });
        console.log("Instructors found:", instructors);
        res.json(instructors);
    } catch (error) {
        console.error("Error fetching instructors:", error);
        res.status(500).send({ error: 'Failed to fetch instructors' });
    }
},

  addInstructor: async (req, res) => {
    const { name, email, contact, instrument } = req.body;
  
    try {
      // Find the student with the largest studentID
      const lastInstructor = await Instructor.findOne().sort({ instructorID: -1 }).limit(1);
  
      // Generate the new studentID by incrementing the highest existing studentID
      const newInstructorID = lastInstructor ? (parseInt(lastInstructor.instructorID, 10) + 1).toString().padStart(4, '0') : '0001';
  
      // Create the new student with the generated ID
      const newInstructor = new Instructor({
        instructorID: newInstructorID,
        name,
        email,
        contact,
        instrument
      });
  
      await newInstructor.save();
      res.status(201).json({ message: 'Instructor added successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to add instructor', error: err.message });
    }
  },
  updateInstructor: async (req, res) => {
    const { instructorID } = req.params;
    const updateData = req.body;
    try {
      const updatedInstructor = await Instructor.findOneAndUpdate({ instructorID }, updateData, { new: true });
      if (!updatedInstructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
      res.status(200).json({ message: 'Instructor updated successfully', updatedInstructor });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update instructor', error: err.message });
    }
  },
  viewInstructors: async (req, res) => {
    try {
      const instructors = await Instructor.find();
      res.status(200).json(instructors);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve instructors', error: err.message });
    }
  },
  viewInstructor: async (req, res) => {
    const { instructorID } = req.params;
    try {
      const instructor = await Instructor.findOne({ instructorID });
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
      res.status(200).json(instructor);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve instructor', error: err.message });
    }
  },
  deleteInstructor: async (req, res) => {
    const { instructorID } = req.params;

    try {
        // Step 1: Delete the student document
        const deletedInstructor = await Instructor.findOneAndDelete({ instructorID });
        if (!deletedInstructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        // Step 2: Find all courses referencing the student in their sessions
        // const coursesWithInstructor = await Course.find({ "instructorID": instructorID });

        
        // console.log("Courses for the instructor:", coursesWithInstructor);

        
        // await Course.deleteMany({ "instructorID": instructorID });

        // Step 4: Respond with a success message
        res.status(200).json({
            message: 'Instructor and associated courses deleted successfully',
            deletedInstructor,
            // updatedCourses: updateCourses.modifiedCount,
            coursesWithInstructor
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete instructor and associated courses', error: err.message });
    }
  },
  addAnnouncement: async (req, res) => {
    const { title, content } = req.body;
    try {
      const newAnnouncement = new Announcement({
        title,
        content,
        type: 'admin',
        datePosted: new Date(),
      });
      await newAnnouncement.save();
      res.status(201).json({ message: 'Announcement added successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to add announcement', error: err.message });
    }
  },
  viewAnnouncements: async (req, res) => {
    try {
      const announcements = await Announcement.find({ type:'admin' });
      res.status(200).json(announcements);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve announcements', error: err.message });
    }
  },

  getCourseAnnouncements: async (req, res) => {
    try {
      const { courseCode } = req.params;
  
      
      const announcements = await Announcement.find({ courseCode });
  
      
      const announcementIds = announcements.map(announcement => announcement._id);
      const comments = await Comment.find({ announcementId: { $in: announcementIds } });
  
      
      const announcementsWithComments = announcements.map(announcement => ({
        ...announcement._doc, // Spread announcement data. _doc is used to access the document object. Don't forget this!!!
        comments: comments.filter(comment => comment.announcementId.equals(announcement._id)) // Attach comments
      }));
  
      res.json({ announcements: announcementsWithComments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Post announcement in a particular course
  postAnnouncement: async (req, res) => {
    try {
      const { courseCode } = req.params;
      const { title, content } = req.body;
      const adminID = req.user.sp_userId; 
  
      // Validate input
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }
  
      // Find the course to ensure it exists and is taught by this instructor
      const course = await Course.findOne({ courseCode });
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found or you do not have access' });
      }
  
      // Create a new announcement
      const newAnnouncement = new Announcement({
        courseCode,
        adminID,
        title,
        type: 'course',
        content,
        datePosted: new Date(),
      });
  
      // Save the new announcement
      await newAnnouncement.save();
  
      // Add the announcement to the course's announcements array
      course.announcements.push(newAnnouncement._id);
      await course.save();
  
      // Return the new announcement and success message
      res.status(200).json({ message: 'Announcement posted successfully', announcement: newAnnouncement });
    } catch (err) {
      res.status(500).json({ message: 'Failed to post announcement', error: err.message });
    }
  },
  deleteAnnouncement: async (req, res) => {
    const { courseCode, announcementId } = req.params;

    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(announcementId)) {
            return res.status(400).json({ message: 'Invalid announcement ID' });
        }

        // Find the course by courseCode
        const course = await Course.findOne({ courseCode });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Convert announcementId to string and find its index in the course's announcements array
        const announcementIndex = course.announcements.findIndex(ann => ann.toString() === announcementId);

        if (announcementIndex === -1) {
            return res.status(404).json({ message: 'Announcement not found in this course' });
        }

        // Remove the announcement ID from the course's announcements array
        course.announcements.splice(announcementIndex, 1);
        await course.save(); // Save the updated course

        // Delete the announcement document from the Announcement collection
        const deletedAnnouncement = await Announcement.findByIdAndDelete(announcementId);

        if (!deletedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error("Error deleting announcement:", error.message); // Log detailed error
        res.status(500).json({ message: 'Server error', error: error.message });
    }
},

  

editAnnouncement: async (req, res) => {
    const { announcementId } = req.params; // Assuming announcementId is the ID of the announcement to edit
    const { title, content } = req.body;

    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(announcementId)) {
            return res.status(400).json({ message: 'Invalid announcement ID' });
        }

        // Find and update the announcement
        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Update fields if provided
        if (title) announcement.title = title;
        if (content) announcement.content = content;

        // Save the updated announcement
        await announcement.save();

        res.status(200).json({ message: 'Announcement updated successfully' });
    } catch (error) {
        console.error("Error updating announcement:", error.message); // Log detailed error
        res.status(500).json({ message: 'Server error', error: error.message });
    }
},

getAllAnnouncements: async(req, res) => {
  try {
    const adminID = req.user.sp_userId; // Assuming the user object is attached via middleware

    // 1. Fetch all courses for the instructor and populate the announcements field
    const courses = await Course.find().populate('announcements'); // Make sure to populate announcements

    // 2. Extract course-specific announcements
    const courseAnnouncements = courses.reduce((acc, course) => {
      if (course.announcements) {
        acc.push(...course.announcements.map(announcement => ({
          courseCode: course.courseCode,
          announcementID: announcement._id,
          title: announcement.title,      // Accessing populated title
          content: announcement.content,  // Accessing populated content
          datePosted: announcement.datePosted,  // Accessing populated datePosted
        })));
      }
      return acc;
    }, []);

    // 3. Fetch global announcements (those posted by admin)
    const adminAnnouncements = await Announcement.find({ courseCode: null });

    // 4. Combine course-specific announcements with admin announcements
    const allAnnouncements = [
      ...adminAnnouncements.map(announcement => ({
        courseCode: "Admin",
        announcementID: announcement._id,
        title: announcement.title,         // Accessing admin announcement title
        content: announcement.content,     // Accessing admin announcement content
        datePosted: announcement.datePosted, // Accessing admin announcement datePosted
      })),
      ...courseAnnouncements
    ];

    if (allAnnouncements.length === 0) {
      return res.status(404).json({ message: 'No announcements available.' });
    }

    // 5. Return all announcements (both course-specific and admin announcements)
    res.status(200).json({ announcements: allAnnouncements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'An error occurred while fetching announcements.' });
  }
},

//ADMIN CONTROLLERS
addAdmin: async (req, res) => {
  const { name, email, contact, instrument } = req.body;

  try {
    
    const lastInstructor = await Instructor.findOne().sort({ instructorID: -1 }).limit(1);

    
    const newInstructorID = lastInstructor ? (parseInt(lastInstructor.instructorID, 10) + 1).toString().padStart(4, '0') : '0001';

   
    const newInstructor = new Instructor({
      instructorID: newInstructorID,
      name,
      email,
      contact,
      instrument
    });

    await newInstructor.save();
    res.status(201).json({ message: 'Instructor added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add instructor', error: err.message });
  }
},

  resetPassword: async (req, res) => {
      const { username } = req.params;
      const { newPassword } = req.body;
  
      try {
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;
        await admin.save();

        console.log(`🔑 Hashed password saved for ${username}:`, hashedPassword);

        res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    },

  //COURSE CONTROLLERS
  createCourse: async (req, res) => {
    const { instrument, instructorID, instructorName, day } = req.body;

  
  if (!instrument || !instructorID || !instructorName || !day) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
  
    const dayMapping = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      
    };

    const dayNumber = dayMapping[day];
    if (!dayNumber) {
      return res.status(400).json({ error: "Invalid day provided." });
    }

    // Define courseCode prefixes based on instrument
    const instrumentMapping = {
      Saxophone: "Sax",
      Violin: "Violin",
      Viola: "Violin",
      Cello: "Violin",
      Strings: "Violin", 
    };

    const coursePrefix = instrumentMapping[instrument] || instrument; 
    const instructorSuffix = instructorID.slice(-2); 

    // Generate courseCode: {Prefix}{DayNumber}{LastTwoDigitsOfInstructorID}
    const courseCode = `${coursePrefix}${dayNumber}${instructorSuffix}`;

    
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(400).json({ error: "Course already exists." });
    }

    // Create the new course
    const newCourse = new Course({
      courseCode,
      instrument,
      instructorID,
      instructorName,
      day,
      sessions: [], 
      announcements: [], 
    });

   
    await newCourse.save();

    res.status(201).json({ message: "Course added successfully.", course: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
  },
  updateCourse: async (req, res) => {
    const { courseCode } = req.params;
    const updateData = req.body;
    const day = updateData.day;

    console.log(day);
    try {
      const dayMapping = {

        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        
      };
  
      const dayNumber = dayMapping[day];
      if (!dayNumber) {
        return res.status(400).json({ error: "Invalid day provided." });
      }
  
      // Define courseCode prefixes based on instrument
      const instrumentMapping = {
        Saxophone: "Sax",
        Violin: "Violin",
        Viola: "Violin",
        Cello: "Violin",
        Strings: "Violin", 
      };
  
      const coursePrefix = instrumentMapping[updateData.instrument] || updateData.instrument; 
      const instructorSuffix = updateData.instructorID.slice(-2);

      const newCourseCode = `${coursePrefix}${dayNumber}${instructorSuffix}`;

      const updatedCourse = await Course.findOneAndUpdate({courseCode}, {courseCode: newCourseCode, ...updateData}, { new: true });
      if (!updatedCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.status(200).json({ message: 'Course updated successfully', updatedCourse });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update course', error: err.message });
    }
  },
  deleteCourse: async (req, res) => {
    const { courseCode } = req.params;
    const username = req.user.sp_userId;


    try {
      const deletedCourse = await Course.findOneAndDelete({ courseCode });
      if (!deletedCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const deletedAnnouncements = await Announcement.find({ courseCode }).deleteMany();
      console.log("Deleted announcements:", deletedAnnouncements);
      const deletedComments = await Comment.find({ courseCode }).deleteMany();

      res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete course', error: err.message });
    }
  },
  viewCourses: async (req, res) => {
    try {
      const courses = await Course.find().populate('instructorID', 'instructorName');
      res.status(200).json(courses);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve courses', error: err.message });
    }
  },

  // Method to get courses by instrument
  viewCoursesByInstrument: async (req, res) => {
    const { instrument } = req.params;
    try {
      const courses = await Course.find({ instrument }).populate('instructorID', 'instructorName');
      if (courses.length === 0) {
        return res.status(404).json({ message: 'No courses found for this instrument' });
      }
      res.status(200).json(courses);
    } catch (err) {
      res.status(500).json({ message: 'Failed to retrieve courses', error: err.message });
    }
  },
  
  //Assign to multiple courses
    assignStudentToCourses: async (req, res) => {
    const { studentID, courses } = req.body;

    try {
        // Find the student by studentID
        const student = await Student.findOne({ studentID });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const updatedCourses = [];

        // Loop through each course provided in the request
        for (const courseInfo of courses) {
            const { courseCode, time } = courseInfo;

            // Find the course by courseCode
            const course = await Course.findOne({ courseCode });
            if (!course) {
                return res.status(404).json({ message: `Course with code ${courseCode} not found` });
            }

            // Add the student session to the course
            course.sessions.push({ studentID: student.studentID, studentName: student.studentName, time });

            // Save the updated course
            await course.save();

            // Add the updated course details to the response list
            updatedCourses.push({
                courseCode: course.courseCode,
                instrument: course.instrument,
                day: course.day,
                instructorID: course.instructorID,
                instructorName: course.instructorName,
                sessions: course.sessions.map(session => ({
                    studentID: session.studentID,
                    studentName: session.studentName,
                    time: session.time
                }))
            });
        }

        // Send the detailed response
        res.status(200).json({
            message: 'Student assigned to courses successfully',
            courses: updatedCourses
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to assign student to courses', error: err.message });
    }
},
viewCourseDetail: async (req, res) => {
  try {
    const { courseCode } = req.params; // Extract course code from the URL params
    const username = req.user.sp_userId; // Assuming the instructor's ID is stored in req.user

    // Find the course by courseCode and instructorID
    const course = await Course.findOne({ courseCode });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Format the course data for response
    res.status(200).json({
      courseCode: course.courseCode,
      day: course.day,
      numberOfStudents: course.sessions.length,
      sessions: course.sessions.map((session) => ({
        studentID: session.studentID,
        studentName: session.studentName,
        time: session.time,
      })),
      instructorName: course.instructorName,
      instructorID: course.instructorID,
      instrument: course.instrument,
      announcements: course.announcements, // Assuming announcements are embedded in the course model
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve course details', error: err.message });
  }
}, 
  
getStudentInfo: async(req,res)=> {
  try {
    const { studentID } = req.params;
    const student = await Student.findOne({ studentID });

    res.status(200).json({
      studentName: student.studentName,
      email: student.email,
      contact: student.contact,

    });
  }
  catch(err) {
    console.error("Failed to get student details", err)
  }
},
      postCommentForStudent: async (req, res) => {
      try {
          const { courseCode, studentID } = req.params;
          const { comment } = req.body;
          const username = req.user.sp_userId; // Assume this is set from your middleware
          
          const admin = await Admin.findOne({username});
          if (!admin){
            return res.status(404).json({message: "Admin Not Found"})
          }

          const student = await Student.findOne({studentID});
          if (!student){
            return res.status(404).json({message: "Student Not Found"})
          }
          
          // Create a new comment
          const newComment = new Comment({
              courseCode,
              studentID,
              studentName: student.studentName,
            
              instructorID: username,
              comment,
          });

          await newComment.save();

          res.status(200).json({ message: 'Comment added successfully' });
      } catch (err) {
          res.status(500).json({ message: 'Failed to add comment', error: err.message });
      }
    },
};

module.exports = AdminController;
