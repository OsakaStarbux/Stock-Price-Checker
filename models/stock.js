//Require Mongoose
const mongoose = require('mongoose')

//Define a schema
const Schema = mongoose.Schema

var StockSchema = new Schema({
  symbol: {type: String, required: true},
  likes: [String]
},{ toJSON: { virtuals: true } }) //include virtual fields when using Express res.json

//Virtual for comment count
StockSchema.virtual('likecount')
  .get(function(){
  return this.likes.length
  })

module.exports = mongoose.model('Stock', StockSchema );