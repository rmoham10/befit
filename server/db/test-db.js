const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Riyaz@11161', // use your MySQL password
  database: 'quicksign_db'   // use your project DB name
});

connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connected successfully!');
  }
  connection.end();
});