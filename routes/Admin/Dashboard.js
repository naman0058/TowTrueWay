var express = require('express');
var router = express.Router();
var pool =  require('../pool');
var upload = require('../multer');
const { PayloadTooLarge } = require('http-errors');
const { query } = require('../pool');



var table = 'admin'


router.get('/',(req,res)=>{
    if(req.session.adminid){


        var query = `select count(id) as today_order from booking where status = 'completed' and date = curdate();`
        var query1 = `select count(id) as todat_completed_order from booking where status!= 'completed' and date= curdate();`
        var query2 = `select sum(price) as today_revenue from booking where date = curdate();`
        var query3 = `select sum(price) as total_price from booking ;`
        var query4 = `select * from products order by id desc limit 5;`
        var query5 = `select * from booking where date = curdate() and status !='completed' ;`
        pool.query(query+query1+query2+query3+query4+query5,(err,result)=>{
            res.render('Admin/Dashboard',{msg : '',result})


        })


   }
    else{
        res.render('Admin/login',{msg : '* Invalid Credentials'})

    }
})



router.get('/store-listing/:name',(req,res)=>{
    if(req.session.adminid){
    res.render('Admin/'+req.params.name)
    }
    else {
        res.render('Admin/login',{msg : '* Invalid Credentials'})

    }
})



router.get('/listing-category',(req,res)=>{
    if(req.session.adminid){
    res.render('Admin/listing-category')
    }
    else {
        res.render('Admin/login',{msg : '* Invalid Credentials'})

    }
})


router.post('/store-listing/:name/insert',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 8 }]),(req,res)=>{
    let body = req.body
 
    console.log(req.files)

if(req.files.icon){
    body['image'] = req.files.image[0].filename;
    body['icon'] = req.files.icon[0].filename;
 console.log(req.body)
   pool.query(`insert into ${req.params.name} set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })
}
else {
    body['image'] = req.files.image[0].filename;
    // body['icon'] = req.files.icon[0].filename;
 console.log(req.body)
   pool.query(`insert into ${req.params.name} set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })
}


    
   
})







router.post('/listing-category/insert',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 8 }]),(req,res)=>{
    let body = req.body
 
    console.log(req.files)

if(req.files.icon){
    body['image'] = req.files.image[0].filename;
    body['icon'] = req.files.icon[0].filename;
 console.log(req.body)
   pool.query(`insert into listing_category set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })
}
else {
    body['image'] = req.files.image[0].filename;
    // body['icon'] = req.files.icon[0].filename;
 console.log(req.body)
   pool.query(`insert into listing_category set ?`,body,(err,result)=>{
       err ? console.log(err) : res.json({msg : 'success'})
   })
}


    
   
})



router.get('/store-listing/:name/delete', (req, res) => {
    let body = req.body
    pool.query(`delete from ${req.params.name} where id = ${req.query.id}`, (err, result) => {
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






router.get('/vendor/list/:type',(req,res)=>{
    pool.query(`select v.* , (select c.name from category c where c.id = v.categoryid) as categoryname from vendor v where v.status = '${req.params.type}' order by id desc`,(err,result)=>{
        err ? console.log(err) : res.render('Admin/vendor-list',{result})
    })
})



router.get('/vendor/details/:id',(req,res)=>{
    var query = `select v.* , (select c.name from category c where c.id = v.categoryid) as categoryname from vendor v where v.id = '${req.params.id}';`
    var query1 = `select sum(price) as total_price from booking where vendorid = '${req.params.id}';`
    var query2 = `select count(id) as total_orders from booking where vendorid = '${req.params.id}';`
    var query3 = `select count(id) as running_orders from booking where status != 'delivered';`
    var query4 = `select count(id) as completed_orders from booking where status = 'delivered';`
    pool.query(query+query1+query2+query3+query4,(err,result)=>{
        if(err) throw err;
        else res.render('Admin/vendor-details',{result})
    })
})





router.get('/listing/list/:type',(req,res)=>{
    pool.query(`select v.* , (select c.name from category c where c.id = v.categoryid) as categoryname from listing v where v.status = '${req.params.type}' order by id desc`,(err,result)=>{
        err ? console.log(err) : res.render('Admin/listing-list',{result})
    })
})




router.get('/listing/details/:id',(req,res)=>{
    var query = `select v.* , (select c.name from category c where c.id = v.categoryid) as categoryname from listing v where v.id = '${req.params.id}';`
    var query1 = `select * from portfolio where listingid = '${req.params.id}';`
    
    pool.query(query+query1,(err,result)=>{
        if(err) throw err;
        else res.render('Admin/listing-details',{result})
    })
})



router.post('/vendor/update-status',(req,res)=>{
    
   pool.query(`update vendor set status = '${req.body.status}' where id = '${req.body.id}'`,(err,result)=>{
       if(err) throw err;
       else {
           console.log('result',result)
           res.send('success')
       }
   })
})



router.post('/product/update-status',(req,res)=>{
      pool.query(`update products set status = '${req.body.status}' where id = '${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else {
            console.log('result',result)
            res.send('success')
        }
    })
 })



