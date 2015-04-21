var mysql = require('./loader/mysqlLoader');
var dbType = 'sqlite';

function getDbObj() {
    var obj = mysql;

    if(dbType == 'mysql') {
        obj = mysql;
    }

    return obj;
}

module.exports = {
    setDbType: function(dbType_) {
        dbType = dbType_;
    },
    query: function(sql, callback) {
        getDbObj().query(sql, callback);
    },
    getSchemas: function(callback) {
        getDbObj().getSchemas(callback);
    },
    getTables: function(schema, callback) {
        getDbObj().getTables(schema, callback);
    },
    getColumns: function(schema, table, callback) {
        getDbObj().getColumns(schema, table, callback);
    }
};