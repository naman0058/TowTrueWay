var express = require('express');
const pool = require('../routes/pool');
var router = express.Router();

const fetch = require("node-fetch");



/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.usernumber){
   var query = `select * from category order by id desc;`
   var query1 = `select * from banner where type = 'Front Banner' order by id desc;`
   var query2=` SELECT bannerid ,productid , (select t.name from promotional_text t where t.id = bannerid) as textname ,
   (select p.name from products p where p.id = productid) as productname,
   (select p.price from products p where p.id = productid) as productprice,
   (select p.quantity from products p where p.id = productid) as productquantity,
   (select p.discount from products p where p.id = productid) as productdiscount,
   (select p.image from products p where p.id = productid) as productimage,
   (select p.categoryid from products p where p.id = productid) as productcategoryid,
   (select p.subcategoryid from products p where p.id = productid) as productsubcategoryid,
   (select p.net_amount from products p where p.id = productid) as productnetamount
   
     FROM
      (SELECT *,
                    ROW_NUMBER() OVER (PARTITION BY bannerid ORDER BY id DESC) as country_rank
        FROM promotional_text_management p) ranked
     WHERE country_rank <= 5 order by bannerid desc , productquantity desc;`
   var query3 = `select * from promotional_text order by id desc;`
   var query4 = `select * from cart where usernumber = '${req.session.number}';`
   var query5 = `select * from banner where type = 'Bottom Banner' order by id desc;`
 
   pool.query(query+query1+query2+query3+query4+query5,(err,result)=>{
     if(err) throw err;
     else  res.render('index', { title: 'Express',result,login:true });
   })
  }
  else{
   var query = `select * from category order by id desc;`
   var query1 = `select * from banner where type = 'Front Banner' order by id desc;`
   var query2=` SELECT bannerid ,productid , (select t.name from promotional_text t where t.id = bannerid) as textname ,
   (select p.name from products p where p.id = productid) as productname,
   (select p.price from products p where p.id = productid) as productprice,
   (select p.quantity from products p where p.id = productid) as productquantity,
   (select p.discount from products p where p.id = productid) as productdiscount,
   (select p.image from products p where p.id = productid) as productimage,
   (select p.categoryid from products p where p.id = productid) as productcategoryid,
   (select p.subcategoryid from products p where p.id = productid) as productsubcategoryid,
   (select p.net_amount from products p where p.id = productid) as productnetamount
   
     FROM
      (SELECT *,
                    ROW_NUMBER() OVER (PARTITION BY bannerid ORDER BY id DESC) as country_rank
        FROM promotional_text_management p) ranked
     WHERE country_rank <= 5 order by bannerid desc , productquantity desc;`
   var query3 = `select * from promotional_text order by id desc;`
   var query4 = `select * from cart where usernumber = '${req.session.number}';`
   var query5 = `select * from banner where type = 'Bottom Banner' order by id desc;`
   pool.query(query+query1+query2+query3+query4+query5,(err,result)=>{
     if(err) throw err;
     else  res.render('index', { title: 'Express',result,login:false });
   })
  }
 
 
  
 });
 





