var dbo = require('./../routes/dbo');
var db = require('../lib/db');
var config = require('../lib/config');
var async = require('async');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
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
    var selector = req.query.selector;
    /*request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            var $ = cheerio.load(body, {

            });
            console.log($(selector));
            console.log('-------------------------------------------');
            console.log($(selector).html());
            console.log($.html(selector));
            res.send($.html(selector));
        }
    })*/

    var j = request.jar();
    var cookie = request.cookie('Hm_lvt_244cac09e43da18d8a6a190c615e0daa=1429193496,1429453854,1429713115,1429803518; Hm_lpvt_244cac09e43da18d8a6a190c615e0daa=1429807004; passport=fmyupssl7ceu2hlidzpmbmnbqqy1ae9w');
    j.setCookie(cookie, url);
    request({url: url, jar: j}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            var $ = cheerio.load(body, {

            });
            console.log($(selector));
            console.log('-------------------------------------------');
            console.log($(selector).html());
            console.log($.html(selector));
            res.send($.html(selector));
        }
    })
});


module.exports = router;
