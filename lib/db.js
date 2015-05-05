var async = require('async');
var config = require('./config');

var mysql = require('./loader/mysqlLoader');
var sqlServer = require('./loader/sqlServerLoader');
var dataSource = config.getSystemDataSource();
var dbType = dataSource.dbType;
var dbObj;

function initDbObj() {
    if(dbType == 'mysql') {
        dbObj = mysql;
    } else if(dbType == 'sqlServer') {
        dbObj = sqlServer;
    }

    if(dbObj) {
        dbObj.setDataSource(dataSource);
    }
}
// 先调用一次
initDbObj();

// 设置数据源
function setDataSource(dataSource_) {
    dataSource = dataSource_;
    dbType = dataSource.dbType;
    initDbObj();
}

/**
 * 获得数据库对象
 *
 * @param pid
 * @param type 类型  schema, table, view
 * @param callback
 */
function getDbObjects(pid, type, callback) {
    var array = [];
    if(!pid) { // root
        var ds = config.getDataSource();
        for(var key in ds) {
            if(ds.hasOwnProperty(key)) {
                var datasource = ds[key];
                array.push({id: key, name: key, type: 'datasource', isParent: true})
            }
        }
        callback(array);
    } else {
        var pids = pid.split('.');
        setDataSource(config.getDataSource()[pids[0]]);

        if(type == 'datasource') {
            dbObj.getSchemas(function(data) {
                for(var i = 0; i < data.length; i++) {
                    var schema = data[i];
                    var id = pid + '.' + schema.name;
                    array.push({id: id, name: schema.name, type: type, children: [
                        {id: id, name: '表', type: 'table', isParent: true},
                        {id: id, name: '视图', type: 'view', isParent: true}
                    ]});
                }
                callback(array);
            })
        } else if(type == 'table') {
            dbObj.getTables(pids[1], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var table = data[i];
                    var id = pid + '.' + table.name;
                    array.push({id: id, name: table.name, displayName: table.displayName, type: type, children: [{id: id, name: '列', type: 'column', isParent: true}]});
                }
                callback(array);
            })
        } else if(type == 'column') {
            dbObj.getColumns(pids[1], pids[2], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var column = data[i];
                    var id = pid + '.' + column.name;
                    array.push({id: id, name: column.name, displayName: column.displayName, type: type});
                }
                callback(array);
            });
        }
    }
}

/**
 * 数据库库
 *
 * @type {{query: query}}
 */
var DB = {
    query : function(sql, callback) {
        dbObj.query(sql, callback);
    },
    getDbObjects: getDbObjects,
    setDataSource: setDataSource
};

module.exports = DB;