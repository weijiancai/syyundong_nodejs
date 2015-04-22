var dbo = require('./../routes/dbo');
var db = require('../lib/db');
var config = require('../lib/config');
var async = require('async');
var express = require('express');
var request = require('request');
var router = express.Router();

//db.setDataSource(config.getDataSource('sh'));

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('tools/tools', res.data);
});

router.post('/dbBrowser', function(req, res, next) {
    var id = req.body.id;
    var type = req.body.type;
    db.getDbObjects(id, type, function(data) {
        res.send(data);
    });
});

router.get('/getWebPage', function(req, res, next) {
    var url = req.query.url;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            res.send(body);
        }
    })
});


module.exports = router;
