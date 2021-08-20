var express = require('express');
var router = express.Router();
var pool =  require('./pool');


// const SendOtp = require('sendotp');
// const sendOtp = new SendOtp(`300563AFuzfOZn9ESb5db12f8f`);





router.get('/',(req,res)=>{
  res.render('login',{msg : ''})

})



router.post('/verification',(req,res)=>{
    let body = req.body
    body['number'] = 91+req.body.number
    //   console.log(req.body)

pool.query(`select * from users where number = '${req.body.number}'`,(err,result)=>{
  if(err) throw err;
  else if(result[0]) {
    req.session.numberverify = 91+req.body.number
    var otp =   Math.floor(100000 + Math.random() * 9000);
    req.session.reqotp = otp;

    res.render('otp',{msg : otp , anothermsg:''})
  //   sendOtp.send(req.body.number, "DELOTM", otp,(err,result)=>{
  //       if(err) throw err;
  //       else{
  //         res.render('otp',{msg : '' , anothermsg:''})
  //  }
  //      })

    
    

  }
  else {
    res.render('login',{msg : '* Mobile Number Not Exists'})
  }
})


   
     
    
   })




router.post('/add-user',(req,res)=>{
  req.session.numberverify = 91+req.body.number
  req.session.name = req.body.name
  var otp =   Math.floor(100000 + Math.random() * 9000);
  req.session.reqotp = otp;
 

  

//   sendOtp.send(req.body.number, "DELOTM", otp,(err,result)=>{
//     if(err) throw err;
//     else{
//       res.render('otp',{msg : '' , anothermsg:''})
// }
//    })
 
  res.render('otp',{msg : '' , anothermsg:''})

})



router.post('/new-user',(req,res)=>{
  let body = req.body;
  if(req.body.otp == req.session.reqotp){
    body['name'] = req.session.name
    body['number'] = req.session.numberverify
    body['name'] = 'hi'



pool.query(`select * from users where number = '${req.session.numberverify}'`,(err,result)=>{
  if(err) throw err;
  else if(result[0]) {


    if(req.session.page){
  pool.query(`update cart set number = '${req.session.numberverify}' where number = '${req.session.ipaddress}'`,(err,result)=>{
    if(err) throw err;
    else {
      req.session.usernumber = req.session.numberverify;
      res.redirect('/checkout')
    }
  })
    }
    else {
      req.session.usernumber = req.session.numberverify;
      res.redirect('/')
    }


  }
  else {

    pool.query(`insert into users set ?`,body,(err,result)=>{
      if(err) throw err;
      else {
       





        if(req.session.page){
          pool.query(`update cart set number = '${req.session.numberverify}' where number = '${req.session.ipaddress}'`,(err,result)=>{
            if(err) throw err;
            else {
              req.session.usernumber = req.session.numberverify;
              res.redirect('/checkout')
            }
          })
            } 
            else {
              req.session.usernumber = req.session.numberverify;
              res.redirect('/')
            }



      }
    })
  }
})



  }
  else{

  res.render('otp',{msg : '' , anothermsg : 'Invalid Otp'})
    
  }
})


module.exports = router;
