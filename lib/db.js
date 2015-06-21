var async = require('async');
var underscore = require('underscore');
var config = require('./config');
var util = require('./util');

var mysql = require('./loader/mysqlLoader');
var sqlServer = require('./loader/sqlServerLoader');
var dataSource = config.getSystemDataSource();
var dbType = dataSource.dbType;
var dbObj;

function initDbObj() {
    if(dbType == 'mysql') {
        dbObj = mysql;
    } else if(dbType == 'sqlServer') {
        dbObj = sqlServer;
    }

    if(dbObj) {
        dbObj.setDataSource(dataSource);
    }
}
// 先调用一次
initDbObj();

// 设置数据源
function setDataSource(dataSource_) {
    if(typeof(dataSource_) == 'string') {
        var strs = dataSource_.split('.');
        dataSource_ = config.getDataSource(strs[0], strs[1]);
    }
    dataSource = dataSource_;
    dbType = dataSource.dbType;
    initDbObj();
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
        var ds = config.getDataSource();
        for(var key in ds) {
            if(ds.hasOwnProperty(key)) {
                var datasource = util.extend({}, ds[key]);
                delete datasource.password;
                array.push({id: key, name: key, type: 'datasource', isParent: true, icon: '/public/images/db/database.png', obj: datasource, children: [
                    {id: key, name: 'Schemas', type: 'schemas', isParent: true, icon: '/public/images/db/Schemas.png'},
                    {id: key, name: 'Users', type: 'users', isParent: true, icon: '/public/images/db/Users.png'},
                    {id: key, name: 'Privileges', type: 'privileges', isParent: true, icon: '/public/images/db/Privileges.png'},
                    {id: key, name: 'Charsets', type: 'charsets', isParent: true, icon: ''}
                ]});
            }
        }
        callback(array);
    } else {
        var pids = pid.split('.');
        if(pids.length > 2) {
            setDataSource(config.getDataSource(pids[0], pids[1]));
        } else {
            setDataSource(config.getDataSource(pids[0]));
        }

        if(type == 'schemas') {
            dbObj.getSchemas(function(data) {
                for(var i = 0; i < data.length; i++) {
                    var schema = data[i];
                    var id = pid + '.' + schema.name;
                    array.push({id: id, name: schema.name, type: type, children: [
                        {id: id, name: '表', type: 'tables', isParent: true, icon: '/public/images/db/Tables.png'},
                        {id: id, name: '视图', type: 'views', isParent: true, icon: '/public/images/db/Views.png'},
                        {id: id, name: '函数', type: 'functions', isParent: true, icon: '/public/images/db/Functions.png'},
                        {id: id, name: '存储过程', type: 'procedures', isParent: true, icon: '/public/images/db/Procedures.png'}
                    ], icon: '/public/images/db/Schema.png'});
                }
                callback(array);
            })
        } else if(type == 'users') {
            dbObj.getUsers(function(data) {
                for(var i = 0; i < data.length; i++) {
                    var user = data[i];
                    array.push({id: user.name, name: user.name, displayName: user.displayName, type: type, icon: '/public/images/db/User.png'});
                }
                callback(array);
            });
        } else if(type == 'privileges') {
            dbObj.getPrivileges(function(data) {
                for(var i = 0; i < data.length; i++) {
                    var privilege = data[i];
                    array.push({id: privilege.name, name: privilege.name, displayName: privilege.displayName, type: type, icon: '/public/images/db/Privilege.png'});
                }
                callback(array);
            });
        } else if(type == 'charsets') {
            dbObj.getCharsets(function(data) {
                for(var i = 0; i < data.length; i++) {
                    var charset = data[i];
                    array.push({id: charset.name, name: charset.name, displayName: charset.displayName, type: type, icon: ''});
                }
                callback(array);
            });
        } else if(type == 'tables') {
            dbObj.getTables(pids[1], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var table = data[i];
                    var id = pid + '.' + table.name;
                    array.push({id: id, name: getTableComment(table.name, table.displayName), displayName: table.displayName, type: 'table', icon: '/public/images/db/Table.png',
                        children: [
                            {id: id, name: '列', type: 'columns', isParent: true, icon: '/public/images/db/Columns.png'},
                            {id: id, name: '约束', type: 'constraints', isParent: true, icon: '/public/images/db/Constraints.png'},
                            {id: id, name: '索引', type: 'indexes', isParent: true, icon: '/public/images/db/Indexes.png'},
                            {id: id, name: '触发器', type: 'triggers', isParent: true, icon: '/public/images/db/Triggers.png'}
                        ]});
                }
                callback(array);
            })
        } else if(type == 'views') {
            dbObj.getViews(pids[1], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var view = data[i];
                    var id = pid + '.' + view.name;
                    array.push({id: id, name: getTableComment(view.name, view.displayName), displayName: view.displayName, type: 'view', icon: '/public/images/db/View.png',
                        children: [{id: id, name: '列', type: 'columns', isParent: true, icon: '/public/images/db/Columns.png'}]});
                }
                callback(array);
            })
        } else if(type == 'functions') {
            dbObj.getFunctions(pids[1], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var func = data[i];
                    var id = pid + '.' + func.name;
                    array.push({id: id, name: func.name, displayName: func.displayName, type: type, icon: '/public/images/db/Function.png',
                        children: [{id: id, name: '参数', type: 'param', isParent: true, icon: '/public/images/db/Arguments.png'}]});
                }
                callback(array);
            })
        } else if(type == 'procedures') {
            dbObj.getProcedures(pids[1], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var procedure = data[i];
                    var id = pid + '.' + procedure.name;
                    array.push({id: id, name: procedure.name, displayName: procedure.displayName, type: type, icon: '/public/images/db/Procedure.png',
                        children: [{id: id, name: '参数', type: 'param', isParent: true, icon: '/public/images/db/Arguments.png'}]});
                }
                callback(array);
            })
        } else if(type == 'columns') {
            dbObj.getColumns(pids[1], pids[2], function(data) {
                data = data || [];
                for(var i = 0; i < data.length; i++) {
                    var column = data[i];
                    var id = pid + '.' + column.name;
                    var obj = {id: id, name: getColumnComment(column), displayName: column.displayName, type: 'column', dataType: column.dataType, icon: '/public/images/db/Column.png'};
                    if(column['isPrimaryKey'] == 'Y' && column['isForeignKey'] == 'Y') {
                        obj.icon = '/public/images/db/ColumnPkFk.png';
                    } else if(column['isPrimaryKey'] == 'Y') {
                        obj.icon = '/public/images/db/ColumnPk.png';
                    } else if(column['isForeignKey'] == 'Y') {
                        obj.icon = '/public/images/db/ColumnFk.png';
                    }
                    // 如果是主键或外键，则数据类型改成varchar类型
                    /*if(column['isPrimaryKey'] == 'Y' || column['isForeignKey'] == 'Y') {
                        obj.dataType = 'varchar';
                    }*/
                    obj.isPk = column['isPrimaryKey'] == 'Y';
                    obj.isFk = column['isForeignKey'] == 'Y';
                    array.push(obj);
                }
                callback(array);
            });
        } else if(type == 'constraints') {
            dbObj.getConstraints(pids[1], pids[2], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var constraint = data[i];
                    var id = pid + '.' + constraint.name;
                    var obj = {id: id, name: constraint.name, displayName: constraint.displayName, type: type, icon: '/public/images/db/Constraint.png'};
                    if(constraint['isEnabled'] == 'N') {
                        obj.icon = '/public/images/db/ConstraintDisabled.png';
                    }
                    array.push(obj);
                }
                callback(array);
            });
        } else if(type == 'indexes') {
            dbObj.getIndexes(pids[1], pids[2], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var index = data[i];
                    var id = pid + '.' + index.name;
                    var obj = {id: id, name: index.name, displayName: index.displayName, type: type, icon: '/public/images/db/Index.png'};
                    if(index['isValid'] == 'N') {
                        obj.icon = '/public/images/db/IndexDisabled.png';
                    }
                    array.push(obj);
                }
                callback(array);
            });
        } else if(type == 'triggers') {
            dbObj.getTriggers(pids[1], pids[2], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var trigger = data[i];
                    var id = pid + '.' + trigger.name;
                    var obj = {id: id, name: trigger.name, displayName: trigger.displayName, type: type, icon: '/public/images/db/Trigger.png'};
                    if(trigger['isEnabled'] == 'N') {
                        obj.icon = '/public/images/db/TriggerDisabled.png';
                    }
                    array.push(obj);
                }
                callback(array);
            });
        } else if(type == 'param') {
            dbObj.getParameters(pids[1], pids[2], function(data) {
                for(var i = 0; i < data.length; i++) {
                    var param = data[i];
                    var id = pid + '.' + param.name;
                    var obj = {id: id, name: param.name, displayName: param.displayName, type: type, icon: '/public/images/db/Argument.png'};
                    array.push(obj);
                }
                callback(array);
            });
        }
    }

    function getTableComment(name, displayName) {
        var result = name;
        if(displayName) {
            result += '<span class="comment"> - ' + displayName+ '</span>';
        }
        return result;
    }
}

