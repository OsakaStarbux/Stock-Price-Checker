const fetch = require("node-fetch");

const Stock = require("../models/stock");

exports.stockHandler = async function(req, res, next) {
  const { stock, like } = req.query;
  if (Array.isArray(stock)) {
    next();
    return;
  }
  const IP = req.headers["x-forwarded-for"].split(",")[0];

  let url = process.env.STOCK_API + stock + "/quote";

  // look up the ticker in the db
  // if the ticker does not exist, add it
  const filter = { symbol: stock };
  let update = {};
  if (like) {
    update = { $addToSet: { likes: IP } }; // add the ip if it doesn't exist
  }

  let doc = await Stock.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true // Make this update into an upsert
  });
  let likes = doc.likecount;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const { symbol, latestPrice } = data;
      res.json({
        stockData: {
          stock: symbol,
          price: `${latestPrice}`,
          likes
        }
      });
    })
    .catch(err => console.log(err));
};

exports.stockPairHandler = async function(req, res) {
  const { stock, like } = req.query; // object destructuring
  const IP = req.headers["x-forwarded-for"].split(",")[0];
  // look up the ticker in the db
  // if the ticker does not exist, add it
  let [ticker1, ticker2] = stock; // array destructuring
  const filter = { symbol: stock };
  let update = {};
  if (like) {
    update = { $addToSet: { likes: IP } }; // add the ip if it doesn't exist
  }

  let doc1 = await Stock.findOneAndUpdate({ symbol: ticker1 }, update, {
    new: true,
    upsert: true // Make this update into an upsert
  });

  let doc2 = await Stock.findOneAndUpdate({ symbol: ticker2 }, update, {
    new: true,
    upsert: true // Make this update into an upsert
  });
  // stock is an array of 2 ticker symbols
  let url1 = process.env.STOCK_API + ticker1 + "/quote";
  let url2 = process.env.STOCK_API + ticker2 + "/quote";

  let response1 = await fetch(url1);
  let response2 = await fetch(url2);

  let jsonData1 = await response1.json();
  let jsonDdata2 = await response2.json();

  res.json({
    stockData: [
      {
        stock: jsonData1.symbol,
        price: `${jsonData1.latestPrice}`,
        rel_likes: doc1.likecount - doc2.likecount
      },
      {
        stock: jsonDdata2.symbol,
        price: `${jsonDdata2.latestPrice}`,
        rel_likes: doc2.likecount - doc1.likecount
      }
    ]
  });
};
