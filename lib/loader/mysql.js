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

module.exports = {
    getSchemaSql: getSchemaSql,
    getTableSql: getTableSql,
    getColumnSql: getColumnSql
};