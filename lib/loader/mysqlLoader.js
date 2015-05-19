var mysql = require('mysql');
var async = require('async');
var sqlBuilder = require('../sqlBuilder');

// 缓存
var C_FKConstraintsColumns = [];

var connection;

function setDataSource(dataSource) {
    connection = mysql.createConnection({
        host: dataSource.host,
        user: dataSource.user,
        password: dataSource.password,
        database: dataSource.database,
        debug: false,
        dateStrings: true
    });
}

function query(sql, callback) {
    console.log(sql);
    //connection.connect();

    connection.query(sql, function(err, rows) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        if(callback) {
            callback(rows);
        }
    });

    //connection.end();
}

function queryByPage(sql, start, length, callback, tableName, pkColName) {
    sql = sql.toLowerCase();
    var idx = sql.indexOf('from');
    var countSql = 'select count(1) count ' + sql.substr(idx);

    //connection.connect();

    async.parallel({
        totalCount: function(callback) {
            console.log(countSql);
            connection.query(countSql, function(err, rows) {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return;
                }

                callback(null, rows[0].count);
            });
        },
        rows: function(callback) {
            sql += ' limit ' + start + ',' + length;
            console.log(sql);
            connection.query(sql, function(err, rows) {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return;
                }

                callback(null, rows);
            });
        }
    }, function(err, results) {
        var result = {recordsTotal: results.totalCount,recordsFiltered: results.totalCount, data: results.rows};
        callback(result);
    });

    //connection.end();
}

function getUsers(callback) {
    query(getUserSql(), callback);
}

function getPrivileges(callback) {
    query(getPrivilegesSql(), callback);
}

function getCharsets(callback) {
    query(getCharsetsSql(), callback);
}

function getSchemas(callback) {
    query(getSchemaSql(), callback);
}

function getTables(schema, callback) {
    query(getTableSql(schema), callback);
}

function getViews(schema, callback) {
    query(getViewSql(schema), callback);
}

function getFunctions(schema, callback) {
    query(getFunctionsSql(schema), callback);
}

function getProcedures(schema, callback) {
    query(getProceduresSql(schema), callback);
}

function getColumns(schema, table, callback) {
    query(getColumnSql(schema, table), callback);
}

function getConstraints(schema, table, callback) {
    query(getConstraintsSql(schema, table), callback);
}

function getIndexes(schema, table, callback) {
    query(getIndexesSql(schema, table), callback);
}

function getTriggers(schema, table, callback) {
    query(getTriggersSql(schema, table), callback);
}

function getParameters(schema, methodName, callback) {
    query(getParametersSql(schema, methodName), callback);
}

function getFKConstraintsColumns(schema, callback, conditions) {
    query(getFKConstraintsColumnsSql(schema, conditions), callback);
}

module.exports = {
    setDataSource: setDataSource,
    query: query,
    queryByPage: queryByPage,
    getUsers: getUsers,
    getPrivileges: getPrivileges,
    getCharsets: getCharsets,
    getSchemas: getSchemas,
    getTables: getTables,
    getViews: getViews,
    getFunctions: getFunctions,
    getProcedures: getProcedures,
    getColumns: getColumns,
    getConstraints: getConstraints,
    getIndexes: getIndexes,
    getTriggers: getTriggers,
    getParameters: getParameters,
    getFKConstraintsColumns: getFKConstraintsColumns,
    getSchemaSearchSql: getSchemaSearchSql
};

function getUserSql() {
    return "select distinct\n" +
        "                GRANTEE as name,\n" +
        "                GRANTEE as displayName,\n" +
        "                'N' as isExpired,\n" +
        "                'N' as isLocked\n" +
        "            from INFORMATION_SCHEMA.USER_PRIVILEGES\n" +
        "            order by GRANTEE asc";
}

