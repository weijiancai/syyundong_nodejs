var dbo = require('./../routes/dbo');
var db = require('../lib/db');
var async = require('async');
var express = require('express');
var router = express.Router();

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


module.exports = router;