router.get('/product',(req,res)=>{

  pool.query(`select categoryid from products where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else {
      let categoryid = result[0].categoryid
  
      if(req.session.usernumber){
        var query = `select * from category order by id desc;`
        var query1 = `select p.* , 
        (select b.name from brand b where b.id = p.brandid) as brandname
        
        from products p where p.id = '${req.query.id}';`
        var query3 = `select * from products order by id desc;`
        var query4 = `select * from products where categoryid = '${categoryid}' order by id desc limit 8;`
        var query5 = `select * from images where productid = '${req.query.id}';`
        pool.query(query+query1+query3+query4+query5,(err,result)=>{
          if(err) throw err;
          else res.render('view-product', { title: 'Express',login:true, result : result});
        })
        
    
      }
      else{
        var query = `select * from category order by id desc;`
        var query1 = `select p.* , 
        (select b.name from brand b where b.id = p.brandid) as brandname
      
        from products p where p.id = '${req.query.id}';`
        var query3 = `select * from products order by id desc;`
        var query4 = `select * from products where categoryid = '${categoryid}' order by id desc limit 8;`
        var query5 = `select * from images where productid = '${req.query.id}';`
  
        pool.query(query+query1+query3+query4+query5,(err,result)=>{
          if(err) throw err;
          else res.render('view-product', { title: 'Express',login:false , result : result});
    
        })
    
      }
  
    }
  })
  
  
  })
  
  
  


  router.post("/cart-handler", (req, res) => {
    let body = req.body
  console.log('usern ka number',req.session.ipaddress)
  
  if(req.session.usernumber || req.session.usernumber!= undefined){
    body['usernumber'] = req.session.usernumber;
  
    console.log(req.body)
    if (req.body.quantity == "0" || req.body.quantity == 0) {
    pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
        if (err) throw err;
        else {
          res.json({
            msg: "updated sucessfully",
          });
        }
    })
    }
    else {
        pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
            if (err) throw err;
            else if (result[0]) {
               // res.json(result[0])
                pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}'`,(err,result)=>{
                    if (err) throw err;
                    else {
                        res.json({
                          msg: "updated sucessfully",
                        });
                      }
  
                })
            }
            else {
              body["price"] = (req.body.price)*(req.body.quantity)
                 pool.query(`insert into cart set ?`, body, (err, result) => {
                 if (err) throw err;
                 else {
                   res.json({
                     msg: "updated sucessfully",
                   });
                 }
               });
  
            }
  
        })
    }
  }
  else {
  
  
  
    if(req.session.ipaddress){
      body['usernumber'] = req.session.ipaddress;
  
      console.log(req.body)
      if (req.body.quantity == "0" || req.body.quantity == 0) {
      pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
          if (err) throw err;
          else {
            res.json({
              msg: "updated sucessfully",
            });
          }
      })
      }
      else {
          pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
              if (err) throw err;
              else if (result[0]) {
                 // res.json(result[0])
                  pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}'`,(err,result)=>{
                      if (err) throw err;
                      else {
                          res.json({
                            msg: "updated sucessfully",
                          });
                        }
    
                  })
              }
              else {
                body["price"] = (req.body.price)*(req.body.quantity)
                   pool.query(`insert into cart set ?`, body, (err, result) => {
                   if (err) throw err;
                   else {
                     res.json({
                       msg: "updated sucessfully",
                     });
                   }
                 });
    
              }
    
          })
      }
    
  
  
    }
  
    else {
  
      var otp =   Math.floor(100000 + Math.random() * 9000);
      req.session.ipaddress = otp;
      body['usernumber'] = otp;
      console.log(req.body)
      if (req.body.quantity == "0" || req.body.quantity == 0) {
      pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
          if (err) throw err;
          else {
            res.json({
              msg: "updated sucessfully",
            });
          }
      })
      }
      else {
          pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
              if (err) throw err;
              else if (result[0]) {
                 // res.json(result[0])
                  pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}'`,(err,result)=>{
                      if (err) throw err;
                      else {
                          res.json({
                            msg: "updated sucessfully",
                          });
                        }
    
                  })
              }
              else {
                body["price"] = (req.body.price)*(req.body.quantity)
                   pool.query(`insert into cart set ?`, body, (err, result) => {
                   if (err) throw err;
                   else {
                     res.json({
                       msg: "updated sucessfully",
                     });
                   }
                 });
    
              }
    
          })
      }
    
  
  
    }
  
  
   
  
  }
  
  
  
  })





 
