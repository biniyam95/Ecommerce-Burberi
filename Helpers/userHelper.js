var db = require("../dbConnectionEstablishment/connection");
var CollectionStore = require("../collectionConfig/collections");
// var OTPStore=require('../twilioConfig/twilio');
const { ObjectId } = require("mongodb");
const { uid } = require('uid')

//imorting dotenv
require('dotenv').config()
//moment
const moment = require('moment');

/* var SID = process.env.TWILIO_SID;
var TOKEN = process.env.TWILIO_TOKEN;
const Client = require("twilio")(SID, TOKEN);
var serviceID=process.env.TWILIO_serviceID */

//twilio
 const Client = require('twilio')(process.env.AccountSID, process.env.AUTHtoken);

var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  'client_id': process.env.SANDBOX_ID,/* process.env.CLIENT_ID */ // please provide your client id here 
  'client_secret':process.env.CLIENT_SECRET /* process.env.CLIENT_SECRET */ // provide your client secret here 
});



//Bcrypt-password encryption

const bcrypt = require("bcrypt");
const { response } = require("../app");

//razorpay
const Razorpay = require("razorpay");
const { resolve } = require("path");
const collections = require("../collectionConfig/collections");

//instance is where new razorpay object is created and stored
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, //generated key id
  key_secret: process.env.RAZORPAY_KEY_SECRET, //generated key secret
});





 


/* if possible write uservalidate up here as a global variable */

