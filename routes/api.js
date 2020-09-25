"use strict";

const expect             = require("chai").expect;
const mongoose           = require('mongoose')
const CONNECTION_STRING  = process.env.DB;
const ObjectId           = mongoose.ObjectID
const fetch              = require("node-fetch");
const StockHandler       = require('../controllers/stockHandler.js');
const stock_url_prefix   = process.env.STOCK_API;

mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false 
}, function(err, client) {
  if (err) {
    console.log("DB err: ", err);
  }
  
  console.log("Runnning DB" )
})

module.exports = function(app) {
  app.route("/api/stock-prices").get([StockHandler.stockHandler, StockHandler.stockPairHandler]);
};
