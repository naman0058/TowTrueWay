var express = require('express');
const pool = require('../routes/pool');
var router = express.Router();

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
        var query7 = `select distinct(t.date) as recent_dates  from talent t order by date desc limit 10;`
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
    pool.query(`select sum(amount) from transaction where date ='${req.body.date}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
            let amount = result[0].amount
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

        res.json({msg:'success'})

           }
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
     from comment c where c.id = '${req.query.id}';`
     pool.query(query1+query2,(err,result)=>{
         if(err) throw err;
         else res.render('single-post',{result})
     })
    
})

module.exports = router;
