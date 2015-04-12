var async = require('async');
var dbo = require('./dbo');
var express = require('express');
var app = require('../app');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    async.parallel({
        hotGames: function (callback) {
            dbo.getHotGame(function (hotGames) {
                callback(null, hotGames);
            })
        },
        bannerImages: function(callback) {
            dbo.getBannerImages(function(bannerImages) {
                callback(null, bannerImages);
            })
        }
    }, function(err, results) {
        res.data.hotGames = results.hotGames;
        res.data.bannerImages = results.bannerImages;
        res.render('index', res.data);
    });
});

module.exports = router;
