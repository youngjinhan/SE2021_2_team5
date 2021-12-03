const db = require("../db");
// const database = require("firebase/database");
const Student = require("../models/student");

const addStudent = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(data);
    var cnt = (await db.ref("students").get()).numChildren();
    await db.ref("students/").push(data);
    // console.log(await (await db.ref("students").get()).val());
    res.send("Data saved successfully\n");
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const students = await db.ref("students");
    const data = await students.get();
    const studentsArray = [];
    if (!data.exists()) {
      res.status(404).send("No student data found");
    } else {
      data.forEach((stu) => {
        // console.log(stu.key, stu.val());
        const student = new Student(
          stu.val().id,
          stu.val().firstName,
          stu.val().lastName,
          stu.val().major
        );
        studentsArray.push(student);
      });
      res.send(studentsArray);
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getStudent = async (req, res, next) => {
  try {
    const id = req.params.id;
    const student = db.ref("students").child(id);
    const data = await student.get();
    if (!data.exists) {
      res.status(404).send("Student with the given ID not found");
    } else {
      res.send(data.val());
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const student = db.ref("students").child(id);
    await student.update(data);
    res.send("Student data updated successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const id = req.params.id;
    db.ref("students").child(id).remove();
    res.send("Data deleted successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = {
  addStudent,
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
};
