var mysql = require('mysql'),
    exports = module.exports = {},
    connection;

exports.connectDB = function(options) {
  connection = mysql.createConnection(options);

  connection.connect(function(err) {
      if (err)
        console.error('error connecting: ' + err.stack);
      connection.query('CREATE TABLE IF NOT EXISTS packages (ID INT NOT NULL AUTO_INCREMENT,name VARCHAR(255),author VARCHAR(255),stars INT,version VARCHAR(100),description TEXT,tags TEXT,github_url VARCHAR(400), PRIMARY KEY(ID))', function(err, rows, fields) {
        if (err) throw err;
      });
  });
};

exports.addPackages = function(values) {
  var insertValues = values,
      inserted;

  return inserted = connection.query('INSERT INTO packages (name,author,stars,version,description,tags) VALUES ?', [insertValues], function (err, results, fields) {
    if (err) {
      throw err;
      return false;
    }
    else
      return true;
  });
};


exports.closeDB = function() {
  connection.end();
};