module.exports = {
  //==================================   USER  ===================================


  //  during signup post
  duSignup: (userBody) => {
    return new Promise(async (resolve, reject) => {
      //initial assigns during first signup in the user collection
      userBody.referalCode = uid() // uid() generates a random number,this is stored as users referal code when first signed up
      userBody.walletBalance = 0 //assign initial walletBalance as zero
      userBody.walletTransaction=[] // assigning empty transaction history array in the userBody which is the usercollection data
      userBody.address=[{street:"street0",state:"state0",city:"city0",zip:"000000",country:"India"}] // assigning dummy address
      userBody.blocked =false
         

      //pass encrypt
      userBody.password = await bcrypt.hash(userBody.password, 10);
      console.log(userBody);

      let memberExist= await db.get().collection(CollectionStore.USER_COLLECTION).findOne({email:userBody.email})
      if(!memberExist){
        
        db.get().collection(CollectionStore.USER_COLLECTION).insertOne(userBody).then((response) => {
          console.log('new user is successfully registered')
         console.log(response,"#########")
           
          newUserId=(response.insertedId).toString()
          console.log(newUserId,"newwwwUserID 4444")
          
          resolve({permission:true,newUserId});
        });
      }
      else{
        console.log('registering permission false')
        resolve({permission:false,newUserId:null});
      }

      
    });
  },

  applyReferal: (referalCode, userId) => {
    return new Promise(async (resolve, reject) => {
      // the user who refered or whose referal was used
        let refererUser = await db.get().collection(CollectionStore.USER_COLLECTION).findOne({ referalCode: referalCode })// check if any user have the Referal Code
        
        if (refererUser) {
          //new user who used the referal
            let newUser = await db.get().collection(CollectionStore.USER_COLLECTION).findOne({ _id: ObjectId( userId ) })
            //transaction histroy of newUser
            let newUserTransaction = {
                TransactionDate: new Date(), // date of transaction
                TransactionTitle: "Referal Code", 
                TransactionMessage: "Rs.200 credited through referal code",
                TransactionAmount: 200,
                referer: refererUser.firstname // whose referal was refered
            }
            //transaction histroy of referer User
            let refererUserTransaction = {
                TransactionDate: new Date(),// time of transaction will be slightly after the newUser's
                TransactionTitle: "Referal Code",
                TransactionMessage: "Rs.300 credited by using your referal code",
                TransactionAmount: 300,
                referee: newUser.UserName // who refered the referal
            }
            
            
            if (referalCode == refererUser.referalCode) { //we dont have to check this condition, when we fetched refererUser, it meant the referal code matched some users referal code and that user himself is referer

              //here $inc and $push was used so that it walletBalance can be incremented to preexisting zero and also both wallet and wallettransaction can have more transactions that will have to be pushed in the future
             // you can also do:
             /* newUser.walletBalance=0+200 ;
                newUser.walletTransaction=NewUserTransaction*/ 
                /* above can be followed in the future because when you already some unknown amount of balance in the wallet , you will have to fetch and add to that, simple option is you can just use $inc
                same goes for pushing transaction histories */
              
                //refetching new user , below variable newUserUpdate is not to pass anywhere but to avoid using .then , because you will have to nest the refererUserUpdate and inside that resolve it
                let newUserUpdate = await db.get().collection(CollectionStore.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                    $inc: { walletBalance: 200 },  $push: { walletTransaction: newUserTransaction}
                })
                //refetching refer user , below variable refererUserUpdate is not to pass anywhere but to avoid using .then 
                let refererUserupdate = await db.get().collection(CollectionStore.USER_COLLECTION).updateOne({ referalCode: referalCode }, {
                    $inc: { walletBalance: 300 },  $push:{ walletTransaction: refererUserTransaction }
                })
                resolve({ walletCredited: true })
            }
        } else {
            resolve({ walletCredited: false })
        }
    })

},

  //function during login with a req.body with it
  duLogin: (body) => {
    return new Promise(async (resolve, reject) => {
      let uservalidate = {};

      let memberInfo = await db.get().collection(CollectionStore.USER_COLLECTION).findOne({ email: body.email });
        
      if (memberInfo && !memberInfo.blocked) {
        //only if member is true , ie, that email exist then compare passwords and it returns a boolean which passwordCheck will takeup if true
        bcrypt.compare(body.password, memberInfo.password)
          .then((passwordCheck) => {
            if (passwordCheck) {
              console.log(
                "password is correct so login will direct to homepage"
              );
              uservalidate.memberStored = memberInfo;
              uservalidate.passwordValidity = true;
              // uservalidate.blocked=false
              resolve(uservalidate);
            } 
            else {
              console.log("wrong password");
              resolve({ passwordCheck: false });
            }
          });
      } else {
        console.log(
          "user trying to login is either not a member or is blocked"
        );
        resolve({ passwordCheck: false });
      }
    });
  },

  // userUnblock:(paramsId)=>{
  //   return new Promise(async(resolve,reject)=>{

  //     await db.get().collection(CollectionStore.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(paramsId)})
  //     resolve()
  //   })
  // },

  //==================================   PRODUCT  ===================================

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      console.log("inside user productfetch()"); //checkpoint
      //storing fetched users in a variable
      let AllProducts = await db.get().collection(CollectionStore.PRODUCT_COLLECTION).find().toArray();
      resolve(AllProducts);
    });
  },

  productFetchOne: (queryId) => {
    return new Promise(async (resolve, reject) => {
      console.log("inside user productfetchOne()"); //  checkpoint
      //storing fetched users in a variable
      let fetchedOneProduct = await db.get().collection(CollectionStore.PRODUCT_COLLECTION).findOne({ _id: ObjectId(queryId) });
      resolve(fetchedOneProduct);
    });
  },

  //==================================   CATEGORY  ===================================

  categoryFetch: () => {
    return new Promise(async (resolve, reject) => {
      console.log("inside categoryfetch()"); //checkpoint
      //storing fetched users in a variable
      let fetchedCategory = await db
        .get()
        .collection(CollectionStore.CATEGORY_COLLECTION)
        .find()
        .toArray();
      console.log(fetchedCategory);
      resolve(fetchedCategory); 
    });
  },

  /* =========================================   CART     ==================================== */

  pushToCart: async(prodId, memberId) => {
    console.log("inside pushtocart");
    prodDetails=await db.get().collection(CollectionStore.PRODUCT_COLLECTION).findOne({_id:ObjectId(prodId)})
    let prodObj = {
      prodItem: ObjectId(prodId),
      quantity: 1,
      prodName:prodDetails.prodName,
      categName:prodDetails.categName,
      price:prodDetails.price,
      stock:prodDetails.stock,
      prodImage:prodDetails.prodImage1

    };
    console.log(prodObj,"@@@@@@@")

    return new Promise(async (resolve, reject) => {
      let memberCartExist = await db.get().collection(CollectionStore.CART_COLLECTION).findOne({ user: ObjectId(memberId) });

      if (memberCartExist) {
        let prodExist = memberCartExist.products.findIndex((item) => item.prodItem == prodId); //if a cart has a userId in it , means it has a product(ie,productId) in it
        console.log(prodExist);

        if (prodExist != -1) {
          // if no product exist inside cart basket
          await db.get().collection(CollectionStore.CART_COLLECTION).updateOne(
            { user: ObjectId(memberId),"products.prodItem": ObjectId(prodId)},
              {$inc: { "products.$.quantity": 1 }})// this means the same as products.quantity but here an extra $ required because we are using an array
              
            .then(() => {
              resolve();
            });
        } else {
          await db.get().collection(CollectionStore.CART_COLLECTION).updateOne(
              { user: ObjectId(memberId) },
              {
                $push: { products: prodObj },
              }
            )
            .then((response) => {
              resolve()
            });
        }
      } 
      else {
        //an object or a Trolley or a Cart for the member is created

        let memberCart = {
          user: ObjectId(memberId), //members id
          products: [prodObj], //Id of products pushed
        };

        await db.get().collection(CollectionStore.CART_COLLECTION).insertOne(memberCart)
          .then(() => {
            resolve()
          })
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartProducts= await db.get().collection(CollectionStore.CART_COLLECTION).aggregate([
        {$match:{ user:ObjectId(userId)}},
        {$unwind: "$products"},
        {$project:{prodItem:"$products.prodItem",quantity:"$products.quantity"}},
        {$lookup:{
              from: CollectionStore.PRODUCT_COLLECTION,
              localField: "prodItem",
              foreignField: "_id",
              as: "prodExtract"  }},
        {$project:{prodItem:1,quantity:1,final_slicedProduct: {$arrayElemAt:["$prodExtract",0]}}}

      ]).toArray();

      console.log(cartProducts,"44$$5$$76")
      resolve(cartProducts);
    });
  },

  getCartCount: (memberId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cartExist = await db.get().collection(CollectionStore.CART_COLLECTION)
         .findOne({ user: ObjectId(memberId) });
      if (cartExist) {
        count = cartExist.products.length; //'products' is the array key which has all the ids of products pushed to cart
      }
      resolve(count); //no.of products pushed
    });
  },

  EraseCart:(userId)=>{
    return new Promise(async (resolve, reject) => {
      db.get().collection(CollectionStore.CART_COLLECTION).deleteOne({ user: ObjectId(userId) });
    }).then(()=>{
      resolve()
    })

  },


