/**
 * Created by wei_jc on 2015/3/15.
 * loader
 */
var loader_config = {
    baseUrl: '/Public/js/',
    urlArgs: "bust=" +  (new Date()).getTime(),
    paths: {
        'jquery': 'lib/jquery-1.11.1',
        'more':'jquery.more',
        'validate': 'lib/jquery.validate',
        'bootstrap': 'lib/bootstrap',
        'jqueryUI': 'jquery-ui-1.10.3.custom.min',
        'common': 'common',
        'common_footer': 'common_footer',
        'page_login': 'pages/login',
        'page_forgetPassword': 'pages/forgetPassword',
        'page_index': 'pages/index',
        'page_register': 'pages/register',
        'page_publish': 'pages/publish',
        'page_game': 'pages/game',
        'page_gameDetail': 'pages/game_detail',
        'page_activity': 'pages/activity',
        'page_activityDetail': 'pages/activity_detail',
        'page_venue': 'pages/venue',
        'page_venueDetail': 'pages/venue_detail',
        'page_friends': 'pages/friends',
        'page_topic': 'pages/topic'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'bootstrap'
        },
        'common': {
            deps: ['jquery', 'bootstrap', 'validate','more'],
            exports: 'common'
        },
        'common_footer': {
            deps: ['common'],
            exports: 'common_footer'
        },
        'page_login': {
            deps: ['common'],
            exports: 'page_login'
        },
        'page_forgetPassword': {
            deps: ['common'],
            exports: 'page_forgetPassword'
        },
        'page_index': {
            deps: ['common'],
            exports: 'page_index'
        },
        'page_register': {
            deps: ['common'],
            exports: 'page_register'
        },
        'page_publish': {
            deps: ['common'],
            exports: 'page_publish'
        },
        'page_game': {
            deps: ['common'],
            exports: 'page_game'
        },
        'page_gameDetail': {
            deps: ['common'],
            exports: 'page_gameDetail'
        },
        'page_activity': {
            deps: ['common'],
            exports: 'page_activity'
        },
        'page_activityDetail': {
            deps: ['common'],
            exports: 'page_activityDetail'
        },
        'page_venue': {
            deps: ['common'],
            exports: 'page_venue'
        },
        'page_venueDetail': {
            deps: ['common'],
            exports: 'page_venueDetail'
        },
        'page_friends': {
            deps: ['common'],
            exports: 'page_friends'
        },
        'page_topic': {
            deps: ['common'],
            exports: 'page_topic'
        }
    }
};

var Loader = {
    modules: [],
    load: function(modules) {
        // 加入公共底部js
        modules.push('common_footer');
        for(var i = 0; i < modules.length; i++) {
            modules[i] = modules[i].replace('.', '_');
        }
        this.modules = modules;
    }
};

// 写入script
var _script = document.createElement("script");
_script.type = "text/javascript";
_script.src = "/Public/js/require.js";
_script.async = true;
_script.onload = function() {
    require.config(loader_config);
    // 加载模块
    //require(Loader.modules);

    var modules = Loader.modules;
    for(var i = 0; i < modules.length; i++) {
        $.getScript(loader_config.baseUrl + loader_config.paths[modules[i]] + '.js');
    }
};
document.getElementsByTagName("head")[0].appendChild(_script);

