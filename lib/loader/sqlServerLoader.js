var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var config, connection;

function setDataSource(dataSource) {
    config = {
        userName: dataSource.user,
        password: dataSource.password,
        server: dataSource.host,

        // If you're on Windows Azure, you will need this:
        options: {
            encrypt: true,
            port: dataSource.port,
            database: dataSource.database
        }
    };
    /*connection = new Connection(config);
    connection.on('connect', function(err) {
            console.log(err);
            console.log('connected.......')
        }
    );*/
}

function query(sql, callback) {
    console.log(sql);
    connection = new Connection(config);
    connection.on('connect', function(err) {
            if(err) {
                console.log(err);
                return;
            }
            var result = [];

            var request = new Request(sql, function(err, rowCount) {
                if (err) {
                    console.log(err);
                }
                callback(result);
            });

            request.on('row', function(columns) {
                var obj = {};
                columns.forEach(function(column) {
                    var key = column.metadata.colName.toLowerCase();
                    obj[key]  = column.value;
                });
                result.push(obj);
            });

            connection.execSql(request);
        }
    );
}

function queryByPage(sql, start, length, callback) {
    sql = sql.toLowerCase();
    var idx = sql.indexOf('from');
    var countSql = 'select count(1) count ' + sql.substr(idx);

    async.parallel({
        totalCount: function(callback) {
            console.log(countSql);
            connection.on('connect', function(err) {
                    if(err) {
                        console.log(err);
                        return;
                    }
                    var result = [];

                    var request = new Request(sql, function(err, rowCount) {
                        if (err) {
                            console.log(err);
                        }
                        callback(null, result[0].count);
                    });

                    request.on('row', function(columns) {
                        var obj = {};
                        columns.forEach(function(column) {
                            var key = column.metadata.colName.toLowerCase();
                            obj[key]  = column.value;
                        });
                        result.push(obj);
                    });

                    connection.execSql(request);
                }
            );
        },
        rows: function(callback) {
            sql += ' limit ' + (start - 1) * length + ',' + length;
            console.log(sql);
            connection = new Connection(config);
            connection.on('connect', function(err) {
                    if(err) {
                        console.log(err);
                        return;
                    }
                    var result = [];

                    var request = new Request(sql, function(err, rowCount) {
                        if (err) {
                            console.log(err);
                        }
                        callback(null, result);
                    });

                    request.on('row', function(columns) {
                        var obj = {};
                        columns.forEach(function(column) {
                            var key = column.metadata.colName.toLowerCase();
                            obj[key]  = column.value;
                        });
                        result.push(obj);
                    });

                    connection.execSql(request);
                }
            );
        }
    }, function(err, results) {
        var result = {draw: 1, recordsTotal: results.totalCount, recordsFiltered: results.totalCount, data: results.rows};
        callback(result);
    })
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
    getParameters: getParameters
};

function getUserSql() {
    return "select\n" +
        "                name as name,\n" +
        "                name as displayName,\n" +
        "                'N' as isExpired,\n" +
        "                'N' as isLocked\n" +
        "            from sys.schemas\n" +
        "            order by schema_id asc";
}

function getPrivilegesSql() {
    return "select distinct\n" +
        "                permission_name as name,\n" +
        "                permission_name as displayName\n" +
        "            from fn_builtin_permissions(default)\n" +
        "            order by permission_name asc";
}

function getCharsetsSql() {
    return "select\n" +
        "                name as name,\n" +
        "                name as displayName,\n" +
        "                0 as maxLength\n" +
        "            from sys.syscharsets\n" +
        "            order by name asc";
}

function getSchemaSql() {
    return "select\n" +
        "                name as name,\n" +
        "                'N' as isPublic,\n" +
        "                (case when database_id > 3 then 'N' else 'Y' end) as isSystem\n" +
        "            from sys.databases\n" +
        "            order by name asc";
}

function getTableSql(schema) {
    return "select\n" +
        "                name name,\n" +
        "                (select top 1 convert(varchar, value) from [" + schema + "].sys.extended_properties where major_id = object_id) displayName,\n" +
        "                'N' as isTemporary\n" +
        "            from  [" + schema + "].sys.TABLES\n" +
        "            order by name asc";
}

function getViewSql(schema) {
    return "select\n" +
        "                table_name as name,\n" +
        "                table_name as displayName,\n" +
        "                null as viewTypeOwner,\n" +
        "                null as viewType,\n" +
        "                'N' as isSystemView\n" +
        "            from [" + schema + "].INFORMATION_SCHEMA.views\n" +
        "            order by table_name asc";
}

function getProceduresSql(schema) {
    return "select\n" +
        "                ROUTINE_NAME as name,\n" +
        "                ROUTINE_NAME as displayName,\n" +
        "                'Y' as isValid,\n" +
        "                'N' as isDebug,\n" +
        "                'N' as isDeterministic\n" +
        "            from [" + schema + "].INFORMATION_SCHEMA.ROUTINES\n" +
        "            where\n" +
        "                ROUTINE_CATALOG = '" + schema + "' and\n" +
        "                ROUTINE_TYPE = 'PROCEDURE'\n" +
        "            order by ROUTINE_NAME asc";
}