function getPrivilegesSql() {
    return "select distinct PRIVILEGE_TYPE as name,\n" +
        "                PRIVILEGE_TYPE as displayName\n" +
        "            from INFORMATION_SCHEMA.USER_PRIVILEGES\n" +
        "            order by PRIVILEGE_TYPE asc";
}

function getCharsetsSql() {
    return "select\n" +
        "                CHARACTER_SET_NAME as name,\n" +
        "                CHARACTER_SET_NAME as displayName,\n" +
        "                MAXLEN as maxLength\n" +
        "            from INFORMATION_SCHEMA.CHARACTER_SETS\n" +
        "            order by CHARACTER_SET_NAME asc";
}

function getSchemaSql() {
    return "select\n" +
        "                SCHEMA_NAME name,\n" +
        "                'N' as isPublic,\n" +
        "                if(lower(SCHEMA_NAME)='information_schema', 'Y', 'N') as isSystem\n" +
        "            from INFORMATION_SCHEMA.SCHEMATA\n" +
        "            order by SCHEMA_NAME asc";
}

function getTableSql(schema) {
    return "select\n" +
        "                TABLE_NAME name,\n" +
        "                TABLE_COMMENT displayName,\n" +
        "                'N' as isTemporary\n" +
        "            from  INFORMATION_SCHEMA.TABLES\n" +
        "            where\n" +
        "                TABLE_SCHEMA = '" + schema + "' and\n" +
        "                TABLE_TYPE = 'BASE TABLE'\n" +
        "            order by TABLE_NAME asc";
}

function getViewSql(schema) {
    return "select\n" +
        "                TABLE_NAME as name,\n" +
        "                TABLE_COMMENT displayName,\n" +
        "                null as viewTypeOwner,\n" +
        "                null as viewType,\n" +
        "                if (TABLE_TYPE = 'VIEW', 'N', 'Y') as isSystemView\n" +
        "            from INFORMATION_SCHEMA.TABLES\n" +
        "            where\n" +
        "                TABLE_SCHEMA = '" + schema + "' and\n" +
        "                TABLE_TYPE in ('VIEW', 'SYSTEM VIEW')\n" +
        "            order by TABLE_NAME asc";
}

function getProceduresSql(schema) {
    return "select\n" +
        "  ROUTINE_NAME as name,\n" +
        "  ROUTINE_NAME as displayName,\n" +
        "  'Y' as isValid,\n" +
        "  'N' as isDebug,\n" +
        "  left(IS_DETERMINISTIC, 1) as isDeterministic\n" +
        "from INFORMATION_SCHEMA.ROUTINES\n" +
        "where\n" +
        "  ROUTINE_SCHEMA = '" + schema + "' and\n" +
        "  ROUTINE_TYPE = 'PROCEDURE'\n" +
        "order by ROUTINE_NAME asc";
}

function getColumnSql(schema, table) {
    return "select\n" +
        "                col.COLUMN_NAME name,\n" +
        "                col.COLUMN_COMMENT displayName,\n" +
        "                col.ORDINAL_POSITION as position,\n" +
        "                col.DATA_TYPE as dataType,\n" +
        "                null as dataTypeOwner,\n" +
        "                null as dataTypePackage,\n" +
        "                col.CHARACTER_MAXIMUM_LENGTH as maxLength,\n" +
        "                col.NUMERIC_PRECISION as numPrecision,\n" +
        "                col.NUMERIC_SCALE as numScale,\n" +
        "                left(col.IS_NULLABLE, 1) as isNullable,\n" +
        "                'N' as isHidden,\n" +
        "                if(col.COLUMN_KEY = 'PRI', 'Y', 'N') as isPrimaryKey,\n" +
        "                if(kcu.COLUMN_NAME is null, 'N', 'Y') as isForeignKey\n" +
        "            from INFORMATION_SCHEMA.`COLUMNS` col\n" +
        "                    left join (\n" +
        "                        select\n" +
        "                            TABLE_SCHEMA,\n" +
        "                            TABLE_NAME,\n" +
        "                            COLUMN_NAME\n" +
        "                    from INFORMATION_SCHEMA.KEY_COLUMN_USAGE\n" +
        "                    where REFERENCED_COLUMN_NAME is not null) kcu on\n" +
        "                        kcu.TABLE_SCHEMA = col.TABLE_SCHEMA and\n" +
        "                        kcu.TABLE_NAME = col.TABLE_NAME and\n" +
        "                        kcu.COLUMN_NAME = col.COLUMN_NAME\n" +
        "            where\n" +
        "                col.TABLE_SCHEMA = '" + schema +"' and\n" +
        "                col.TABLE_NAME = '" + table + "'\n" +
        "            order by col.ORDINAL_POSITION asc";
}

