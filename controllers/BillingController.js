"use strict"

const logger      = require('../utils/logger');
const Billing        = require('../models/billing.model');
const self        = {};

self.createBilling = async (req, res) => {  
  try {
    const billings = [];
    console.log(req.body.students)

    if (typeof req.body.students === 'string') {
      const billing = {
        'invoiceNumber': req.body.invoiceNumber,
        'invoiceAmount': req.body.invoiceAmount,
        'invoiceDate': req.body.invoiceDate,
        'cae': req.body.cae,
        'caeDueDate': req.body.caeDueDate,
        'insurance': req.body.insurance,
        'concept': req.body.concept,
        'details': req.body.details,
        'period': req.body.period,
        'receiptNumber': req.body.receiptNumber,
        'receiptAmount': req.body.receiptAmount,
        'receiptDate': req.body.receiptDate,
        'rememberDate': req.body.rememberDate,
        'student': req.body.students,
      }
      await Billing.create(billing)
      return res.json(billing);
    }else{
      for (const student of req.body.students) {
        
        const billing = {
          'invoiceNumber': req.body.invoiceNumber,
          'invoiceAmount': req.body.invoiceAmount,
          'invoiceDate': req.body.invoiceDate,
          'cae': req.body.cae,
          'caeDueDate': req.body.caeDueDate,
          'insurance': req.body.insurance,
          'concept': req.body.concept,
          'details': req.body.details,
          'period': req.body.period,
          'receiptNumber': req.body.receiptNumber,
          'receiptAmount': req.body.receiptAmount,
          'receiptDate': req.body.receiptDate,
          'rememberDate': req.body.rememberDate,
          'student': student,
        }

        billings.push(await Billing.create(billing));
        logger.info('create billing', JSON.stringify(billing))
      }
      return res.json(billings);
    }
  } catch (e) {
    logger.error('create billing', e.message)
    res.json({error: e.message})
  }
};

self.getBillings = async (req, res) => {  
  try {
    const billings = await Billing.find({deletedAt: null});

    logger.info('get billings', JSON.stringify(billings))
    res.json(billings);
  } catch (e) {
    logger.error('get billings', e.message)
    res.json({error: e.message})
  }
};

self.getBillingsNotifications = async (req, res) => {  
  try {
    const {operation = 'add', days = '30'} = req.params;
    let billings = null;
    const rememberDateFrom = new Date();
    const rememberDateTo = new Date();

    if (operation === 'add') {
      rememberDateTo.setDate(rememberDateTo.getDate() + parseInt(days));
    } else {
      rememberDateTo.setDate(rememberDateTo.getDate() - parseInt(days));
    }

    if (parseInt(days) === 0) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 59, 999);

      billings = await Billing.find({deletedAt: null, rememberDate: {$gte: todayStart, $lte: todayEnd}});
    } else {
      billings = await Billing.find({deletedAt: null, rememberDate: {$gte: rememberDateFrom, $lt: rememberDateTo}});
    }

    logger.info('get billings', JSON.stringify(billings))
    res.json(billings);
  } catch (e) {
    logger.error('get billings', e.message)
    res.json({error: e.message})
  }
};

self.getAllBillingsNotifications = async (req, res) => {  
  try {
    const billings = await Billing.find({deletedAt: null});
    logger.info('get billings', JSON.stringify(billings))
    res.json(billings);
  } catch (e) {
    logger.error('get billings', e.message)
    res.json({error: e.message})
  }
};

self.getBillingById = async (req, res) => {  
  try {
    const billingId = req.params.billingId;
    const billing = await Billing.findOne({_id: billingId, deletedAt: null})
    logger.info('get billing by id', billingId)
    res.json(billing);
  } catch (e) {
    logger.error('get billing by id', e.message)
    res.json({error: e.message})
  }
};

self.getBillingByBillingname = async (req, res) => {  
  try {
    const search = req.params.billingname;
    const billing = await Billing.findOne({billingname: search, deletedAt: null}).exec()
    logger.info('get billing by billingname', search)
    res.json(billing);
  } catch (e) {
    logger.error('get billing by billingname', e.message)
    res.json({error: e.message})
  }
};

self.getBillingByIdAndUpdate = async (req, res) => {  
  try {
    const billingId = req.params.billingId;

    const filter = { _id: billingId, deletedAt: null };
    const update = req.body;

    await Billing.findOneAndUpdate(filter, update)
    const updatedBilling = await Billing.findOne({_id: billingId})
    console.log('update billing by id', billingId, ' update', JSON.stringify(update))
    res.json(updatedBilling);
  } catch (e) {
    logger.error('update billing by id', e.message)
    res.json({error: e.message})
  }
};

self.deleteBillingById = async (req, res) => {  
  try {
    const billingId = req.params.billingId;

    const filter = { _id: billingId };
    const update = {deletedAt: Date.now()};

    await Billing.findOneAndUpdate(filter, update)
    const updatedBilling = await Billing.findOne({_id: billingId})
    logger.info('delete billing by id', billingId)
    res.json(updatedBilling);
  } catch (e) {
    logger.error('delete billing by id', e.message)
    res.json({error: e.message})
  }
};

module.exports = self;