// when cart '+'/'-' button clicked, its action or functionality
  changeProductQuantity: (bodyContent) => {
    Count = parseInt(bodyContent.Count); //parsed to integer value from string
    Quantity = parseInt(bodyContent.Quantity);
    //price = parseInt(bodyContent.price);
    
    return new Promise(async (resolve, reject) => {

      //when both minus button is pressed(count=-1) and only one quantity is present, so its the last product that getting pulled, also we need to alert
      if (Count == -1 && Quantity == 1) {
        await db.get() .collection(CollectionStore.CART_COLLECTION) .updateOne(
            { _id: ObjectId(bodyContent.Cart) },
            {
              $pull: { products: { prodItem: ObjectId(bodyContent.Product) } }, //removed the last one product
            }
          )
          .then(() => {
            resolve({ removeProduct: true }); // will be used for last product removed alert
          });
      }
      //for any other conditions except the above one
      else {
        await db .get() .collection(CollectionStore.CART_COLLECTION) .updateOne(
            {  _id: ObjectId(bodyContent.Cart) , "products.prodItem": ObjectId(bodyContent.Product)  }, 
            {  $inc: { "products.$.quantity": Count }  }
          )
          .then(() => {
            resolve({ changedquantity: true });
          });
      }
    });
  },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      //cart products are fetched based on their id from another collection
      let cartProducts = await db.get().collection(CollectionStore.CART_COLLECTION).aggregate([
          { $match: { user: ObjectId(userId) } },  // why dint match with cartId is because there can be multiple carts , and grandTotal is the total from all the carts
          {
            $unwind: "$products", //to split in equal and seperate each product in to each doc
          },
          {
            $project: {  //unboxing inside each product
              prodItem: "$products.prodItem",
              quantity: "$products.quantity"
            },
          },

          {
            $lookup: {
              //since unwind is used, we can skip pipeline
              from: CollectionStore.PRODUCT_COLLECTION, //product collection is where we fetch from
              localField: "prodItem", // id product pushed in the cart with which we fetch the product details
              foreignField: "_id", //id cart with which we match the cart, from where we take id product
              as: "final_OnecartProduct",
            },
          },

          {
            $project: {
              prodItem: 1,
              quantity: 1,
              final_slicedProduct: {$arrayElemAt: ["$final_OnecartProduct", 0]} //entokke display aakanen parayan
            },
          },

          //since price is inside 'final_OnecartProduct' , we are using project to get the price inside the final_OnecartProduct , to get total seperately
          //instead of fetching one by one we have to group the total of one cart,so we need cartId
            //grouping
             //group id or batch id
              //sum = (product1-price*product1-quantity)+(product2-price*product2-quantity)+...
              // subTotal:{
              //   $multiply: ["$quantity",{ $toInt: "$final_slicedProduct.price" },]
              // },
           { $group: {
              _id: null,
              totalAmount: {$sum: {$multiply: ["$quantity",{ $toInt: "$final_slicedProduct.price" }]}}       
            }
          },
          {
            $project: {
              _id:0,
              totalAmount:1,
             
              
            },
          }
        ])
        .toArray();
      // console.log(totalAmount[0]?.totalAmount, "hhjhggfdgf"); //optional chaining to avoid throwing when total is empty
      // console.log(final_OnecartProduct,'final one cart product');
  console.log(cartProducts,"4545$$$$$$$");
  console.log(cartProducts[0]?.totalAmount,"&&&&&")
      resolve(cartProducts[0]?.totalAmount);
    });
  },

  //function after placeorder is posted -insert orderdetails into order_collection and empty cart
  checkOut: (body, productList, totalPrice, discountAmount) => {
    return new Promise(async (resolve, reject) => {
  
      // if COD-status is placed , if Online then pending, because cod is instant, no need of card details but Online needs it, so it will be pending till everything is done
      let orderStatus =body["payment-method"] === "COD" ? "placed" : "pending";

      // orderlist-userid, cartid, productsid
      let orderObj = {
          deliveryDetails: {                            //delivery details like address
            Firstname: body.firstname,
            Lastname: body.lastname,
            Email: body.email,
            
            Street:body.street,
            State: body.state,
            City:  body.city,
            Country: body.country,
            Zip: body.zip,
            Phone: body.phone,
        },

        user: ObjectId(body.USER),                //  hidden USER key-> id user
        paymentMethod: body["payment-method"],    //cod or online
        orderedProducts: productList,                 // list of all the products in the cartpage/cart
        

        TotalAmount: totalPrice,                      // total amount from cart and place order page
        Orderstatus: orderStatus,                     // placed or pending
        DateMod: moment(new Date()).format('lll'),    //date of order placement on admin side
        dateOfOrder:new Date(),
        discountAmount: discountAmount,                 //coupon that is used
        netTotalAmount: (totalPrice -discountAmount)        //if coupon is used then it will be deducted from totalamount 
      };
      
      //you only checkout after the coupon's been validated as an activeCoupon available
      if(body.couponCode){
        await db.get().collection(CollectionStore.COUPON_COLLECTION).updateOne({couponCode:body.couponCode},
          {$push: {Users:ObjectId(body.USER)} })  // userId pushed inside an array 'Users' ,in the coupon collection
       }

      //as soon as checkout is clicked the order details should be inserted into ORDER_COLLECTION 
      db.get().collection(CollectionStore.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
          console.log("next is orderObj");
          console.log(orderObj);
         orderID=(response.insertedId).toString()
          /* db.get().collection(CollectionStore.CART_COLLECTION).deleteOne({ user: ObjectId(paramsId.USER) }); */
          resolve(orderID);   //order id is returned for razorpay
        });
    });
  },

  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      //productList after the order is placed and its checked out
      let cartExist = await db.get().collection(CollectionStore.CART_COLLECTION).findOne({ user: ObjectId(userId) });
      console.log(cartExist, "sdajdsfj");
      resolve(cartExist.products);
        
    });
  },

  // get Orderlist
  getOrders: (memberId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(CollectionStore.ORDER_COLLECTION)
      .find({ user: ObjectId(memberId) }).sort({_id:-1})
      .toArray();
      console.log(orders, "uuuuuuuuuuuuuuuuu");
      resolve(orders);
    });
  },

  getaOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db.get().collection(CollectionStore.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) })
      console.log(order, "uuuuuuuuuuuuuuuuu");
      resolve(order);
    });
  },

  //get orderedProduct

  getOrderedProduct: (orderId) => {
    return new Promise(async (resolve, reject) => {
      //cart products are fetched based on their id from another collection
      let orderedProduct = await db.get().collection(CollectionStore.ORDER_COLLECTION).aggregate([
          {$match: { _id: ObjectId(orderId) }}, //id order

          { $unwind: "$orderedProducts" },//to split in equal and seperate each product in to each doc
          { $project: { prodItem: "$orderedProducts.prodItem", quantity: "$orderedProducts.quantity"}},
          { $lookup: {
              //since unwinded is used, we can skip pipeline
              from: CollectionStore.PRODUCT_COLLECTION, //product collection is where we fetch from
              localField: "prodItem", // id product pushed in the cart with which we fetch the product details
              foreignField: "_id", //id cart with which we match the cart, from where we take id product
              as: "final_OneOrderProduct",
            },
          },
          { $project: { prodItem: 1, quantity: 1, final_slicedOrderProduct: { $arrayElemAt: ["$final_OneOrderProduct", 0]}}}
        ]).toArray();

      console.log(orderedProduct, "7777777!!!!!"); //optional chaining to avoid throwing when total is empty
    
      resolve(orderedProduct);
    });
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /* ========================================================================================================================================================================================================= */

  //RAZORPAY

  generateRazorpay: (orderIdf, netTotalAmount) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: netTotalAmount * 100, //default its in paise so we need to convert to rupees
        currency: "INR",
        receipt: "" + orderIdf, //to convert orderIdf to string
      };

      //CREATING NEW ORDER
      instance.orders.create(options, function (err, orderIdf) {
        if (err) {
          console.log("error", err);
        } else {
          console.log("new orderId:-", orderIdf);
          resolve(orderIdf);
        }
      });
    });
  },

  //verifyPayment of razorpay

  verifyPaymentRazor: (paramsId) => {
    return new Promise((resolve, reject) => {
      //cryto and hashing
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "SFI8RybMgdlYz1cnhAy0yWwK");

      hmac.update(paramsId["payment[razorpay_order_id]"] + "|" + paramsId["payment[razorpay_payment_id]"]);
      hmac = hmac.digest("hex"); // string conversion to hex code
      if (hmac == paramsId["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  //change status of payment to Placed

  changePaymentStatus: (orderId) => {  // req.body.order[receipt] means orderId from order response from ajax
    return new Promise((resolve, reject) => {
      db.get().collection(CollectionStore.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },{$set: {Orderstatus: "placed"}})
        .then(() => {
          resolve();
        });
    });
  },

  removeCartProduct:(bodyContent)=>{
    return new Promise(async(resolve, reject) => {
    await db.get().collection(CollectionStore.CART_COLLECTION) .updateOne({ _id: ObjectId(bodyContent.CartId) },
      {
        $pull: { products: { prodItem: ObjectId(bodyContent.ProdId) } }, //remove the product that needs to be pulled
      }).then(()=>{
        resolve({deleted:true})
      })
      
    })
  },




  /* ========================================================================================================================================================================================================= */

  //OTP -- using the phone number and checking it, nothing involved except phone number

  duOTPLogin: (bodyContent) => {
    let uservalidate = {};
    return new Promise(async (resolve, reject) => {
      
      let memberExist = await db.get().collection(CollectionStore.USER_COLLECTION).findOne({ phone: bodyContent.phone });
      if (memberExist) {
       
        uservalidate.memberStored = memberExist;
        uservalidate.status = true;

        console.log("5555555");
      
        // initiating/creating twilio verify-code  and send as "SMS" to the number of user in the database.
        Client.verify.services(process.env.ServiceSID).verifications.create(
          { 
           to      :  `+91${bodyContent.phone}`,
          channel :   "sms" 
          })
          .then((data) => {
          console.log(data,"tewilo2222222222222222222222222222")
          });
        resolve(uservalidate);
      } 
      else {
        uservalidate.status = false;
        resolve(uservalidate);
      }
    });
  },

  // Otp-confirm

  duOTPConfirm : (CODE,temp) => {
    return new Promise((resolve, reject) => {
      console.log(CODE);
      
      //
      Client.verify.services(process.env.ServiceSID).verificationChecks.create({
          to  : `+91${temp.phone}`,
          code: CODE,      // hsould i use phone or code
        })
        .then((data) => {
          //should i use permission or status
          if (data.status == "approved") {  //should i use granted or accepted
            resolve({ status: true });
          } else {
            resolve({ status: false });
          }
        });
    });
  },

  /* ============================================================================================================================================================================================================ */

    // <-----------------------------PAGINATION PAGE COUNT ------------------------------------------->

  paginatorCount:(count)=>{
    return new Promise((resolve, reject) => {
      pages = Math.ceil(count/6 )
      let arr = []
      for (let i = 1; i <= pages; i++) {
          arr.push(i)
      }
      resolve(arr)
     })
  },

      // <------------------------------------TEN PRODUCTS SORT------------------------------------->

  getTenProducts: (Pageno) => {
    return new Promise(async (resolve, reject) => {
        let val = (Pageno - 1) * 6
        let AllProducts_ = await db.get().collection(CollectionStore.PRODUCT_COLLECTION)
            .find().sort({ _id: -1 }).skip(val).limit(6).toArray()

        resolve(AllProducts_)
    })
},


createPay:(payment)=>{
  return new Promise((resolve, reject) => {
    paypal.payment.create(payment, function (err, payment) {
        if (err) {
            reject(err);
        } else {
            resolve(payment);
        }
    });
});
},

//Add address post insert address into user collection as object
addAddress:(bodyContent,userId)=>{
  return new Promise(async(resolve,reject)=>{
    /* Address=bodyContent */
   await db.get().collection(CollectionStore.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
    {  $set:{
    "address.$[].state":bodyContent.state,
    "address.$[].street":bodyContent.street,  
    "address.$[].city":bodyContent.city,
    "address.$[].zip":bodyContent.zip,
    "address.$[].country":bodyContent.country
  }  })
    })

    .then((data)=>{
     resolve()
    })
},

getProfile:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    all_Profile=await db.get().collection(CollectionStore.USER_COLLECTION).findOne({_id:ObjectId(userId)})
    resolve(all_Profile)
})
},

