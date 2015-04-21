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
        dbObj.getSchemas(function(data) {
            for(var i = 0; i < data.length; i++) {
                var schema = data[i];
                array.push({id: schema.name, name: schema.name, type: type, children: [
                    {id: schema.name, name: '表', type: 'table', isParent: true},
                    {id: schema.name, name: '视图', type: 'view', isParent: true}
                ]});
            }
            callback(array);
        })
    } else {
        if(type == 'table') {
            dbObj.getTables(pid, function(data) {
                for(var i = 0; i < data.length; i++) {
                    var table = data[i];
                    array.push({id: table.name, name: table.name, displayName: table.displayName, type: type, children: [{id: pid + '.' + table.name, name: '列', type: 'column', isParent: true}]});
                }
                callback(array);
            })
        } else if(type == 'column') {
            var strs = pid.split('.');
            dbObj.getColumns(strs[0], strs[1], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var column = data[i];
                    array.push({id: column.name, name: column.name, displayName: column.displayName, type: type});
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