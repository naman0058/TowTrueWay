var express = require('express');
var router = express.Router();
var pool =  require('./pool');
var upload = require('./multer');




const fetch = require("node-fetch");

router.post("/payment-initiate", (req, res) => {
  const url = `https://rzp_live_dzlUpCalsmyFit:MuvUAutY83bcbpHZol6xXrPZ@api.razorpay.com/v1/orders/`;
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
 

    console.log('body',req.body);

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
    

    console.log('files',req.files)

    body['image'] = req.files.image[0].filename;
    body['image1'] = req.files.image1[0].filename;
    body['image2'] = req.files.image2[0].filename;
    body['image3'] = req.files.image3[0].filename;
    body['image4'] = req.files.image4[0].filename;

    body['date'] =  today
    body['status'] = 'pending'


    console.log('body',req.body);

   pool.query(`insert into selfie set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })

   
})







router.post('/getAllSelfie',(req,res)=>{
     pool.query(`select * from selfie where number = '${req.body.number}'`,(err,result)=>{
        err ? console.log(err) : res.json(result)
    })
 
})










router.post('/listingInsert',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'aadhar_front', maxCount: 8 } , { name: 'aadhar_back', maxCount: 8 } , { name: 'pan_card', maxCount: 8 } ]),(req,res)=>{
    let body = req.body

 console.log('data come',req.body)
 console.log('files come',req.files)


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

    body['image'] = req.files.image[0].filename;
    body['aadhar_front'] = req.files.aadhar_front[0].filename;
    body['aadhar_back'] = req.files.aadhar_back[0].filename;
    body['pan_card'] = req.files.pan_card[0].filename;

    body['date'] = today;

   
 console.log(req.body)
   pool.query(`insert into listing set ?`,body,(err,result)=>{
       err ? res.json({msg:err}) : res.json({msg : 'success'})
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







// router.post('/mlmregister',(req,res)=>{
//     let body = req.body
//     body['carry_forward'] = 0;
//     console.log(req.body)

//     pool.query(`select * from users where unique_code = '${req.body.sponserid}'`,(err,result)=>{
//         if(err) throw err;
//         else if(result[0]){
//             let sponsersdata = result
//             pool.query(`update users set ? where number = ?`,[req.body,req.body.number],(err,result)=>{
//                 if(err) throw err;
//                 else {
        
                
//             pool.query(`select * from users where sponserid = '${req.body.sponserid}' and placement = 'left' and reward != 'done'`,(err,result)=>{
//                 if(err) throw err;
//                 else if(result[0]){
//                  let leftdata = result;
//             pool.query(`select * from users where sponserid = '${req.body.sponserid}' and placement = 'right' and reward != 'done'`,(err,result)=>{
//                  if(err) throw err;
//                  else if(result[0]){
//                  let rightdata = result;
               
//                  if(sponsersdata[0].carry_forward > 0){
//                     //  res.json({msg:'yes carry foward',leftdata,rightdata})
//                     if(leftdata[0].package < rightdata[0].package){
                
//                         let remaining_amount = rightdata[0].package - leftdata[0].package;

//                         if(sponsersdata[0].carry_forward >= remaining_amount){



//                             let f_wallet_amount = ((rightdata[0].package*2)*12)/100;
//                             let remaining_amount1 = rightdata[0].package - leftdata[0].package;

//                             // res.json({carry_forward_amount , f_wallet_amount})
    
//                             pool.query(`update users set  f_wallet = f_wallet +${f_wallet_amount} , carry_forward = carry_forward - ${remaining_amount1} where number = '${sponsersdata[0].number}'`,(err,result)=>{
//                                 if(err) throw err;
//                                 else {
//                                     console.log(leftdata[0].number)
//                             pool.query(`update users set reward = 'done' where number = '${leftdata[0].number}'`,(err,result)=>{
//                                 // console.log('re',result)
//                                 if(err) throw err;
//                                 else {
//                             pool.query(`update users set reward = 'done' where number = '${rightdata[0].number}'`,(err,result)=>{
//                                if(err) throw err;
//                                else res.json({msg:'success'})
//                             })
    
//                                 }
                               
//                             })
//                                 }
//                             })

//                         }
//                         else{
//                             let f_wallet_amount = ((leftdata[0].package*2)*12)/100;
//                             let remaining_amount1 = rightdata[0].package - leftdata[0].package;

//                             // res.json({carry_forward_amount , f_wallet_amount})
    
//                             pool.query(`update users set  f_wallet = f_wallet +${f_wallet_amount} , carry_forward = carry_forward + ${remaining_amount1} where number = '${sponsersdata[0].number}'`,(err,result)=>{
//                                 if(err) throw err;
//                                 else {
//                                     console.log(leftdata[0].number)
//                             pool.query(`update users set reward = 'done' where number = '${leftdata[0].number}'`,(err,result)=>{
//                                 // console.log('re',result)
//                                 if(err) throw err;
//                                 else {
//                             pool.query(`update users set reward = 'done' where number = '${rightdata[0].number}'`,(err,result)=>{
//                                if(err) throw err;
//                                else res.json({msg:'success'})
//                             })
    
//                                 }
                               
//                             })
//                                 }
//                             })
//                         }
//                         // let amount_have = 
//                         // let f_wallet_amount = ((leftdata[0].package*2)*12)/100;

//                     }
//                     else if(leftdata[0].package > rightdata[0].package){
                    
//                     let remaining_amount = leftdata[0].package - rightdata[0].package;

//                         if(sponsersdata[0].carry_forward >= remaining_amount){


//                             let f_wallet_amount = ((leftdata[0].package*2)*12)/100;
//                             let remaining_amount1 = leftdata[0].package - rightdata[0].package;

//                             // res.json({carry_forward_amount , f_wallet_amount})
    
//                             pool.query(`update users set  f_wallet = f_wallet +${f_wallet_amount} , carry_forward = carry_forward - ${remaining_amount1} where number = '${sponsersdata[0].number}'`,(err,result)=>{
//                                 if(err) throw err;
//                                 else {
//                                     console.log(leftdata[0].number)
//                             pool.query(`update users set reward = 'done' where number = '${leftdata[0].number}'`,(err,result)=>{
//                                 // console.log('re',result)
//                                 if(err) throw err;
//                                 else {
//                             pool.query(`update users set reward = 'done' where number = '${rightdata[0].number}'`,(err,result)=>{
//                                if(err) throw err;
//                                else res.json({msg:'success'})
//                             })
    
//                                 }
                               
//                             })
//                                 }
//                             })

//                         }
//                         else{
//                             let f_wallet_amount = ((rightdata[0].package*2)*12)/100;
//                             let remaining_amount1 = leftdata[0].package - rightdata[0].package;

//                             // res.json({carry_forward_amount , f_wallet_amount})
    
//                             pool.query(`update users set  f_wallet = f_wallet +${f_wallet_amount} , carry_forward = carry_forward + ${remaining_amount1} where number = '${sponsersdata[0].number}'`,(err,result)=>{
//                                 if(err) throw err;
//                                 else {
//                                     console.log(leftdata[0].number)
//                             pool.query(`update users set reward = 'done' where number = '${leftdata[0].number}'`,(err,result)=>{
//                                 // console.log('re',result)
//                                 if(err) throw err;
//                                 else {
//                             pool.query(`update users set reward = 'done' where number = '${rightdata[0].number}'`,(err,result)=>{
//                                if(err) throw err;
//                                else res.json({msg:'success'})
//                             })
    
//                                 }
                               
//                             })
//                                 }
//                             })
     
//                         }
//                     }

//                      else{
                        
//                         let f_wallet_amount = ((rightdata[0].package*2)*12)/100;

//                         // res.json({carry_forward_amount , f_wallet_amount})

//                         pool.query(`update users set  f_wallet = f_wallet +${f_wallet_amount} where number = '${sponsersdata[0].number}'`,(err,result)=>{
//                             if(err) throw err;
//                             else {
//                                 console.log(leftdata[0].number)
//                         pool.query(`update users set reward = 'done' where number = '${leftdata[0].number}'`,(err,result)=>{
//                             // console.log('re',result)
//                             if(err) throw err;
//                             else {
//                         pool.query(`update users set reward = 'done' where number = '${rightdata[0].number}'`,(err,result)=>{
//                            if(err) throw err;
//                            else res.json({msg:'success'})
//                         })

//                             }
                           
//                         })
//                             }
//                         })



//                       }


//                  }
//                  else{
//                       if(leftdata[0].package < rightdata[0].package){
                       

//                         let carry_forward_amount = rightdata[0].package - leftdata[0].package;
//                         let f_wallet_amount = ((leftdata[0].package*2)*12)/100;

//                         // res.json({carry_forward_amount , f_wallet_amount})

//                         pool.query(`update users set carry_forward = carry_forward + ${carry_forward_amount} , f_wallet = f_wallet +${f_wallet_amount} where number = '${sponsersdata[0].number}'`,(err,result)=>{
//                             if(err) throw err;
//                             else {
//                                 console.log(leftdata[0].number)
//                         pool.query(`update users set reward = 'done' where number = '${leftdata[0].number}'`,(err,result)=>{
//                             // console.log('re',result)
//                             if(err) throw err;
//                             else {
//                         pool.query(`update users set reward = 'done' where number = '${rightdata[0].number}'`,(err,result)=>{
//                            if(err) throw err;
//                            else res.json({msg:'success'})
//                         })

//                             }
                           
//                         })
//                             }
//                         })


//                       }
//                       else if(leftdata[0].package > rightdata[0].package){
                        
//                         let carry_forward_amount = leftdata[0].package - rightdata[0].package;
//                         let f_wallet_amount = ((rightdata[0].package*2)*12)/100;

//                         // res.json({carry_forward_amount , f_wallet_amount})

//                         pool.query(`update users set carry_forward = carry_forward + ${carry_forward_amount} , f_wallet = f_wallet +${f_wallet_amount} where number = '${sponsersdata[0].number}'`,(err,result)=>{
//                             if(err) throw err;
//                             else {
//                                 console.log(leftdata[0].number)
//                         pool.query(`update users set reward = 'done' where number = '${leftdata[0].number}'`,(err,result)=>{
//                             // console.log('re',result)
//                             if(err) throw err;
//                             else {
//                         pool.query(`update users set reward = 'done' where number = '${rightdata[0].number}'`,(err,result)=>{
//                            if(err) throw err;
//                            else res.json({msg:'success'})
//                         })

//                             }
                           
//                         })
//                             }
//                         })


//                       }
//                       else{
                        
//                         let f_wallet_amount = ((rightdata[0].package*2)*12)/100;

//                         // res.json({carry_forward_amount , f_wallet_amount})

//                         pool.query(`update users set  f_wallet = f_wallet +${f_wallet_amount} where number = '${sponsersdata[0].number}'`,(err,result)=>{
//                             if(err) throw err;
//                             else {
//                                 console.log(leftdata[0].number)
//                         pool.query(`update users set reward = 'done' where number = '${leftdata[0].number}'`,(err,result)=>{
//                             // console.log('re',result)
//                             if(err) throw err;
//                             else {
//                         pool.query(`update users set reward = 'done' where number = '${rightdata[0].number}'`,(err,result)=>{
//                            if(err) throw err;
//                            else res.json({msg:'success'})
//                         })

//                             }
                           
//                         })
//                             }
//                         })



//                       }

//                  }
        
        
//                  }
//                  else {
//                      res.json({msg:'no user in rght remainning'})
//                  }
        
//             })
//                 }
//                 else{
//                     res.json({msg:'no user in left remaning'})
//                 }
//             })
           
//         }
              
//         })
//         }
//         else{
//             res.json({msg : 'invalid sponserid'})
//         }
//     }) 

  

   
// })





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
        else {
            pool.query(`update talent set likes = likes-1 where id = '${req.body.postid}'`,(err,result)=>{
                if(err) throw err;
                else  res.json({msg:'success'})
            })
          }
    })
        }
        else{
    pool.query(`insert into like_post set ?`,body,(err,result)=>{
        if(err) throw err;
        else {
    pool.query(`update talent set likes = likes+1 where id = '${req.body.postid}'`,(err,result)=>{
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




router.get('/profile',(req,res)=>{
    pool.query(`select * from users u where u.number = '${req.query.number}'`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})



router.post('/search-listing',(req,res)=>{
    pool.query(`select * from category where keyboard = '${req.body.search}'`,(err,result)=>{
        if(err) throw err;
        else res.json(result);
    })
})




function done(downlineid,newid,){

console.log('eeghj',newid)
        pool.query(`select * from member where userid = '${newid}'`,(err,result)=>{
         
            if(err) throw err;
            else if(result[0].sponserid!=''){
    console.log('rss',result)
                let newid = result[0].placementid;
                let newplacement = result[0].placement

                

         pool.query(`insert into downline(userid , downlineid , placement ) value('${downlineid}' , '${newid}' , '${newplacement}' )`,(err,result)=>{
                    if(err) throw err;
                    else{
                      done(downlineid,newid)

                    }
                })

             

               
            }
            else{
                recentid  = ''
                console.log('closed')
                // console.log('updatelast id',recentid)
            }
        })
    
       
 

    
    // console.log('done',newid)
    //  pool.query(`insert into downline(userid , downlineid , placement ) value('${downlineid}' , '${newid}' , '${newplacement}' )`,(err,result)=>{
    //                 if(err) throw err;
    //                 else{
    //             return;

    //                 }
    //             })
}


router.post('/mlmregister',(req,res)=>{
    let body = req.body;
    body['userid'] = 'dddd'
    body['capping'] = 250
    pool.query(`select userid from member where userid = '${req.body.sponserid}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
            let userid = result[0].userid
         
 if(req.body.sponserid == req.body.placementid){
     
    pool.query(`select count(id) as counter from member where placementid = '${req.body.placementid}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0].counter < 2){
            pool.query(`select placement from member where placementid = '${req.body.placementid}'`,(err,result)=>{
                if(err) throw err;
                else if(result[0]){
                    if(result[0].placement == req.body.placement){
                        res.json({msg:'Placed Already'})
                         }

                         else{
                            pool.query(`insert into member set ?`,body,(err,result)=>{
                                if(err) throw err;
                                else {
                                    
                          var otp = Math.floor(1000 + Math.random() * 9000);
                        
                                    let downlineid = 'TTW' + result.insertId + otp
                                    let recentid = 'TTW' + result.insertId + otp
        
        
        //infinite loop
        
        
        
        
      //infinite loop
pool.query(`update member set userid = '${downlineid}' where number = '${req.body.number}'`,(err,result)=>{
    // err ? console.log(err) : res.json({msg:'Successfully Inserted'})
    if(err) throw err;
    else{

     done(recentid,recentid)
     res.json({msg:'Successfully Inserted'})
   
    }
        
          

//yahvgs


   


    })
                                }
                               })
                        }    
//fdhg
                }
                else{
                    pool.query(`insert into member set ?`,body,(err,result)=>{
                        if(err) throw err;
                        else {
                            
                  var otp = Math.floor(1000 + Math.random() * 9000);
                
                            let downlineid = 'TTW' + result.insertId + otp
                            let recentid = 'TTW' + result.insertId + otp


//infinite loop
pool.query(`update member set userid = '${downlineid}' where number = '${req.body.number}'`,(err,result)=>{
    // err ? console.log(err) : res.json({msg:'Successfully Inserted'})
    if(err) throw err;
    else{

     done(recentid,recentid)
     res.json({msg:'Successfully Inserted'})
   
    }
        
          

//yahvgs


   


    })







                            // pool.query(`insert into downline(userid , downlineid , placement) values('${userid}' , '${downlineid}' , '${req.body.placement}')`,(err,result)=>{
                            //     if(err) throw err;
                            //     else {
                           
                            //     }
                            // })
                        }
                       })
                }
                
                // condition

                 
              
            })
      
        }
        else{
         res.json({msg:'Change your placement ID'})
        }
    })

 }
 else {

    pool.query(`select downlineid from downline where userid = '${req.body.sponserid}' and downlineid = '${req.body.placementid}' and placement = '${req.body.placement}'`,(err,result)=>{
           if(err) throw err;
           else if(result[0]) {
    
            pool.query(`select count(id) as counter from member where placementid = '${req.body.placementid}'`,(err,result)=>{
                if(err) throw err;
                else if(result[0].counter < 2){
                    pool.query(`select placement from member where placementid = '${req.body.placementid}'`,(err,result)=>{
                        if(err) throw err;
                        else if(result[0]){
                            if(result[0].placement == req.body.placement){
                                res.json({msg:'Placed Already'})
                                 }
        
                                 else{
                                    pool.query(`insert into member set ?`,body,(err,result)=>{
                                        if(err) throw err;
                                        else {
                                            
                                  var otp = Math.floor(1000 + Math.random() * 9000);
                                
                                            let downlineid = 'TTW' + result.insertId + otp
                                            let recentid = 'TTW' + result.insertId + otp
                
                
                //infinite loop
                
                
                
                
          //infinite loop
pool.query(`update member set userid = '${downlineid}' where number = '${req.body.number}'`,(err,result)=>{
    // err ? console.log(err) : res.json({msg:'Successfully Inserted'})
    if(err) throw err;
    else{

     done(recentid,recentid)
     res.json({msg:'Successfully Inserted'})
   
    }
        
          

//yahvgs


   


    })

                                        }
                                       })
                                }    
        
                        }
                        else{
                            res.json({msg:'no placement available'})
                        }
                        
                        // condition
        
                         
                      
                    })
              
                }
                else{
                 res.json({msg:'Change your placement ID'})
                }
            })
            
           }
           else{
               res.json({msg:'Downline not available'})
           }
    })

 }

        }
        else{
            res.json({msg:'Sponser ID Not Exists'})
        }
    })
})




function package_select(plan,newid,){

           console.log('eeghj',newid)
            pool.query(`select * from member where userid = '${newid}'`,(err,result)=>{
             
                if(err) throw err;
                else if(result[0].placementid!=''){
                    let leftvalue = result[0].left;
                    let rightvalue = result[0].right;
                    let matching = 0;
                    

        // console.log('rss',result)
                    let newid = result[0].placementid;
                    let newplacement = result[0].placement
    
                    if(newplacement=='left'){
                      pool.query(`update member set left=left+${plan} where userid = '${newid}'`,(err,result)=>{
                          if(err) throw err;
                          else {
                      leftvalue = leftvalue+plan;
                      if(leftvalue > rightvalue){
                        matching = rightvalue;
                      }
                      else{
                       matching = leftvalue;
                      }



                    
                 if(matching>0){
                    let pair_income = ((matching*2)*12)/100;
                    pool.query(`update member set left=left-${matching} , right=right-${matching} , pair_income = pair_income+'${pair_income}' where userid = '${newid}'`,(err,result)=>{
                      if(err) throw err;
                      else{
                        package_select(plan,newid)

                      }
                    })
                 }

                          }
                      })
                    }
                    else{



                        pool.query(`update member set right=right+${plan} where userid = '${newid}'`,(err,result)=>{
                            if(err) throw err;
                            else {
                        rightvalue = rightvalue+plan;
                        if(leftvalue > rightvalue){
                          matching = rightvalue;
                        }
                        else{
                         matching = leftvalue;
                        }
  
  
  
                      
                   if(matching>0){
                       let pair_income = ((matching*2)*12)/100;
                      pool.query(`update member set left=left-${matching} , right=right-${matching} , pair_income = pair_income+'${pair_income}' where userid = '${newid}'`,(err,result)=>{
                        if(err) throw err;
                        else{
                          package_select(plan,newid)
  
                        }
                      })
                   }
  
                            }
                        })


                    }
                

    
            //  pool.query(`insert into downline(userid , downlineid , placement ) value('${downlineid}' , '${newid}' , '${newplacement}' )`,(err,result)=>{
            //             if(err) throw err;
            //             else{
            //               done(downlineid,newid)
    
            //             }
            //         })
    


                 
    
                   
                }
                else{
                    // recentid  = ''
                    console.log('closed')
                    // console.log('updatelast id',recentid)
                }
            })
        
      
    }




router.post('/package-select',(req,res)=>{
    let body = req.body;
    pool.query(`update users set color = '${req.body.color}' , plan = '${req.body.plan}' where number = '${req.body.number}'`,(err,result)=>{
        if(err) throw err;
        else {
             package_select(req.body.plan,req.body.userid)
        }
    })

})


module.exports = router;
