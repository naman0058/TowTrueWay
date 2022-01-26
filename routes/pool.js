
var mysql = require('mysql')


const pool = mysql.createPool({
 
 host : 'db-mysql-blr1-79982-do-user-10297867-0.b.db.ondigitalocean.com',
   user: 'doadmin',
    password : 'nc3PdpfQIcW8tOFm',
    database: 'towtrueway',
    port:'25060',
    multipleStatements: true
  })

  // Towtrueway#Towtrueway2021#Towtrueway


// const pool = mysql.createPool({
 
//   host : 'localhost',
//     user: 'root',
//      password : '123',
//      database: 'towtrueway',
//      port:'3306',
//      multipleStatements: true
//    })


module.exports = pool;


// select  parent.name as subCategory
// ,       child.name as SubCategoryimage
// from    (
//         select  name
//         ,       id
//         ,       @rn := if(@cur = id, @rn+1, 1) as rn
//         ,       @cur := id
//         from    category c
//         join    (select @rn := 0, @cur := '') i

//         order by
//                 id
//         ,       id
//         ) as child
// join    subcategory as parent
// on      child.id = parent.id
// where   child.rn < 3