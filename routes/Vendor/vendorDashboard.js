var express = require('express');
var router = express.Router();
var pool =  require('../pool');
var upload = require('../multer');



var table = 'admin'


router.get('/',(req,res)=>{
    console.log(req.session.vendornumber)
    // req.session.vendorid = 4
    // req.session.vendornumber = '918319339945'
    if(req.session.vendornumber){
       pool.query(`select * from vendor where number = '${req.session.vendornumber}'`,(err,result)=>{
           req.session.categoryid = result[0].categoryid;
           req.session.vendorid = result[0].id;
           if(err) throw err;
           else if(result[0].status == 'pending'){

                 if(result[0].pan_front_image){
                   res.render('Vendor/pending')
                    
                 }
                 else{
                    res.render('Vendor/kyc',{business_name:result[0].business_name , number : result[0].number ,  gst : '' , pan_number : '' , aadhar_number : '' , remarks : ''})

                 }



           }
           else if(result[0].status=='rejected'){
            res.render('Vendor/kyc',{business_name:result[0].business_name , number : result[0].number , gst : result[0].gst_number , pan_number : result[0].pan_number , aadhar_number : result[0].aadhar_number ,  remarks : 'Rejected ! Please Upload All The Documents Again'})
                
           }
           else {

             var query = `select count(id) as today_order from booking where status = 'completed' and date = curdate() and vendorid = '${req.session.vendorid}';`
             var query1 = `select count(id) as todat_completed_order from booking where status!= 'completed' and date= curdate() and vendorid = '${req.session.vendorid}';`
             var query2 = `select sum(price) as today_revenue from booking where date = curdate();`
             var query3 = `select sum(price) as total_price from booking where vendorid = '${req.session.vendorid}';`
             var query4 = `select * from products where vendorid = '${req.session.vendorid}' order by id desc limit 5;`
             var query5 = `select * from booking where date = curdate() and status !='completed' and vendorid = '${req.session.vendorid}';`
             pool.query(query+query1+query2+query3+query4+query5,(err,result)=>{
                res.render('Vendor/Dashboard',{result})

             })




           }
       })
   }
    else{
        res.render('Vendor/login',{msg : '* Invalid Credentials'})

    }
})



router.get('/add-product',(req,res)=>{
    if(req.session.vendornumber){
    res.render('Vendor/product')
    }
    else {
        res.render('Vendor/login',{msg : '* Invalid Credentials'})

    }
})



router.get('/add-image',(req,res)=>{
    if(req.session.vendornumber){
    res.render('Vendor/image')
    }
    else {
        res.render('Vendor/login',{msg : '* Invalid Credentials'})

    }
})





router.post('/insert-image',upload.single('image'),(req,res)=>{
    let body = req.body
 
    // console.log(req.files)

  
    body['vendorid'] = req.session.vendorid;
    body['image'] = req.file.filename;
   
 console.log(req.body)
   pool.query(`insert into images set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })

   
})





router.post('/insert',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),(req,res)=>{
    let body = req.body
 
    // console.log(req.files)

    let price = (req.body.price)
    let net_price = (req.body.price)-price
    body['net_amount'] = Math.round(net_price);
    body['categoryid'] = req.session.categoryid;
    body['vendorid'] = req.session.vendorid;

    body['image'] = req.files.image[0].filename;
    body['thumbnail'] = req.files.thumbnail[0].filename;
 console.log('mydata',req.body)
   pool.query(`insert into products set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })

   
})




router.get('/show-product',(req,res)=>{
    pool.query(`select p.* , 
    (select s.name from subcategory s where s.id = p.subcategoryid) as subcategoryname,
    (select b.name from brand b where b.id = p.brandid) as brandname
     from products p where p.vendorid = '${req.session.vendorid}'`,(err,result)=>{
        err ? console.log(err) : res.json(result)
    })
})






router.get('/show-images',(req,res)=>{
    pool.query(`select i.* , 
    (select p.name from products p where p.id = i.productid) as productname
     from images i where i.vendorid = '${req.session.vendorid}'`,(err,result)=>{
        err ? console.log(err) : res.json(result)
    })
})



