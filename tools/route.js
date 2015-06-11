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
var sqlBuilder = require('../lib/sqlBuilder');
var router = express.Router();
var underscore = require('underscore');

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
    var id = req.body.id || req.query.id;
    var start = req.body.start || 0; // 第几页
    var length = req.body.length || 10; // 每页行数
    var pkColName = req.body.pk;
    var conditions = req.body.conditions;

    var datasource = id.split('.')[0];
    var ds = config.getDataSource(datasource, id.split('.')[1]);
    db.setDataSource(ds);
    /*var conditions = eval('(' + req.body.conditions + ')');
    var where = '';
    if(conditions && conditions.length > 0) {
        where = ' where ';
        for(var i = 0; i < conditions.length; i++) {
            var obj = conditions[i];
            var mode = obj['mode'];
            if(mode == '%%') {
                where += obj['name'] + " like '%" + obj['value'] + "%'";
            } else if(mode == '*%') {
                where += obj['name'] + " like '" + obj['value'] + "%'";
            } else if(mode == '%*') {
                where += obj['name'] + " like '%" + obj['value'] + "'";
            } else {
                where += obj['name'] + obj['mode'] + "'" + obj['value'] + "'";
            }
            if(i < conditions.length - 1) {
                where += ' and ';
            }
        }
    }*/
    var tableName = id.substr(datasource.length + 1);
    if(ds.dbType == 'sqlServer') {
        tableName = tableName.replace('.', '.dbo.');
    }
    var sql = sqlBuilder.create().query().from(tableName).addConditions(conditions).build();
    db.queryByPage(sql, start, length, function(data) {
        data.draw = parseInt(req.body.draw) || 1;
        res.send(data);
    }, tableName, pkColName);
});

router.post('/dbGetDataSource', function(req, res, next) {
    var dataSource = config.getDataSource();
    var array = [];
    for(var key in dataSource) {
        if(dataSource.hasOwnProperty(key)) {
            array.push(key);
        }
    }
    res.send(array);
});

router.post('/dbEditTable', function(req, res, next) {
    var table = req.body.table;
    var pks = req.body.pks;
    var pkValues = req.body.pkValues;
    var value = req.body.value;
    var column = req.body.column;

    var datasource = table.split('.')[0];
    var ds = config.getDataSource(datasource, table.split('.')[1]);
    db.setDataSource(ds);
    var tableName = table.substr(datasource.length + 1);
    if(ds.dbType == 'sqlServer') {
        tableName = tableName.replace('.', '.dbo.');
    }
    var sql = "UPDATE " + tableName + " SET " + column + "='" + value + "' WHERE ";
    var pkArray = pks.split(',');
    var pkValueArray = pkValues.split(',');
    for(var i = 0; i < pkArray.length; i++) {
        sql += pkArray[i] + "='" + pkValueArray[i] + "'";
        if(i < pkArray.length - 1) {
            sql += ' AND ';
        }
    }
    db.query(sql, function() {
        res.send(value);
    });
});

// 删除表数据
router.post('/dbDeleteTableRow', function(req, res, next) {
    var table = req.body.table;
    var conditions = req.body.conditions;

    var datasource = table.split('.')[0];
    var ds = config.getDataSource(datasource, table.split('.')[1]);
    db.setDataSource(ds);
    var tableName = table.substr(datasource.length + 1);
    if(ds.dbType == 'sqlServer') {
        tableName = tableName.replace('.', '.dbo.');
    }
    var sql = sqlBuilder.create().del().from(tableName).addConditions(conditions).build();
    db.query(sql, function() {
        res.send();
    });
});