function getColumnSql(schema, table) {
    return "select\n" +
        "                col.name as name,\n" +
        "                (select top 1 convert(varchar, value) from [" + schema + "].sys.extended_properties where major_id = col.object_id and minor_id = col.column_id) displayName,\n" +
        "                col.column_id as position,\n" +
        "                (select top 1 name from [" + schema + "].sys.types where system_type_id = col.system_type_id) as dataType,\n" +
        "                null as dataTypeOwner,\n" +
        "                null as dataTypePackage,\n" +
        "                col.max_length as maxLength,\n" +
        "                col.PRECISION as numPrecision,\n" +
        "                col.SCALE as numScale,\n" +
        "                (case when col.IS_NULLABLE = 0 then 'N' else 'Y' end) as isNullable,\n" +
        "                'N' as isHidden,\n" +
        "                'N' as isPrimaryKey,\n" +
        "                'N' as isForeignKey\n" +
        "            from [" + schema + "].sys.columns col\n" +
        "            where\n" +
        "                col.object_id = (select object_id from [" + schema + "].sys.tables where name='" + table + "')\n" +
        "            order by col.name asc";
}

function getFunctionsSql(schema) {
    return "select\n" +
        "                ROUTINE_NAME as name,\n" +
        "                ROUTINE_NAME as displayName,\n" +
        "                'Y' as isValid,\n" +
        "                'N' as isDebug,\n" +
        "                'N' as isDeterministic\n" +
        "            from [" + schema + "].INFORMATION_SCHEMA.ROUTINES\n" +
        "            where\n" +
        "                ROUTINE_CATALOG = '" + schema + "' and\n" +
        "                ROUTINE_TYPE = 'FUNCTION'\n" +
        "            order by ROUTINE_NAME asc";
}

function getParametersSql(schema, methodName) {
    return "select\n" +
        "                a.PARAMETER_NAME as name,\n" +
        "                a.PARAMETER_NAME as displayName,\n" +
        "                null as PROGRAM_NAME,\n" +
        "                a.SPECIFIC_NAME as METHOD_NAME,\n" +
        "                b.ROUTINE_TYPE as METHOD_TYPE,\n" +
        "                0 as OVERLOAD,\n" +
        "                a.ORDINAL_POSITION as POSITION,\n" +
        "                a.ORDINAL_POSITION as SEQUENCE,\n" +
        "                (case when a.PARAMETER_MODE is null then 'OUT' else a.PARAMETER_MODE end) as IN_OUT,\n" +
        "                null as DATA_TYPE_OWNER,\n" +
        "                null as DATA_TYPE_PACKAGE,\n" +
        "                a.DATA_TYPE as DATA_TYPE_NAME,\n" +
        "                a.CHARACTER_MAXIMUM_LENGTH  as DATA_LENGTH,\n" +
        "                a.NUMERIC_PRECISION as DATA_PRECISION,\n" +
        "                a.NUMERIC_SCALE as DATA_SCALE\n" +
        "            from [" + schema + "].INFORMATION_SCHEMA.PARAMETERS a, [" + schema + "].INFORMATION_SCHEMA.ROUTINES b\n" +
        "            where\n" +
        "                a.SPECIFIC_CATALOG = b.ROUTINE_CATALOG and\n" +
        "                a.SPECIFIC_NAME = b.SPECIFIC_NAME and\n" +
        "                a.SPECIFIC_CATALOG = '" + schema + "' and\n" +
        "                a.SPECIFIC_NAME = '" + methodName + "'\n" +
        "            order by\n" +
        "                a.SPECIFIC_NAME,\n" +
        "                a.ORDINAL_POSITION asc";
}

function getConstraintsSql(schema, table) {
    return "select\n" +
        "                a.constraint_name as name,\n" +
        "                a.CONSTRAINT_TYPE constraintType,\n" +
        "                '' as fkConstraintOwner,\n" +
        "                '' as fkConstraintName,\n" +
        "                'Y' as isEnabled,\n" +
        "                null as checkCondition\n" +
        "                from\n" +
        "                INFORMATION_SCHEMA.TABLE_CONSTRAINTS a,\n" +
        "                INFORMATION_SCHEMA.KEY_COLUMN_USAGE b\n" +
        "            where\n" +
        "                a.table_name = b.table_name and\n" +
        "                a.table_catalog = b.table_catalog and\n" +
        "                a.constraint_name = b.constraint_name and\n" +
        "                a.TABLE_catalog = '" + schema + "' and\n" +
        "                a.table_name = '" + table + "'\n" +
        "            order by\n" +
        "                a.TABLE_NAME,\n" +
        "                a.CONSTRAINT_NAME asc";
}

function getIndexesSql(schema, table) {
    return "select\n" +
        "                name as name,\n" +
        "                (select name from dbo.sysobjects where id=object_id) as tableName,\n" +
        "                '' as columnName,\n" +
        "                (case when is_unique = 0 then 'N' else 'Y' end) as isUnique,\n" +
        "                'Y' as isAsc,\n" +
        "                (case when is_disabled = 0 then 'N' else 'Y' end) as isValid\n" +
        "            from [" + schema + "].sys.indexes\n" +
        "            where\n" +
        "                name is not null and\n" +
        "                object_id = (select id from [" + schema + "].dbo.sysobjects where name='" + table + "' and xtype='U')\n" +
        "            order by name asc";
}

function getTriggersSql(schema, table) {
    return "select\n" +
        "                t.name name,\n" +
        "                '' as triggerType,\n" +
        "                '' as triggeringEvent,\n" +
        "                'Y' as isEnabled,\n" +
        "                'Y' as isValid,\n" +
        "                'N' as isDebug,\n" +
        "                'Y' as isForEachRow\n" +
        "            from [" + schema + "].sys.TRIGGERS t\n" +
        "            where\n" +
        "               object_id = (select id from [" + schema + "].dbo.sysobjects where name='" + table + "' and xtype='U')\n " +
        "            order by parent_id, name asc";
}