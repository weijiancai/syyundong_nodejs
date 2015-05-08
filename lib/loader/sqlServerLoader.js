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

function getSchemas(callback) {
    query(getSchemaSql(), callback);
}

function getTables(schema, callback) {
    query(getTableSql(schema), callback);
}

function getFunctions(schema, callback) {
    query(getFunctionsSql(schema), callback);
}

function getColumns(schema, table, callback) {
    query(getColumnSql(schema, table), callback);
}

module.exports = {
    setDataSource: setDataSource,
    query: query,
    getSchemas: getSchemas,
    getTables: getTables,
    getFunctions: getFunctions,
    getColumns: getColumns
};

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

function getParametersSql(schema) {
    return "select\n" +
        "                a.PARAMETER_NAME as name,\n" +
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
        "                a.SPECIFIC_CATALOG = '" + schema + "'\n" +
        "            order by\n" +
        "                a.SPECIFIC_NAME,\n" +
        "                a.ORDINAL_POSITION asc";
}