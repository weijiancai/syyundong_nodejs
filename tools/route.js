var dbo = require('./../routes/dbo');
var db = require('../lib/db');
var config = require('../lib/config');
var async = require('async');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var Ftp = require('ftp');
var iconv = require('iconv-lite');
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
        res.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-Disposition': 'attachment; filename=' + path.substr(path.lastIndexOf('/') + 1)
        });

        //path = iconv.encode(path, 'GBK').toString();
        //fs.write('./test.txt', iconv.encode(path, 'GBK'));

        var ftp = new Ftp();
        ftp.on('ready', function() {
            ftp.get(path, function(err, stream) {
                if (err) {
                    console.log(err);
                    res.send();
                    return;
                }

                stream.once('close', function() { ftp.end(); });
                stream.pipe(res);
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

var tplConfig = [];

// 模板浏览
router.post('/tplBrowser', function(req, res) {
    var projectDir = req.projectDir;
    var tplDir = projectDir + path.sep + 'tpls';
    var tplFile =  path.join(tplDir, 'tpls.json');

    if(!fs.existsSync(tplFile)) {
        fs.writeFile(tplFile, JSON.stringify(tplConfig));
    } else {
        var str = fs.readFileSync(tplFile, {encoding: 'UTF-8'});
        if(str.length > 0) {
            tplConfig = JSON.parse(str);
        }
    }

    res.send(tplConfig);
    /*var files = fs.readdirSync(tplDir);
    for(file in files) {
        var fileName =
    }*/
});

// 保存模板
router.post('/tplSave', function(req, res) {
    var html = req.body.html || '';
    var css = req.body.css || '';
    var javascript = req.body.javascript || '';
    var data = req.body.data || '';
    var name = req.body.name;
    var desc = req.body.desc;

    var hasConfig = false;
    for(var i = 0; i < tplConfig.length; i++) {
        var config = tplConfig[i];
        if (config.name == name) {
            hasConfig = true;
        }
    }
    if(!hasConfig) {
        tplConfig.push({name: name, desc: desc});
    }

    var projectDir = req.projectDir;
    var tplDir = projectDir + path.sep + 'tpls';
    // 写入文件
    var tplFile =  path.join(tplDir, 'tpls.json');
    fs.writeFile(tplFile, JSON.stringify(tplConfig));

    var dir = path.join(tplDir, name);
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    fs.writeFile(path.join(dir, name + '.html'), html);
    fs.writeFile(path.join(dir, name + '.css'), css);
    fs.writeFile(path.join(dir, name + '.js'), javascript);
    fs.writeFile(path.join(dir, name + '.json'), data);

    res.send('success');
});

// 获得模板
router.post('/tplGet', function(req, res) {
    var name = req.body.name;
    var projectDir = req.projectDir;

    for(var i = 0; i < tplConfig.length; i++) {
        var config = tplConfig[i];
        if(config.name == name) {
            var obj = {};
            obj.html = fs.readFileSync(path.join(projectDir, 'tpls' + path.sep + name + path.sep + name + '.html'), {encoding: 'UTF-8'});
            obj.css = fs.readFileSync(path.join(projectDir, 'tpls' + path.sep + name + path.sep + name + '.css'), {encoding: 'UTF-8'});
            obj.javascript = fs.readFileSync(path.join(projectDir, 'tpls' + path.sep + name + path.sep + name + '.js'), {encoding: 'UTF-8'});
            obj.data = fs.readFileSync(path.join(projectDir, 'tpls' + path.sep + name + path.sep + name + '.json'), {encoding: 'UTF-8'});
            obj.name = config.name;
            obj.desc = config.desc;
            res.send(obj);
            return;
        }
    }
    res.send();
});


module.exports = router;
