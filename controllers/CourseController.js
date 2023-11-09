"use strict"

const logger      = require('../utils/logger');
const Course   = require('../models/course.model');
const self        = {};

self.createCourse = async (req, res) => {  
  try {
    const course = {
      'name': req.body.name,
      'price': req.body.price
    }
    const newCourse = await Course.create(course);
    logger.info('create course', JSON.stringify(course))
    return res.json(newCourse);
  } catch (e) {
    logger.error('create course', e.message)
    res.json({error: e.message})
  }
};

self.getCourses = async (req, res) => {  
  try {
    const courses = await Course.find({deletedAt: null});
    logger.info('get courses', JSON.stringify(courses))
    res.json(courses);
  } catch (e) {
    logger.error('get courses', e.message)
    res.json({error: e.message})
  }
};

self.getCourseById = async (req, res) => {  
  try {
    const courseId = req.params.courseId;
    const course = await Course.findOne({_id: courseId, deletedAt: null})
    logger.info('get course by id', courseId)
    res.json(course);
  } catch (e) {
    logger.error('get course by id', e.message)
    res.json({error: e.message})
  }
};

self.getCourseByIdAndUpdate = async (req, res) => {  
  try {
    const courseId = req.params.courseId;

    const filter = { _id: courseId, deletedAt: null };
    const update = req.body;

    await Course.findOneAndUpdate(filter, update)
    const updatedCourse = await Course.findOne({_id: courseId})
    console.log('update course by id', courseId, ' update', JSON.stringify(update))
    res.json(updatedCourse);
  } catch (e) {
    logger.error('update course by id', e.message)
    res.json({error: e.message})
  }
};

self.deleteCourseById = async (req, res) => {  
  try {
    const courseId = req.params.courseId;

    const filter = { _id: courseId };
    const update = {deletedAt: Date.now()};

    await Course.findOneAndUpdate(filter, update)
    const updatedCourse = await Course.findOne({_id: courseId})
    logger.info('delete course by id', courseId)
    res.json(updatedCourse);
  } catch (e) {
    logger.error('delete course by id', e.message)
    res.json({error: e.message})
  }
};

module.exports = self;