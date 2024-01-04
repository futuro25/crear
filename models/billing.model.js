var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var receiptSchema = new Schema({
  'receiptNumber': {type:String, required:false},
  'receiptAmount': {type:String, required:false},
  'receiptDate': {type:String, required:false},
  'bankName': {type:String, required:false},
  'paymentReceiptNumber': {type:String, required:false},
  'paymentDetail': {type:String, required:false},
})

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
  'receipts': {type:[receiptSchema], required:false},
  'withholdingName1': {type:String, required:false},
  'withholdingAmount1': {type:String, required:false},
  'withholdingName2': {type:String, required:false},
  'withholdingAmount2': {type:String, required:false},
  'withholdingName3': {type:String, required:false},
  'withholdingAmount3': {type:String, required:false},
  'withholdingName4': {type:String, required:false},
  'withholdingAmount4': {type:String, required:false},
  'withholdingName5': {type:String, required:false},
  'withholdingAmount5': {type:String, required:false},
  'paidInFull': {type:Boolean, required:false},
  'student': {type:String, required:false},
  "createdAt": {type: Date, default: Date.now},
  "updatedAt": {type: Date, default: Date.now},
  "deletedAt": {type: Date, default: null}
});


module.exports = mongoose.model('Billing', billingSchema);
