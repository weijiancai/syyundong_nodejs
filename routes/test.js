var dbo = require('./dbo');
var async = require('async');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('admin/admin', res.data);
});

router.get('/dataTable', function(req, res, next) {
    res.render('test/dataTable');
});

module.exports = router;
