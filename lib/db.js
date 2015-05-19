var async = require('async');
var config = require('./config');
var util = require('./util');

var mysql = require('./loader/mysqlLoader');
var sqlServer = require('./loader/sqlServerLoader');
var dataSource = config.getSystemDataSource();
var dbType = dataSource.dbType;
var dbObj;
var cachedSchemas = [];

// 缓存
var C_FKConstraintsColumns = [];

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
        setDataSource(config.getDataSource()[pids[0]]);

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
}

function getFKConstraintsColumns(schema, callbak, conditions) {
    dbObj.getFKConstraintsColumns(schema, callbak, conditions);
}

function search(value, type, id, callback) {
    var results = [];
    if(!type || !id) {
        async.parallel({
            datasource: function(callback) {
                var dataSources = config.getDataSource();
                for(var key in dataSources) {
                    if(dataSources.hasOwnProperty(key)) {
                        toResult(key, '/public/images/db/database.png', null, null, null, 'DATABASE');
                    }
                }
                callback();
            },
            schema: function(callback) {
                for(var i = 0; i < cachedSchemas.length; i++) {
                    var schema = cachedSchemas[i];
                    toResult(schema.name, '/public/images/db/Schema.png', schema.datasource, '', schema.comment, 'SCHEMA');
                }
                callback();
            }
        }, function(err, rs) {
            callback(results);
        })
    } else {

    }

    function toResult(name, icon, dataSource, id, comment,  dbType) {
        var html = '<li class="dbSearchResult list-group-item">';
        var idx = name.indexOf(value);
        if(idx > -1) {
            html += '<img src="' + icon + '"/>';
            html += '<span>' + name.substr(0, idx) + '<span class="highlight">' + value + '</span>' + name.substr(idx + value.length + 1) + '</span>';
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

    function searchSchema(datasource) {
        setDataSource(datasource);
    }
}

// 缓存数据库schema
function cacheSchema() {
    var dataSources = config.getDataSource();
    var functions = [];
    for(var dsName in dataSources) {
        if(dataSources.hasOwnProperty(dsName)) {
            var func = (function(dsName) {
                return function(callback) {
                    setDataSource(config.getDataSource(dsName));
                    dbObj.getSchemas(function(data) {
                        for(var i = 0; i < data.length; i++) {
                            data[i].datasource = dsName;
                        }
                        cachedSchemas.push(data);
                        callback();
                    });
                }
            })(dsName);

            functions.push(func);
            break;
        }
    }

    try {
        async.parallel(functions, function() {});
    } catch(e) {
        console.log(e);
    }
}

/**
 * 数据库库
 *
 * @type {{query: query}}
 */
var DB = {
    query : function(sql, callback) {
        dbObj.query(sql, callback);
    },
    queryByPage: function(sql, start, length, callback, tableName, pkColName) {
        dbObj.queryByPage(sql, start, length, callback, tableName, pkColName);
    },
    getDbObjects: getDbObjects,
    setDataSource: setDataSource,
    getFKConstraintsColumns: getFKConstraintsColumns,
    search: search,
    cacheSchema: cacheSchema,
    getCachedSchemas: function() {
        return cachedSchemas;
    }
};

module.exports = DB;