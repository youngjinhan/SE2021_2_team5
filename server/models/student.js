class Student {
  constructor(
    id,
    sid,
    firstName,
    lastName,
    major,
    lectCheck,
    chemCheck,
    electCheck,
    isDone
  ) {
    this.id = id;
    this.sid = sid;
    this.firstName = firstName;
    this.lastName = lastName;
    this.major = major;
    this.lectCheck = lectCheck;
    this.chemCheck = chemCheck;
    this.electCheck = electCheck;
    this.isDone = isDone;
  }
}

module.exports = Student;