router.post('/listing/update-status',(req,res)=>{
    
    pool.query(`update listing set status = '${req.body.status}' where id = '${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else {
            console.log('result',result)
            res.send('success')
        }
    })
 })
 


router.get('/orders/:type',(req,res)=>{
    if(req.params.type == 'runnning'){
       pool.query(`select b.* , 
       (select p.name from products p where p.id = b.booking_id) as bookingname,
       (select p.image from products p where p.id = b.booking_id) as bookingimage 
   
       from booking b where b.status != 'completed' and b.status != 'cancelled'  order by id desc`,(err,result)=>{
           err ? console.log(err) : res.render('Admin/ORder',{result, title:'Running Orders'})
       })
    }
    else if(req.params.type=='completed'){
       pool.query(`select b.* , 
       (select p.name from products p where p.id = b.booking_id) as bookingname,
       (select p.image from products p where p.id = b.booking_id) as bookingimage 
   
       from booking b where b.status = 'completed'  order by id desc`,(err,result)=>{
           err ? console.log(err) : res.render('Admin/ORder',{result, title:'Completed Orders'})
       })
    }
    else {
       pool.query(`select b.* , 
       (select p.name from products p where p.id = b.booking_id) as bookingname,
       (select p.image from products p where p.id = b.booking_id) as bookingimage 
   
       from booking b where b.status = 'cancelled'  order by id desc`,(err,result)=>{
           err ? console.log(err) : res.render('Admin/ORder',{result, title:'Cancelled Orders'})
       })
    }
   
      
   })



   router.get('/transaction/reports',(req,res)=>{
       if(req.session.adminid){
        res.render('Admin/transaction-reports')
       }
       else{
       res.redirect('/admin')
       }
       
   })







   router.get('/transaction/reports/bytype',(req,res)=>{
       var query = `select sum(amount) as total_amount_recieved from transaction t where  date between '${req.query.from_date}' and '${req.query.to_date}' and t.type = '${req.query.type}' and sign = '+';`
       var query1 = `select t.* , (select u.name from users u where u.number = t.number) as username from transaction t where date between '${req.query.from_date}' and '${req.query.to_date}' and t.type = '${req.query.type}' order by id desc;`
       var query2 = `select sum(amount) as total_amount_sent from transaction t where  date between '${req.query.from_date}' and '${req.query.to_date}' and t.type = '${req.query.type}' and sign = '-';`

       pool.query(query+query1+query2,(err,result)=>{
           if(err) throw err;
        //    00else res.render('Admin/transaction-talent-hunt',{result})
    else res.json(result)  
    })
   })



    
   
router.get('/product-request',(req,res)=>{
    pool.query(`select p.* ,
    (select c.name from category c where c.id = p.categoryid ) as categoryname,
    (select s.name from subcategory s where s.id = p.categoryid ) as subcategoryname,
    (select v.name from vendor v where v.id = p.vendorid ) as vendorname
    from products p  where status = 'pending'`,(err,result)=>{
        if(err) throw err;
        // else res.json(result)
        else res.render('Admin/product_request',{result})
    })
})



router.get('/product-request/details',(req,res)=>{
    var query = `select p.* , 
    (select c.name from category c where c.id = p.categoryid ) as categoryname,
    (select s.name from subcategory s where s.id = p.categoryid ) as subcategoryname,
    (select v.name from vendor v where v.id = p.vendorid ) as vendorname,
    (select v.number from vendor v where v.id = p.vendorid ) as vendornumber

    from products p where id = '${req.query.id}';`
    var query1 = `select * from images where productid = '${req.query.id}';`
    pool.query(query+query1,(err,result)=>{
        if(err) throw err;
       // else res.json(result)
        else res.render('Admin/single-product-request',{result})
    })
})




router.get('/users/normal',(req,res)=>{
    if(req.session.adminid){
        pool.query(`select * from users order by id desc`,(err,result)=>{
            if(err) throw err;
            else res.render('Admin/Users',{result})
        })
       }
       else{
       res.redirect('/admin')
       }
})



router.get('/users/listing',(req,res)=>{
    if(req.session.adminid){
        pool.query(`select * from listing order by id desc`,(err,result)=>{
            if(err) throw err;
            else res.render('Admin/Users',{result})
        })
       }
       else{
       res.redirect('/admin')
       }
})




router.get('/commission/list',(req,res)=>{
    pool.query(`select name , commission from subcategory order by name desc`,(err,result)=>{
        if(err) throw err;
        else res.render('Admin/commission',{result})
    })
})



router.get('/ecommerce/payout',(req,res)=>{
    if(req.session.adminid){
        res.render('Admin/payout-list')
       }
       else{
       res.redirect('/admin')
       }
})



router.get('/ecommerce/payout/report',(req,res)=>{
    var query = `select sum(price) as total_amount from booking b where b.payout is null and date between '${req.query.from_date}' and '${req.query.to_date}';`
    var query1 = `select b.vendorid , b.price , b.date, b.subcategoryid, 
    (select v.account_holder_name from vendor v where v.id = b.vendorid) as vendor_account_holder_name,
    (select v.ifsc_code from vendor v where v.id = b.vendorid) as vendor_ifsc_code,
    (select v.branch_name from vendor v where v.id = b.vendorid) as vendor_branch_name,
    (select v.account_type from vendor v where v.id = b.vendorid) as vendor_account_type,

    (select v.bank_name from vendor v where v.id = b.vendorid) as vendor_bank_name,
    (select v.number from vendor v where v.id = b.vendorid) as vendor_mobile_number,
    (select v.account_number from vendor v where v.id = b.vendorid) as vendor_account_number,
    (select s.commission from subcategory s where s.id = b.subcategoryid ) as company_commission
    from booking b where b.payout is null and date between '${req.query.from_date}' and '${req.query.to_date}';`
    pool.query(query+query1,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})



// All Data Found




module.exports = router;
