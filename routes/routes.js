"use strict"

const express  = require('express');
const router   = express.Router();
const userController     = require('../controllers/UserController');
const studentController     = require('../controllers/StudentController');
const insuranceController     = require('../controllers/InsuranceController');
const courseController     = require('../controllers/CourseController');
const billingController     = require('../controllers/BillingController');
const utilsController     = require('../controllers/UtilsController');

// USER
router.get('/users', (req, res, next) => userController.getUsers(req, res, next));
router.get('/users/:userId', (req, res, next) => userController.getUserById(req, res, next));
router.get('/users/:username', (req, res, next) => userController.getUserByUsername(req, res, next));
router.post('/users', (req, res, next) => userController.createUser(req, res, next));
router.patch('/users/:userId', (req, res, next) => userController.getUserByIdAndUpdate(req, res, next));
router.delete('/users/:userId', (req, res, next) => userController.deleteUserById(req, res, next));

// STUDENT
router.get('/students', (req, res, next) => studentController.getStudents(req, res, next));
router.get('/students/:studentId', (req, res, next) => studentController.getStudentById(req, res, next));
router.post('/students', (req, res, next) => studentController.createStudent(req, res, next));
router.patch('/students/:studentId', (req, res, next) => studentController.getStudentByIdAndUpdate(req, res, next));
router.delete('/students/:studentId', (req, res, next) => studentController.deleteStudentById(req, res, next));

// INSURANCE
router.get('/insurances', (req, res, next) => insuranceController.getInsurances(req, res, next));
router.get('/insurances/:insuranceId', (req, res, next) => insuranceController.getInsuranceById(req, res, next));
router.post('/insurances', (req, res, next) => insuranceController.createInsurance(req, res, next));
router.patch('/insurances/:insuranceId', (req, res, next) => insuranceController.getInsuranceByIdAndUpdate(req, res, next));
router.delete('/insurances/:insuranceId', (req, res, next) => insuranceController.deleteInsuranceById(req, res, next));

// COURSES
router.get('/courses', (req, res, next) => courseController.getCourses(req, res, next));
router.get('/courses/:courseId', (req, res, next) => courseController.getCourseById(req, res, next));
router.post('/courses', (req, res, next) => courseController.createCourse(req, res, next));
router.patch('/courses/:courseId', (req, res, next) => courseController.getCourseByIdAndUpdate(req, res, next));
router.delete('/courses/:courseId', (req, res, next) => courseController.deleteCourseById(req, res, next));

// BILLING
router.get('/billings', (req, res, next) => billingController.getBillings(req, res, next));
router.get('/billings/:billingId', (req, res, next) => billingController.getBillingById(req, res, next));
router.post('/billings', (req, res, next) => billingController.createBilling(req, res, next));
router.patch('/billings/:billingId', (req, res, next) => billingController.getBillingByIdAndUpdate(req, res, next));
router.delete('/billings/:billingId', (req, res, next) => billingController.deleteBillingById(req, res, next));
router.get('/notifications', (req, res, next) => billingController.getAllBillingsNotifications(req, res, next));
router.get('/notifications/:operation/:days', (req, res, next) => billingController.getBillingsNotifications(req, res, next));

// UTILS
router.post('/resources', (req, res, next) => utilsController.upload(req, res, next));
router.post('/receipt', (req, res, next) => utilsController.createReceipt(req, res, next));
router.get('/logs', (req, res, next) => utilsController.getLogs(req, res, next));

// router.post('/students/upload', (req, res, next) => studentController.upload(req, res, next));

module.exports = router;