router.get('/mycart',(req,res)=>{

  console.log(req.session.ipaddress)
 
   if(req.session.usernumber){
     var query = `select * from category order by id desc;`
     var query1 = `select c.* , 
     (select p.name from products p where p.id = c.booking_id) as bookingname,
     (select p.image from products p where p.id = c.booking_id) as bookingimage,
     (select p.quantity from products p where p.id = c.booking_id) as availablequantity
     
 
     
      from cart c where c.usernumber = '${req.session.usernumber}';`
    var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`              
 
 
     pool.query(query+query1+query2,(err,result)=>{
       if(err) throw err;
       else{
 
 if(result[2][0].totalprice > 500) {
   res.render('cart', { title: 'Express',login:true,result , shipping_charges : 0 });
 
 }
 else {
   res.render('cart', { title: 'Express',login:true,result , shipping_charges : 500 });
 
 }
 
    
       }
    
    
        })
 
   }
   else{
     var query = `select * from category order by id desc;`
     var query1 = `select c.* , 
     (select p.name from products p where p.id = c.booking_id) as bookingname,
     (select p.image from products p where p.id = c.booking_id) as bookingimage,
     (select p.quantity from products p where p.id = c.booking_id) as availablequantity
 
     
      from cart c where c.usernumber = '${req.session.ipaddress}';`
    var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.ipaddress}';`              
 
     pool.query(query+query1+query2,(err,result)=>{
       if(err) throw err;
       else{
      
 
         if(result[2][0].totalprice > 500) {
           res.render('cart', { title: 'Express',login:false,result , shipping_charges : 0 });
         
         }
         else {
           res.render('cart', { title: 'Express',login:false,result , shipping_charges : 500 });
         
         }
         
    
       }
    
    
        })
 
   }
 })
   




router.post('/add-to-cart',(req,res)=>{
  let body = req.body
  console.log('data',req.body)
  console.log(req.session.usernumber)
  if(req.session.usernumber || req.session.usernumber!= undefined){


if(req.body.quantity=='0' || req.body.quantity==0){
  pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and number = '${req.session.usernumber}'`,(err,result)=>{
    if(err) throw err;
    else {
      res.json({
        msg : 'success'
      })
    }
  })
}
else{
  body['number'] = req.session.usernumber
  pool.query(`select * from cart where booking_id = '${req.body.booking_id}' and number = '${req.session.usernumber}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]) {
        pool.query(`update cart set quantity =  ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity} where booking_id = '${req.body.booking_id}' and number = '${req.session.usernumber}' `,(err,result)=>{
          if(err) throw err;
          else {
            res.json({
              msg : 'success'
            })
          }
        })
    }
    else {
     pool.query(`insert into cart set ?`,body,(err,result)=>{
          if(err) throw err;
          else {
            res.json({
              msg : 'success'
            })
          }
        
     })
    }
  })
}



 
  }
  else{



  







  if(req.session.ipaddress){



    if(req.body.quantity=='0' || req.body.quantity==0){
      pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and number = '${req.session.ipaddress}'`,(err,result)=>{
        if(err) throw err;
        else {
          res.json({
            msg : 'success'
          })
        }
      })
    }

    else {
      body['number'] = req.session.ipaddress;
      pool.query(`select * from cart where booking_id = '${req.body.booking_id}' and number = '${req.session.usernumber}`,(err,result)=>{
        if(err) throw err;
        else if(result[0]) {
            pool.query(`update cart set quantity =  ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity} where booking_id = '${req.body.booking_id}' and number = '${req.session.ipaddress}' `,(err,result)=>{
              if(err) throw err;
              else {
                res.json({
                  msg : 'success'
                })
              }
            })
        }
        else {
         pool.query(`insert into cart set ?`,body,(err,result)=>{
              if(err) throw err;
              else {
                res.json({
                  msg : 'success'
                })
              }
            
         })
        }
      })
    }

  
  
    


  }
  else{
    var otp =   Math.floor(100000 + Math.random() * 9000);
    req.session.ipaddress = otp;
    body['number'] = otp;
    pool.query(`select * from cart where booking_id = '${req.body.booking_id}'`,(err,result)=>{
      if(err) throw err;
      else if(result[0]) {
          pool.query(`update cart set quantity =  ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity} where booking_id = '${req.body.booking_id}' `,(err,result)=>{
            if(err) throw err;
            else {
              res.json({
                msg : 'success'
              })
            }
          })
      }
      else {
       pool.query(`insert into cart set ?`,body,(err,result)=>{
            if(err) throw err;
            else {
              res.json({
                msg : 'success'
              })
            }
          
       })
      }
    })
    


  }

    
   

  }
})









