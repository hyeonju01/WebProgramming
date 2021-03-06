var createError = require('http-errors');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');
var item = require('./routes/item');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

app.locals.moment = require('moment');
app.locals.querystring = require('querystring');

// MongoDB Connect
mongoose.Promise = global.Promise; // ES6 Native Promise를 mongoose에서 사용한다.
mongoose.connect('mongodb+srv://user:user@cluster0-sa8xv.mongodb.net/test?retryWrites=true&w=majority', {
  useMongoClient: true
});
mongoose.connection.on('error', console.error);



//Favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// _method로 method 변경할 수 있도록 함.
app.use(methodOverride('_method', {methods: ['POST', 'GET']}));

app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
//sass, scss 사용할 수 있도록 함.
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  debug: true,
  sourceMap: true
}));

//session
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'long-long-long-secret-string-1313513tefgwdsvbjkvasd'
}));

app.use(flash());

//public 디렉토리의 내용들을 static service.
app.use(express.static(path.join(__dirname, 'public')));

// pug의 local에 현재 사용자 정보와 flash 메시지를 전달하자.
app.use(function(req, res, next) {
  res.locals.currentUser = req.session.user;
  res.locals.flashMessages = req.flash();
  next();
});

//Route
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