router.get('/delete',(req,res)=>{
    pool.query(`delete from products where id = '${req.query.id}'`,(err,result)=>{
        err ? console.log(err) : res.json(result)
    })
})



router.post('/kyc_details',upload.fields([{ name: 'pan_front_image', maxCount: 1 }, { name: 'pan_back_image', maxCount: 1 } , { name: 'aadhar_front_image', maxCount: 1 }, { name: 'aadhar_back_image', maxCount: 1 }]),(req,res)=>{
    let body = req.body
 
    console.log(req.files)

    body['pan_front_image'] = req.files.pan_front_image[0].filename;
    body['pan_back_image'] = req.files.pan_back_image[0].filename;
    body['aadhar_front_image'] = req.files.aadhar_front_image[0].filename;
    body['aadhar_back_image'] = req.files.aadhar_back_image[0].filename;


 console.log(req.body)
   pool.query(`update vendor set ? where number = ?`,[req.body,req.body.number],(err,result)=>{
       err ? console.log(err) : res.redirect('/vendor-dashboard')
   })

   
})





router.get('/subcategory',(req,res)=>{
    
console.log(req.session.categoryid)
    pool.query(`select * from subcategory where categoryid = '${req.session.categoryid}'`,(err,result)=>{
        err ? console.log(err) : res.json(result)
    })
})










router.get('/orders/:type',(req,res)=>{
 if(req.params.type == 'runnning'){
    pool.query(`select b.* , 
    (select p.name from products p where p.id = b.booking_id) as bookingname,
    (select p.image from products p where p.id = b.booking_id) as bookingimage 

    from booking b where b.status != 'completed' and b.status != 'cancelled' and b.vendorid = '${req.session.vendorid}'  order by id desc`,(err,result)=>{
        err ? console.log(err) : res.render('Vendor/ORder',{result, title:'Running Orders'})
    })
 }
 else if(req.params.type=='completed'){
    pool.query(`select b.* , 
    (select p.name from products p where p.id = b.booking_id) as bookingname,
    (select p.image from products p where p.id = b.booking_id) as bookingimage 

    from booking b where b.status = 'completed' and b.vendorid = '${req.session.vendorid}'  order by id desc`,(err,result)=>{
        err ? console.log(err) : res.render('Vendor/ORder',{result, title:'Completed Orders'})
    })
 }
 else {
    pool.query(`select b.* , 
    (select p.name from products p where p.id = b.booking_id) as bookingname,
    (select p.image from products p where p.id = b.booking_id) as bookingimage 

    from booking b where b.status = 'cancelled' and b.vendorid = '${req.session.vendorid}' order by id desc`,(err,result)=>{
        err ? console.log(err) : res.render('Vendor/ORder',{result, title:'Cancelled Orders'})
    })
 }

   
})





router.get('/commission/list',(req,res)=>{
    pool.query(`select name , commission from subcategory order by name desc`,(err,result)=>{
        if(err) throw err;
        else res.render('Vendor/commission',{result})
    })
})












router.get('/product/full/details/:id',(req,res)=>{
    pool.query(`select b.* , 
    (select p.name from products p where p.id = b.booking_id) as productname,
    (select v.name from vendor v where v.id = b.vendorid) as vendorname
    from booking b where b.id = '${req.params.id}'`,(err,result)=>{
        if(err) throw err;
        else res.render('Vendor/single-order-details',{result})
    })
})







