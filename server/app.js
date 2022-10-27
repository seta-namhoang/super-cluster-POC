var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { mapController } = require('./controller/index');
const { initMap } = require('./map/mapIndex')
const cors = require('cors');
const { getCacheInstance } = require('./cache');
const cacheInstance = getCacheInstance();
const mapRouter = require('./routes/index');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
let index;
try {
  if (cacheInstance.get('mapInstance')) {
    index = cacheInstance.get('mapInstance')
  } else {
    index = initMap();
    cacheInstance.set('mapInstance', index, 10000000)
  }
  app.set('mapIndex', index)
} catch (err) {
  console.log(err);
}
//index map
app.use('/', mapRouter);


// catch 404 and forward to error handler‰
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
