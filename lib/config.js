var path = require('path');
var fs = require('fs');
var util = require('./util');
var underscore = require('underscore');

var systemConfig = {};
var dataSource = {};
var configDir, configFile;
var dbFavorites, dbTrace;

systemConfig.dataSource = dataSource;

function init() {
    // 创建config目录
    configDir = path.join(__dirname, 'config');
    if(!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
    }
    console.log(configDir);

    configFile = path.join(configDir, 'SystemConfig.json');
    console.log(configDir);
    if(!fs.existsSync(configFile)) {
        save();
    } else {
        var str = fs.readFileSync(configFile, {encoding: 'UTF-8'});
        if(str.length > 0) {
            systemConfig = JSON.parse(str);
        }
    }
    dataSource = systemConfig.dataSource;
    dbFavorites = systemConfig.dbFavorites;
    if(!dbFavorites) {
        systemConfig.dbFavorites = dbFavorites = [];
    }
    dbTrace = systemConfig.dbTrace;
    if(!dbTrace) {
        systemConfig.dbTrace = dbTrace = {};
    }
    console.log(systemConfig);
}

function save() {
    if(configFile) {
        fs.writeFile(configFile, JSON.stringify(systemConfig));
    }
}

function addDataSource(name, dbType, host, port, user, password, database, isVpn) {
    if(!dataSource[name]) {
        console.log('add DataSource: ' + name);
        dataSource[name] = {name: name, dbType: dbType, host: host, port: port, user: user, password: password, database: database, isVpn: isVpn};
        save();
    }
}

function getDataSource(name, database) {
    if(name) {
        var ds = dataSource[name];
        if(ds && database) {
            ds.database = database;
        }
        return ds;
    }
    return dataSource;
}

function addSystemDataSource(dbType, host, port, user, password, database) {
    addDataSource('__system__', dbType, host, port, user, password, database);
}

function getSystemDataSource() {
    return getDataSource('__system__');
}

function addDbFavorites(dbId) {
    if(underscore._.indexOf(dbFavorites, dbId) > -1) {
        return;
    }
    dbFavorites.push(dbId);
    dbFavorites.sort();
    save();
}

function getDbFavorites() {
    return dbFavorites;
}

function addDbTrace(tableName, title, traces) {
    var obj = {};
    obj[title]  = traces;
    dbTrace[tableName] = util.extend(dbTrace[tableName] || {}, obj);
    save();
}

function getDbTrace(tableName) {
    return dbTrace[tableName];
}

module.exports = {
    init: init,
    addDataSource: addDataSource,
    getDataSource: getDataSource,
    addSystemDataSource: addSystemDataSource,
    getSystemDataSource: getSystemDataSource,
    addDbFavorites: addDbFavorites,
    getDbFavorites: getDbFavorites,
    addDbTrace: addDbTrace,
    getDbTrace: getDbTrace,
    save: save
};