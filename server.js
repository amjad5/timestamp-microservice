'use strict';

var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var moment = require('moment')


app.use(bodyParser.urlencoded({ extended: false }))

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
        console.log(req.params)
        res.sendFile(process.cwd() + '/views/index.html');
    })

app.route('/:time?')
    .get(function(req, res) {
      var time = req.params.time;
      const obj = new Object();
      if(Number(time)){
        time = Number(time)
        obj.unix = moment.unix(time).format('X')
        obj.natural = moment(time, 'X').format("MMMM DD,YYYY");
      }else{
        obj.unix = moment(time, "MMMM DD,YYYY").format('X')
        obj.natural = moment(time, "MMMM DD,YYYY").format("MMMM DD,YYYY");
      }
      res.json(obj)
    })


// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.APPPORT, function () {
  console.log('Node.js listening ...');
});

