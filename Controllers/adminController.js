const adminHelper = require('../Helpers/adminHelper');
const userHelper=require('../Helpers/userHelper');

const moment = require('moment');

/*--------------------  hardcoded admin credentials--------------------*/
const adminCredentials={
  adminEmail:'admin@gmail.com',
  adminPassword:'1111'
};

module.exports={

  LOGIN:
  (req, res)=>{

    let enteredAdminHome=req.session.adminCredentialsSESS
    // console.log(enteredAdminHome)//test point to see if its loggedin or not, if not it will empty
    
    if(enteredAdminHome){
      res.redirect('/admin/admin-home')
    }
    else{
      res.render('admin/admin-login',{layout:'admin-layout',adminNotLoggedIn:true})
    }
  },

  LOGIN_PO:
  (req, res)=>{

    let adminInfo= req.body //req.body is stored in variable adminInfo

    //validating admin wuth hardcoded credentials
    if(adminInfo.email===adminCredentials.adminEmail&& adminInfo.password===adminCredentials.adminPassword)
    { 
      console.log('credentials matched for admin')
      req.session.adminCredentialsSESS=adminCredentials
      req.session.adminloggedIn=true

      console.log(req.session.adminCredentialsSESS)// testpoint
      
      //credentials are correct , eligible for home entry
      res.redirect('/admin/admin-home')
    }
    else{
      console.log('credentials did not match');
      res.redirect('/admin')// redirect back to login page
    }
  },


  HOME:
  async(req, res)=>{
     let monthSales= await adminHelper.getmonthlySales()
     let categorySales= await adminHelper.categorySales()
     let transactionSales= await adminHelper.transactionSales()
     let topSales= await adminHelper.topSales()
     let dashCounts= await adminHelper.dashCounts()

    res.render('admin/admin-home',{dashCounts,monthSales,categorySales,transactionSales,topSales,layout:'admin-layout'})
  
},

PRODUCT_LIST:
(req, res)=>{

  //productFetch()=> to fetch inserted products from collection 'The-products'
  adminHelper.getAllProducts().then((AllProducts)=>{
      res.render('admin/product-List',{AllProducts,layout:'admin-layout'})
    
  }) 
},

ADD_PRODUCT:
(req, res)=>{
  adminHelper.getAllCategs().then((AllCategs)=>{
  res.render('admin/add-product',{AllCategs, layout:'admin-layout'})
})

},

ADD_PRODUCT_PO:
async(req, res)=>{
  console.log(req.files,"dhfjkahdsfjadsjfhkdjfjkdshfkjdshkfjhsdkj");
     
     /* let Images= []
     //map or forEach iterators can be used , images or other files are posted in the files object in the request object
     //all the image filenames in the req.files is now pushed to variable 'Images' then this is passed to 'req.body ' as re1.body.images
     req.files.forEach(function (value,index){
      Images.push(value.filename)
     }) */
/*      req.body.prodImage = Images //stored to a key called image so that it can be inside bodyContent
 */  
req.body.prodImage1 = req.files.prodImage1[0].filename
req.body.prodImage2 = req.files.prodImage2[0].filename
req.body.prodImage3 = req.files.prodImage3[0].filename
req.body.prodImage4 = req.files.prodImage4[0].filename
     await adminHelper.addProduct(req.body)
     res.redirect('/admin/product-List')

    },

    /* if(!permissionf){
      console.log(InsertedIdf) //testpoint- the objectId of document uploaded,this is used to represents the image in that document, if there are multiple images we will have to add additional extension to the objectId used for each of the image

      console.log('permission granted for product insertion')//checkpoint1

          let ImageDetails = req.files.prodImage 
          console.log( req.files.prodImage ,"peoduct imageid")    
          //check for errors here when neccessary
          ImageDetails.mv('./public/product-images/' + InsertedIdf + '.jpg') // using objectid, we are renaming the image file and storing in a seperate folder 'product-images'
    
          res.redirect('/admin/product-List')
    }
    else{
      console.log('product item already exists')//checkpoint2
      res.redirect('/admin/add-product')
    } */
  


EDIT_PRODUCT:
async(req, res)=>{
 
  //to pass the values in value="" in edit product we need the productdetails, so we have to fetch it 
  
 await adminHelper.getAllCategs().then(async(AllCategs)=>{
  await adminHelper.getaProduct(req.params.id).then((aProduct)=>{
    console.log("thisssssssssssssssssssssssssssss",aProduct)
    
    res.render('admin/edit-product',{aProduct, AllCategs, layout:'admin-layout'})
  })

})
},

EDIT_PRODUCT_PO:
async(req, res)=>{

  console.log(req.body,"01111111111111111111");
  console.log(req.files.length);

 /*  if (req.files.prodImage1 == null) {
    prodImage1 = await adminHelper.getProdImage(req.params.id,cb(prodImage1))
} else {
  prodImage1 = req.files.prodimage1[0].filename
} */

///////////////////////////////

  if (req.files.prodImage1 == null) {
    prodImage1 = await adminHelper.getProdImage1(req.params.id)
} else {
  prodImage1 = req.files.prodImage1[0].filename
}

if (req.files.prodImage2 == null) {
  prodImage2 = await adminHelper.getProdImage2(req.params.id)
} else {
  prodImage2 = req.files.prodImage2[0].filename
}

if (req.files.prodImage3 == null) {
  prodImage3 = await adminHelper.getProdImage3(req.params.id)
} else {
  prodImage3 = req.files.prodImage3[0].filename
}

if (req.files.prodImage4 == null) {
 prodImage4 = await adminHelper.getProdImage4(req.params.id)
} 
else {
  prodImage4 = req.files.prodImage4[0].filename
}

req.body.prodImage1 = prodImage1
req.body.prodImage2 = prodImage2
req.body.prodImage3 = prodImage3
req.body.prodImage4 = prodImage4


  await adminHelper.editProduct( req.body, req.params.id )
  
    res.redirect('/admin/product-List')
},

PRODUCT_DELETE:
(req, res) => {
  adminHelper.productDelete(req.params.id).then(() => {
    res.redirect("/admin/product-List");
  });
},

CATEGORY_LIST:
(req, res) => {

  let enteredAdminHome = req.session.adminCredentialsSESS;
  //productFetch()=> to fetch inserted products from collection 'CATEGORY'
  adminHelper.getAllCategs().then((AllCategs) => {
    if (enteredAdminHome) {
      res.render("admin/category-List", { AllCategs, layout: "admin-layout"});
    }
  });
},

ADD_CATEGORY:
(req, res) => {
  res.render("admin/add-category", { layout: "admin-layout" });
},

ADD_CATEGORY_PO:
(req, res) => {
  console.log(req.body); //testpoint
  

  //productInsert()=>to insert the products that is posted or submitted, as the
  adminHelper.categoryInsert(req.body).then((permissionf) => {
    console.log(permissionf);
    if (permissionf.permission) {
      console.log("permission granted for category insertion"); //checkpoint1

      res.redirect("/admin/category-List");
    } else {
      console.log("Category already exists"); //checkpoint2
      res.redirect("/admin/category-List");
    }
  });
},

EDIT_CATEGORY:
async (req, res) => {
  //to pass the values in value="" in edit product we need the productdetails, so we have to fetch it
  adminHelper.categoryFetchOne(req.params.id).then((fetchedOneCategoryf) => {
    res.render("admin/edit-category", {
      fetchedOneCategoryf,
      layout: "admin-layout",
    });
  });
},

EDIT_CATEGORY_PO:
(req, res) => {
  //productUpdate()=>to update the product details in the collection'The-products'
  adminHelper.categoryUpdate(req.body, req.params.id).then((permissionf) => {
    if (permissionf) {
      res.redirect("/admin/category-List");
    } else {
      res.redirect("/admin/category-List");
    }
  });
},

DELETE_CATEGORY:
(req, res) => {
  adminHelper.categoryDelete(req.params.id).then(() => {
    res.redirect("/admin/category-List");
  });
},

USER_LIST:
(req, res) => {
  let enteredAdminHome = req.session.adminCredentialsSESS;

  //userFetch()=>to fetch the users, as the userlist loads users will be fetched
  adminHelper.userFetch().then((fetchedUserf) => {
    if (enteredAdminHome) {
      res.render("admin/user-List", { fetchedUserf, layout: "admin-layout" });
    }
  });
},

USER_BLOCK:
(req, res) => {
  adminHelper.userBlock(req.params.id).then(() => {
    console.log(req.session.member,"dshfhdfjksdfjdsjfds");
    /* if (req.session.member._id === req.params.id) { */
      // req.session.member.blocked = true;

      //when you block him and his data is still in the session, null them all
      if(req.session.member){
      req.session.member = null;
      req.session.loggedIn = false;
      req.session.userErr = "you are blocked";
    }
    res.redirect("/admin/user-List");
  });
},

USER_UNBLOCK:
(req, res) => {
  adminHelper.userUnblock(req.params.id).then(() => {
    res.redirect("/admin/user-List");
  });
},

CART_LIST:
async (req, res) => {
  let AllCarts = await adminHelper.getAllCarts();
  res.render("admin/cart-List", { layout: "admin-layout", AllCarts });
  // })
},

ORDER_LIST:
async (req, res) => {
  let AllOrders = await adminHelper.getAllOrders();
  res.render("admin/order-List", { layout: "admin-layout", AllOrders });
  // })
},

LOGOUT:
(req, res) => {
  req.session.adminCredentialsSESS = null;
  req.session.adminloggedIn = false;
  console.log("admin session destroyed");
  console.log(req.session);
  res.redirect("/admin");
},

CHANGE_DELIVERY_STATUS:
(req, res) => {
  console.log(req.body,"8888888888888")//just like req.query.id
  adminHelper.changeDeliveryStatus(req.body).then((response)=>{
    res.json(response)
  })
},



SEARCH_BY_DATE_PO: 
async (req, res, next) => {
  let dateRange = {}
  if (req.body.fromDate === "" || req.body.toDate === "") {
      res.redirect('/admin/sample')
  } else {
      dateRange.fromDate = req.body.fromDate
      dateRange.toDate = req.body.toDate
  }
  let salesReport = await adminHelper.getReportbyDate(dateRange)
  res.render('admin/sample', { layout: 'admin-layout', salesReport })

},

SALES_REPORT:
async(req, res)=>{
  let salesReport = await adminHelper.getSalesReport()
  res.render("admin/sales-report", { layout: "admin-layout",salesReport});
},



SAMPLE:
(req, res)=>{
  res.render("admin/sample", { layout: "admin-layout"});
},
//////////////////////////////////////////////////////////////  COUPONS /////////////////////////////////////////////////////////////


Add_Coupon_post:
 async (req, res) => {
  let addCoupon = await adminHelper.addCoupon(req.body)
  
  if (addCoupon.status === false) {
      req.session.couponError = "Your Entered Coupon code Already exists! Try again..";
  } else {
      req.session.couponError = null
      res.redirect('/admin/coupon-List')
  }

},

Coupon_List:
async(req,res)=>{
  let activeCoupons = await adminHelper.getActiveCoupons()
  let expiredCoupons = await adminHelper.getExpiredCoupons()

  res.render("admin/coupon-List", { layout: "admin-layout",activeCoupons,expiredCoupons,couponError: req.session.couponError});
  req.session.couponError = null;
},

Edit_Coupon_post:
async(req,res)=>{
  await adminHelper.editCoupon(req.body)
  res.redirect('/admin/coupon-List')
},

Delete_Coupon_post: 
async (req,res) => {
  await adminHelper.deleteCoupon(req.body).then((response)=>{
    res.json(response)
  }) 
},

//////////////////////////////////////////////////////////////  BANNER /////////////////////////////////////////////////////////////

Banner_List: 
async (req,res) => {
let banners=await adminHelper.getBanner()

res.render('admin/banner-List', { layout: 'admin-layout',banners })
},

//how about modals we can lose addbanner seperate page and route


Add_Banner_post:
async(req,res)=>{
  console.log(req.files.bannerImg1[0].filename,'784578478548758')
  req.body.bannerImg1 = req.files.bannerImg1[0].filename
  await adminHelper.addBanner(req.body)
  res.redirect('/admin/banner-List')
},

Edit_Banner_post:
async(req,res)=>{
  console.log(req.body,"&&GGG&^^");
  if (req.files.bannerImg1 == null){
  //.id is what we getting because we gave as name="id" not name="_id", so it is submitted in the name as 'id'
  tempImg1 = await adminHelper.fetchBannerImg(req.body.id,"bannerImg1") } 
  else 
  { tempImg1 = req.files.bannerImg1[0].filename }

  req.body.bannerImg1 = tempImg1

  adminHelper.editBanner(req.body).then(() => {
    res.redirect('/admin/banner-List')
})
},

Delete_Banner:
async(req,res)=>{
  adminHelper.deleteBanner(req.params.id).then((response) => {
    res.json(response)
})
}



















  ///////////////////////////////////////////////////
}