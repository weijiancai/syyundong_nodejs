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

            var request = new Request(sql, function(err, rowCount) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(rowCount + ' rows');
                }
            });

            request.on('row', function(columns) {
                columns.forEach(function(column) {
                    console.log(column.value);
                });
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

function getColumns(schema, table, callback) {
    query(getColumnSql(schema, table), callback);
}

module.exports = {
    setDataSource: setDataSource,
    query: query,
    getSchemas: getSchemas,
    getTables: getTables,
    getColumns: getColumns
};

function getSchemaSql() {
    return "select\n" +
        "                name as SCHEMA_NAME,\n" +
        "                'N' as IS_PUBLIC,\n" +
        "                (case when database_id > 3 then 'N' else 'Y' end) as IS_SYSTEM\n" +
        "            from sys.databases\n" +
        "            order by name asc";
}

function getTableSql(schema) {
    return "select\n" +
        "                name TABLE_NAME,\n" +
        "                (select top 1 convert(varchar, value) from [%1$s].sys.extended_properties where major_id = object_id) TABLE_COMMENT,\n" +
        "                'N' as IS_TEMPORARY\n" +
        "            from  [" + schema + "].sys.TABLES\n" +
        "            order by name asc";

}

function getColumnSql(schema, table) {
    return "select\n" +
        "                '" + table + "' as DATASET_NAME,\n" +
        "                col.name as COLUMN_NAME,\n" +
        "                (select top 1 convert(varchar, value) from [" + schema + "].sys.extended_properties where major_id = col.object_id and minor_id = col.column_id) COLUMN_COMMENT,\n" +
        "                col.column_id as POSITION,\n" +
        "                (select top 1 name from [" + schema + "].sys.types where system_type_id = col.system_type_id) as DATA_TYPE_NAME,\n" +
        "                null as DATA_TYPE_OWNER,\n" +
        "                null as DATA_TYPE_PACKAGE,\n" +
        "                col.max_length as DATA_LENGTH,\n" +
        "                col.PRECISION as DATA_PRECISION,\n" +
        "                col.SCALE as DATA_SCALE,\n" +
        "                (case when col.IS_NULLABLE = 0 then 'N' else 'Y' end) as IS_NULLABLE,\n" +
        "                'N' as IS_HIDDEN,\n" +
        "                'N' as IS_PRIMARY_KEY,\n" +
        "                'N' as IS_FOREIGN_KEY\n" +
        "            from [" + schema + "].sys.columns col\n" +
        "            where\n" +
        "                col.object_id = (select object_id from [" + schema + "].sys.tables where name='" + table + "')\n" +
        "            order by col.name asc";
}