var mysql = require('./loader/mysql');
var dbType = 'mysql';

function getSql(dbType, sqlType) {
    var obj;
    if(dbType == 'mysql') {
        obj = mysql;
    }

    if(sqlType == 'schema') {
        return obj.getSchemaSql;
    }
}

function getDbSqlObj() {
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
    getSchemaSql: function() {
        return getDbSqlObj().getSchemaSql();
    },
    getTableSql: function(schema) {
        return getDbSqlObj().getTableSql(schema);
    },
    getColumnSql: function(schema, table) {
        return getDbSqlObj().getColumnSql(schema, table);
    }
};