const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Serve images
app.use('/uploads', express.static('uploads'));

//  MULTER SETUP
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// JWT AUTH 
const auth= require('./middleware/auth');

// ================= ROUTES =================

// 🔹 Login (Dummy user)
app.post('/login', (req, res) => {
  const user = {
    id: 1,
    username: "admin"
  };

  const token = jwt.sign(user, "secretkey", { expiresIn: "1h" });

  res.json({ token });
});

// 🔹 Add Student (Protected + Image Upload)
app.post('/add-student', auth, upload.single('image'), (req, res) => {
  const { name, course, city} = req.body;

  if (!name || !course ||!city || !req.file) {
    return res.status(400).send("All fields required");
  }

  const newStudent = {
    id: Date.now(),
    name,
    course,
    image: req.file.path,
    city
  };

  let students = [];

  try {
    const data = fs.readFileSync('students.json');
    students = JSON.parse(data);
  } catch {
    students = [];
  }

  students.push(newStudent);

  fs.writeFileSync('students.json', JSON.stringify(students, null, 2));

  res.send("Student added successfully");
});

app.get('/', (req, res) => {
  res.send("Backend is running 🚀");
});

// 🔹 Get All Students (Flashcard Data)
app.get('/students', (req, res) => {
  try {
    const data = fs.readFileSync('students.json');
    const students = JSON.parse(data);
    res.json(students);
  } catch {
    res.json([]);
  }
});

// 🔹 Delete Student (Extra Feature)
app.delete('/delete/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);

  const data = JSON.parse(fs.readFileSync('students.json'));

  const updated = data.filter(s => s.id !== id);

  fs.writeFileSync('students.json', JSON.stringify(updated, null, 2));

  res.send("Deleted successfully");
});

// ================= SERVER =================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});