editAddress:(bodyContent,userId)=>{
  return new Promise(async(resolve,reject)=>{
   await db.get().collection(CollectionStore.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
    {  
      $set:{
      //$[] ->(positional operator)-> access nested field name 
      "address.$[].state":bodyContent.state,
      "address.$[].street":bodyContent.street,  
      "address.$[].city":bodyContent.city,
      "address.$[].zip":bodyContent.zip,
      "address.$[].country":bodyContent.country

         }}
         )
    })

    .then((data)=>{
     resolve()
    })
},

deleteAddress:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    await db.get().collection(CollectionStore.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
    {$set:{"address.$[].state":"state0",
    "address.$[].street":"street0",  
    "address.$[].city":"city0",
    "address.$[].zip":"000000",
    "address.$[].country":"India"}})
  })
  .then((data)=>{
    resolve()
   })

},

     //<--------------------------------  WISHLIST  ------------------------------------------>

pushToWishlist: (prodId, userId) => {
  //as soon as the prodId is recieved ,its collected and stuffed inside new array item ,waiting to be pushed into the array 
  //this is an Array item

console.log(prodId,"8888966565654")
  let prodObj={
    prodItem:ObjectId(prodId),
    quantity:1
  };

  return new Promise(async (resolve, reject) => {
   
    let wishExist= await db.get().collection(CollectionStore.WISHLIST_COLLECTION).findOne({user: ObjectId(userId)});

    /* when no wishlist basket is created */
    if(!wishExist){
      //wishlist basket created
      let wish={
      user: ObjectId(userId),
      products: [prodObj] //object prodObj passed inside an array
      };  

    await db.get().collection(CollectionStore.WISHLIST_COLLECTION).insertOne(wish).then(()=>{  // inserted the basket in the collection
      resolve()
    })
    }

   /* when wishlist basket exists  */
    else{
       //CHECKING whether the product just added to wishlist exist or not, (item is each Array Item in the array of products already added)
       let prodExist= wishExist.products.findIndex((arrayitem)=>arrayitem.prodItem == prodId)

       if(prodExist == -1){   //when product doesnt exist
        console.log('21221212121')
          await db.get().collection(CollectionStore.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId)},
          { $push:{ products: prodObj } })
          .then(()=>{
            resolve()
          })
          }
        else {  //product exist
          console.log('5445121212');
          await db.get().collection(CollectionStore.WISHLIST_COLLECTION).updateOne({user:ObjectId(userId),"products.prodItem":ObjectId(prodId)},   //updating the one that is of a user's wishlist bucket and the prodId in that array item matches , so that we can increment that items quantity 
          {$inc:{"products.$.quantity":1}})
          .then(()=>{
            resolve()
          })
        }
       }
})
},

