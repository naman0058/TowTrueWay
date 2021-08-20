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
        var query7 = `select distinct(t.date) as recent_dates , (select tr.date from talent_hunt_return tr where tr.date = recent_dates) as sent_date t from talent t order by date desc limit 10;`
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


module.exports = router;