// 保存数据源
router.post('/dbSaveDataSource', function(req, res, next) {
    var name = req.body.name;
    var dbType = req.body.dbType;
    var host = req.body.host;
    var port = req.body.port;
    var user = req.body.user;
    var password = req.body.password;
    var database = req.body.database;
    var isVpn = req.body.isVpn;

    var ds = config.getDataSource(name);
    if(ds) {
        ds.dbType = dbType;
        ds.host = host;
        ds.port = port;
        ds.user = user;
        ds.password = password;
        ds.database = database;
        ds.isVpn = isVpn;
        config.save();
    } else {
        config.addDataSource(name, dbType, host, port, user, password, database, isVpn);
    }

    res.send();
});
// 删除数据源
router.post('/dbDeleteDataSource', function(req, res, next) {
    var name = req.body.name;

    var ds = config.getDataSource();
    if(ds[name]) {
        delete ds[name];
        config.save();
    }
    res.send();
});
// 显示外键详细信息
router.post('/dbShowFkDetail', function(req, res, next) {
    var table = req.body.table;
    var column = req.body.column;
    var value = req.body.value;

    var strs = table.split('.');
    var datasource = strs[0];
    var schema = strs[1];
    var tableName = strs[2];
    db.setDataSource(config.getDataSource(datasource, schema));
    db.getFKConstraintsColumns(schema, function(data) {
        console.log(data);
        if(data.length == 1) {
            var refTable = data[0]['referenced_table_name'];
            var refColumn = data[0]['referenced_column_name'];

            async.parallel({
                columns: function(callback) {
                    db.getDbObjects(datasource + '.' + schema + '.' + refTable, 'columns', function(data) {
                        callback(null, data);
                    });
                },
                data: function(callback) {
                    var sql = "SELECT * FROM " + refTable + " WHERE " + refColumn + "='" + value + "'";
                    db.query(sql, function(data) {
                        if(data && data.length == 1) {
                            callback(null, data[0]);
                        } else {
                            callback(null, {});
                        }
                    });
                }
            }, function(err, results) {
                res.send({columns: results.columns, data: results.data, fkTable: refTable});
            });
        }
    }, {tableName: tableName, columnName: column});
});
// 搜索数据库
router.post('/dbSearch', function(req, res, next) {
    var value = req.body.value;
    var type = req.body.type;
    var id = req.body.id;
    var filter = req.body.filter;

    db.search(value, type, id, filter, function(data) {
        res.send(data);
    });
});
// 获得外键引用列
router.post('/dbGetFkRefCol', function(req, res, next) {
    var table = req.body.table;

    var traces = config.getDbTrace(table);
    if(traces) {
        res.send(traces);
        return;
    }

    var strs = table.split('.');
    var datasource = strs[0];
    var schema = strs[1];
    var tableName = strs[2];
    db.setDataSource(config.getDataSource(datasource, schema));
    db.getFKConstraintsColumns(schema, function(data) {
        var result = [], aCache = [];
        var prefix = datasource + '.' + schema + '.';
        iterator(tableName);

        function iterator(refTableName, refColName) {
            for(var i = 0; i < data.length; i++) {
                if(underscore._.indexOf(aCache, i) > -1) {
                    continue;
                }

                var obj = data[i];
                if(obj['referenced_table_name'] == refTableName) {
                    var parentCol = prefix + refTableName + '.' + obj['referenced_column_name'];
                    result.push({parentCol: parentCol, childCol: prefix + obj['table_name'] + '.' + obj['column_name']});
                    aCache.push(i);
                    iterator(obj['table_name'], obj['column_name']);
                }
            }
        }

        res.send({'未命名': result});
    });
});
// 获得数据库收藏
router.post('/dbGetFavorites', function(req, res, next) {
    res.send(config.getDbFavorites());
});
// 添加数据库收藏
router.post('/dbAddFavorites', function(req, res, next) {
    var dbId = req.body.dbId;
    config.addDbFavorites(dbId);
    res.send();
});
// 保存数据追踪
router.post('/dbSaveTrace', function(req, res, next) {
    var table = req.body.table;
    var traces = req.body.traces;
    var title = req.body.title;
    config.addDbTrace(table, title, JSON.parse(traces));
    res.send();
});
// 数据追踪
router.get('/dbTrace', function(req, res, next) {
    var table = req.query.table;
    var data = JSON.parse(req.query.data);
    var title = req.query.title;
    var pkColName = req.query.pkColName;
    var result = [];
    //result.push({table: table, data: data});
    var traces = config.getDbTrace(table)[title];
    if(!traces || traces.length == 0) {
        res.send('<h2>请配置数据跟踪！</h2>');
        return;
    }
    if(!pkColName) {
        res.send('<h2>请设置主键列！</h2>');
        return;
    }
    traces.unshift({parentCol: traces[1].parentCol, childCol: traces[1].parentCol});

    db.setDataSource(table);
    var mainBuild = sqlBuilder.create().from(table.split('.')[2]);
    var array = pkColName.split(',');
    for(var i = 0; i )
    db.query()

    function getTableName(parentCol) {
        return parentCol.substr(0, parentCol.lastIndexOf('.'));
    }

    var dataCache = {};
    dataCache[getTableName(traces[1].parentCol)] = data;

    function iterator(parentCol, childCol, i) {
        var strs = childCol.split('.');
        var datasource = strs[0];
        var schema = strs[1];
        var tableName = strs[2];
        var colName = strs[3];

        var array = [];
        var data = dataCache[getTableName(parentCol)];
        for(var j = 0; j < data.length; j++) {
            array.push(data[j][parentCol.split('.')[3]]);
        }

        // 下一个
        function next(data) {
            result.push({table: datasource + '.' + schema + '.' + tableName, data: data});
            if(i == traces.length - 1) {
                res.render('tools/db_trace', {result: result});
            } else {
                i++;
                dataCache[getTableName(traces[i].parentCol)] = data.concat(dataCache[getTableName(traces[i].parentCol)] || []);
                iterator(traces[i].parentCol, traces[i].childCol, i);
            }
        }

        if(array.length == 0) {
            next([]);
            return;
        }

        var ds =config.getDataSource(datasource, schema);
        db.setDataSource(ds);
        var tName;
        if(ds.dbType == 'sqlServer') {
            tName = '[' + schema + '].dbo.' + tableName;
        } else {
            tName = schema + '.' + tableName;
        }
        var builder = sqlBuilder.create().query().from(tName);
        builder.and(colName, array);
        db.query(builder.build(), function(data) {
            next(data);
        });
    }

    iterator(traces[0].parentCol, traces[0].childCol, 0);
});
// 赋值DDL
router.post('/dbCopyDdl', function(req, res, next) {
    var dbId = req.body.dbId;
    db.copyDdl(dbId, function(data) {
        res.send(data);
    })
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
        res.send({recordsTotal: files.length,recordsFiltered: files.length, data: files});
    }).on('error', function(err) {
        console.log(err);
        res.send({recordsTotal: files.length,recordsFiltered: files.length, data: files});
    });
    // connect to localhost:21 as anonymous
    ftp.connect({
        host: '192.168.56.1',
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

    res.send({recordsTotal: tplConfig.length,recordsFiltered: tplConfig.length, data:tplConfig});
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
