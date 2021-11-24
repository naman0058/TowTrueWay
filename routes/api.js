var express = require('express');
var router = express.Router();
var pool =  require('./pool');
var upload = require('./multer');







router.get('/get-brand',(req,res)=>{
    pool.query(`select b.* , 
    (select c.name from category c where c.id = b.categoryid) as categoryname,
    (select s.name from subcategory s where s.id = b.subcategoryid) as subcategoryname
    from brand b order by id desc limit 10`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    }) 
})



router.get('/get-banner-image',(req,res)=>{
    pool.query(`select s.* , (select c.name from category c where c.id = s.categoryid) as categoryname from banner_image s order by id desc limit 10`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    }) 
})






// mobile api



router.get('/get-category',(req,res)=>{
    pool.query(`select * from category order by id desc limit 10`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
   
   })
   



   router.get('/get-brand',(req,res)=>{
    pool.query(`select * from brand order by name desc `,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
   
   })




   router.get('/get-product',(req,res)=>{
    pool.query(`select * from products order by name desc `,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
   
   })





   
   
   router.get('/get-subcategory',(req,res)=>{
       pool.query(`select s.* , (select c.name from category c where c.id = s.categoryid) as categoryname from subcategory s`,(err,result)=>{
           if(err) throw err;
           else res.json(result)
       }) 
   })
   


   router.get('/get-subcategory1',(req,res)=>{
    pool.query(`select s.* , (select c.name from category c where c.id = s.categoryid) as categoryname from subcategory s where s.categoryid = '${req.query.categoryid}'  order by id desc limit 10`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    }) 
})


//    router.get('/get-product',(req,res=>{
//        pool
//    }))


router.get('/search',(req,res)=>{
    pool.query(`select * from products where keyword Like '%${req.query.search}%'`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})


router.get('/product-description',(req,res)=>{


  pool.query(`select * from products where id  = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else {
      let subcategory = result[0].subcategoryid


      var query = `select * from products where id = '${req.query.id}';`
      var query1 = `select * from images where productid = '${req.query.id}';`
      var query2 = `select  * from products where subcategoryid = '${subcategory}';`
      
      pool.query(query+query1+query2,(err,result)=>{
          if(err) throw err;
          else res.json(result)
      })



    }
  })

})



router.get('/get-address',(req,res)=>{
    pool.query(`select * from address where usernumber = '${req.query.usernumber}'`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})



router.post('/save-address',(req,res)=>{
    let body = req.body;
    console.log('body h',req.body)
    pool.query(`insert into address set ?`,body,(err,result)=>{
        if(err) throw err;
        else res.json({
            msg : 'success'
        })
    })
})



router.post("/cart-handler", (req, res) => {
    let body = req.body
    console.log(req.body)
    if (req.body.quantity == "0" || req.body.quantity == 0) {
    pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  number = '${req.body.number}'`,(err,result)=>{
        if (err) throw err;
        else {
          res.json({
            msg: "updated sucessfully",
          });
        }
    })
    }
    else {
        pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and number = '${req.body.number}' `,(err,result)=>{
            if (err) throw err;
            else if (result[0]) {
               // res.json(result[0])
                pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and number = '${req.body.number}'`,(err,result)=>{
                    if (err) throw err;
                    else {
                        res.json({
                          msg: "updated sucessfully",
                        });
                      }

                })
            }
            else {
                body['oneprice'] = req.body.price
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

})




router.get('/myorder',(req,res)=>{
    pool.query(`select * from booking where usernumber = '${req.query.number}' order by date desc`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})



router.post('/save-user',(req,res)=>{
    let body =  req.body;


    pool.query(`select * from users where number = '${req.body.number}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
         res.json({
            msg : 'success'

         })
        }
        else {
            pool.query(`insert into users set ?`,body,(err,result)=>{
                if(err) throw err;
                else res.json({
                    msg : 'success'
                })
            })
        }
    })

   
})



router.post("/mycart", (req, res) => {
 
    var query = `select c.*,(select s.name from products s where s.id = c.booking_id) as servicename
    ,(select s.image from products s where s.id = c.booking_id) as productlogo,
    (select s.quantity from products s where s.id = c.booking_id) as productquantity
    from cart c where c.number = '${req.body.number}';`
    var query1 = `select count(id) as counter from cart where number = '${req.body.number}';`
    var query2 = `select sum(c.price) as total_ammount from cart c where c.quantity <= (select p.quantity from products p where p.id = c.booking_id ) and  c.number = '${req.body.number}' ;`
    var query3 = `select c.*,(select s.name from products s where s.id = c.booking_id) as servicename
    ,(select s.image from products s where s.id = c.booking_id) as productlogo,
    (select s.quantity from products s where s.id = c.booking_id) as productquantity
      
    from cart c where c.quantity <= (select p.quantity from products p where p.id = c.booking_id ) and c.number = '${req.body.number}' ;`
    var query4 = `select count(id) as counter from cart c where c.quantity <= (select p.quantity from products p where p.id = c.booking_id ) and c.number = '${req.body.number}';`
    pool.query(query+query1+query2+query3+query4, (err, result) => {
      if (err) throw err;
      else if (result[0][0]) {
        req.body.mobilecounter = result[1][0].counter;
        console.log("MobileCounter", req.body.mobilecounter);
        res.json(result);
      } else
        res.json({
          msg: "empty cart",
        });
    });

});


let data2 = []


router.get('/index',(req,res)=>{

     
    let data1 = []
  
    
    pool.query(`select * from app_order`,(err,result)=>{
        if(err) throw err;
        else {
    //  console.log(result.length)
    
   for( i=0;i<result.length;i++){
       let j = i
       let length = result.length
       let title = result[i].title
       let categoryid = result[i].categoryid
       let subcategoryid = result[i].subcategoryid

// console.log('original',j)

       
       pool.query(`select * from products where categoryid = '${categoryid}' and subcategoryid = '${subcategoryid}'`,(err,response)=>{
           if(err) throw err;
           else {
  


// console.log(j)
   data2.push({Title:title,data:response})
 
    // console.log('dfgfdfffff',data2)
    // res.json(data2)



           
           }

        //    console.log('fgy',response[0])
           


       })
     
   }
//    console.log('finaltime',data2)
   res.json(data2)
   data2 = []

        }
    })

})



function check_repurchse(number,dp){

  pool.query(`select * from member where number = '${number}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
   
      let bv = (dp*20)/100;
      pool.query(`update member set bv = bv+${bv} where number = '${number}'`,(err,result)=>{
        if(err) throw err;
        else {
          res.json({
            msg : 'success'
        })
        }
      })


    }
    else{
      res.json({
        msg : 'success'
    })
    }
  })

}



router.post('/buy-now',(req,res)=>{
    let body = req.body;



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
   body['orderid'] = result;


    pool.query(`insert into booking set ?`, body,(err,result)=>{
        if(err) throw err;
        else {
     pool.query(`update products set quantity = quantity - ${req.body.quantity} where id = ${req.body.booking_id}`,(err,result)=>{
         if(err) throw err;
         else {
            check_repurchse(req.body.number)
         }
     })

        }
    })
})





router.post('/order-now',(req,res)=>{
    let body = req.body;
console.log('body',req.body)
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


   


   pool.query(`select * from cart where number = '${req.body.usernumber}'`,(err,result)=>{
       if(err) throw err;
       else {

       let data = result

       for(i=0;i<result.length;i++){
        data[i].name = req.body.name
        data[i].date = today
        data[i].orderid = orderid
        data[i].status = 'pending'
        data[i].number = req.body.number
        data[i].usernumber = req.body.usernumber
        data[i].payment_mode = 'cash'
        data[i].address = req.body.address
        data[i].id = null


       }



for(i=0;i<data.length;i++) {
   pool.query(`insert into booking set ?`,data[i],(err,result)=>{
           if(err) throw err;
           else {
  pool.query(`update products set quantity = quantity - ${data[i].quantity} where id = '${data[i].booking_id}'`,(err,result)=>{
   if(err) throw err;
   else {

   }

  })

           }
      })
}


    


pool.query(`delete from cart where number = '${req.body.usernumber}'`,(err,result)=>{
    if(err) throw err;
    else {

pool.query(`select sum(dp_price) as totaldp from booking where orderid = '${orderid}'`,(err,result)=>{
  if(err) throw err;
  else {
    check_repurchse(req.body.number,result[0].totaldp)

  }
})


    }
})


       }
   })

   
})






// router.post('/orders',(req,res)=>{
//     let body = req.body;
//     body['date'] = today
//     body['status'] = 'pending'
//     pool.query(`insert into booking set ?`,body,(err,result)=>{
//         if(err) throw err;
//         else {
//           let insertId = result.insertId

//           pool.query(`select * from cart c where c.quantity <= (select p.quantity from product p where p.id = c.booking_id ) and c.number = '${req.body.number}' and c.status is null`,(err,result)=>{
//             if(err) throw err;
//             else {
//           //    res.json(result)
//               for(i=0;i<result.length;i++){
//                 let booking_id = result[i].booking_id
//                 pool.query(`update product set quantity = quantity - '${result[i].quantity}' where id = '${result[i].booking_id}'`,(err,result)=>{
//                   if(err) throw err;
//                   else {
//                     pool.query(`update cart set status = 'booked' , orderid = '${insertId}' where number = '${req.body.number}' and booking_id ='${booking_id}' and status is null`,(err,result)=>{
//                       if(err) throw err;
//                       else {
//                            res.json({
//                   msg :'success'
//               })
//                       }
//                   })
//                   }
//                 })
//               }
            
            
//             }
//           })
           
           
//         }
       
//     })
// })








router.get('/view-all-product',(req,res)=>{
    console.log('que',req.query)
    var query = `select t.* ,   
      (select p.name from product p where p.id = t.productid) as productname,
      (select p.price from product p where p.id = t.productid) as productprice,
      (select p.quantity from product p where p.id = t.productid) as productquantity,
      (select p.discount from product p where p.id = t.productid) as productdiscount,
      (select p.image from product p where p.id = t.productid) as productimage,
      (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
      (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
      (select p.net_amount from product p where p.id = t.productid) as productnetamount ,
    (select c.quantity from cart c where c.booking_id = t.productid and c.usernumber = '${req.query.number}'  ) as userquantity
  
      from banner_manage t where t.bannerid = '${req.query.id}' `
      pool.query(query,(err,result)=>{
        if(err) throw err;
       else res.json(result)
      })
  })
  
  
  
  
  router.get('/view-all-text-product',(req,res)=>{
    console.log('que',req.query)
    var query = `select t.* ,   
      (select p.name from product p where p.id = t.productid) as productname,
      (select p.price from product p where p.id = t.productid) as productprice,
      (select p.quantity from product p where p.id = t.productid) as productquantity,
      (select p.discount from product p where p.id = t.productid) as productdiscount,
      (select p.image from product p where p.id = t.productid) as productimage,
      (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
      (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
      (select p.net_amount from product p where p.id = t.productid) as productnetamount ,
    (select c.quantity from cart c where c.booking_id = t.productid and c.usernumber = '${req.query.number}'  ) as userquantity
  
      from promotional_text_management t where t.bannerid = '${req.query.id}' `
      pool.query(query,(err,result)=>{
        if(err) throw err;
       else res.json(result)
      })
  })
  
  
  
  
  router.get('/show-all-promotional-text',(req,res)=>{
    pool.query(`select * from promotional_text order by id desc`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })
  
  
  
  
  
  router.get('/promotional/text/delete', (req, res) => {
    let body = req.body
    pool.query(`delete from promotional_text where id = ${req.query.id}`, (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully delete'
            })
        }
    })
  })
  
  
  router.post('/promotional/text/update', (req, res) => {
    pool.query(`update promotional_text set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully update'
            })
  
            
        }
    })
  })
  
  
  
  
  
  
  
  router.post('/promotional/text/update_image',upload.single('image'), (req, res) => {
    let body = req.body;
    body['image'] = req.file.filename
  
  
  pool.query(`update promotional_text set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            // res.json({
            //     status:200,
            //     type : 'success',
            //     description:'successfully update'
            // })
  
            res.redirect('/banner/new-promotional-text')
        }
    })
  
  
  
  
   
  })
  
  
  
  
  router.get('/get-faq',(req,res)=>{
    pool.query(`select * from faq order by id desc`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })
  
  
  router.get('/get-faq/delete',(req,res)=>{
    pool.query(`delete from faq where id = '${req.query.id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })
  
  
  
  
  router.post('/update-faq', (req, res) => {
    pool.query(`update faq set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully update'
            })
  
            
        }
    })
  })
  
  
  
  
  
  router.get('/all-website-customize',(req,res)=>{
    pool.query(`select * from website_customize`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })
  
  
  
  
  
  
  
  
  router.get('/get-faq/website',(req,res)=>{
    pool.query(`delete from website_customize where id = '${req.query.id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })
  
  
  
  
  router.post('/update-website', (req, res) => {
    pool.query(`update website_customize set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully update'
            })
  
            
        }
    })
  })
  
  
  
  