getWishProds:(userId)=>{
  return new Promise(async (resolve, reject) => {    
  let wish_Prods=await db.get().collection(CollectionStore.WISHLIST_COLLECTION).aggregate(
      [ {$match: {user: ObjectId(userId)}},
        {$unwind:"$products"},
        {$project: {prodItem: "$products.prodItem",quantity:"$products.quantity"}},
        {$lookup:{
          from: CollectionStore.PRODUCT_COLLECTION, 
          localField: "prodItem",
          foreignField: "_id",
          as: "prodExtract"
        }},
        {$project:{prodItem:1,quantity:1,prodExtract:1,  prodFinish: {$arrayElemAt:["$prodExtract",0]}}}
      ])
      .toArray()
      resolve(wish_Prods)
  })
},

removeWishProd:(body)=>{
  return new Promise(async (resolve, reject) => {
    await db.get().collection(CollectionStore.WISHLIST_COLLECTION).updateOne({_id:ObjectId(body.wishId)},
    {$pull:{ products: { prodItem: ObjectId(body.prodId)}}})  //shouldnt quantity be pulled //to access nested prodItem,follow this syntax
    .then(()=>{
      resolve({removed:true})
    })
  })

},

getWishCount:(userId)=>{
  return new Promise(async (resolve, reject) => {
   wishExist=await db.get().collection(CollectionStore.WISHLIST_COLLECTION).findOne({user:ObjectId(userId)})
   if(wishExist){
    wish_Count=wishExist.products.length
   }
   else{
    wish_Count=0
   }
   resolve(wish_Count)
  })
},



