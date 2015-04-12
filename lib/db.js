var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'syyundong',
    debug: false
});

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

/**
 * 数据库库
 *
 * @type {{query: query}}
 */
var DB = {
    query : query
};

module.exports = DB;