router.post("/payment-initiate", (req, res) => {
    const url = `https://rzp_live_wdTkjI7Ba4b5qN:rxR0Prlwb9Gz7HctbrpukFOe@api.razorpay.com/v1/orders/`;
    const data = {
      amount: req.body.amount * 100, // amount in the smallest currency unit
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
  
  router.get("/demo", (req, res) => {
    res.render("dem");
  });
  
  router.get("/demo1", (req, res) => {
    console.log(req.query);
    res.send(req.query);
  });
  
  router.post("/razorpay-response", (req, res) => {
    let body = req.body;
    console.log("response recieve", body);
  
    if (body.razorpay_signature) {
      res.redirect("/api/success_razorpay");
    } else {
      res.redirect("/api/failed_payment");
    }
  });
  
  router.get("/success_razorpay", (req, res) => {
    res.json({
      msg: "success",
    });
  });
  
  router.get("/failed_payment", (req, res) => {
    res.json({
      msg: "failed",
    });
  });
  
  router.post("/failed_payment", (req, res) => {
    res.json({
      msg: "failed",
    });
  });
  
  
  

  router.get('/get-top-banner',(req,res)=>{
    pool.query(`select * from banner where type = 'Front Banner'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })
  
  
  
  router.get('/get-bottom-banner',(req,res)=>{
    pool.query(`select * from banner where type = 'Bottom Banner'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })
  



  router.post('/get-products-api',(req,res)=>{
    pool.query(`select * from products where subcategoryid = '${req.body.subcategoryid}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })


module.exports = router;