/////////////////////////////////////////////    COUPON   /////////////////////////////////////////////

applyCoupon: (couponCode,userId) => {
  return new Promise(async (resolve, reject) => {
    
      let couponExist = await db.get().collection(CollectionStore.COUPON_COLLECTION).findOne({ couponCode: couponCode })
      let response={};//new response object created

      /* if(couponCode.length===0){
        response.err = "you didnt even enter anything!"
        response.status=false
      } *///this woulda worked if the below code didnt interfere because its already ruling empty input as "invalid coupon code"

      //if no such coupon exits.
      if(couponExist === null) {  //if(!couponExist){}, maybe this is checked with null because sometimes empty array object can be truthy, but 'null' is always falsy
           console.log("invalid coupon");  
          response.status =  false
          response.err    = "Invalid Coupon Code"
          resolve(couponExist)
      }
      //if coupon exists
      else {
          let activeCoupon = await db.get().collection(CollectionStore.COUPON_COLLECTION).findOne({ couponCode: couponCode, expiryDate: { $gte: new Date() } })//checked expiry with todays date,its not expired if its greater than todays date
          if (activeCoupon === null) {
               console.log("coupon Expired");
              response.status =  false
              response.err    = "Coupon Expired"
              resolve(response)
          } else {
            let userExist=await db.get().collection(CollectionStore.COUPON_COLLECTION).findOne({couponCode:couponCode,  Users:ObjectId(userId)}) //checking for user
            
            if(userExist){//user already used coupon
              console.log("user already used this coupon ");
              response.status =  false
              response.err    = "Coupon already Used"
              resolve(response)
            }
            else{// if it is active coupon
              console.log('coupon valid')
              response.activeCoupon = activeCoupon
              response.status       = true
              resolve(response)
            }
            
          }

      }

  })
},


