var express = require('express');
var router = express.Router();
var pool =  require('../pool');


var table = 'admin'


router.get('/',(req,res)=>{
  res.render('Vendor/registeration',{msg : ''})

})



router.post('/verification',(req,res)=>{
  let body = req.body
  body['number'] = 91+req.body.number
     console.log(req.body)

pool.query(`select * from vendor where number = '${req.body.number}'`,(err,result)=>{
if(err) throw err;
else if(result[0]) {
  res.render('Vendor/registeration',{msg : '* Mobile Number Already Exists'})

}
else {
  req.session.vendornumberverify = req.body.number
  req.session.vendorbusinessname = req.body.business_name
  req.session.vendorstorename = req.body.name
  req.session.vendorcategoryid = req.body.categoryid

  var otp =   Math.floor(100000 + Math.random() * 9000);
  req.session.reqotp = otp;
  console.log("Request Number",req.session.vendornumberverify);
  console.log("OTP",otp);
  
  res.render('Vendor/otp',{msg : otp , anothermsg:''})

}
})


 })





 
router.post('/new-user',(req,res)=>{
  let body = req.body;
  if(req.body.otp == req.session.reqotp){
    body['name'] = req.session.vendorstorename
    body['number'] = req.session.vendornumberverify
    body['business_name'] = req.session.vendorbusinessname
    body['categoryid'] = req.session.vendorcategoryid
    body['status'] = 'pending'


    var today = new Date();
var dd = today.getDate();

var mm = today.getMonth()+1; 
var yyyy = today.getFullYear();
if(dd<10) 
{
    dd='0'+dd;
} 

if(mm<10) 
{
    mm='0'+mm;
} 
today = yyyy+'-'+mm+'-'+dd;


body['date'] = today


pool.query(`insert into vendor set ?`,body,(err,result)=>{
  if(err) throw err;
  else {
    req.session.vendornumber = req.session.vendornumberverify
    res.redirect('/vendor-dashboard')
  }
})

  }
  else{
    var otp =   Math.floor(100000 + Math.random() * 9000);
  req.session.reqotp = otp;
  res.render('Vendor/otp',{msg : otp , anothermsg : 'Invalid Otp'})
    
  }
})


module.exports = router;