function getFunctionsSql(schema) {
    return "select\n" +
        "                ROUTINE_NAME as name,\n" +
        "                ROUTINE_NAME as displayName,\n" +
        "                'Y' as isValid,\n" +
        "                'N' as isDebug,\n" +
        "                left(IS_DETERMINISTIC, 1) as isDeterministic\n" +
        "            from INFORMATION_SCHEMA.ROUTINES\n" +
        "            where\n" +
        "                ROUTINE_SCHEMA = '" + schema + "' and\n" +
        "                ROUTINE_TYPE = 'FUNCTION'\n" +
        "            order by ROUTINE_NAME asc";
}

function getParametersSql(schema, methodName) {
    return "select\n" +
        "                PARAMETER_NAME as name,\n" +
        "                PARAMETER_NAME as displayName,\n" +
        "                null as PROGRAM_NAME,\n" +
        "                SPECIFIC_NAME as METHOD_NAME,\n" +
        "                ROUTINE_TYPE as METHOD_TYPE,\n" +
        "                0 as OVERLOAD,\n" +
        "                ORDINAL_POSITION as POSITION,\n" +
        "                ORDINAL_POSITION as SEQUENCE,\n" +
        "                if (PARAMETER_MODE is null, 'OUT', PARAMETER_MODE) as IN_OUT,\n" +
        "                null as DATA_TYPE_OWNER,\n" +
        "                null as DATA_TYPE_PACKAGE,\n" +
        "                DATA_TYPE as DATA_TYPE_NAME,\n" +
        "                CHARACTER_MAXIMUM_LENGTH  as DATA_LENGTH,\n" +
        "                NUMERIC_PRECISION as DATA_PRECISION,\n" +
        "                NUMERIC_SCALE as DATA_SCALE\n" +
        "            from INFORMATION_SCHEMA.PARAMETERS\n" +
        "            where\n" +
        "                SPECIFIC_SCHEMA = '" + schema + "' and\n" +
        "                SPECIFIC_NAME = '" + methodName + "'\n" +
        "            order by\n" +
        "                SPECIFIC_NAME,\n" +
        "                ORDINAL_POSITION asc";
}

function getConstraintsSql(schema, table) {
    return "select\n" +
        "                case\n" +
        "                    when tc.CONSTRAINT_TYPE = 'PRIMARY KEY' then concat('pk_', tc.TABLE_NAME)\n" +
        "                    when tc.CONSTRAINT_TYPE = 'UNIQUE' then concat('unq_', tc.TABLE_NAME)\n" +
        "                    else tc.CONSTRAINT_NAME\n" +
        "                end as name,\n" +
        "                tc.CONSTRAINT_TYPE constraintType,\n" +
        "                rc.UNIQUE_CONSTRAINT_SCHEMA as fkConstraintOwner,\n" +
        "                case\n" +
        "                    when rc.UNIQUE_CONSTRAINT_NAME = 'PRIMARY' then concat('pk_', rc.REFERENCED_TABLE_NAME)\n" +
        "                    when rc.UNIQUE_CONSTRAINT_NAME = 'name' then concat('unq_', rc.REFERENCED_TABLE_NAME)\n" +
        "                    else rc.UNIQUE_CONSTRAINT_NAME\n" +
        "                end as fkConstraintName,\n" +
        "                'Y' as isEnabled,\n" +
        "                null as checkCondition\n" +
        "            from\n" +
        "                INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc left join\n" +
        "                INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc on\n" +
        "                    rc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA and\n" +
        "                    rc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME and\n" +
        "                    rc.TABLE_NAME = tc.TABLE_NAME\n" +
        "            where\n" +
        "                tc.TABLE_SCHEMA = '" + schema + "' and\n" +
        "                tc.TABLE_NAME = '" + table + "'\n" +
        "            order by\n" +
        "                tc.TABLE_NAME,\n" +
        "                tc.CONSTRAINT_NAME asc";
}