//////////////////////////////////////////////////////////////  STOCK /////////////////////////////////////////////////////////////

stockDecrease:(productList)=>{
  return new Promise((resolve,reject)=>{

    if(productList != null){
      
      //the productList that was passed to the ajax was stringified for ease of passing is now back in the server as stringified, we need to revert it back 
      console.log(productList.length,'product array length')
      console.log(productList,'fiankdadksfjaoksjd');
      
 // iteration for decrementing stock of each product identifying with their Id
      for(i=0; i<productList.length; i++){

          let prodId = productList[i].prodItem
          let quantity = productList[i].quantity
  
          db.get().collection(CollectionStore.PRODUCT_COLLECTION).updateOne({_id : ObjectId(prodId)},{ $inc:{ stock:-quantity } })
      }
      resolve()
    }
   // when the productList , that is cart is empty
    else{
      reject()
    }
  })
},

stockIncrease:(orderId)=>{
  return new Promise(async(resolve,reject)=>{
    let orderList=await db.get().collection(CollectionStore.ORDER_COLLECTION).findOne({_id:ObjectId(orderId)}) //taking the orderList we need
    console.log(orderList,"^%^%888*"); 
    
   
    let productList=orderList.orderedProducts
    console.log(productList,"$%$%$%$221")
    console.log(productList.length,"*(!!!@");
   
    //iterating for stock increase of each product in the orderlist that got cancelled
    for(i=0; i<productList.length; i++){
      let prodId=productList[i].prodItem
      let quantity=productList[i].quantity     
      db.get().collection(CollectionStore.PRODUCT_COLLECTION).updateOne({_id: ObjectId(prodId)},{ $inc: {stock:quantity} })
    }
    resolve({Increased:true})
  })
},


//////////////////////////////////////////////////////////////  ORDER MANAGE /////////////////////////////////////////////////////////////
cancelOrder:(orderId)=>{
  return new Promise(async (resolve, reject) => {
    await db.get().collection(CollectionStore.ORDER_COLLECTION).updateOne( {_id:ObjectId(orderId)},{$set:{ Orderstatus: 'cancelled' }} )
  .then(()=>{
    resolve({cancelled:true})
  })
  })

},


