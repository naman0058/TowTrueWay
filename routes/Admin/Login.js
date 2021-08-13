var express = require('express');
var router = express.Router();
var pool =  require('../pool');


var table = 'admin'


router.get('/',(req,res)=>{
  res.render('Admin/login',{msg : ''})

})



router.post('/verification',(req,res)=>{
    let body = req.body
   

pool.query(`select * from ${table} where email = '${req.body.email}' and password = '${req.body.password}'`,(err,result)=>{
  if(err) throw err;
  else if(result[0]) {
      req.session.adminid = result[0].id
   res.redirect('/admin/dashboard')
  }
  else {
    res.render('Admin/login',{msg : '* Invalid Credentials'})
  }
})
   })



module.exports = router;
