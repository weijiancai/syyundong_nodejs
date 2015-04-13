var dbo = require('./dbo');
var async = require('async');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('admin/admin', res.data);
});

router.post('/getGames', function(req, res, next) {
    var pid = req.body.pid;
    async.parallel([function(callback) {
        dbo.getGames(pid, function(games) {
            callback(null, games);
        })
    }], function(err, results) {
        var data = results[0] || [];
        var obj = {draw: 1, recordsTotal: data.length, recordsFiltered: data.length, data: data};
        res.send(obj);
    })
});

module.exports = router;
