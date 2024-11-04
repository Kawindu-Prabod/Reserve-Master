require('dotenv').config();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schemas and models
const lecturerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const bookingSchema = new mongoose.Schema({
  lectureName: String,
  department: String,
  module: String,
  year: String,
  date: String,
  startTime: String,
  endTime: String,
  typeOfBooking: String,
  location: String,
  bookedEmail: String,
});

const Lecturer = mongoose.model('Lecturer', lecturerSchema);
const Student = mongoose.model('Student', studentSchema);
const Booking = mongoose.model('Booking', bookingSchema);

app.post('/send-confirmation', async (req, res) => {
  const { email, code } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Confirmation Code',
    text: `Hello,

Your confirmation code is: **${code}**

Please enter this code to complete your registration.

Thank you!`,

  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Confirmation code sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Error sending confirmation code' });
  }
});

// Routes
app.post('/Lectures', async (req, res) => {
  try {
    const lecturer = new Lecturer(req.body);
    await lecturer.save();
    res.status(201).send(lecturer);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/Students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).send(student);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/Lectures', async (req, res) => {
  const email = req.query.email;
  const lecturer = await Lecturer.find({ email });
  res.send(lecturer);
});

app.get('/Students', async (req, res) => {
  const email = req.query.email;
  const student = await Student.find({ email });
  res.send(student);
});

// New login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const lecturer = await Lecturer.findOne({ email });
    if (lecturer && lecturer.password === password) {
      return res.status(200).send({ email: lecturer.email });
    }

    const student = await Student.findOne({ email });
    if (student && student.password === password) {
      return res.status(200).send({ email: student.email });
    }

    return res.status(401).send({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

// Rooms Endpoints
app.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.send(rooms);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching rooms' });
  }
});

app.post('/rooms', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).send(room);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Bookings Endpoints
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.send(bookings);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching bookings' });
  }
});

app.post('/bookings', async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).send(booking);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// Function to send email reminders for today's bookings
const sendEmailReminders = async () => {
  const currentDate = new Date(); // Get the current date
  const today = currentDate.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'

  // Fetch bookings for today
  const todayBookings = await Booking.find({ date: today }).lean(); // Query bookings where the date is today

  // If there are bookings for today, proceed to send emails
  if (todayBookings.length > 0) {
    // Fetch all students
    const students = await Student.find();
    
    // Prepare email content for all students
    const studentEmails = students.map(student => student.email);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmails,
      subject: 'Today\'s Booking Reminder',
      text: `Dear Students,\n\nThis is a reminder for the following bookings scheduled for today:\n\n` +
            todayBookings.map(booking => `Lecture: ${booking.module}\nDate: ${booking.date}\nTime: ${booking.startTime} to ${booking.endTime}\nLocation: ${booking.location}\n`).join('\n') +
            `\nBest regards,\nUniversity`,
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Reminder sent for today's bookings.`);
    } catch (error) {
      console.error('Error sending reminder email:', error);
    }
  } else {
    console.log('No bookings for today.');
  }
};


// Schedule the job to run at 6:00 AM and 9:00 AM every day
cron.schedule('0 6,9 * * *', () => {
  console.log('Running scheduled email task...');
  sendEmailReminders();
});

// // Schedule a job to run every 10 minutes
// cron.schedule('*/10 * * * *', async () => {
//   const currentTime = new Date();
//   const twoHoursLater = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);

//   try {
//     // Query the database for upcoming lectures
//     const upcomingLectures = await Booking.find({
//       startTime: {
//         $gte: currentTime.toTimeString().slice(0, 5),
//         $lte: twoHoursLater.toTimeString().slice(0, 5),
//       },
//     }).populate('students');

//     upcomingLectures.forEach(async (lecture) => {
//       const students = lecture.students; // Get students from the lecture
//       const studentEmails = students.map(student => student.email); // Extract emails

//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: studentEmails,
//         subject: 'Reminder: Check Your Bookings',
//         text: `Dear Students,\n\nThis is a reminder to check your bookings for the lecture scheduled to start at ${lecture.startTime}.\n\nBest regards,\nYour School Team`,
//       };

//       // Send emails
//       await transporter.sendMail(mailOptions);
//     });

//     console.log('Email reminders sent for upcoming lectures.');
//   } catch (error) {
//     console.error('Error sending email reminders:', error);
//   }
// });