function getIndexesSql(schema, table) {
    return "select distinct\n" +
        "                INDEX_NAME name,\n" +
        "                TABLE_NAME tableName,\n" +
        "                COLUMN_NAME columnName,\n" +
        "                if (NON_UNIQUE = 'YES', 'N', 'Y') as isUnique,\n" +
        "                (CASE WHEN COLLATION = 'A' THEN 'Y' ELSE 'N' END) as isAsc,\n" +
        "                'Y' as isValid\n" +
        "            from INFORMATION_SCHEMA.STATISTICS\n" +
        "            where \n" +
        "               TABLE_SCHEMA = '" + schema + "' and " +
        "               TABLE_NAME = '" + table +"'\n" +
        "            order by\n" +
        "                TABLE_NAME,\n" +
        "                INDEX_NAME asc";
}

function getTriggersSql(schema, table) {
    return "select\n" +
        "                TRIGGER_NAME name,\n" +
        "                ACTION_TIMING as triggerType,\n" +
        "                EVENT_MANIPULATION as triggeringEvent,\n" +
        "                'Y' as isEnabled,\n" +
        "                'Y' as isValid,\n" +
        "                'N' as isDebug,\n" +
        "                'Y' as isForEachRow\n" +
        "            from INFORMATION_SCHEMA.TRIGGERS\n" +
        "            where EVENT_OBJECT_SCHEMA = '" + schema + "'\n and" +
        "               EVENT_OBJECT_TABLE = '" + table + "'" +
        "            order by\n" +
        "                EVENT_OBJECT_TABLE,\n" +
        "                TRIGGER_NAME asc";
}

function getFKConstraintsColumnsSql(schema, conditions) {
    var sql = "SELECT\n" +
        "  table_schema schemaName, \n" +
        "  constraint_name,\n" +
        "  table_name,\n" +
        "  column_name,\n" +
        "  referenced_table_name,\n" +
        "  referenced_column_name\n" +
        "FROM information_schema.KEY_COLUMN_USAGE\n" +
        "WHERE table_schema = '" + schema + "' AND referenced_table_name IS NOT NULL AND referenced_column_name IS NOT NULL";

    if(conditions) {
        var tableName = conditions.tableName;
        var columnName = conditions.columnName;
        var isAnd;
        var where = ' AND ';
        if(tableName) {
            where += "table_name = '" + tableName + "'";
            isAnd = true;
        }
        if(columnName) {
            if(isAnd) {
                where += ' AND ';
            }
            where += "column_name = '" + columnName + "'";
            isAnd = true;
        }

        sql += where;
    }

    return sql;
}

function getSchemaSearchSql(value, schema) {
    var sql = '';
    if(!schema) {

    }
    var schemaSql = sqlBuilder.create()
        .query("'' id, SCHEMA_NAME name, '' comment, 'SCHEMA' dbType")
        .from("INFORMATION_SCHEMA.SCHEMATA")
        .where()
        .like('SCHEMA_NAME', value)
        .order("SCHEMA_NAME asc")
        .build();
    return "select SCHEMA_NAME id, SCHEMA_NAME name, '' comment, 'SCHEMA' dbType  from INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME LIKE '%" + value + "%' order by SCHEMA_NAME asc";
}