router.get('/delete',(req,res)=>{
  pool.query(`delete from cart where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else {
      pool.query(`select * from cart`,(err,result)=>{
        if(err) throw err;
        else{
         res.render('cart', { title: 'Express',login:'true',result });
     
        }
     
     
         })
    }
  })
})



router.get('/checkout',(req,res)=>{

console.log('hd',req.session.usernumber)

  if(req.session.usernumber){


    pool.query(`select email from users where number = '${req.session.usernumber}'`,(err,result)=>{
      if(err) throw err;
      // else if(result[0].email==null || result[0].email == ''){
      //   req.session.newuser = '1';
      //   var query = `select * from category order by id desc;`
      //   var query1 = `select * from users where number = '${req.session.usernumber}';`
    
      //   pool.query(query+query1,(err,result)=>{
      //     if(err) throw err;
      //     else res.render('myaccount',{result:result,login:true,msg:'Please Update Your Profile To Checkout'})
      //   })
      // }
      else {
        var query = `select * from category order by id desc;`
   
        var query1 = `select c.* ,
                     (select p.name from products p where p.id = c.booking_id) as bookingname
                     from cart c where c.usernumber = '${req.session.usernumber}';`
        var query2 = `select sum(price) as totalprice from cart where usernumber = '${req.session.usernumber}';`  
        var query3 = `select * from address where usernumber = '${req.session.usernumber}';` 
        var query4 = `select name,email from users where number = '${req.session.usernumber}'`           
        
     
         pool.query(query+query1+query2+query3+query4,(err,result)=>{
           if(err) throw err;
           else {
     
     
     
            // res.json(result)
             req.session.totalprice = result[2][0].totalprice
     
     
     if((+req.session.totalprice) > 500) {
       shipping_charges = 0
     }
     else {
      shipping_charges = 500
     }
     
              res.render('checkout', { title: 'Express',login:true , result : result , shipping_charges });
           } 
         })
      }
    })

 
   

  }
  else{
    req.session.page = '1'
    res.redirect('/login')
  }
})









router.post('/order-now',(req,res)=>{
  let body = req.body;
// console.log('body',req.body)
  let cartData = req.body

  console.log('CardData',cartData)
  if(req.body.payment_mode == 'online') {

    req.session.userfirstname =  req.body.first_name;
  
    req.session.address1 = req.body.address1;
    req.session.address2 = req.body.address2;
    req.session.city = req.body.city;
    req.session.state = req.body.state;
    req.session.pincode = req.body.pincode;
    // req.session.time = req.body.time;
    req.session.payment_mode = req.body.payment_mode;
   
   
    if((+req.session.totalprice) > 500) {
      amount = req.session.totalprice
    }
    else {
     amount = (+req.session.totalprice) + 500
    }


    const url = `https://rzp_live_wdTkjI7Ba4b5qN:rxR0Prlwb9Gz7HctbrpukFOe@api.razorpay.com/v1/orders/`;
    const data = {
      amount: amount* 100, // amount in the smallest currency unit
      //amount:100,
      currency: "INR",
      payment_capture: true,
    };
    console.log("data", data);
    const options = {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };
    fetch(url, options)
      .then((res) => res.json())
      .then((resu) => {
          //  res.render('open',{resu : resu.id})
          res.json(resu)
      })

  }
  else{


    console.log('CardData',cartData)

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
    
    
    
      var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var result = '';
      for ( var i = 0; i < 12; i++ ) {
          result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
     orderid = result;
    
    
        body['address'] = req.body.address1 + ',' + req.body.address2 + ',' + req.body.city + ',' + req.body.state + ',' + req.body.pincode;
        body['name'] = req.body.first_name  ;
    
    
     console.log(req.body)
    
    
     pool.query(`select * from cart where usernumber = '${req.session.usernumber}'`,(err,result)=>{
         if(err) throw err;
         else {
    
         let data = result
    
         for(i=0;i<result.length;i++){
          data[i].name = req.body.name
          data[i].date = today
          data[i].orderid = orderid
          data[i].status = 'pending'
          data[i].number = req.session.usernumber
          data[i].usernumber = req.session.usernumber
          data[i].payment_mode = 'cash'
          data[i].address = req.body.address
          data[i].id = null
          data[i].pincode = req.body.pincode
          data[i].order_date = today
          // data[i].time = req.body.time

          if((+data[i].price) > 500){
            data[i].price = data[i].price
            data[i].shipping_charges = 0
          }
          else{
          data[i].price = (+data[i].price) + 500;
          data[i].shipping_charges = 500
          }
    
    
         }
    
    
       
    
    for(i=0;i<data.length;i++) {
      console.log('quantity1',data[i])
    
    let quantity = data[i].quantity;
    let booking_id = data[i].booking_id;
    
     pool.query(`insert into booking set ?`,data[i],(err,result)=>{
             if(err) throw err;
             else {
        
    
    pool.query(`update products set quantity = quantity - ${quantity} where id = '${booking_id}'`,(err,result)=>{
     if(err) throw err;
     else {
    
     }
    
    })
    
             }
        })
    }
    
    
      
    
    
    pool.query(`delete from cart where usernumber = '${req.session.usernumber}'`,(err,result)=>{
      if(err) throw err;
      else {
         res.redirect('/confirmation')
      }
    })
    
    
         }
     })

  }

  

 
})




router.get('/my-account',(req,res)=>{
  if(req.session.usernumber){
    req.session.page = null;
    var query = `select * from category order by id desc;`
    var query1 = `select b.* , (select p.name from products p where p.id = b.booking_id) as bookingname,
    (select p.image from products p where p.id = b.booking_id) as bookingimage
    from booking b where usernumber = '${req.session.usernumber}' order by id desc ;`
    var query2 = `select * from users where number = '${req.session.usernumber}';`
    var query3 = `select * from address where usernumber = '${req.session.usernumber}';`
    var query4 = `select email from users where number = '${req.session.usernumber}';`

    pool.query(query+query1+query2+query3+query4,(err,result)=>{
      if(err) throw err;
      else res.render('myaccount',{result:result,login:true})
    })
  }
  else{
    req.session.page = null;
  res.redirect('/login')
  }
 
})




router.get('/shop',(req,res)=>{
  var query = `select * from category order by id desc;`
  var query1 = `select * from products where categoryid = '${req.query.categoryid}';`
  pool.query(query+query1,(err,result)=>{
    if(err) throw err;
    else  res.render('shop',{result:result})
  })
 
})



router.get('/search',(req,res)=>{
  var query = `select * from category order by id desc;`
  var query1 = `select * from products where keyword Like '%${req.query.search}%';`
  pool.query(query+query1,(err,result)=>{
    if(err) throw err;
    else if(result[1][0]){
      res.render('shop',{result:result})
    }
    else res.send('no')
  })
 
})









router.get("/payment", (req, res) => {
  const url = `https://rzp_live_wdTkjI7Ba4b5qN:rxR0Prlwb9Gz7HctbrpukFOe@api.razorpay.com/v1/orders/`;
  const data = {
    amount: 100 * 100, // amount in the smallest currency unit
    //amount:100,
    currency: "INR",
    payment_capture: true,
  };
  console.log("data", data);
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };
  fetch(url, options)
    .then((res) => res.json())
    .then((resu) => res.send(resu));
});


















