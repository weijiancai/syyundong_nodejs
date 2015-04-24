var dbo = require('./../routes/dbo');
var db = require('../lib/db');
var config = require('../lib/config');
var async = require('async');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
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
    var cookie = req.query.cookie;
    var localFilePath = req.query.localFilePath;

    request({
        url: url,
        headers: {
            Cookie: cookie,
            "Accept-Language": "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3"
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body, {
                ignoreWhitespace: false,
                normalizeWhitespace: false,
                xmlMode: false,
                decodeEntities: false
            });
            var html = $.html(selector);
            // 保存到本地文件
            if(localFilePath) {
                fs.writeFile(localFilePath, html);
            }
            res.send(html);
        } else {
            console.log('error = ' + error);
            console.log('statusCode = ' + response.statusCode);
        }
    })
});


module.exports = router;
