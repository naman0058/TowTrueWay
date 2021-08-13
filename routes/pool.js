

  
var mysql = require('mysql')


const pool = mysql.createPool({
 
 host : 'db-mysql-blr1-05486-do-user-9022348-0.b.db.ondigitalocean.com',
   user: 'doadmin',
    password : 'm8wcz9akv2dbl1jy',
    database: 'e-commerce',

    port:'25060' ,
    multipleStatements: true
  })


module.exports = pool;