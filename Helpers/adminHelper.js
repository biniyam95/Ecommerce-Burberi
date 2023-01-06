const { ObjectId } = require('mongodb');
var db = require('../dbConnectionEstablishment/connection')
var CollectionStore=require('../collectionConfig/collections')
const moment = require('moment');

module.exports={

      // ============================USER====================================

  userFetch:()=>{
    return new Promise(async(resolve,reject)=>{
      console.log('inside userfetch()')
    
    //storing fetched users in a variable
     let fetchedUser= await db.get().collection(CollectionStore.USER_COLLECTION).find().toArray()
     resolve(fetchedUser)
    })
  },

  //this can be used to check during login post of the user
  userBlock:(paramsId)=>{
    return new Promise(async(resolve,reject)=>{

      let blockedUser=await db.get().collection(CollectionStore.USER_COLLECTION).findOne({_id:ObjectId(paramsId)})
     

      await db.get().collection(CollectionStore.USER_COLLECTION).updateOne({_id:ObjectId(paramsId)},{$set:
      {
        blocked:true
      }
    
      })
      resolve()
    })
  },

  userUnblock:(paramsId)=>{
    return new Promise(async(resolve,reject)=>{

      let UnblockedUser=await db.get().collection(CollectionStore.USER_COLLECTION).findOne({_id:ObjectId(paramsId)})
      console.log('Unblocked user is:');
      console.log(UnblockedUser);

      await db.get().collection(CollectionStore.USER_COLLECTION).updateOne({_id:ObjectId(paramsId)},{$set:
      {
        blocked:false
      }
      })
      resolve()
    })
  },

  // ===============================PRODUCT====================================


  addProduct:(bodyContent)=>{
    bodyContent.stock=parseInt(bodyContent.stock)
    bodyContent.price=parseInt(bodyContent.price)
    bodyContent.isWished=false
    return new Promise(async(resolve,reject)=>{
      db.get().collection(CollectionStore.PRODUCT_COLLECTION).insertOne(bodyContent).then((data)=>{
       resolve()
      })
    })
    /* return new Promise(async(resolve,reject)=>{
     let prodNameExist= await db.get().collection(CollectionStore.PRODUCT_COLLECTION).findOne({prodName:bodyContent.prodName})
     console.log(prodNameExist)
      if(!prodNameExist){
      //inserting submitted content onto collection 'The-products'
        await db.get().collection(CollectionStore.PRODUCT_COLLECTION).insertOne(bodyContent).then((data)=>{
         
          let InsertedId= data.insertedId
          let permission=true
         
        
          resolve(InsertedId,permission)
      })
      }
      else{
        let InsertedId= ""
        let permission=false
        resolve(InsertedId,permission)
      }
    }) */
  },

  getAllProducts:()=>{
    return new Promise(async(resolve,reject)=>{
      console.log('inside getAllProducts()')//checkpoint
    //storing fetched users in a variable
     let AllProducts= await db.get().collection(CollectionStore.PRODUCT_COLLECTION).find().sort({_id:-1}).toArray()
    //  console.log(AllProducts)
     resolve(AllProducts)  
    })
  },

 

  //to fetch and pass to the edit-product hbs for value=""
  getaProduct:(paramsId)=>{
    return new Promise(async(resolve,reject)=>{
      console.log('inside getaproduct')
      console.log(paramsId,"paraaaaaaaaapara")
      let a_Product = await db.get().collection(CollectionStore.PRODUCT_COLLECTION).findOne({_id:ObjectId(paramsId)})
      console.log(a_Product,"aaaaaaaaaaaaaaaaaprodddddddddddd")
      resolve(a_Product)
    
  }) 
  },

  editProduct:( bodyContent , prodId)=>{
    console.log('9999999999999999999999999999999999999999');
         return new Promise(async(resolve,reject)=>{
          await db.get().collection(CollectionStore.PRODUCT_COLLECTION).updateOne({_id:ObjectId(prodId)},
          {  
          $set: {
            prodImage1:bodyContent.prodImage1,
            prodImage2:bodyContent.prodImage2,
            prodImage3:bodyContent.prodImage3,
            prodImage4:bodyContent.prodImage4,  

            prodName:bodyContent.prodName,
            categName:bodyContent.categName,
            price:parseInt(bodyContent.price), // somehow when updating number becomes string , so we need to convert to number
            stock:parseInt(bodyContent.stock)

          }})
          resolve()
         })


    /* return new Promise(async(resolve,reject)=>{
      //checking if product name already exist other than the same item thats being edited
      let prodNameUpdExist= await db.get().collection(CollectionStore.PRODUCT_COLLECTION).findOne({prodName:bodyContent.prodName,_id:{$ne:ObjectId(paramsId)}})
      console.log(prodNameUpdExist);//test
      
      if(!prodNameUpdExist){
        //updating the values of product details in the collection
        await db.get().collection(CollectionStore.PRODUCT_COLLECTION).updateOne({_id:ObjectId(paramsId)},{$set:
        {  
          prodName:bodyContent.prodName,
          categName:bodyContent.categName,
          price:bodyContent.price,
          stock:bodyContent.stock
       }})
        resolve({permission:true})
        }

      else{
          resolve({permission:false})
      }
    }) */
  },

 /*  getProdImage:(prodId,cb(prodImage))=>{
       db.get().collection(CollectionStore.PRODUCT_COLLECTION).findOne({_id:ObjectId(prodId)}).then((data)=>{
       console.log(data.prodImage1,"dshfdsjhfkjdhfjimsssssaaaaaa");
       console.log(data.prodImage2,"dfg");
       console.log(data.prodImage3,"dfd");
       console.log(data.prodImage4,"df");
        resolve(data.prodImage1);
      })
    
    }, */

  getProdImage1:(prodId)=>{
    return new Promise(async(resolve,reject)=>{
      await db.get().collection(CollectionStore.PRODUCT_COLLECTION).findOne({_id:ObjectId(prodId)}).then((data)=>{
       console.log(data.prodImage1,"dshfdsjhfkjdhfjimsssssaaaaaa");
       console.log(data.prodImage2,"dfg");
       console.log(data.prodImage3,"dfd");
       console.log(data.prodImage4,"df");
        resolve(data.prodImage1);
      })
    })
    },
    getProdImage2:(prodId)=>{
      return new Promise(async(resolve,reject)=>{
        await db.get().collection(CollectionStore.PRODUCT_COLLECTION).findOne({_id:ObjectId(prodId)}).then((data)=>{
          resolve(data.prodImage2);
        })
      })
      },
      getProdImage3:(prodId)=>{
        return new Promise(async(resolve,reject)=>{
          await db.get().collection(CollectionStore.PRODUCT_COLLECTION).findOne({_id:ObjectId(prodId)}).then((data)=>{
            resolve(data.prodImage3);
          })
        })
        },
        getProdImage4:(prodId)=>{
          return new Promise(async(resolve,reject)=>{
            await db.get().collection(CollectionStore.PRODUCT_COLLECTION).findOne({_id:ObjectId(prodId)}).then((data)=>{
              resolve(data.prodImage4);
            })
          })
          },
  

  productDelete:(paramsId)=>{
    return new Promise(async(resolve,reject)=>{
    
      await db.get().collection(CollectionStore.PRODUCT_COLLECTION).deleteOne({_id:ObjectId(paramsId)})
      resolve()  
    })
  },


  // ============================CATEGORY====================================


  categoryInsert:(bodyContent)=>{
    return new Promise(async(resolve,reject)=>{
       // every inserting category name will convert to capitalise, next time a existing name comes, before inserting it will be converted then matched with already existing one before inserting
      bodyContent.categoryName=bodyContent.categoryName.toUpperCase(); 
      let categoryNameExist= await db.get().collection(CollectionStore.CATEGORY_COLLECTION).findOne({categoryName:bodyContent.categoryName})
      console.log(categoryNameExist)
       
      if(!categoryNameExist){
       //inserting submitted content onto collection 'The-products'
         await db.get().collection(CollectionStore.CATEGORY_COLLECTION).insertOne(bodyContent).then(()=>{ 
          console.log('inside non existance') 
          resolve({permission:true})
       })
       }
       else{
         resolve({permission:false})
       }
     })
  },

  getAllCategs:()=>{
    return new Promise(async(resolve,reject)=>{
      console.log('inside categoryfetch()')//checkpoint
    //storing fetched users in a variable
     let AllCategs= await db.get().collection(CollectionStore.CATEGORY_COLLECTION).find().toArray()
     console.log(AllCategs);
     resolve(AllCategs)  
    })
  },

  //to fetch and pass to the edit-category hbs for value=""
  categoryFetchOne:(paramsId)=>{
    return new Promise(async(resolve,reject)=>{
      let fetchedOneCategory= await db.get().collection(CollectionStore.CATEGORY_COLLECTION).findOne({_id:ObjectId(paramsId)})
      console.log('hadksjfhakjdhfkj')
        resolve(fetchedOneCategory)
    })
  },

  categoryUpdate:(bodyContent , paramsId)=>{
    return new Promise(async(resolve,reject)=>{
      console.log('inside categoryUpdate') // checkpoint
      //checking if product name already exist other than the same item thats being edited
      let categoryNameUpdExist= await db.get().collection(CollectionStore.CATEGORY_COLLECTION).findOne({categoryName:bodyContent.categoryName,_id:{$ne:ObjectId(paramsId)}})
      console.log(categoryNameUpdExist);//test
      
      if(!categoryNameUpdExist){
        //updating the values of product details in the collection
        await db.get().collection(CollectionStore.CATEGORY_COLLECTION).updateOne({_id:ObjectId(paramsId)},{$set:
        {  
          categoryName:bodyContent.categoryName
       }
       })
        resolve({permission:true})
        }

      else{
          resolve({permission:false})
      }
    })
  },

  

  categoryDelete:(paramsId)=>{
    return new Promise(async(resolve,reject)=>{

      await db.get().collection(CollectionStore.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(paramsId)})
      resolve()  
    })
  },


  /* ======================================================================   CART   ==================================================================== */

  getAllCarts:()=>{
    return new Promise(async(resolve,reject)=>{
      
  
     let AllCarts= await db.get().collection(CollectionStore.CART_COLLECTION).find().toArray()
     
     resolve(AllCarts)  
  })
},