router.get('/view-all-product',(req,res)=>{


  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select t.* ,   
    (select p.name from products p where p.id = t.productid) as productname,
    (select p.price from products p where p.id = t.productid) as productprice,
    (select p.quantity from products p where p.id = t.productid) as productquantity,
    (select p.discount from products p where p.id = t.productid) as productdiscount,
    (select p.image from products p where p.id = t.productid) as productimage,
    (select p.categoryid from products p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from products p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from products p where p.id = t.productid) as productnetamount 
    from promotional_text_management t where t.bannerid = '${req.query.id}' order by productquantity desc `
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else if(result[1][0]) res.render('view_all_product',{result:result,login:true})
      else  res.render('not_found',{result,login:true})
    })
  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select t.* ,   
    (select p.name from products p where p.id = t.productid) as productname,
    (select p.price from products p where p.id = t.productid) as productprice,
    (select p.quantity from products p where p.id = t.productid) as productquantity,
    (select p.discount from products p where p.id = t.productid) as productdiscount,
    (select p.image from products p where p.id = t.productid) as productimage,
    (select p.categoryid from products p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from products p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from products p where p.id = t.productid) as productnetamount 
    from promotional_text_management t where t.bannerid = '${req.query.id}' order by productquantity desc ;`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else  res.render('view_all_product',{result:result,login:false})
    })
  }
  
  

 
})












