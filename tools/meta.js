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

    var metaConfig = config.getMetaConfig(id);
    if(metaConfig) {
        for(var i = 0; i < metaConfig.length; i++) {
            if(metaConfig[i][pks] == pkValues) {
                metaConfig[i][column] = value;
                config.save();
                break;
            }
        }
    }

    res.send(value);
});


module.exports = router;