getAllOrders:()=>{
  return new Promise(async(resolve,reject)=>{
    // this is all the orders , not just one order
    let AllOrders= await db.get().collection(CollectionStore.ORDER_COLLECTION).find().sort({DateMod:-1}).toArray()
    
    resolve(AllOrders)
 })
},

changeDeliveryStatus:(bodyContent)=>{
  return new Promise(async (resolve, reject) => {
    await db.get().collection(CollectionStore.ORDER_COLLECTION).updateOne({_id:ObjectId(bodyContent.orderId)},
    {
      $set:{ Orderstatus: bodyContent.changedstatus  }
  })
  .then(()=>{
    resolve({changed:true})
  })
  })
},
 

//////////////////////////////////////////////////////////////  HOMEPAGE(DASHBOARD) SALES /////////////////////////////////////////////////////////////
dashCounts:()=>{
  return new Promise(async (resolve, reject) => {
    let CODCount = await db.get()?.collection(CollectionStore.ORDER_COLLECTION).find({ paymentMethod: "COD" }).count()
    let PayPalCount = await db.get()?.collection(CollectionStore.ORDER_COLLECTION).find({ paymentMethod: "PAYPAL" }).count()
    let RazorpayCount = await db.get().collection(CollectionStore.ORDER_COLLECTION).find({ paymentMethod: "ONLINE" }).count()
    let totalOrders = await db.get().collection(CollectionStore.ORDER_COLLECTION).find().count()
    let totalUsers = await db.get().collection(CollectionStore.USER_COLLECTION).find().count()
    let totalRevenue = await db.get().collection(CollectionStore.ORDER_COLLECTION).aggregate([
            {$group: {
            _id: null, 
            netTotalAmount: { $sum: "$netTotalAmount" }}
          },
            {$project: {_id: 0, netTotalAmount:1}}
        ]).toArray()

    let dashCounts = {}
    dashCounts.CODCount = CODCount
    dashCounts.RazorpayCount = RazorpayCount
    dashCounts.PayPalCount = PayPalCount
    dashCounts.totalOrders = totalOrders
    dashCounts.totalUsers = totalUsers
    dashCounts.totalRevenue = totalRevenue[0].netTotalAmount
    console.log(dashCounts,"++++556")
    resolve(dashCounts)
})
},

