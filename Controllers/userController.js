const adminHelper = require('../Helpers/adminHelper');
const userHelper=require('../Helpers/userHelper');
const moment = require('moment');
//imorting dotenv
require('dotenv').config()
/* console.log(process.env,'this is processenv'); */

//paypal imported
var paypal = require('paypal-rest-sdk');
//paypal configure
paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  'client_id': process.env.CLIENT_ID,/* process.env.CLIENT_ID */ // please provide your client id here 
  'client_secret':process.env.CLIENT_SECRET /* process.env.CLIENT_SECRET */ // provide your client secret here 
});


module.exports={
  HOME:
  async(req,res)=>{           
    console.log(req.session)//test
    
    let cartCount= null
    let topSales=null
    
    if(req.session.loggedIn){
    cartCount = await userHelper.getCartCount(req.session.member._id)
    topSales= await adminHelper.topSales()  
    }
    res.render('user/home',{topSales,wishCount:req.session.wishCount, cartCount : req.session.cartCount, LoggedIN : req.session.loggedIn ,HOME:true}) 
  },

  LOGIN:
  (req, res)=>{
              
    if(req.session.loggedIn){
      res.redirect('/')
    }
    //normal case
    else{
      res.render('user/login',{hidepartial:true,loginErrFound: req.session.loginErr})
      req.session.loginErr=false
    } 
},

LOGIN_PO:
(req, res)=>{

  userHelper.duLogin(req.body).then((uservalidate)=>{
          if(uservalidate.passwordValidity){
            // before rendering homepage first we mark down or color dye that user is loggedin,this should have been right after rendering but here its just before rendering, after response its not possible to mark down all this
            req.session.loggedIn= true //colordyes as logged into home 
            req.session.member=uservalidate.memberStored
            //check if there is a return url stored in session ,if there is use that or use the usual one
                    if(req.session.returnTo){
                      res.redirect(req.session.returnTo);
                      delete req.session.returnTo;
                      console.log(req.session.returnTo,'333333')
                    }
                    else{
                      res.redirect('/')
                    }
          }
          else{
          req.session.loginErr ="Invalid username or password" //or you can also set to true , its the same , if there is a value its considered as true,unlike there, you cant directly pass the variable when you set to true
            res.redirect('/login')
          }
    })

},

SHOP_ALL:
(req, res)=>{
  
  console.log(req.session.CartCount,"cartcount inside shopall")

  //productfetch()=> to fetch products from collection The-products and display on shop all page
  userHelper.getAllProducts().then(async(AllProducts)=>{
   
    ///////
   
    let count = 0
    //counting all products one by one
    AllProducts.forEach(AllProducts => {
      count++
    });
    let pageCount = await userHelper.paginatorCount(count)
    AllProducts = await userHelper.getTenProducts(req.query.id)

    if (req.query.minimum) {
      let minimum = req.query.minimum.slice(1)
      let maximum = req.query.maximum.slice(1)
      let arr = []
      AllProducts = await userHelper.getAllProducts()
     
      AllProducts.forEach(product => {
        if (AllProducts.price >= minimum && AllProducts.price <= maximum) {
          arr.push(AllProducts)
        }
      });
      AllProducts = arr  ;
    }

    ////////

    let fetchedCategoryf= await userHelper.categoryFetch()

        res.render('user/shop-all',{wishCount:req.session.wishCount,cartCount : req.session.cartCount,pageCount,AllProducts,fetchedCategoryf, LoggedIN : req.session.loggedIn,SHOP:true})
      
    })

},

CART:
async(req, res)=>{

  console.log(req.session.cartCount,'inside cart');

  let cartProducts= await userHelper.getCartProducts(req.session.member._id)
  console.log(cartProducts,"cartProducts");
  
  let totalValue=0
  //incase there cart is empty
  if(cartProducts.length>0){
    totalValue= await userHelper.getTotalAmount(req.session.member._id) 
  }

  // let totalValue=await userHelper.getTotalAmount(req.session.member._id)

  res.render('user/cart',{cart:true,stockErr:req.session.stockErr,wishCount:req.session.wishCount,cartCount : req.session.cartCount,totalValue, cartProducts , USERid:req.session.member._id,  LoggedIN : req.session.loggedIn})
  req.session.stockErr=null // after cart refresh the error will be gone
  console.log(req.session.stockErr,"errrrrrrrrrrooorrr")
},

ADDTOCART:
(req, res)=>{ //verifyLogin middleware cant be used here because of ajax
  console.log(req.params.id,'inside add-to-cart ');
  //product's id and user's id
  
    userHelper.pushToCart(req.params.id,req.session.member._id).then(()=>{
      //redirect not required since we are only reloading the small segment, that reload is done by ajax
      //we are also giving a response here in json form
      res.json({status:true})
    })  
},

CHANGE_PRODUCT_QUANTITY_PO:
(req, res, next) => {
  //req.body here is the data from the ajax function,
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    console.log(req.body.User, "reqbodyUser");
    //total changing when quantity changes in the cart page , response.total will used to change the value in the total price as we change the quantity
    response.total = await userHelper.getTotalAmount(req.body.User);
    
    res.json(response); // res.render or res.redirect is not required since we are not passing an entire html ,only a portion of it thats why we are using res.json
  });
},

