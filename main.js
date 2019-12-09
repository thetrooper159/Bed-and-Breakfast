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
  res.locals.name = req.session.name;
  res.locals.count = count;
  next();
});

app.get('/', function(req, res) {
 res.render('home');
});

app.get('/adminb', function(req, res, next) {
  var conn = mysql.createConnection(credentials.connection);
  conn.query('SELECT bnb.user.name, bnb.reservation.sdate,bnb.reservation.edate FROM bnb.reservation INNER JOIN bnb.user ON bnb.reservation.user_ID = bnb.user.ID;',
   function(err, results, rows, fields){
    console.log(results);
    res.render('adminb', {rows: results});
  });
});

app.get('/adminc', function(req, res, next) {
  var conn = mysql.createConnection(credentials.connection);
  conn.query('SELECT bnb.contact.name, bnb.contact.email, bnb.contact.message FROM bnb.contact;',
   function(err, results, rows, fields){
    console.log(results);
    res.render('adminc', {rows: results});
  });
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

app.get('/booked', function(req, res){
	res.render('booked');
});

app.get('/contacted', function(req, res){
	res.render('contacted');
});

app.get('/login', function(req, res, count){
	res.render('login', { csrf: 'CSRF token goes here' });
});

app.get('/register', function(req, res){
	res.render('register', { csrf: 'CSRF token goes here' });
});

app.post('/regi', function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var users = {
      name: req.body.name,
      email: req.body.email
  }
    var conn = mysql.createConnection(credentials.connection);
    conn.query('INSERT INTO user SET ?', users, function(err, results, rows, fields) {
      if (err) {
        res.locals.message = "There seems to be an error.";
        res.redirect(303, '/register?error='+err);
      } else if (name && email) {
      		conn.query('SELECT * FROM user WHERE name = ? AND email = ?', [name, email], function(err, results, rows, fields) {
      			if (results.length > 0) {
      				req.session.loggedin = true;
      				req.session.name = name;
              req.session.user_ID = results[0].ID;
              console.log(req.session.user_ID);
      				res.redirect(303, '/');
              count++;
      			} else {
              res.locals.message = "There seems to be an error.";
      				res.redirect(303, '/login?error='+err);
      			}
      			res.end();
      		});
      	} else {
          res.locals.message = "There seems to be an error.";
          res.redirect(303, '/login?error='+err);
      		res.end();
      	}
    });
  });
app.post('/logi', function(req, res) {
	var name = req.body.name;
	var email = req.body.email;
	if (name && email) {
    var conn = mysql.createConnection(credentials.connection);
		conn.query('SELECT * FROM user WHERE name = ? AND email = ?', [name, email], function(err, results, rows, fields) {
      if (results.length > 0 && results[0].admin === 1) {
        req.session.loggedin = true;
        req.session.name = name;
        req.session.user_ID = results[0].ID;
        console.log(req.session.user_ID);
        count++;
        res.redirect(303,'/adminb');
      } else if (results.length > 0){
        req.session.loggedin = true;
        req.session.name = name;
        req.session.user_ID = results[0].ID;
        console.log(req.session.user_ID);
        count++;
        res.redirect(303,'/');
      } else {
        res.locals.message = "There seems to be an error.";
        res.redirect(303, '/login?error='+err);
      }
			res.end();
		});
	} else {
    res.locals.message = "There seems to be an error.";
    res.redirect(303, '/login?error='+err);
		res.end();
	}
});
app.get('/logout', function(req, res){
        delete req.session.name;
        res.redirect(303, '/');
        count--;
});
app.post('/bkr', function(req, res) {
  var sdate = req.body.sdate;
	var edate = req.body.edate;

  var dates = {
      sdate: req.body.sdate,
      edate: req.body.edate,
      user_ID: req.session.user_ID
  }
    var conn = mysql.createConnection(credentials.connection);
    conn.query('INSERT INTO reservation SET ?', dates, function(err, results, rows, fields) {
      if (err) {
        res.json({
            status:false,
            message:'there are some error with query: ' + err
        })
      }else{
          res.redirect('/booked');
        }
      })
    });

app.post('/ques', function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var message = req.body.message;

  var submit = {
      name: req.body.name,
      email: req.body.email,
      message: req.body.message
      }
        var conn = mysql.createConnection(credentials.connection);
        conn.query('INSERT INTO contact SET ?', submit, function(err, results, rows, fields) {
          if (err) {
            res.redirect(303, '/contact?error='+err);
          }else{
              res.redirect('/contacted');
            }
          })
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