function getColumnComment(column) {
    var result = column.name + '<span class="comment"> - ' + column.dataType;
    if(column.maxLength > 0) {
        result += '(' + column.maxLength + ')';
    } else if(column.numPrecision > 0) {
        result += '(' + column.numPrecision;
        if(column['numScale'] > 0) {
            result += ',' + column['numScale'];
        }
        result += ')';
    }
    if(column.displayName) {
        result += ' ' + column.displayName;
    }
    return result + ' </span>';
}

function getFKConstraintsColumns(schema, callbak, conditions) {
    dbObj.getFKConstraintsColumns(schema, callbak, conditions);
}

function search(value, type, id, filter, callback) {
    var datasource = id.split('.')[0];
    var schema = id.split('.')[1];

    var results = [];
    if(schema) {
        setDataSource(config.getDataSource(datasource, schema));
        query([{name: schema}]);
    } else {
        setDataSource(config.getDataSource(datasource));
        dbObj.getSchemas(function(schemas) {
            query(schemas);
        });
    }

    function query(schemas) {
        dbObj.query(dbObj.getSearchSql(value, schemas, filter), function(data) {
            if(data && data.length > 0) {
                for(var i = 0; i < data.length; i++) {
                    var object = data[i];
                    var icon = '';
                    var type = object.dbType;
                    if(type == 'SCHEMA') {
                        icon = '/public/images/db/Schema.png';
                    } else if(type == 'TABLE') {
                        icon = '/public/images/db/Table.png';
                    } else if(type == 'VIEW') {
                        icon = '/public/images/db/View.png';
                    } else if(type == 'PK_FK_COLUMN') {
                        icon = '/public/images/db/ColumnPkFk.png';
                    } else if(type == 'PK_COLUMN') {
                        icon = '/public/images/db/ColumnPk.png';
                    } else if(type == 'FK_COLUMN') {
                        icon = '/public/images/db/ColumnFk.png';
                    } else if(type == 'COLUMN') {
                        icon = '/public/images/db/Column.png';
                    } else if(type == 'CONSTRAINT') {
                        icon = '/public/images/db/Constraint.png';
                    } else if(type == 'INDEX') {
                        icon = '/public/images/db/Index.png';
                    } else if(type == 'TRIGGER') {
                        icon = '/public/images/db/Trigger.png';
                    } else if(type == 'PROCEDURE') {
                        icon = '/public/images/db/Procedure.png';
                    } else if(type == 'FUNCTION') {
                        icon = '/public/images/db/Function.png';
                    }
                    toResult(object.name, icon, datasource, object.id, object.comment, type);
                }
            }
            callback(results);
        });
    }

    function toResult(name, icon, dataSource, id, comment,  dbType) {
        var html = '<li class="dbSearchResult list-group-item" data-id="' + dataSource + '.' + id + '.' + name+ '" data-type="' + dbType + '">';
        var idx = name.indexOf(value);
        if(idx > -1) {
            html += '<img src="' + icon + '"/>';
            html += '<span>' + name.substr(0, idx) + '<span class="highlight">' + value + '</span>' + name.substr(idx + value.length) + '</span>';
            if(dataSource) {
                html += '<span class="dbId">([' + dataSource + '] ' + id + ') ';
            }
            if(comment) {
                html += '<span class="comment">' + comment + '</span>';
            }
            html += '<span class="dbType">' + dbType + '</span>';
            html += '</li>';
            results.push(html);
        }
    }
}