REMOVE_CART_PRODUCT_PO:
async (req, res) => {
  await userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
},

PLACE_ORDER:
async (req, res) => {
  let stockErr =await userHelper.stockCheck(req.session.member._id)
  let totalAmount = await userHelper.getTotalAmount(req.session.member._id);
   let allProfile= await userHelper.getProfile(req.session.member._id); /* user address details */
   res.render("user/place-order", {wishCount:req.session.wishCount, cartCount : req.session.cartCount,totalAmount, allProfile,totalAmount,USERid: req.session.member._id,LoggedIN: req.session.loggedIn,}); //all datas passed in the checkout or place order page

    if(stockErr){
     req.session.stockErr= stockErr
     res.redirect("/cart") //throw err msg"stock insufficient" or "out of stock"
   }
    else{
    res.render("user/place-order", {wishCount:req.session.wishCount, cartCount : req.session.cartCount,totalAmount, allProfile,totalAmount,USERid: req.session.member._id,LoggedIN: req.session.loggedIn,}); //all datas passed in the checkout or place order page
   }
},

//checkout post
PLACE_ORDER_PO:
async (req, res) => {
  console.log(req.body.USER, "inside place order"); // USER - hidden key in the place order form
  console.log(req.body);
  console.log(req.body.payWithWallet,"@@@@@@@@@@#@#@")// if payment with wallet is selected
   if(req.body.payWithWallet){
    req.session.payWithWallet=req.body.payWithWallet
   }
  //rounded coupon discountAmount
  let discountAmount= Math.round(parseInt(req.body.discountAmount2))

  let productList = await userHelper.getCartProductList(req.body.USER);
  console.log(productList,"*********")
  let totalPrice = await userHelper.getTotalAmount(req.body.USER);
  let netTotalAmount=totalPrice-discountAmount
  //CHECKOUT BUTTON (ajax used )
  userHelper.checkOut(req.body, productList, totalPrice, discountAmount,netTotalAmount).then((orderIdf) => {
   
    req.session.orderId=orderIdf; 
   console.log(req.session.orderId,"UUDD") 
    console.log(req.body, "inside checkout-reqbody");
    //if payment method was 'COD'
    if (req.body["payment-method"] === "COD") {
      //stockdecrease 
      userHelper.stockDecrease( productList ).then(()=>{
        res.json({ CODsuccess: true }); //success status from ajax
      })     
    }
    //if payment method was 'ONLINE'/Razorpay
    else if(req.body["payment-method"]==="ONLINE"){
      console.log('21121212121')
      userHelper.generateRazorpay(orderIdf, netTotalAmount).then((response) => {
        res.json(response);
      });
    }
    //if payment method is paypal
    else if(req.body["payment-method"]==="PAYPAL"){
      var payment = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/order-success",/* process.env.PAYPAL_SUCCESS_URL + orderIdf */
            "cancel_url": "http://localhost:3000"

        },
        "transactions": [{
            "amount": {
                "total": totalPrice,
                "currency": "USD"
            },
            "description": orderIdf
        }]
    } 
    
    // create payment on paypal
    userHelper.createPay(payment).then((transaction) => {
      var id = transaction.id;
      var links = transaction.links;
      var counter = links.length;
      while (counter--) {
          if (links[counter].rel == 'approval_url') {
              transaction.pay = true    //response.payPal
              transaction.linkto = links[counter].href
              transaction.orderId = orderIdf
           
              userHelper.changePaymentStatus(orderIdf).then(()=>{
                res.json(transaction)
            })
          }
      }
  })
  .catch((err) => {
    console.log(err);
    res.redirect('/error');
});


    }
  });
},

