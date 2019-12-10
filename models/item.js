var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

//여행지, 이름, 가격, 설명, 여행 코스
var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'Guide' },
  cityName: {type: String, trim: true, required: true},
  tourTitle: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  tourCourse: {type: String, trim: true, required: true},
  createdAt: {type: Date, default: Date.now}
  //numLikes: {type: Number, default: 0},
  //numAnswers: {type: Number, default: 0},
  //numReads: {type: Number, default: 0},
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Question = mongoose.model('item', schema);

module.exports = item;