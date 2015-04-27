var dbo = require('./../routes/dbo');
var db = require('../lib/db');
var config = require('../lib/config');
var async = require('async');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Ftp = require('ftp');
var iconv = require('iconv-lite');
var FTPS = require('ftps');
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

router.post('/dbRetrieve', function(req, res, next) {
    var id = req.body.id;
    db.query('SELECT * FROM ' + id, function(data) {
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

router.post('/ftpBrowser', function(req, res, next) {
    var path = req.body.path;

    if(!path) {
        path = '/';
    }
    var files = [];
    var ftp = new Ftp();
    ftp.on('ready', function() {
        ftp.list(path, function(err, list) {
            if (err) {
                console.log(err);
            } else {
                for(var i = 0; i < list.length; i++) {
                    var name = iconv.decode(new Buffer(list[i].name, 'binary'), 'GBK');
                    list[i].path = path == '/' ? (path + name) : (path + '/' + name);
                    list[i].name = name;
                }
                files = list;
            }

            ftp.end();
            ftp.destroy();
        });
    }).on('end', function() {
        res.send(files);
    }).on('error', function(err) {
        console.log(err);
        res.send(files);
    });
    // connect to localhost:21 as anonymous
    ftp.connect({
        host: '115.29.163.55',
        user: 'wei_jc',
        password: 'wjcectongs2013#'
    });
});

// 删除ftp文件
router.get('/ftpDelete', function(req, res, next) {
    var path = req.query.path;

    if(path) {
        var ftp = new Ftp();
        ftp.on('ready', function() {
            ftp.delete(path, function(err, list) {
                if (err) {
                    console.log(err);
                }

                ftp.end();
                ftp.destroy();
            });
        }).on('end', function() {
            res.send({success: true});
        }).on('error', function(err) {
            console.log(err);
            res.send({success: true});
        });
        // connect to localhost:21 as anonymous
        ftp.connect({
            host: '115.29.163.55',
            user: 'wei_jc',
            password: 'wjcectongs2013#'
        });
    } else {
        res.send({success: true});
    }
});

// 文件下载
router.get('/ftpDownload', function(req, res, next) {
    var path = req.query.path;

    if(path) {
        iconv.extendNodeEncodings();

        res.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-Disposition': 'attachment; filename=' + path.substr(path.lastIndexOf('/'))
        });

        path = iconv.encode(path, 'GBK').toString();
        fs.write('./test.txt', iconv.encode(path, 'GBK'));

        var ftp = new Ftp();
        ftp.on('ready', function() {
            ftp.get(path, function(err, stream) {
                if (err) {
                    console.log(err);
                    res.send();
                    return;
                }

                stream.once('close', function() { c.end(); });
                stream.pipe(res);

                ftp.end();
                ftp.destroy();

            });
        }).on('end', function() {
            res.send();
        }).on('error', function(err) {
            console.log(err);
            res.send({success: true});
        });
        // connect to localhost:21 as anonymous
        ftp.connect({
            host: '115.29.163.55',
            user: 'wei_jc',
            password: 'wjcectongs2013#'
        });
    } else {
        res.send({success: true});
    }
});

// 文件上传
router.post('/ftpUpload', function(req, res, next) {
    var path = req.query.path;
    var projectDir = req.projectDir;

    if(path) {
        var ftp = new Ftp();
        ftp.on('ready', function() {
            var localPath = projectDir + '/' + req.files.file.path;
            var remotePath = path + '/' + req.files.file.originalname;
            console.log('local path = ' + localPath);
            console.log('remote path = ' + remotePath);
            ftp.put(localPath, remotePath, function(err) {
                if (err) {
                    console.log(err);
                    res.send();
                    return;
                }

                ftp.end();
                ftp.destroy();

            });
        }).on('end', function() {
            res.send();
        }).on('error', function(err) {
            console.log(err);
            res.send({success: true});
        });
        // connect to localhost:21 as anonymous
        ftp.connect({
            host: '115.29.163.55',
            user: 'wei_jc',
            password: 'wjcectongs2013#'
        });
    } else {
        res.send({success: true});
    }
});


module.exports = router;