VerifyPayRazor_post:
(req, res) => {
  console.log(req.body);
  //once verify is posted, it has payment_id,order_id,signature to finally output success or fail 
  userHelper.verifyPaymentRazor(req.body).then(async() => {
    console.log(req.body["order[amount]"],"TRRRRRR")
    let balanceErr=null
   //only when razorpay or paypal is used , but in this case, we can only have razorpay
   if(req.session.payWithWallet){
     balanceErr = await userHelper.payWithWallet(req.session.member._id,req.body["order[amount]"])
     req.session.payWithWallet=null
   }
          if(!balanceErr){
            let productList=await userHelper.getCartProducts(req.session.member._id);
            userHelper.stockDecrease( productList )
          //once payment is checked
          userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
            res.json({ status: true }); //payment successful, status: true is not coming from any response, but we are setting it because eveything after changestatus is very unlinkely to go wrong
            console.log("payment successful");
          });
         }
         else{
          console.log(balanceErr,"5500")
          req.session.balanceErr=balanceErr;
          res.json({ status: false }); //payment failed
          console.log("payment failed because of insufficient balance");
        }
   
    
    })

    
      
},

ORDER_SUCCESS:
async(req, res) => {
  console.log(req.session.loggedIn)
  let allProfile=await userHelper.getProfile(req.session.member._id)
  let totalAmount= await userHelper.getTotalAmount(req.session.member._id)
  let cartProducts= await userHelper.getCartProducts(req.session.member._id)
  let order = await userHelper.getaOrder(req.session.orderId);
  console.log(order,"!!!!!!!!!")
  
  
  userHelper.EraseCart(req.session.member._id)
  res.render("user/order-success", { order,allProfile,cartProducts,totalAmount,hidepartial: true }); // is user:req.session.member  required ??
},

VIEW_ORDERS:
async (req, res) => {
  
  let orderList = await userHelper.getOrders(req.session.member._id);

  res.render("user/view-orders", { ORDERS:true,wishCount:req.session.wishCount,cartCount : req.session.cartCount, orderList, LoggedIN: req.session.loggedIn }); // is user:req.session.member  required ??
  req.session.orderId=null
},

VIEW_ORDERED_PRODUCT:
async (req, res) => {
  //verifyLogin after fix

  let orderedProducts = await userHelper.getOrderedProduct(req.params.id);
  console.log(orderedProducts,"3785hf")
  res.render("user/view-orderedproduct", {orderedProducts,LoggedIN: req.session.loggedIn});
},



SINGLE_PRODUCT:
(req, res) => {
  //query was used here
  userHelper.productFetchOne(req.query.id).then((fetchedOneProductf) => {
    res.render("user/single-product", {wishCount:req.session.wishCount,cartCount : req.session.cartCount,fetchedOneProductf,LoggedIN: req.session.loggedIn,USERid:req.session.member});
  });
},

OTP_LOGIN:
(req, res) => {
  res.render("user/Otp-Login", { hidepartial: true });
},

OTP_LOGIN_PO:
(req, res) => {
  userHelper.duOTPLogin(req.body).then((uservalidatef) => {
    if (uservalidatef.status) {
      Temp = uservalidatef.memberStored;
      console.log(Temp);
      res.redirect("/Otp-confirm");
    } else {
      res.redirect("/Otp-login");
    }
  });
},

OTP_CONFIRM:
(req, res) => {
  res.render("user/Otp-confirm", { hidepartial: true });
},

OTP_CONFIRM_PO:
(req, res) => {
  let CODE = req.body.one + req.body.two + req.body.three + req.body.four + req.body.five + req.body.six;
  console.log(CODE, "this code is string concatenated and converted to number");

  userHelper.duOTPConfirm(CODE, Temp).then((data) => {
    if (data.status) {
      req.session.member = Temp;
      req.session.loggedIn = true;

      res.redirect("/");
    } else {
      res.redirect("/Otp-confirm");
    }
  });
},

LOGOUT:
(req, res) => {
  req.session.member = null;
  req.session.loggedIn = false;
  console.log(req.session.returnTo,'000000')
   delete req.session.returnTo;  // this is for when you logout from profile page and you then try to login to homepage you somehow end up routing to the last page before logout that is profile page  
  console.log("session destroyed");
  console.log(req.session);
  res.redirect("/"); //back to landing page
},

SIGNUP:
(req, res) => {
  res.render("user/signup", { hidepartial: true });
},


PROFILE:
async(req,res)=>{
   let allProfile=await userHelper.getProfile(req.session.member._id)
   let wallet = await userHelper.getWallet(req.session.member._id) // to display wallet in the profilepage

   
  res.render("user/profile", { profile:true, wishCount:req.session.wishCount,cartCount : req.session.cartCount, wallet, allProfile,LoggedIN: req.session.loggedIn, USERErr: req.session.userErr });
},

ADD_ADDRESS_PO:
(req, res)=>{
  console.log(req.body,"777777");
  console.log(req.session.member._id,'777788');
     //dont use await below here it will take forever to call the function addAddress, i mean who is it even awaiting for 
    userHelper.addAddress(req.body,req.session.member._id)
     res.redirect('/profile')

},