returnOrder:(orderId)=>{
  return new Promise((resolve, reject) => {
    db.get().collection(CollectionStore.ORDER_COLLECTION).updateOne( { _id: ObjectId(orderId)},{ $set: { Orderstatus: 'returned' }} )
        .then(() => {
            resolve({returned:true})
        })
})
},

//////////////////////////////////////////////////////////////  WALLET AND REFERAL /////////////////////////////////////////////////////////////


getWallet: (userId) => {
  return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(CollectionStore.USER_COLLECTION).findOne({ _id: ObjectId(userId) })

      /* let cartDetails = user.walletTransaction //?where does it come from
      
      cartDetails?.forEach(cartDetails => {
      cartDetails.date = new Date(cartDetails.date).toLocaleDateString()
      }) */

      //wallet object created
      let wallet = {
          walletBalance: user.walletBalance,// wats the initial walletBalance
          walletTransaction: user.walletTransaction
      }
      resolve(wallet)

  })
},

stockCheck:(userId)=>{
  let stockerr=null
  return new Promise(async (resolve, reject) => {
    //cart products are fetched based on their id from another collection
    let cartProducts = await db.get().collection(CollectionStore.CART_COLLECTION).aggregate([
        { $match: { user: ObjectId(userId) } },  
        { $unwind: "$products" },
        { $project: { prodItem: "$products.prodItem", quantity: "$products.quantity" }},
        { $lookup: {from: CollectionStore.PRODUCT_COLLECTION, localField: "prodItem",foreignField: "_id", as: "extractProd"} },

        { $project: { quantity:1 ,finishProd : {$arrayElemAt: ["$extractProd", 0]} } }
        
      ])
      .toArray();
  console.log(cartProducts,"uiuiui")
  
  let lim= cartProducts.length
  console.log(lim,"666")

  for(i=0;i<lim;i++){
    
    console.log(cartProducts[i]?.finishProd.stock,"meiii&") //we use [0] because its coming as an object inside array
    console.log(cartProducts[i]?.quantity,"suiuiui")
    
    if(cartProducts[i]?.finishProd.stock === 0){
     stockerr="Remove out of stock item from cart"
     console.log(stockerr,"999")
     break;
    }
    else if(cartProducts[i]?.quantity > cartProducts[i]?.finishProd.stock){
      stockerr=" Insufficient Stock"
      console.log(stockerr,"888")
      break;
    }
    else{
      console.log("no stockcheck error")
    } 
  }
  resolve(stockerr);
  
  });
},

refund:(userId,orderId)=>{
  
  return new Promise(async (resolve, reject) => {
    let order = await db.get().collection(CollectionStore.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) })
    console.log(order,"*****")
    let refundAmount=order.netTotalAmount
    console.log(refundAmount,"5000000")
    if(order.paymentMethod==="ONLINE" || order.paymentMethod==="PAYPAL" ){
      let refundResponse = await db.get().collection(CollectionStore.USER_COLLECTION).updateOne({ _id:ObjectId(userId) },{$inc:{walletBalance:refundAmount}})
      console.log(refund,"60000")

     let Refundtransaction={
        TransactionDate: new Date(), 
        TransactionTitle: "Refund of orderId " + orderId , 
        TransactionMessage: "you have been refunded with " + refundAmount + "for your returned order",
        TransactionAmount: refundAmount
    }
     let transaction= await db.get().collection(CollectionStore.USER_COLLECTION).updateOne({ _id:ObjectId(userId) },{$push:{walletTransaction:Refundtransaction}}) 
    }
    resolve()
  })
},

payWithWallet:(userId,paymentAmount)=>{
  let payAmount=parseInt(paymentAmount/100)
  return new Promise(async (resolve, reject) => {
    
    let user = await db.get().collection(CollectionStore.USER_COLLECTION).findOne({ _id:ObjectId(userId) })
     if(payAmount > user.walletBalance){
        balanceErr="Insufficient Wallet Balance"
        resolve(balanceErr)
     }
     else{
      let razorPayTransaction={
        TransactionDate: new Date(), 
        TransactionTitle: "Online order payment"  , 
        TransactionMessage: "your order was successful",
        TransactionAmount: payAmount
    }
      let userUpdate = await db.get().collection(CollectionStore.USER_COLLECTION).updateOne({ _id:ObjectId(userId) },{ $inc:{walletBalance: -payAmount}, $push:{walletTransaction: razorPayTransaction} }) 
      resolve(balanceErr)
     }
  })
}






//-----------------------/END/-------------------------------------------------------
}