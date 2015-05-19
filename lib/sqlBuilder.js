var underscore = require('underscore');

function SqlBuilder() {
    var sql = 'SELECT ';
    var query = '';
    var from = ' FROM ';
    var where = ' WHERE ';
    var order = ' ORDER BY';
    var isQuery, isWhere, isOrder;

    /**
     *
     * @param str
     * @returns {SqlBuilder}
     */
    this.query = function(str) {
        query += str;
        isQuery = true;
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
        where += str;
        isWhere = true;
        return this;
    };

    /**
     *
     * @param str
     * @returns {SqlBuilder}
     */
    this.order = function(str) {
        order += str;
        isOrder = true;
        return this;
    };

    /**
     *
     * @param str
     * @param value
     * @returns {SqlBuilder}
     */
    this.and = function(str, value) {
        if(value) {
            where += ' AND ' + str + "'" + value + "'";
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
    this.adds = function(str) {
        where += ' AND ' + str;
        return this;
    };


    /**
     *
     * @returns {string}
     */
    this.build = function() {
        sql += isQuery ? query : ' * ';
        sql += from;
        if(isWhere || where.length > 8) {
            sql += where;
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