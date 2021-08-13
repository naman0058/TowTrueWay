var express = require('express');
const pool = require('../routes/pool');
var router = express.Router();
<<<<<<< HEAD
const fetch = require("node-fetch");

=======
>>>>>>> e89b4ff3898fbfc4826c7461dcba2d136994439a

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select * from products order by id desc;`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
    else res.render('index', { title: 'Express',login:'true' , result:result });
     
    })

  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from products order by id desc;`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
    else res.render('index', { title: 'Express',login:'false' , result:result });
     
    })

  }
});








router.get('/product',(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select p.* , 
    (select b.name from brand b where b.id = p.brandid) as brandname
    from products p where p.id = '${req.query.id}';`
    var query2 = `select * from images where id = '${req.body.id}';`
    var query3 = `select * from products order by id desc;`
    pool.query(query+query1+query2+query3,(err,result)=>{
      if(err) throw err;
      else res.render('product', { title: 'Express',login:'true' , result : result});
    })
    

  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select * from products where id = '${req.query.id}';`
    var query2 = `select * from images where id = '${req.body.id}';`
    var query3 = `select * from products order by id desc;`
    pool.query(query+query1+query2+query3,(err,result)=>{
      if(err) throw err;
      else res.render('product', { title: 'Express',login:'false' , result : result});

    })

  }
})








router.get('/mycart',(req,res)=>{
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select c.* , 
    (select p.name from products p where p.id = c.booking_id) as bookingname
     from cart c where c.number = '${req.session.usernumber}';`
   var query2 = `select sum(price) as totalprice from cart where number = '${req.session.usernumber}';`              


    pool.query(query+query1+query2,(err,result)=>{
      if(err) throw err;
      else{
       res.render('cart', { title: 'Express',login:'true',result });
   
      }
   
   
       })

  }
  else{
    var query = `select * from category order by id desc;`
    var query1 = `select c.* , 
    (select p.name from products p where p.id = c.booking_id) as bookingname
     from cart c where c.number = '${req.session.usernumber}';`
   var query2 = `select sum(price) as totalprice from cart where number = '${req.session.usernumber}';`              

    pool.query(query+query1+query2,(err,result)=>{
      if(err) throw err;
      else{
       res.render('cart', { title: 'Express',login:'true',result });
   
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
  if(req.session.usernumber){
    var query = `select * from category order by id desc;`
   
   var query1 = `select c.* ,
                (select p.name from products p where p.id = c.booking_id) as bookingname
                from cart c where c.number = '${req.session.usernumber}';`
   var query2 = `select sum(price) as totalprice from cart where number = '${req.session.usernumber}';`              
   

    pool.query(query+query1+query2,(err,result)=>{
      if(err) throw err;
      else  res.render('checkout', { title: 'Express',login:'true' , result : result });
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


//  console.log('CardData',cartData)

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
    body['name'] = req.body.first_name + ' ' + req.body.last_name ;


//  console.log(req.body)


 pool.query(`select * from cart where number = '${req.session.usernumber}'`,(err,result)=>{
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


     }


   

for(i=0;i<data.length;i++) {
  console.log('quantity1',data[i].quantity)

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


  


pool.query(`delete from cart where number = '${req.session.usernumber}'`,(err,result)=>{
  if(err) throw err;
  else {
     res.redirect('/myorder')
  }
})


     }
 })

 
})




router.get('/myorder',(req,res)=>{
  if(req.session.usernumber){
    req.session.page = null;
    pool.query(`select b.* , (select p.name from products p where p.id = b.booking_id) as bookingname
               from booking b where usernumber = '${req.session.usernumber}' order by id desc `,(err,result)=>{
      if(err) throw err;
      else res.render('myorder',{result:result,login:'true'})
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

<<<<<<< HEAD







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




=======
>>>>>>> e89b4ff3898fbfc4826c7461dcba2d136994439a
module.exports = router;
