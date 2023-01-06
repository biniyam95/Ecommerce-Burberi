var express = require("express");
const { response } = require("../app");
var router = express.Router();





let {
  HOME,LOGIN,LOGIN_PO,SIGNUP,SIGNUP_PO,LOGOUT,ERRORPAGE,
  OTP_LOGIN,OTP_LOGIN_PO,OTP_CONFIRM,OTP_CONFIRM_PO,
  SHOP_ALL,SINGLE_PRODUCT,
  CART,ADDTOCART,CHANGE_PRODUCT_QUANTITY_PO,REMOVE_CART_PRODUCT_PO,
  PLACE_ORDER,PLACE_ORDER_PO,VerifyPayRazor_post,ORDER_SUCCESS,
  VIEW_ORDERS,VIEW_ORDERED_PRODUCT,Cancel_Order,Return_Order,
  PROFILE,ADD_ADDRESS_PO,EDIT_ADDRESS_PO,DELETE_ADDRESS,
  WISHLIST,ADD_TO_WISHLIST,REMOVE_WISHPROD,
  Apply_Coupon_post,
  Referal,Referal_post,
  payFail,
  
  SAMPLE 
} = require("../Controllers/userController");
const userHelper = require("../Helpers/userHelper");

/* -------------------  middleware to verify login  ----------------- */

//this is for those pages like cart, orders ,wishlist,-pages we initially wanted to hide before login but now its going to show but the access will be checked

const verifyLogin = async(req, res, next) => {
  if (req.session.loggedIn) {    
    next();
  } 
  else { 
    
    req.session.returnTo = req.url; //storing the url that just got restricted and redirecting to login
   res.redirect('/login');   
  }
};

const headCounts = async(req,res,next)=>{
  if(req.session.loggedIn){
    let wishCount=await userHelper.getWishCount(req.session.member._id)
    let cartCount = await userHelper.getCartCount(req.session.member._id)
    req.session.wishCount=wishCount;
    req.session.cartCount=cartCount;
    console.log('in111in1111')
    next()
  }
  else{
    console.log('out0000out00');
    next()
  }
};



/*----------------------------------------------------------routes----------------------------------------------------------------------*/

// USER
router.get("/",headCounts, HOME);
router.get("/login", LOGIN);
router.post("/login", LOGIN_PO);
router.get("/signup", SIGNUP);
router.post("/signup",SIGNUP_PO);
router.get("/logout", LOGOUT);
router.get("/error", ERRORPAGE);

// OTP 
router.get("/Otp-login", OTP_LOGIN);
router.post("/Otp-login", OTP_LOGIN_PO);
router.get("/Otp-confirm", OTP_CONFIRM);
router.post("/Otp-confirm", OTP_CONFIRM_PO);

// SHOP
router.get("/shop-all",headCounts,SHOP_ALL);
router.get("/single-product" ,headCounts,SINGLE_PRODUCT);

// CART
router.get("/cart", verifyLogin, headCounts, CART);
router.get("/add-to-cart/:id", ADDTOCART);
router.post("/change-product-quantity", CHANGE_PRODUCT_QUANTITY_PO);
router.post("/removeCartProduct", REMOVE_CART_PRODUCT_PO);

// PLACE-ORDER
router.get("/place-order", verifyLogin, headCounts, PLACE_ORDER);
router.post("/place-order", PLACE_ORDER_PO);
router.get("/order-success", verifyLogin, ORDER_SUCCESS);
router.post("/verify-payment-razor", VerifyPayRazor_post);

// ORDERS
router.get("/view-orders", verifyLogin,headCounts, VIEW_ORDERS);
router.get("/view-orderedproduct/:id", verifyLogin , VIEW_ORDERED_PRODUCT);
router.get("/cancel-order",verifyLogin,Cancel_Order );
router.get('/return-order', verifyLogin, Return_Order);

// PROFILE
router.get("/profile",verifyLogin,headCounts,PROFILE );
router.post("/add-address",ADD_ADDRESS_PO );
router.post("/edit-address",EDIT_ADDRESS_PO );
router.get('/delete-address',verifyLogin,DELETE_ADDRESS);

// WISHLIST
router.get('/wishlist',verifyLogin,headCounts,WISHLIST);
router.get('/add-to-wishlist/:id',verifyLogin,ADD_TO_WISHLIST);
router.post('/remove-wishProd',REMOVE_WISHPROD);

//COUPON
router.post('/apply-coupon',Apply_Coupon_post)

//referal coupon
router.get('/referal',Referal);
router.post('/referal',Referal_post);

//payment failed
router.get('/pay-fail',verifyLogin, payFail)



//sample
router.get('/sample',SAMPLE)










module.exports = router;