categorySales:()=>{
  return new Promise(async (resolve, reject) => {
    let categorySales =await db.get().collection(CollectionStore.ORDER_COLLECTION).aggregate([
      { $match:{ Orderstatus:  { $in:["delivered"] }}},
      { $project: {_id:0, netTotalAmount:1, orderedProducts:1 } },
      { $unwind:'$orderedProducts'},
      { $group:{ 
        _id: {  Item:'$orderedProducts.categName'},
        totalquantity: { $sum: '$orderedProducts.quantity' },
        totalRevenue:  { $sum: '$netTotalAmount' }
      }},
      {$project:{_id:0,category:'$_id.Item',totalquantity:1,totalRevenue:1}}
    ]).toArray()
    console.log(categorySales,"___91")
    resolve(categorySales)
  })
},

transactionSales:()=>{
  return new Promise(async (resolve, reject) => {
    let transactionSales =await db.get().collection(CollectionStore.ORDER_COLLECTION).aggregate([
      { $match:{ Orderstatus:  { $in:["delivered"] }}},
      { $project: {_id:0, netTotalAmount:1, orderedProducts:1,paymentMethod:1 } },
      { $unwind:'$orderedProducts'},
      { $group:{ 
        _id: '$paymentMethod',
        totalquantity: { $sum: '$orderedProducts.quantity' },
        totalRevenue:  { $sum: '$netTotalAmount' }
      }},
      {$project:{_id:0,paymentMethod:'$_id',totalquantity:1,totalRevenue:1}}
    ]).toArray()
    console.log(transactionSales,"___92")
    resolve(transactionSales)

  })

},

