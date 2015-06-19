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

/* GET dict. */
router.get('/', function(req, res, next) {
    var id = req.query.id;
    var dictConfig = config.getDictConfig(id);
    if(dictConfig) {
        res.send(dictConfig);
    }
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
