var mysql = require("mysql");
var credentials = require("./credentials");

var conn = mysql.createConnection(credentials.connection);
conn.connect(function(err) {
  if (err) {
    console.error("ERROR: cannot connect: " + err);
    return;
  }
  conn.query("SELECT * FROM users", function(err, rows, fields) {
    if (err) {
      console.error("ERROR: query failed: " + err);
      return;
    }
    console.log(JSON.stringify(rows));
  });
  conn.end();
});