topSales:()=>{
  return new Promise(async (resolve, reject) => {
    let topSales =await db.get().collection(CollectionStore.ORDER_COLLECTION).aggregate([
      { $match:{ Orderstatus:  { $in:["delivered"] }}},
      { $project: {_id:0, netTotalAmount:1, orderedProducts:1} },
      { $unwind:'$orderedProducts'},
      { $group:{ 
        _id: '$orderedProducts.prodName',
        totalQty:      { $sum: '$orderedProducts.quantity' },
        totalRevenue:  { $sum: '$netTotalAmount' },
        category:      { $push:'$orderedProducts.categName'},
        price:         { $push:'$orderedProducts.price'},

      }},
      {$project:{_id:0,product:'$_id',totalQty:1,totalRevenue:1,category:{$arrayElemAt:["$category",0]}, price:{$arrayElemAt:["$price",0]}}},
      {$sort:{totalQty:-1}},
      {$limit:3}
    ]).toArray()
    console.log(topSales,"___01")
    console.log("");
    resolve(topSales)
  })

},



getmonthlySales:()=>{
  return new Promise(async (resolve, reject) => {
   let monthlySales =await db.get().collection(CollectionStore.ORDER_COLLECTION).aggregate([
      {$match:{ Orderstatus:  { $in:["delivered"] }}},
      {$group:{ 
          _id:{month:{$month: '$dateOfOrder'}} ,
          netTotalAmount:{$sum:'$netTotalAmount'} 
        }},
      {$project:{_id:0,month: '$_id.month',netTotalAmount:1}},  //this is get rid of _id and stored the monthNum in 'month' fieldname
      {$sort:{month:-1}},
      {$limit:6},
      // {$project:{totalmonthlyAmount:1}}
   ]).toArray()


   //converting monthnumber into month
   monthlySales.forEach(item => {
    function toMonthName(month) {
        const date = new Date();
        date.setMonth(month - 1);
        return date.toLocaleString('en-US', {month: 'short'})
      }  
        item.month = toMonthName(item.month) // assign a month field and assigned with monthname after conversion
   });
   console.log(monthlySales,"**(*(%^%")
resolve(monthlySales);

   

   /* console.log(monthlySales[0],"&*&*&*");
   console.log(monthlySales[0].totalmonthlyAmount,monthlySales[0]._id,"&*&*&&*&*");
   console.log(monthlySales[1].totalmonthlyAmount);
   console.log(monthlySales[2].totalmonthlyAmount);
   console.log(monthlySales[0]._id) */
   
  })
},

