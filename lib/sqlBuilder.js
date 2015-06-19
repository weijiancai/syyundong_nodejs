var underscore = require('underscore');

function SqlBuilder() {
    var sql = '';
    var query = 'SELECT ';
    var del = 'DELETE ';
    var from = ' FROM ';
    var where = ' WHERE 1=1 ';
    var order = ' ORDER BY ';
    var isQuery, isWhere, isOrder, isDelete;

    /**
     *
     * @param str
     * @returns {SqlBuilder}
     */
    this.query = function(str) {
        if(str && str.length > 0) {
            if(isQuery) {
                query += ',';
            }
            query += str;
            isQuery = true;
        }
        return this;
    };

    this.del = function(str) {
        if(str && str.length > 0) {
            del += str;
        }
        isDelete = true;
        return this;
    };

    /**
     *
     * @param table
     * @returns {SqlBuilder}
     */
    this.from = function(table) {
        from += table;
        return this;
    };

    /**
     *
     * @param str
     * @returns {SqlBuilder}
     */
    this.where = function(str) {
        if(str && str.length > 0) {
            where += where.length == ' WHERE 1=1 '.length ? 'AND ' + str : str;
            isWhere = true;
        }
        return this;
    };

    /**
     *
     * @param str
     * @returns {SqlBuilder}
     */
    this.order = function(str) {
        if(str && str.length > 0) {
            if(isOrder) {
                order += ',';
            }
            order += str;
            isOrder = true;
        }
        return this;
    };

    /**
     *
     * @param str
     * @param value
     * @param operator
     * @returns {SqlBuilder}
     */
    this.and = function(str, value, operator) {
        operator = operator || '=';
        if(value) {
            if(underscore._.isArray(value)) {
                if(value.length == 0) {
                    return this;
                }

                where += ' AND (';
                for(var i = 0; i < value.length; i++) {
                    if(!value[i]) continue;
                    where += str + operator + "'" + value[i] + "'";
                    if(i < value.length - 1) {
                        where += ' OR ';
                    }
                }
                where += ')';
            } else {
                where += ' AND ' + str + operator + "'" + value + "'";
            }
        }
        return this;
    };

    /**
     *
     * @param col
     * @param value
     * @returns {SqlBuilder}
     */
    this.like = function(col, value) {
        if(value) {
            if(underscore._.isArray(col)) {
                where += ' AND (';
                for(var i = 0; i < col.length; i++) {
                    where += col[i] + " LIKE '%" + value + "%'";
                    if(i < col.length - 1) {
                        where += ' OR ';
                    }
                }
                where += ')';
            } else {
                where += ' AND ' + col + " LIKE '%" + value + "%'";
            }
        }

        return this;
    };

    /**
     *
     * @param str
     * @returns {SqlBuilder}
     */
    this.ands = function(str) {
        where += ' AND ' + str;
        return this;
    };

    /**
     *
     * @param col
     * @param value
     * @returns {SqlBuilder}
     */
    this.in = function(col, value) {
        if(value) {
            if(underscore._.isArray(value) && value.length > 0) {
                where += ' AND ' + col + ' in (';
                for(var i = 0; i < value.length; i++) {
                    where += "'" + value[i] + "'";
                    if(i < value.length - 1) {
                        where += ",";
                    }
                }
                where += ')';
            } else {
                where += ' AND ' + col + ' in (' + value + ')';
            }
        }

        return this;
    };

    /**
     * 转换查询条件
     *
     * @param conditions_ [{name, value, mode}]
     * @returns {SqlBuilder}
     */
    this.addConditions = function(conditions_) {
        var conditions = eval('(' + conditions_ + ')');

        if(conditions && conditions.length > 0) {
            where += ' AND ';
            for(var i = 0; i < conditions.length; i++) {
                var obj = conditions[i];
                var mode = obj['mode'];
                if(mode == '%%') {
                    where += obj['name'] + " like '%" + obj['value'] + "%'";
                } else if(mode == '*%') {
                    where += obj['name'] + " like '" + obj['value'] + "%'";
                } else if(mode == '%*') {
                    where += obj['name'] + " like '%" + obj['value'] + "'";
                } else {
                    where += obj['name'] + obj['mode'] + "'" + obj['value'] + "'";
                }
                if(i < conditions.length - 1) {
                    where += ' and ';
                }
            }
        }

        return this;
    };

    /**
     *
     * @returns {string}
     */
    this.build = function() {
        if(isDelete) { // 删除语句
            sql += del;
        } else { // 查询语句
            sql += isQuery ? query : 'SELECT * ';
        }

        sql += from;
        if(isWhere || where.length > 8) {
            sql += where.replace(' 1=1 AND', '');
        }
        if(isOrder) {
            sql += order;
        }

        return sql;
    }
}

module.exports = {
    /**
     *
     * @returns {SqlBuilder}
     */
    create: function() {
        return new SqlBuilder();
    }
};