EDIT_ADDRESS_PO:
(req,res)=>{
  console.log(req.body,"8888877");
  console.log(req.session.member._id,'87887878');

   userHelper.editAddress(req.body,req.session.member._id)
  res.redirect('/profile')

},

DELETE_ADDRESS:
(req,res)=>{
   userHelper.deleteAddress(req.session.member._id)
   res.redirect('/profile')
},
     //<-------------------------------- WISHLIST ------------------------------------------>

WISHLIST:
async(req,res)=>{
  console.log(req.session.member._id,"fgfdgfd4g5454g5df4");
  let wishProds = await userHelper.getWishProds(req.session.member._id)
  console.log(wishProds,"0212101212020");
  
  res.render('user/wishlist',{wishlist:true,wishCount:req.session.wishCount,cartCount : req.session.cartCount,  wishProds,LoggedIN : req.session.loggedIn})
},

ADD_TO_WISHLIST:
(req,res)=>{
  userHelper.pushToWishlist(req.params.id,req.session.member._id).then(()=>{
    res.json({status:true})
  })
},

REMOVE_WISHPROD:
async(req,res)=>{
    await userHelper.removeWishProd(req.body).then((response)=>{
      res.json({response}) //after deletion this response is then passed
    })
},


// COUPON

Apply_Coupon_post:
async (req,res) => {
  
  let couponRes = await userHelper.applyCoupon(req.body.couponCode,req.session.member._id) //in the route we used /:couponCode
  res.json(couponRes)
},



//////////////////////////////////////////////////////////////  ORDER MANAGE /////////////////////////////////////////////////////////////

Cancel_Order:
(req, res) => {
  
  userHelper.cancelOrder(req.query.OrderId).then((response)=>{
     if(response.cancelled){
      //we dont know which order this is , so we need query id for it,(we have query id, the trigger button is 'cancel'= it passes a queryid or orderid) during checkout we can get productList that was being purchased from cart, now cart is no more and this has no timing , it can happen anytime whenver cancel is pressed, but we already have a query id of order
      userHelper.stockIncrease( req.query.OrderId ) // no need to be awaited this can happen in the background,it is not immediately required
    } 
    res.json(response)
  })
},

//this is after its been delivered, so when you return it stock should increase back
Return_Order:
(req, res)=> {
  console.log("Inside theeajkjksajlkd ifreutri")
  userHelper.returnOrder(req.query.OrderId).then(async(response) => {
    if(response){
      userHelper.refund(req.session.member._id,req.query.OrderId) 
    } 
    res.json(response)
  })
},

SIGNUP_PO:
(req, res) => {
  //duSignup is just a function to insert req.body passed on to it into the database collection registeredClients
  userHelper.duSignup(req.body).then((response) => {
    if (response.permission) {
      console.log(response.permission,"helelleo")
      if(response.newUserId){
        console.log(response.newUserId,"hiiiiihihihih")
        req.session.newUserId=newUserId
        console.log(req.session.newUserId,"dkjfhkdsjfdsjfsjdfdsflasdfkjsdhfkjsdhfkjshdfjk");
        res.redirect("/referal");
      }
    } else {
      console.log("email alreay exists");
      res.redirect("/signup");
    }
  });
},

Referal:
(req,res)=>{
  console.log(req.session.newUserId,"6356354$$");
  res.render('user/referal',{ hidepartial: true, referalErr: req.session.referalErr })
  req.session.referalErr = null // when you refresh error will be gone
},

Referal_post:
async(req,res)=>{
  //instead of using then and taking that response in there, we directly take the response.Its the same thing
  let response = await userHelper.applyReferal(req.body.referalCode, req.session.newUserId)
  req.session.newUserId=null // this can either be nulled or just kept like that, anyway when another new user registers, this id will be replaced by that users id
  console.log(req.session.newUserId,"tytyttyt")
  if (response.walletCredited) {
      console.log("uiuiuiiuiuiuiu")
      res.redirect('/login');
  } else {
      req.session.referalErr = "The Entered referral code is Invalid" // no referer has this referal code , this error is stored in session
      res.redirect('/referal')
  }
},



//////////////////////////////////////////////////////////////  Extras  /////////////////////////////////////////////////////////////
  
payFail: async (req, res) => {
  // const deletePendingOrder = await userHelper.deletePendingOrder(req.params.orderId)
  res.render('user/pay-fail', { hidepartial: true ,balanceErr: req.session.balanceErr})
  req.session.balanceErr=null
},

ERRORPAGE:
(req, res) => {
  res.render("error", { hidepartial: true, USERErr: req.session.userErr });
},

SAMPLE:
(req, res) => {
  res.render("user/sample", { hidepartial: true, USERErr: req.session.userErr });
},
}

