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

module.exports = {
    getSchemaSql: getSchemaSql,
    getTableSql: getTableSql
};