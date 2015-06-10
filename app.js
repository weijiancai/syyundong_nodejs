var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
var multer  = require('multer');
var config = require('./lib/config');

// 初始化config
config.init();
config.addSystemDataSource('mysql', 'localhost', '3306', 'root', 'root', 'syyundong');

var dbo = require('./routes/dbo');

var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var tools = require('./tools/route');
var meta = require('./tools/meta');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '')));
app.use(express.static(__dirname + '/uploads'));
app.use(multer({ dest: './uploads/'}));

app.use(function(req, res, next) {
    // 项目目录
    req.projectDir =  path.join(__dirname, '');
    // 运动项目
    var groupName = require('url').parse(req.url).pathname;
    res.data = {groupName: groupName};
    async.parallel({
        sports: function(callback) {
            dbo.getSports(function(sports) {
                callback(null, sports);
            })
        }
    }, function(err, results) {
        res.data.games = results.sports.getGames();
        res.data.activities = results.sports.getActivities();
        res.data.venues = results.sports.getVenues();

        next();
    });
});

app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin);
app.use('/tools', tools);
app.use('/meta', meta);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
