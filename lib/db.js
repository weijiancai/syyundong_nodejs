var mysql = require('mysql');
var loader = require('./loader');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'syyundong',
    debug: false
});

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
    /*var sql = "select\n" +
        "                TABLE_NAME name,\n" +
        "                TABLE_COMMENT displayName,\n" +
        "                'N' as isTemporary\n" +
        "            from  INFORMATION_SCHEMA.TABLES\n" +
        "            where\n" +
        "                TABLE_SCHEMA = '" + schema + "' and\n" +
        "                TABLE_TYPE = 'BASE TABLE'\n" +
        "            order by TABLE_NAME asc";

    console.log(sql);*/
    query(loader.getTableSql(schema), callback);
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
                    array.push({id: table.name, name: table.displayName, type: type, children: [{id: table.name, name: '表', type: 'table', isParent: true},{id: table.name, name: '视图', type: 'view', isParent: true}]});
                }
                callback(array);
            })
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