router.get('/payout/history',(req,res)=>{
    console.log(req.session.vendorid)
    pool.query(`select b.vendorid , b.price , b.date, b.subcategoryid, b.vendor_price,
    (select v.account_holder_name from vendor v where v.id = b.vendorid) as vendor_account_holder_name,
    (select v.ifsc_code from vendor v where v.id = b.vendorid) as vendor_ifsc_code,
    (select v.branch_name from vendor v where v.id = b.vendorid) as vendor_branch_name,
    (select v.account_type from vendor v where v.id = b.vendorid) as vendor_account_type,

    (select v.bank_name from vendor v where v.id = b.vendorid) as vendor_bank_name,
    (select v.number from vendor v where v.id = b.vendorid) as vendor_mobile_number,
    (select v.account_number from vendor v where v.id = b.vendorid) as vendor_account_number,
    (select s.commission from subcategory s where s.id = b.subcategoryid ) as company_commission
    from booking b where b.payout = 'completed' and b.vendorid = '${req.session.vendorid}' order by date desc;`,(err,result)=>{
        if(err) throw err;
        else res.render('Vendor/payout-history',{result})
    })
})





router.get('/live-earning',(req,res)=>{
    pool.query(`select b.*,
    (select p.name from products p where p.id = b.booking_id) as productname
    from booking b where b.payout is null and b.vendorid = '${req.session.vendorid}' order by date desc;`,(err,result)=>{
        if(err) throw err;
        else res.render('Vendor/single-payout-history',{result})
    })
})





router.get('/complete-earning',(req,res)=>{
    pool.query(`select b.*,
    (select p.name from products p where p.id = b.booking_id) as productname
    from booking b where b.payout is not null and b.vendorid = '${req.session.vendorid}' order by date desc;`,(err,result)=>{
        if(err) throw err;
        else res.render('Vendor/single-payout-history',{result})
    })
})






router.get('/reports',(req,res)=>{
  
        res.render('Vendor/payout-list')
       
})



router.get('/payout/report',(req,res)=>{
    var query = `select sum(vendor_price) as total_amount from booking b where b.payout is null and b.status = 'delivered' and b.vendorid = '${req.session.vendorid}' and b.date between '${req.query.from_date}' and '${req.query.to_date}';`
    var query1 = `select b.* ,(select p.name from products p where p.id = b.booking_id) as productname
    from booking b where b.payout is null and b.status = 'delivered' and b.vendorid = '${req.session.vendorid}' and b.date between '${req.query.from_date}' and '${req.query.to_date}';`
    pool.query(query+query1,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})





router.get('/transaction/reports',(req,res)=>{
    res.render('Vendor/transaction-reports')

   
})



router.get('/transaction/reports/bytype',(req,res)=>{
    var query = `select sum(amount) as total_amount_recieved from transaction t where  date between '${req.query.from_date}' and '${req.query.to_date}' and t.type = '${req.query.type}' and sign = '+' and number = '${req.session.vendornumber}';`
    var query1 = `select t.* , (select u.name from users u where u.number = t.number) as username from transaction t where date between '${req.query.from_date}' and '${req.query.to_date}' and t.type = '${req.query.type}' and number = '${req.session.vendornumber}' order by id desc ;`
    var query2 = `select sum(amount) as total_amount_sent from transaction t where  date between '${req.query.from_date}' and '${req.query.to_date}' and t.type = '${req.query.type}' and sign = '-' and number = '${req.session.vendornumber}' ;`

    pool.query(query+query1+query2,(err,result)=>{
        if(err) throw err;
     //    00else res.render('Admin/transaction-talent-hunt',{result})
 else res.json(result)  
 })
})




router.get('/profile',(req,res)=>{
    
    pool.query(`select * from vendor where number = '${req.session.vendornumber}'`,(err,result)=>{
        if(err) throw err;
        else res.render('Vendor/profile',{result})
    })
})


router.get('/bank',(req,res)=>{
    
    pool.query(`select * from vendor where number = '${req.session.vendornumber}'`,(err,result)=>{
        if(err) throw err;
    // else res.json(result)
        else res.render('Vendor/bank',{result})
    })
})






router.post('/update/vendor/details', (req, res) => {
    let body = req.body
   body['number'] = req.session.vendornumber
   console.log(req.body)
    pool.query(`update vendor set ? where number = ?`, [req.body, req.body.number], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else{
        
            res.redirect('/vendor-dashboard/bank')
        
    }

})

    })

module.exports = router;
