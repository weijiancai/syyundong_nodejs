var path = require('path');
var fs = require('fs');

var systemConfig = {};
var dataSource = {};
var configDir, configFile;

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
        systemConfig.dataSource = dataSource;
        save();
    } else {
        systemConfig = JSON.parse(fs.readFileSync(configFile, {encoding: 'UTF-8'}));
    }
    dataSource = systemConfig.dataSource;
    console.log(systemConfig);
}

function save() {
    if(configFile) {
        fs.writeFile(configFile, JSON.stringify(systemConfig));
    }
}

function addDataSource(name, dbType, host, port, user, password, database) {
    if(!dataSource[name]) {
        console.log('add DataSource: ' + name);
        dataSource[name] = {dbType: dbType, host: host, port: port, user: user, password: password, database: database};
        save();
    }
}

function addSystemDataSource(dbType, host, port, user, password, database) {
    addDataSource('__system__', dbType, host, port, user, password, database);
}

function getSystemDataSource() {
    return dataSource['__system__'];
}

module.exports = {
    init: init,
    addDataSource: addDataSource,
    addSystemDataSource: addSystemDataSource,
    getSystemDataSource: getSystemDataSource
}