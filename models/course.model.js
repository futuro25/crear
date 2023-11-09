var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var courseSchema = new Schema({
    'name': {type:String, required:false},
    'price': {type:String, required:false},
    "createdAt": {type: Date, default: Date.now},
    "updatedAt": {type: Date, default: Date.now},
    "deletedAt": {type: Date, default: null}
});


module.exports = mongoose.model('Course', courseSchema);
