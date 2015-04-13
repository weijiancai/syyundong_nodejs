var db = require('../lib/db');
var vo = require('./vo');

/**
 * 数据库相关操作
 *
 */
var DBO = {
    /**
     * 数据缓存
     *
     */
    cache: {sport: null},
    /**
     * 运动项目：赛事、活动、场馆
     *
     * @param callback
     */
    getSports: function(callback) {
        var self = this;
        if(self.cache.sport) {
            callback(self.cache.sport);
            return;
        }

        db.query('select * from dz_sport order by level', function(rows) {
            var sport = new vo.Sport();
            sport.initData(rows);
            self.cache.sport = sport;
            callback(sport);
        });
    },
    /**
     * 热门赛事
     *
     * @param callback
     */
    getHotGame: function(callback) {
        db.query('SELECT * FROM v_hot_game_ranking', callback);
    },
    /**
     * 首页轮播图片
     *
     * @param callback
     */
    getBannerImages: function(callback) {
        db.query('SELECT * FROM v_banner_images', callback);
    },
    /**
     * 获得赛事分类下的所有赛事
     *
     * @param pid
     * @param callback
     */
    getGames: function(pid, callback) {
        this.getSports(function(sports) {
            callback(sports.getGamesByPid(pid));
        });
    }
};

module.exports = DBO;