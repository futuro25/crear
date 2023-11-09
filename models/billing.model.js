var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var billingSchema = new Schema({
    'invoiceNumber': {type:String, required:false},
    'invoiceAmount': {type:String, required:false},
    'invoiceDate': {type:String, required:false},
    'insurance': {type:String, required:false},
    'cae': {type:String, required:false},
    'caeDueDate': {type:String, required:false},
    'period': {type:String, required:false},
    'concept': {type:String, required:false},
    'details': {type:[String], required:false},
    "rememberDate": {type: Date, default: null},
    'receiptNumber': {type:String, required:false},
    'receiptAmount': {type:String, required:false},
    'receiptDate': {type:String, required:false},
    'student': {type:String, required:false},
    "createdAt": {type: Date, default: Date.now},
    "updatedAt": {type: Date, default: Date.now},
    "deletedAt": {type: Date, default: null}
});


module.exports = mongoose.model('Billing', billingSchema);
