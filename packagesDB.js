var mysql = require('mysql');
var exports = module.exports = {};
var connection;

exports.connectDB = function(options) {
  connection = mysql.createConnection(options);

  connection.connect(function(err) {
      if (err)
        console.error('error connecting: ' + err.stack);
      connection.query('CREATE TABLE IF NOT EXISTS packages (name VARCHAR(255) BINARY PRIMARY KEY,author VARCHAR(255),stars INT,version VARCHAR(100),description VARCHAR(400),tags TEXT,github_url TEXT)', function(err, rows, fields) {
        if (err) throw err;
      });
  });
};

exports.addPackage = function(values) {
  var insertValues = values;
  
  connection.query('INSERT IGNORE INTO packages (name,author,stars,version,description,tags,github_url) VALUES (?,?,?,?,?,?,?)', insertValues, function (err, results, fields) {
    if (err) throw err;
  });
};


exports.closeDB = function() {
  connection.end();
};
