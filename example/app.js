'use strict';

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();
var logger = express.logger('dev');

require('node-sec')(app,{
    csp:{
      script: ['https://ajax.googleapis.com', 'https://platform.twitter.com', "'unsafe-inline'"],
      style: ["'unsafe-inline'"],
      frame: ['https://platform.twitter.com', 'https://facebook.com'],
      img: ['https://goo.gl'],
      connect: ["'self'", 'http://localhost:3001'],
      report: '/report',
      //reportOnly: true
    },
    xframe: 'SAMEORIGIN',
    // Allow CORS access from URLs
    cors:{
      origin: ['http://localhost:3000']
    }
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(logger);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});


app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/',function (req, res) {
  res.send('<html><head><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>\
  </head><body>hello<img src="https://goo.gl/Huxlm"/><a href="http://localhost:3000/">meee</a>\
  <script>$.ajax({\
  url: "http://localhost:3001/",\
  context: document.body\
}).done(function() {\
  console.log("done");\
});</script>\
  </body></html>');
 }
);

app.post('/report', function(req, res){
    console.log(req.body);
    res.send('');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
