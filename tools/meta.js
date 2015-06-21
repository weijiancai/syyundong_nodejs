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

router.post('/query', function(req, res, next) {
    var id = req.body.id || req.query.id;
    var start = req.body.start || 0; // 第几页
    var length = req.body.length || 10; // 每页行数
    var pkColName = req.body.pk;
    var conditions = req.body.conditions;

    var datasource = id.split('.')[0];
    var ds = config.getDataSource(datasource, id.split('.')[1]);
    db.setDataSource(ds);

    var tableName = id.substr(datasource.length + 1);
    if(ds.dbType == 'sqlServer') {
        tableName = tableName.replace('.', '.dbo.');
    }
    var sql = sqlBuilder.create().query().from(tableName).addConditions(conditions);
    // 列信息
    var metaConfig = config.getMetaConfig(id);
    if(metaConfig) {
        for(var j = 0; j < metaConfig.length; j++) {
            var col = metaConfig[j];
            if(col.id.substr(0, 2) == '$$') continue;

            sql.query(col.name);
            if(col.isFk && col.fkCol && col.fkDisplayCol) {
                var strs = col.fkCol.split('.');
                sql.query("(SELECT " + col.fkDisplayCol + " FROM " + strs[0]+ " WHERE " + col.fkCol + "=" + (tableName + "." + col.name) + ") " + strs[0] + "_" + col.fkDisplayCol);
            }
        }
    }
    // 排序
    var orderBy = '';
    var i = 0, k = 0;
    while(true) {
        var orderKey = 'order[' + i + '][column]';
        if(!req.body[orderKey]) {
            break;
        }
        var colKey = 'columns[' + req.body[orderKey] + '][data]';
        var orderable = req.body['columns[' + req.body[orderKey] + '][orderable]'];
        if(orderable == 'true') {
            var colName = req.body[colKey];
            var dir = req.body['order[' + i + '][dir]'];
            //sql.order(colName + ' ' + dir);
            if(k > 0) {
                orderBy += ', ';
            }
            orderBy += colName + ' ' + dir;
            k++;
        }

        i++;
    }
    db.queryByPage(sql.build(), start, length, function(data) {
        data.draw = parseInt(req.body.draw) || 1;
        res.send(data);
    }, tableName, pkColName.split(',')[0], orderBy);
});


module.exports = router;