/**
 * 查询数据库表、视图，转换为MetaConfig
 * @param dbId
 * @param callback
 */
function toMetaConfig(dbId, callback) {
    setDataSource(dbId);
    var pids = dbId.split('.');
    async.parallel({
        columns: function(callback) {
            dbObj.getColumns(pids[1], pids[2], function(data) {
                callback(null, data);
            });
        },
        flRefs: function(callback) {
            getFKConstraintsColumns(pids[1], function(data) {
                callback(null, data);
            });
        }
    }, function(err, results) {
        var array = [];
        var columns = results.columns;
        for(var i = 0; i < columns.length; i++) {
            var column = columns[i];
            var id = dbId + '.' + column.name;
            var maxLength = column.maxLength;
            var dataType = column.dataType;
            var obj = {id: id, name: column.name, displayName: column.displayName || column.name, dataType: dataType, isDisplay: true, dict: '', align: 'left', sortNum: (i + 1) * 10, isValid: true, maxLength: maxLength, displayStyle: 0};
            obj.isPk = column['isPrimaryKey'] == 'Y';
            obj.isFk = column['isForeignKey'] == 'Y';
            obj.isRequire = column['isNullable'] == 'Y';
            obj.isHighlight = false;
            obj.editable = false;
            if(maxLength <= 0) {
                obj.width = 80;
            } else if((obj.isPk || obj.isFk) && maxLength == 32) {
                obj.width = 100;
            } else if (maxLength > 500) {
                obj.width = 200;
            } else {
                obj.width = maxLength;
            }
            if(underscore._.indexOf(booleanArray, dataType) > -1) {
                obj.width = 50;
                obj.displayStyle = 3;
            } else if(underscore._.indexOf(intArray, dataType) > -1) {
                obj.width = 60;
                obj.align = 'center';
            } else if(underscore._.indexOf(dateArray, dataType) > -1) {
                obj.width = 140;
            }
            obj.tip = getColumnComment(column);

            // 查找外键引用列
            if(obj.isFk) {
                for(var j = 0; j < results.flRefs.length; j++) {
                    var ref = results.flRefs[j];

                    if(ref['table_name'] == pids[2] && ref['column_name'] == obj.name) {
                        obj.fkCol = ref['referenced_table_name'] + '.' + ref['referenced_column_name'];
                        obj.fkDisplayCol = null;
                    }
                }
            }

            array.push(obj);
        }
        callback(array);
    });
}

