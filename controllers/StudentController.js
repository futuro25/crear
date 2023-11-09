"use strict"

const logger     = require('../utils/logger');
const Student    = require('../models/student.model');
const uploadImage = require('../utils/utils');
const utilsController = require('./UtilsController');
const self       = {};

self.createStudent = async (req, res) => {  
  try {
    const student = {
      "name": req.body.name,
      "lastName": req.body.lastName,
      "email": req.body.email,
      "documentNumber": req.body.documentNumber,
      "pictureUrl": req.body.pictureUrl,
      "healthInsurance": req.body.healthInsurance,
      "cudUrl": req.body.cudUrl,
      "cudDueDate": req.body.cudDueDate,
      "billingDue": req.body.billingDue,
      "course": req.body.course
    }
    const newStudent = await Student.create(student);
    await utilsController.createLog('Student created', JSON.stringify(newStudent));
    logger.info('create student', JSON.stringify(student))
    return res.json(newStudent);
  } catch (e) {
    logger.error('create student', e.message)
    res.json({error: e.message})
  }
};

self.getStudents = async (req, res) => {  
  try {
    const students = await Student.find({deletedAt: null});

    logger.info('get students', JSON.stringify(students))
    res.json(students);
  } catch (e) {
    logger.error('get students', e.message)
    res.json({error: e.message})
  }
};

self.getStudentById = async (req, res) => {  
  try {
    const studentId = req.params.studentId;
    const student = await Student.findOne({_id: studentId, deletedAt: null})

    logger.info('get student by id', studentId)
    res.json(student);
  } catch (e) {
    logger.error('get student by id', e.message)
    res.json({error: e.message})
  }
};

self.getStudentByIdAndUpdate = async (req, res) => {  
  try {
    const studentId = req.params.studentId;

    const filter = { _id: studentId, deletedAt: null };
    const update = req.body;

    await Student.findOneAndUpdate(filter, update)
    const updatedStudent = await Student.findOne({_id: studentId})
    logger.info('update student by id', studentId, ' update', JSON.stringify(update))
    await utilsController.createLog('Student deleted', JSON.stringify(updatedStudent));
    res.json(updatedStudent);
  } catch (e) {
    logger.error('update student by id', e.message)
    res.json({error: e.message})
  }
};

self.deleteStudentById = async (req, res) => {  
  try {
    const studentId = req.params.studentId;

    const filter = { _id: studentId };
    const update = {deletedAt: Date.now()};

    await Student.findOneAndUpdate(filter, update)
    const updatedStudent = await Student.findOne({_id: studentId})
    await utilsController.createLog('Student deleted', JSON.stringify(updatedStudent));
    logger.info('delete student by id', studentId)
    res.json(updatedStudent);
  } catch (e) {
    logger.error('delete student by id', e.message)
    res.json({error: e.message})
  }
};

self.getStudentsFunction = async () => {  
  try {
    const students = await Student.find({deletedAt: null});

    logger.info('get students', JSON.stringify(students))
    return students;
  } catch (e) {
    logger.error('get students', e.message)
    return {error: e.message}
  }
};

module.exports = self;