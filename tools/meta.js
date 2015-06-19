var dbo = require('./../routes/dbo');
var db = require('../lib/db');
var config = require('../lib/config');
var util = require('../lib/util');
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

/* GET users listing. */
router.get('/', function(req, res, next) {
    var id = req.query.id;
    var metaConfig = config.getMetaConfig(id);
    if(metaConfig) {
        res.send(metaConfig);
        return;
    }

    db.toMetaConfig(id, function(metaConfig) {
        config.addMetaConfig(id, metaConfig);
        res.send(metaConfig);
    });
});

router.post('/edit', function(req, res, next) {
    var id = req.body.id;
    var pks = req.body.pks;
    var pkValues = req.body.pkValues;
    var column = req.body.column;
    var value = req.body.value;

    if(column == 'isPk' || column == 'isFk' || column == 'editable' || column == 'isHighlight' || column == 'isDisplay') {
        value = (value == 'true');
    }

    var metaConfig = config.getMetaConfig(id);
    if(metaConfig) {
        for(var i = 0; i < metaConfig.length; i++) {
            if(metaConfig[i][pks] == pkValues) {
                metaConfig[i][column] = value;
                // 排序
                if(column == 'sortNum') {
                    metaConfig.sort(function(a, b) {
                        return a.sortNum - b.sortNum;
                    });
                } else if(column == 'fkDisplayCol' && metaConfig[i]['fkCol']) { // 外键列， 新增一列：引用列
                    var obj = util.extend({}, metaConfig[i]);
                    obj.fkCol = null;
                    obj.fkDisplayCol = null;
                    obj.isFk = false;
                    obj.isPk = false;
                    obj.name = metaConfig[i]['fkCol'].split('.')[0] + '_' + metaConfig[i]['fkDisplayCol'];
                    obj.displayName = metaConfig[i]['fkDisplayCol'];
                    obj.sortNum = metaConfig[i]['sortNum'] + 2;
                    var ids = metaConfig[i]['id'].split('.');
                    obj.id = '$$' + ids[0] + '.' + ids[1] + '.' + metaConfig[i]['fkCol'].split('.')[0] + '.' + metaConfig[i]['fkDisplayCol'];
                    obj.tip = '';
                    var idx = -1;
                    for(var j = 0; j < metaConfig.length; j++) {
                        if(metaConfig[j]['id'] == id) {
                            idx = j;
                            break;
                        }
                    }
                    if(idx > -1) {
                        metaConfig.splice(idx, 1, obj);
                    } else {
                        metaConfig.push(obj);
                    }

                    // 排序
                    metaConfig.sort(function(a, b) {
                        return a.sortNum - b.sortNum;
                    });
                }

                config.save();
                break;
            }
        }
    }

    res.send(value);
});

router.post('/resetSortNum', function(req, res, next) {
    var id = req.body.id;
    var metaConfig = config.getMetaConfig(id);
    if(metaConfig) {
        for(var i = 0; i < metaConfig.length; i++) {
            metaConfig[i].sortNum = (i + 1) * 10;
        }
        config.save();
    }
    res.send();
});


module.exports = router;