var stringArray = ["CHARACTER VARYING", "varchar", "mediumtext", "char"];
var intArray = ["BIGINT", "INTEGER", "SMALLINT", "int", "tinyint"];
var dateArray = ["TIMESTAMP", "DATE", "datetime", "time"];
var doubleArray = ["decimal", "double"];
var blobArray = ["longblob", "blob"];
var textArray = ["text", "longtext"];
var booleanArray = ["boolean"];

/*function getDataType(dataTypeStr) {
    if (UString.inArray(stringArray, dataTypeStr, true)) {
        return STRING;
    } else if (UString.inArray(intArray, dataTypeStr, true)) {
        return INTEGER;
    } else if (UString.inArray(doubleArray, dataTypeStr, true)) {
        return DOUBLE;
    } else if (NUMBER.name().equalsIgnoreCase(dataTypeStr)) {
        return NUMBER;
    } else if (UString.inArray(dateArray, dataTypeStr, true)) {
        return DATE;
    } else if (EMAIL.name().equalsIgnoreCase(dataTypeStr)) {
        return EMAIL;
    } else if (IP.name().equalsIgnoreCase(dataTypeStr)) {
        return IP;
    } else if (URL.name().equalsIgnoreCase(dataTypeStr)) {
        return URL;
    } else if (DATA_SOURCE.name().equalsIgnoreCase(dataTypeStr)) {
        return DATA_SOURCE;
    } else if (PASSWORD.name().equalsIgnoreCase(dataTypeStr)) {
        return PASSWORD;
    } else if (BOOLEAN.name().equalsIgnoreCase(dataTypeStr)) {
        return BOOLEAN;
    } else if (DICT.name().equalsIgnoreCase(dataTypeStr)) {
        return DICT;
    } else if (UString.inArray(blobArray, dataTypeStr, true)) {
        return BLOB;
    } else if (GUID.name().equalsIgnoreCase(dataTypeStr)) {
        return GUID;
    } else if (UString.inArray(textArray, dataTypeStr, true)) {
        return TEXT;
    }

    return STRING;
}*/

/**
 * 数据库库
 *
 * @type {{query: query}}
 */
var DB = {
    query : function(sql, callback) {
        dbObj.query(sql, callback);
    },
    queryByPage: function(sql, start, length, callback, tableName, pkColName, orderBy) {
        dbObj.queryByPage(sql, start, length, callback, tableName, pkColName, orderBy);
    },
    queryByBuilder: function(builder, start, length, callback, tableName, pkColName) {
        dbObj.queryByBuilder(builder, start, length, callback, tableName, pkColName);
    },
    getDbObjects: getDbObjects,
    setDataSource: setDataSource,
    getFKConstraintsColumns: getFKConstraintsColumns,
    search: search,
    copyDdl: function(dbId, callback) {
        setDataSource(dbId);
        dbObj.copyDdl(dbId, callback);
    },
    toMetaConfig: toMetaConfig
};

module.exports = DB;