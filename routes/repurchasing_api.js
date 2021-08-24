var express = require('express');
var router = express.Router();
var pool =  require('./pool');
var upload = require('./multer');





router.post('/photoUpload',upload.single('image'),(req,res)=>{
    let body = req.body
    body['image'] = req.file.filename;
  console.log(req.body)
   pool.query(`insert into photo_wallet_images set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })

   
})



router.get('/getUploadedPhoto',(req,res)=>{
   pool.query(`select * from photo_wallet_images where number = '${req.query.number}'`,(err,result)=>{
       err ? console.log(err) : res.json(result)
   })

})





router.post('/uploadSelfie',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image1', maxCount: 8 } , { name: 'image2', maxCount: 8 } , { name: 'image3', maxCount: 8 } , { name: 'image4', maxCount: 8 }]),(req,res)=>{
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
    

    console.log(req.files)

    body['image'] = req.files.image[0].filename;
    body['image1'] = req.files.image1[0].filename;
    body['image2'] = req.files.image2[0].filename;
    body['image3'] = req.files.image3[0].filename;
    body['image4'] = req.files.image4[0].filename;

    body['date'] =  today
    body['status'] = 'pending'

   pool.query(`insert into selfie set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })

   
})







router.post('/getAllSelfie',(req,res)=>{
     pool.query(`select * from selfie where number = '${req.body.number}'`,(err,result)=>{
        err ? console.log(err) : res.json(result)
    })
 
})










router.post('/listingInsert',upload.single('image'),(req,res)=>{
    let body = req.body
    // let body = req.body
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
    body['date'] = today;

   
 console.log(req.body)
   pool.query(`insert into listing set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })

})




router.post('/getAllListing',(req,res)=>{
     pool.query(`select * from listing where categoryid = '${req.body.categoryid}'`,(err,result)=>{
        err ? console.log(err) : res.json(result)
    })
})



router.get('/getAllListingCategory',(req,res)=>{
    pool.query(`select * from listing_category;`,(err,result)=>{
       err ? console.log(err) : res.json(result)
   })
})



router.post('/single-listing-details',(req,res)=>{
   var query = `select * from listing where id = '${req.body.id}';`
   var query1 = `select * from portfolio where listingid = '${req.body.id}';`
   pool.query(query+query1,(err,result)=>{
       if(err) throw err;
       else res.json(result)
   })
})







router.post('/mlmregister',(req,res)=>{
    let body = req.body
 
   
 console.log(req.body)
 pool.query(`update users set ? where number = ?`,[req.body,req.body.number],(err,result)=>{
    err ? console.log(err) : res.json({msg:'success'})
})

   
})





router.post('/talentHuntInsert',upload.single('image'),(req,res)=>{
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
   
 console.log(req.body)


pool.query(`select id from talent where date = CURDATE()`,(err,result)=>{
    if(err) throw err;
  
    else{
        pool.query(`insert into talent set ?`,body,(err,result)=>{
            err ? console.log(err) : res.json({msg : 'success'})
        })
     
    }
})

 
   
})





router.post('/getAllTalent',(req,res)=>{
    pool.query(`select t.* , 
    (select u.name from users u where u.number =  '${req.body.number}') as username,
    (select l.id from like_post l where l.postid = t.id and l.number = '${req.body.number}') as isUserLike
    from talent t order by id desc;`,(err,result)=>{
       err ? console.log(err) : res.json(result)
   })
})




router.get('/myTalent',(req,res)=>{
    pool.query(`select * from talent  where number='${req.body.number}'  order by id desc;`,(err,result)=>{
       err ? console.log(err) : res.json(result)
   })
})





router.post('/like',(req,res)=>{
   

        let body = req.body


    pool.query(`select * from like_post where postid = '${req.body.postid}' and number = '${req.body.number}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
    pool.query(`delete from like_post where postid = '${req.body.postid}' and number = '${req.body.number}'`,(err,result)=>{
        if(err) throw err;
        else res.json({msg:'success'})
    })
        }
        else{
    pool.query(`insert into like_post set ?`,body,(err,result)=>{
        if(err) throw err;
        else {
    pool.query(`update post set likes = likes+1 where id = '${req.body.postid}'`,(err,result)=>{
        if(err) throw err;
        else  res.json({msg:'success'})
    })

             }
    })
        }
    })
})





router.post('/comment',(req,res)=>{
    let body = req.body
   pool.query(`insert into comment set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })

})




router.post('/get-comment',(req,res)=>{
    pool.query(`select c.*, 
    (select u.name from users u where u.number = c.number) as username
     from comment c where c.postid = '${req.body.postid}'`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})






module.exports = router;
