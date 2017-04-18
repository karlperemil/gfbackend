var express = require('express');
var app = express();

var mongo = require('mongodb');
var monk = require('monk');
var bodyParser = require('body-parser');
var db = monk(process.env.MONGODB_URI || 'localhost:27017/nodetest1');

process.env.PORT

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next()
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/',function(req,res){
    res.send('are you really supposed to be here');
});



// respond with "hello world" when a GET request is made to the homepage
app.post('/sendhighscore', function (req, res) {
  var db = req.db;
  var level = req.body.level;
  var highscore = req.body.highscore;
  var playername = req.body.playername;
  var key = req.body.key;

  if(key !== level.substr(0,1) + highscore.substr(0,1) + playername.substr(0,1)){
    res.send("oh no you didn't!");
    return;
  }

  // Set our collection
  var collection = db.get('highscore');

  // Submit to the DB
  collection.insert({
      "level" : level,
      "highscore" : highscore,
      "playername" : playername
  }, function (err, doc) {
      if (err) {
          // If it failed, return error
          res.send("There was a problem adding the information to the database.");
      }
      else {
          // And forward to success page
          res.send("ok"+" "+ level+" "+highscore+" "+playername);
      }
  });
})

app.get('/gethighscore', function (req, res) {
  var collection = db.get('highscore');
  collection.find({},{},function(e,docs){
      docs = JSON.stringify(docs);
      res.send(docs);
  });
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'));