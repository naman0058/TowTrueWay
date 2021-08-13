var express = require('express');
var router = express.Router();
var pool =  require('./pool');







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
    var query = `select * from products where id = '${req.query.id}';`
    var query1 = `select * from images where productid = '${req.query.id}';`
    pool.query(query+query1,(err,result)=>{
        if(err) throw err;
        else res.json(result)
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


    pool.query(`select * from user where number = '${req.body.number}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
         res.json({
            msg : 'success'

         })
        }
        else {
            pool.query(`insert into user set ?`,body,(err,result)=>{
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
             res.json({
                 msg : 'success'
             })
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
        res.json({
            msg : 'success'
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


module.exports = router;
