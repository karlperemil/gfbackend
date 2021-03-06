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
  var time = req.body.time;
  var key = req.body.key;
  var country = req.body.country;

  var compareKey = getKey(level,highscore,playername);
  console.log(key,compareKey);

  if(key !== compareKey){
    res.send("oh no you didn't!" +" "+ level +" "+ highscore +" "+ playername + " " + time +" "+ key);
    return;
  }

  // Set our collection
  var collection = db.get('highscore');

  // Submit to the DB
  collection.insert({
      "level" : level,
      "highscore" : highscore,
      "playername" : playername,
      "time" : time,
      "country" : country
  }, function (err, doc) {
      if (err) {
          // If it failed, return error
          res.send("There was a problem adding the information to the database.");
      }
      else {
          // And forward to success page
          res.send("ok"+" "+ level+" "+highscore+" "+playername+" "+time);
      }
  });
})

function getKey(level,highscore,playername){
    var finalVal = 0;
    for(var i = 0; i < level.length; i++){
        finalVal += level.charCodeAt(i);
    }
    for(var i = 0; i < highscore.length; i++){
        finalVal += highscore.charCodeAt(i);
    }
    for(var i = 0; i < playername.length; i++){
        finalVal += playername.charCodeAt(i);
    }
    return finalVal.toString();
}

app.get('/gethighscore/:level/:country/:mode', function (req, res) {
  var collection = db.get('highscore');
  var sort = -1;
  if(req.param.mode == "designed"){
    collection.find({level:req.params.level, country: req.params.country},{ limit : 10, sort : { time : 1 }},function(e,docs){
        docs = JSON.stringify(docs);
        docs = '{"highscoreentries": '+ docs + '}';
        res.send(docs);
    });
  }
  else {
      collection.find({level:req.params.level, country: req.params.country},{ limit : 10, sort : { highscore : -1 }},function(e,docs){
        docs = JSON.stringify(docs);
        docs = '{"highscoreentries": '+ docs + '}';
        res.send(docs);
    });
  }
  
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'));