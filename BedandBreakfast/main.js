var express = require('express');
var app = express();
var fortune = require('./lib/fortune.js');
var formidable = require('formidable');
var credentials = require('./credentials.js');
var mysql = require("mysql");
var path = require('path');
var count = 0;

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
 defaultLayout:'main',
 helpers: {
 section: function(name, options){
 if(!this._sections) this._sections = {};
 this._sections[name] = options.fn(this);
 return null;
 }
 }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({extended:true}));
app.use(require('express-session')({
  resave: false,
  saveUniitialized: false,
  secret:credentials.cookieSecret,
}));

app.set('port', process.env.PORT || 3001);

if( app.thing == null ) console.log( 'bleat!' );

app.use(function(req, res, next){
 res.locals.showTests = app.get('env') !== 'production' &&
 req.query.test === '1';
 next();
});
app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
 	res.locals.partials.weatherContext = getWeatherData();
 	next();
});
app.use(function(req, res, next){
  res.locals.name = req.session.name;
  res.locals.count = count;
  next();
});

app.get('/', function(req, res) {
 res.render('home');
});

app.get('/book', function(req, res) {
 res.render('book');
});

app.get('/about', function(req, res) {
 res.render('about');
});

app.get('/contact', function(req, res) {
 res.render('contact');
});

app.get('/thank-you', function(req, res){
	res.render('thank-you');
});

app.get('/login', function(req, res, count){
	res.render('login', { csrf: 'CSRF token goes here' });
});

function getWeatherData(){
    return {
        locations: [
           {
                name: 'Pittsburgh',
                forecastUrl: 'http://www.wunderground.com/US/PA/Pittsburgh.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '69 F',
            },
        ],
    };
}
app.post('/process', function(req, res){
    //if(req.xhr || req.accepts('json,html')==='json'){
      //  req.session.name = req.body.name;
      //  res.send({ success: true });
      //  count++;
    //} else {
        // if there were an error, we would redirect to an error page
        var conn = mysql.createConnection(credentials.connection);
        conn.connect(function(err) {
          if (err) {
            console.error("ERROR: cannot connect: " + err);
            return;
          }
          conn.query("SELECT * FROM user", function(err, rows, fields) {
            if (err) {
              console.error("ERROR: query failed: " + err);
              return;
            }
            console.log(JSON.stringify(rows));
          });
          conn.end();
        });
        console.log('Form (from querystring): ' + req.query.form);
        console.log('CSRF token (from hidden form field): ' + req.body._csrf);
        console.log('Name (from visible form field): ' + req.body.name);
        req.session.name = req.body.name;
        console.log('Email (from visible form field): ' + req.body.email);
        res.redirect(303, '/');
        count++;
  //  }
});
app.post('/auth', function(req, res) {
	var name = req.body.name;
	var email = req.body.email;
  var conn = mysql.createConnection(credentials.connection);
	if (name && email) {
		conn.query('SELECT * FROM user WHERE name = ? AND email = ?', [name, email], function(err, results, rows, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.name = name;
				res.redirect(303, '/');
        count++;
			} else {
				res.send('Incorrect Name and/or Email!');
			}
			res.end();
		});
	} else {
		res.send('Please enter Name and Email!');
		res.end();
	}
});
app.get('/logout', function(req, res){
  //  if(req.xhr || req.accepts('json,html')==='json'){
  //      delete req.session.name;
    //    res.send({ success: true });
    //    count--;
//    } else {
        // if there were an error, we would redirect to an error page
        delete req.session.name;
        res.redirect(303, '/');
        count--;
//    }
});
// 404 catch-all handler (middleware)
app.use(function(req, res, next){
 res.status(404);
 res.render('404');
});
// 500 error handler (middleware)
app.use(function(err, req, res, next){
 console.error(err.stack);
 res.status(500);
 res.render('500');
});

app.listen(app.get('port'), function(){
 console.log( 'Express started on http://localhost:' +
 app.get('port') + '; press Ctrl-C to terminate.' );
});
