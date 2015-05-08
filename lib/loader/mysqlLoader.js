var mysql = require('mysql');

var connection;

function setDataSource(dataSource) {
    connection = mysql.createConnection({
        host: dataSource.host,
        user: dataSource.user,
        password: dataSource.password,
        database: dataSource.database,
        debug: false
    });
}

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

function getParametersSql(schema) {
    return "select\n" +
        "                PARAMETER_NAME as ARGUMENT_NAME,\n" +
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
        "                SPECIFIC_SCHEMA = '" + schema + "'\n" +
        "            order by\n" +
        "                SPECIFIC_NAME,\n" +
        "                ORDINAL_POSITION asc";
}