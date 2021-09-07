var express = require('express');
const pool = require('../routes/pool');
var router = express.Router();
var upload = require('./multer');


const fetch = require("node-fetch");


router.get('/',(req,res)=>{
    if(req.session.adminid){
        var query = `select count(id) as total_post from talent where date = CURDATE();`
        var query1 = `select sum(likes) as total_likes from talent where date = CURDATE();`
        var query2 = `select t.*, (select u.name from users u where u.number = t.number) as username from talent t where t.date = CURDATE() order by likes desc limit 10;`
        var query3 = `select sum(amount) as total_earning from transaction where date = CURDATE();`
        var query4 = `select sum(amount) as talent_hunt_earning from transaction where type = 'talent_hunt' and date = CURDATE();`
        var query5 = `select id from talent_hunt_return where date = CURDATE();`
        var query6 = `select date from talent_hunt_return order by id desc limit 1;`
        var query7 = `select distinct(t.date) as recent_dates from talent t where send_amount is null order by date desc limit 10;`
        pool.query(query+query1+query2+query3+query4+query5+query6+query7,(err,result)=>{
            if(err) throw err;
             else res.render('talent-hunt',{result})
            //else res.json(result)
        })
        
    }
    else{
        res.render('Admin/login',{msg : '* Invalid Credentials'})

    }
})




