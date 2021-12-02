
var mysql = require('mysql')
require('dotenv').config()

const pool = mysql.createPool({
 
 host : 'db-mysql-blr1-79982-do-user-10297867-0.b.db.ondigitalocean.com',
   user: 'doadmin',
    password : 'nc3PdpfQIcW8tOFm',
    database: 'towtrueway',
    port:'25060',
    multipleStatements: true
  })


module.exports = pool;