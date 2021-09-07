var createError = require('http-errors');
var cookieSession = require('cookie-session')

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var login = require('./routes/login');
var api = require('./routes/api')
var admin = require('./routes/Admin/Login');
var adminDashboard = require('./routes/Admin/Dashboard')
var vendor_registeration = require('./routes/Vendor/registeration')
var vendor_dashboard = require('./routes/Vendor/vendorDashboard');
var vendorLogin = require('./routes/Vendor/login');

var banner = require('./routes/banner');
var repurchasingapi = require('./routes/repurchasing_api');
var talentHunt = require('./routes/talentHunt');

var repurchasingapi = require('./routes/repurchasing_api')
var mlm = require('./routes/mlm');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));










app.use(cookieSession({
  name: 'session',
  keys: ['political-frames'],
 
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))




app.use('/login',login);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin',admin);
app.use('/admin/dashboard',adminDashboard);
app.use('/api',api);
app.use('/vendor-registeration',vendor_registeration);
app.use('/vendor-dashboard',vendor_dashboard);
app.use('/vendor-login',vendorLogin);

app.use('/banner',banner);
app.use('/repurchasing-api',repurchasingapi);
app.use('/talent-hunt',talentHunt)

app.use('/repurchasing-api',repurchasingapi);
app.use('/mlm',mlm);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
