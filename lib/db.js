var mysql = require('mysql');
var async = require('async');
var loader = require('./loader');
var config = require('./config');

var systemDataSource = config.getSystemDataSource();

var connection = mysql.createConnection({
    host: systemDataSource.host,
    user: systemDataSource.user,
    password: systemDataSource.password,
    database: systemDataSource.database,
    debug: false
});
// 设置数据库类型
loader.setDbType(systemDataSource.dbType);

function query(sql, callback) {
    connection.query(sql, function(err, rows) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        if(callback) {
            callback(rows);
        }
    });
}

function getSchemas(callback) {
    console.log(loader.getSchemaSql());
    query(loader.getSchemaSql(), callback);
}

function getTables(schema, callback) {
    query(loader.getTableSql(schema), callback);
}

function getColumns(schema, table, callback) {
    console.log(loader.getColumnSql(schema, table));
    query(loader.getColumnSql(schema, table), callback);
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
        getSchemas(function(data) {
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
            getTables(pid, function(data) {
                for(var i = 0; i < data.length; i++) {
                    var table = data[i];
                    array.push({id: table.name, name: table.name, displayName: table.displayName, type: type, children: [{id: pid + '.' + table.name, name: '列', type: 'column', isParent: true}]});
                }
                callback(array);
            })
        } else if(type == 'column') {
            var strs = pid.split('.');
            getColumns(strs[0], strs[1], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var column = data[i];
                    array.push({id: column.name, name: column.name, displayName: column.displayName, type: type});
                }
                callback(array);
            });
        }
    }
}

function convertJsonObject(type, data) {
    var array = [];
    if(type == 'schema') {
        for(var i = 0; i < data.length; i++) {
            var schema = data[i];
            array.push({id: schema.name, name: schema.name, type: type, children: [{id: schema.name, name: '表', type: 'table', isParent: true},{id: schema.name, name: '视图', type: 'view', isParent: true}]});
        }
    } else if(type == 'table') {

    }

    return array;
}

/**
 * 数据库库
 *
 * @type {{query: query}}
 */
var DB = {
    query : query,
    getDbObjects: getDbObjects
};

module.exports = DB;