var path = require('path');
var fs = require('fs');
var util = require('./util');
var underscore = require('underscore');

var systemConfig = {};
var dataSource = {};
var configDir, configFile;
var dbFavorites, dbTrace, metaConfig, dictConfig;

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
    metaConfig = systemConfig.metaConfig;
    if(!metaConfig) {
        systemConfig.metaConfig = metaConfig = {};
    }
    dictConfig = systemConfig.dictConfig;
    if(!dictConfig) {
        systemConfig.dictConfig = dictConfig = {};
    }
    console.log(systemConfig);

    // 数据字典
    if(!dictConfig['sys.DBDataSource']) {
        genDict('sys.DBDataSource', 'DBDataSource', '数据库数据源', dataSource, 'name', 'name');
    }
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
    addDataSource('system', dbType, host, port, user, password, database);
}

function getSystemDataSource() {
    return getDataSource('system');
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
    if(!tableName) {
        return dbTrace;
    }
    return dbTrace[tableName];
}

function addMetaConfig(id, config) {
    metaConfig[id] = config;
    save();
}

function getMetaConfig(id) {
    if(id) return metaConfig[id];

    return metaConfig;
}
function addDictConfig(id, config) {
    dictConfig[id] = config;
    save();
}

function getDictConfig(id) {
    if(id) return dictConfig[id];

    return dictConfig;
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
    addMetaConfig: addMetaConfig,
    getMetaConfig: getMetaConfig,
    addDictConfig: addDictConfig,
    getDictConfig: getDictConfig,
    save: save
};

/**
 * 根据数据生成数据字典
 *
 * @param id
 * @param name
 * @param displayName
 * @param data
 * @param nameCol
 * @param displayNameCol
 */
function genDict(id, name, displayName, data, nameCol, displayNameCol) {
    var codes = [];

    function addCode(object) {
        codes.push({name: object[nameCol], displayName: object[displayNameCol]});
    }

    if(underscore._.isArray(data)) {
        for(var i = 0; i < data.length; i++) {
            addCode(data[i]);
        }
    } else {
        for(var key in data) {
            if(data.hasOwnProperty(key)) {
                addCode(data[key]);
            }
        }
    }

    dictConfig[id] = {id: id, name: name, displayName: displayName, codes: codes};
    save();
}