//////////////////////////////////////////////////////////////  SALES REPORT /////////////////////////////////////////////////////////////

getSalesReport:()=>{
  return new Promise(async (resolve, reject) => {
    let salesReport = await db.get().collection(CollectionStore.ORDER_COLLECTION).aggregate([
        
      {$match:{ Orderstatus:  { $nin:["cancelled","pending","returned"] }}},
      { $project: {_id:0, netTotalAmount:1, orderedProducts:1 } },
      { $unwind:'$orderedProducts'},
      { $group: {
                _id : {Item:'$orderedProducts.prodName'},
                totalquantity : { $sum: '$orderedProducts.quantity' },
                totalRevenue :  {  $sum: '$netTotalAmount' }
        }},
        {$project:{_id:0,Item:'$_id.Item',totalquantity:1,totalRevenue:1}}
        
     ]).toArray();

    console.log(salesReport,"^&^&^&^&^")

    resolve(salesReport);
  })
},

getReportbyDate:(DateRange)=>{
  return new Promise(async (resolve, reject) => {
    let salesReport = await db.get().collection(CollectionStore.ORDER_COLLECTION).aggregate([
      {$match:{  dateOfOrder: { $gte: new Date(DateRange.fromDate), $lte: new Date(DateRange.toDate) }}},

      { $project: {_id:0, netTotalAmount:1, orderedProducts:1 } },
      { $unwind:'$orderedProducts'},
      { $group: {
                _id: {Item:'$orderedProducts.prodName'},
                totalquantity: { $sum: '$orderedProducts.quantity' },
                totalRevenue: {  $sum: '$netTotalAmount' }
        }},
        {$project:{_id:0,Item:'$_id.Item',totalquantity:1,totalRevenue:1}}
        
     ]).toArray();

    console.log(salesReport,"^&^&^&^&^")

    resolve(salesReport);
  })
},

//////////////////////////////////////////////////////////////  COUPON /////////////////////////////////////////////////////////////

//ADD COUPON
addCoupon: (body) => {
  //converting string to number
  body.couponDiscount = parseInt(body.couponDiscount)
  body.maxAmount = parseInt(body.maxAmount)
  body.minSpend = parseInt(body.minSpend)

  console.log(body.expiryDate,"*///***/");
  body.expiryDate = new Date(body.expiryDate)  //converting normal date format to iso date
  console.log(body.expiryDate,"*///***/");

  return new Promise(async (resolve, reject) => {
      let couponCodeExist = await db.get().collection(CollectionStore.COUPON_COLLECTION).findOne({ couponCode: body.couponCode })
      if (couponCodeExist) {
          resolve({ status: false })
      } else {
          await db.get().collection(CollectionStore.COUPON_COLLECTION).insertOne(body)
          resolve({ status: true })
      }


  })
},



//ACTIVE COUPONS
getActiveCoupons: () => {
  return new Promise(async (resolve, reject) => {
      let activeCoupons = await db.get().collection(CollectionStore.COUPON_COLLECTION).aggregate([
              {$match: {expiryDate: { $gte: new Date() }}},  //just now created date which is  todays date 
              {$project:{
                      expiryDate: { $dateToString: { format: "%d-%m-%Y ", date: "$expiryDate" } },  // to convert iso date to day-month-year format
                      couponCode: 1,
                      maxAmount: 1,
                      minSpend: 1,
                      couponDescription: 1,
                      couponDiscount: 1
                  }}
                ]).toArray()
                console.log(activeCoupons,'45454542jhh12111ss445454')
      resolve(activeCoupons)
  })
},

