"use strict"

const logger      = require('../utils/logger');
const User        = require('../models/user.model');
const sendEmail = require('../utils/emails');
const utilsController = require('./UtilsController');
const self        = {};

self.createUser = async (req, res) => {  
  try {
    const user = {
      'name': req.body.name,
      'lastName': req.body.lastName,
      'username': req.body.username,
      'email': req.body.email,
      'pictureUrl': req.body.pictureUrl,
      'securityLevel': req.body.securityLevel
    }

    const newUser = await User.create(user);
    const inviteLink = "http://localhost:3000/invite?inviteId="+newUser._id;

    const html = '<div className="flex text-sm w-full px-4"><div className="w-full py-4 flex flex-col justify-start"><p className="p-2">Bienvenid@ Leandro!</p><p className="p-2">Habilita tu usuario haciendo <a href="'+inviteLink+'">click aqui</a></p></div></div>';

    const sendedEmail = await sendEmail(user.email, "Hello ✔", html)

    await utilsController.createLog('User created', JSON.stringify(newUser));

    logger.info('create user', JSON.stringify(user))
    logger.info('email sended', sendedEmail)
    return res.json(newUser);
  } catch (e) {
    logger.error('create user', e.message)
    res.json({error: e.message})
  }
};

self.getUsers = async (req, res) => {  
  try {
    const users = await User.find({deletedAt: null});
    logger.info('get users', JSON.stringify(users))
    res.json(users);
  } catch (e) {
    logger.error('get users', e.message)
    res.json({error: e.message})
  }
};

self.getUserById = async (req, res) => {  
  try {
    const userId = req.params.userId;
    const user = await User.findOne({_id: userId, deletedAt: null})
    logger.info('get user by id', userId)
    res.json(user);
  } catch (e) {
    logger.error('get user by id', e.message)
    res.json({error: e.message})
  }
};

self.getUserByUsername = async (req, res) => {  
  try {
    const search = req.params.username;
    const user = await User.findOne({username: search, deletedAt: null}).exec()
    logger.info('get user by username', search)
    res.json(user);
  } catch (e) {
    logger.error('get user by username', e.message)
    res.json({error: e.message})
  }
};

self.getUserByIdAndUpdate = async (req, res) => {  
  try {
    const userId = req.params.userId;

    const filter = { _id: userId, deletedAt: null };
    const update = req.body;

    await User.findOneAndUpdate(filter, update)
    const updatedUser = await User.findOne({_id: userId})
    console.log('update user by id', userId, ' update', JSON.stringify(update))
    await utilsController.createLog('User updated', JSON.stringify(updatedUser));
    res.json(updatedUser);
  } catch (e) {
    logger.error('update user by id', e.message)
    res.json({error: e.message})
  }
};

self.deleteUserById = async (req, res) => {  
  try {
    const userId = req.params.userId;

    const filter = { _id: userId };
    const update = {deletedAt: Date.now()};

    await User.findOneAndUpdate(filter, update)
    const updatedUser = await User.findOne({_id: userId})
    await utilsController.createLog('User deleted', JSON.stringify(updatedUser));
    logger.info('delete user by id', userId)
    res.json(updatedUser);
  } catch (e) {
    logger.error('delete user by id', e.message)
    res.json({error: e.message})
  }
};

module.exports = self;