router.post('/myaccount-update', (req, res) => {
  console.log(req.body)
  pool.query(`update users set ? where number = ?`, [req.body, req.body.number], (err, result) => {
      if(err) {
          res.json({
              status:500,
              type : 'error',
              description:err
          })
      }
      else {

  if(req.session.newuser){
    req.session.newuser = null;
        res.redirect('/checkout')
  }
  else {
    res.redirect('/my-account#account-details')

  }


          
      }
  })
})




router.get('/wishlist',(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select t.*,
    (select p.name from products p where p.id = t.booking_id) as productname,
    (select p.price from products p where p.id = t.booking_id) as productprice,
    (select p.quantity from products p where p.id = t.booking_id) as productquantity,
    (select p.discount from products p where p.id = t.booking_id) as productdiscount,
    (select p.image from products p where p.id = t.booking_id) as productimage,
    (select p.categoryid from products p where p.id = t.booking_id) as productcategoryid,
    (select p.subcategoryid from products p where p.id = t.booking_id) as productsubcategoryid,
    (select p.net_amount from products p where p.id = t.booking_id) as productnetamount ,
    (select c.quantity from cart c where c.booking_id = t.booking_id and c.usernumber = '${req.session.usernumber}'  ) as userquantity
    from wishlist t where usernumber = '${req.session.usernumber}';`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else res.render('wishlist',{result})
    })
  }
 
  else{
   res.redirect('/login')
  }
 
 
})




router.get('/logout',(req,res)=>{
  req.session.usernumber = null;
  req.session.ipaddress = null;
  res.redirect('/login')
})
 

router.get('/edit/address',(req,res)=>{
  pool.query(`select * from address where id ='${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else res.render('edit-address',{result})
  })
})










router.get('/website-customization',(req,res)=>{
  res.render('website_customization')
})



router.get('/faq-customization',(req,res)=>{
  res.render('faq_customization')
})




router.post('/faq-insert',(req,res)=>{
  let body = req.body
  pool.query(`insert into faq set ?`,body,(err,result)=>{
    if(err) throw err;
    else res.json({
      msg : 'success'
    })
  })
})



router.post('/website-customization-insert',(req,res)=>{
  let body = req.body   
  pool.query(`select * from website_customize where name = '${req.body.name}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
      res.json({
        msg : 'Already Inserted'
      })
    }
    else {
      pool.query(`insert into website_customize set ?`,body,(err,result)=>{
        if(err) throw err;
        else res.json({
          msg : 'success'
        })
      })
    }
  })
})


module.exports = router;