getExpiredCoupons: () => {
  return new Promise(async (resolve, reject) => {
      let expiredCoupons = await db.get().collection(CollectionStore.COUPON_COLLECTION).aggregate([
              { $match: {expiryDate: { $lt: new Date() }}},
              { $project:{
                      expiryDate: { $dateToString: { format: "%Y-%m-%d ", date: "$expiryDate" } },
                      couponCode: 1,
                      maxAmount: 1,
                      minSpend: 1,
                      couponDescription: 1,
                      couponDiscount: 1

                  }
              }
          ]).toArray()
      resolve(expiredCoupons)
  })
},

editCoupon: (body) => {
  console.log("inside the helper");
  console.log(body);
  return new Promise(async (resolve, reject) => {
     await db.get().collection(CollectionStore.COUPON_COLLECTION).updateOne(
              { _id: ObjectId(body.id) },
              { $set: {
                      couponCode: body.couponCode,
                      couponDescription: body.couponDescription,
                      couponDiscount: parseInt(body.couponDiscount),
                      maxAmount: parseInt(body.maxAmount),
                      minSpend: parseInt(body.minSpend),
                      expiryDate: new Date(body.expiryDate)
                  }
              }
          )
      resolve({ status: true })

  })
},

deleteCoupon: (body) => {
  console.log(body.couponId,"*&*HJHJHJ&^&^&")
  // console.log("IIIIIIjijjiIIII", couponId.offerId);
  return new Promise(async (resolve, reject) => {
       await db.get().collection(CollectionStore.COUPON_COLLECTION).deleteOne({ _id: ObjectId(body.couponId) })
      resolve({deleted:true})
  })

},

//////////////////////////////////////////////////////////////  BANNER /////////////////////////////////////////////////////////////

getBanner: () => {
  return new Promise(async (resolve, reject) => {
      let Banners= await db.get().collection(CollectionStore.BANNER_COLLECTION).find().toArray()
      //for mutliple images use forEach() method
      console.log(Banners,"dsfs")// when Banners is empty it gives an empty array, an empty is somehow not falsy, so check condition with null
      if(Banners.length>=1){   
      Banners[0].dateAdded= moment(Banners[0].dateAdded).format('lll')
      resolve(Banners)
    }
      else{
        resolve()
      }
  })
},

addBanner: (bannerContent) => {
  return new Promise(async (resolve, reject) => {
      /* details.position = "Top_Main" */
      bannerContent.dateAdded = new Date
      db.get().collection(CollectionStore.BANNER_COLLECTION).insertOne(bannerContent).then(() => {
      resolve()
      })

  })
},

editBanner:(bannerContent)=>{
  return new Promise((resolve, reject) => {
    db.get().collection(CollectionStore.BANNER_COLLECTION).updateOne({ _id: ObjectId(bannerContent.id) }, {
          $set:{ bannerTitle: bannerContent.bannerTitle,
                 bannerDescription: bannerContent.bannerDescription,
                 bannerImg1: bannerContent.bannerImg1,
                 dateAdded: new Date()   
     }}).then(() =>{
        resolve()
    })
})
},

deleteBanner: (bannerId) => {
  return new Promise((resolve, reject) => {
      db.get().collection(CollectionStore.BANNER_COLLECTION).deleteOne({ _id: ObjectId(bannerId) }).then(() => {
          resolve({ deleted: true })
      })
  })
},

fetchBannerImg:(bannerId, BannerName)=>{
  return new Promise(async (resolve, reject) => {
    let Banners = await db.get().collection(CollectionStore.BANNER_COLLECTION).findOne({ _id: ObjectId(bannerId) })
    resolve(Banners.bannerImg1)
    /*  if (BannerName === "largeImg") {
        resolve(response.largeImg)
    } else if (BannerName === "smallImg") {
        resolve(response.smallImg)
    } */
})
}

















}