router.post('/send/amount',(req,res)=>{
    console.log(req.body)
    pool.query(`select sum(amount) as amount from transaction where date ='${req.body.date}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
            let amount = result[0].amount
            console.log('amount',amount)
    pool.query(`select number , percentage from talent  where date = '${req.body.date}' order by likes desc limit 10`,(err,result)=>{
        if(err) throw err;
        else {
           
           for(i=0;i<result.length;i++) {
          let send_amount = (amount*result[i].percentage)/100;
          let number = result[i].number;

          pool.query(`insert into talent_hunt_return(amount,date,number) values('${send_amount}' , '${req.body.date}' , '${number}')`,(err,result)=>{
              if(err) throw err;
              else{
         
              }
          })


           }

           pool.query(`update talent set send_amount = 'sent' where date = '${req.body.date}'`,(err,result)=>{
            if(err) throw err;
            else res.json({msg:'success'})
          
        })

       

        }
    })
        }
        else{
            res.json({msg:'no post'})
        }
    })
})




router.get('/post',(req,res)=>{

if(req.session.usernumber){
    var query = `select * from category order by id desc;`
    var query1 = `select * from talent order by id desc;`
    pool.query(query+query1,(err,result)=>{
        if(err) throw err;
        else res.render('talent_hunt',{result})
    })
}
else{
res.redirect('/login')
}


router.get('/all-talent',(req,res)=>{
    var query1 = `select t.*,
    (select l.id from like_post l where l.postid = t.id and l.number = '${req.session.usernumber}') as isUserLike
    from talent t order by id desc;`
    pool.query(query1,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })

})

  
    
})



router.post('/like',(req,res)=>{
   

    if(req.session.usernumber){
        let body = req.body
   let id = req.body.id

        body['number'] = req.session.usernumber

console.log(req.body)

      pool.query(`select * from like_post where postid = '${req.body.id}' and number = '${req.session.usernumber}'`,(err,result)=>{
          if(err) throw err;
          else if(result[0]){
      pool.query(`delete from like_post where postid = '${req.body.id}' and number = '${req.session.usernumber}'`,(err,result)=>{
          if(err) throw err;
          else {
            pool.query(`update talent set likes = likes-1 where id = '${id}'`,(err,result)=>{
                if(err) throw err;
                else  res.json({msg:'success'})
            })
          }
      })
          }
          else{
            body['postid'] = req.body.id
              body['id'] = null
      pool.query(`insert into like_post set ?`,body,(err,result)=>{
          if(err) throw err;
          else {
      pool.query(`update talent set likes = likes+1 where id = '${id}'`,(err,result)=>{
          if(err) throw err;
          else  res.json({msg:'success'})
      })
      
               }
      })
          }
      })
    }
    else{
    res.redirect('/login')
    }

  
})




router.post('/comment',(req,res)=>{
    if(req.session.usernumber){
        let body = req.body
        body['number'] = req.session.usernumber
        body['postid'] = req.body.id
        body['id'] = null;
       pool.query(`insert into comment set ?`,body,(err,result)=>{
           err ? console.log(err) : res.json({msg : 'success'})
       })
    }
    else{
    res.redirect('/login')
    }
  

})


router.get('/post/single',(req,res)=>{
    var query1 = `select t.*,
    (select l.id from like_post l where l.postid = t.id and l.number = '${req.session.usernumber}') as isUserLike
    from talent t where id = '${req.query.id}';`
    var query2 = `select c.* , 
    (select u.name from users u where u.number = c.number) as username
     from comment c where c.postid = '${req.query.id}' order by id desc;`
     pool.query(query1+query2,(err,result)=>{
         if(err) throw err;
        // else res.json(result)
         else res.render('single-post',{result})
     })
    
})




router.get('/add-post',(req,res)=>{
    var query = `select * from category order by id desc;`
    var query1 = `select * from talent order by id desc;`
    pool.query(query+query1,(err,result)=>{
        if(err) throw err;
        else res.render('add_post',{result})
    })
    
})



router.get('/pricing',(req,res)=>{
    var query = `select * from category order by id desc;`
    var query1 = `select * from talent order by id desc;`
    pool.query(query+query1,(err,result)=>{
        if(err) throw err;
        else res.render('talent_hunt_pricing',{result})
    }) 
})







router.post('/razorpay',(req,res)=>{
    const url = `https://rzp_live_2AYlv8GRAaT63p:iIzpixX7YsDSUVPtAtbO5SMn@api.razorpay.com/v1/orders/`;
      const data = {
          amount:req.body.amount*100,  // amount in the smallest currency unit
        //amount:100,
        currency: 'INR',
          payment_capture: true
      }
      
      const options = {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
              'Content-Type': 'application/json'
          }
      }
      fetch(url, options)
          .then(res => res.json())
          .then(
              resu =>res.json(resu)
          );
   })




   
 router.post('/razorpay_response',(req,res)=>{
    let body = req.body
    console.log('response',req.body)
    req.session.payment_id = req.body.razorpay_payment_id
    body['name'] = req.session.username
    body['number'] = req.session.usernumber
    body['college_name'] = req.session.usercollegename
    body['projectid'] = req.session.userprojectid
    body['email'] = req.session.useremail
    body['date'] = today
    console.log('data insert',req.body)
    pool.query(`insert into book set ?`,req.body , (err,result)=>{
        if(err) throw err;
        else res.send('success')
    })
    
    
    
    
        })









        router.post('/insert-post',upload.single('image'),(req,res)=>{
            let body = req.body
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
        
            body['image'] = req.file.filename;
            body['date'] = today
            body['likes'] = 0
            body['number'] = req.session.usernumber
            body['percentage'] = 1
           
         console.log(req.body)
        
        
        pool.query(`select id from talent where date = CURDATE()`,(err,result)=>{
            if(err) throw err;
          
            else{
                pool.query(`insert into talent set ?`,body,(err,result)=>{
                    err ? console.log(err) : res.redirect('/talent-hunt/post')
                })
             
            }
        })
        
         
           
        })
        




        router.get('/transaction',(req,res)=>{
            pool.query(`select sum(amount) as total_amount,date from talent_hunt_return group by date order by date desc`,(err,result)=>{
                if(err) throw err;
               // else res.json(result)
                 else res.render('Admin/talent-hunt-transaction',{result})
            })
        })



        router.get('/transaction-details-by-date',(req,res)=>{
            var query = `select sum(amount) as total_amount from talent_hunt_return where date = '${req.query.date}';`
            var query1 = `select t.* , (select u.name from users u where u.number = t.number) as username from talent_hunt_return t where date = '${req.query.date}';`
            pool.query(query+query1,(err,result)=>{
                if(err) throw err;
                //else res.json(result)
                 else res.render('Admin/talent-hunt-transaction-details',{result})
            })
        })





module.exports = router;
