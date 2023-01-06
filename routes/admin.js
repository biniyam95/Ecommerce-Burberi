var express = require("express");
var router = express.Router();


/* multer import */
const multer = require("multer");

// <------ MULTER middleware - PRODUCT -MULTIPLE IMAGES -------->
const ProductStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/product-images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const uploadProd = multer({ storage: ProductStorage }).fields([{ name: 'prodImage1', maxCount: 1 }, { name: 'prodImage2', maxCount: 1 }, { name: 'prodImage3', maxCount: 1 }, { name: 'prodImage4', maxCount: 1 }])
//------------------------------------------------

// <------ MULTER middleware - BANNER -MULITPLE IMAGES -------->
const BannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/product-images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const uploadBanner = multer({ storage: BannerStorage }).fields([{ name:'bannerImg1', maxCount: 1 }])
//------------------------------------

let {
  LOGIN,LOGIN_PO,HOME,LOGOUT,
  USER_LIST,USER_BLOCK,USER_UNBLOCK,
  PRODUCT_LIST,ADD_PRODUCT,ADD_PRODUCT_PO,EDIT_PRODUCT,EDIT_PRODUCT_PO,PRODUCT_DELETE,
  CATEGORY_LIST,ADD_CATEGORY,ADD_CATEGORY_PO,EDIT_CATEGORY,EDIT_CATEGORY_PO,DELETE_CATEGORY,
  CART_LIST,ORDER_LIST,CHANGE_DELIVERY_STATUS,
  SALES_REPORT,SEARCH_BY_DATE_PO,
  Coupon_List,Add_Coupon_post,Edit_Coupon_post,Delete_Coupon_post,
  Banner_List,Add_Banner_post,Edit_Banner_post,Delete_Banner,
 
  SAMPLE
} = require("../Controllers/adminController");

/* -------------------  middleware to verify login  ----------------- */
const verifyAdLogin = (req, res, next) => {
    if (req.session.adminloggedIn) { next() } 
    else { res.redirect("/admin") }
};

/*...............................   ROUTES   ...............................*/

// Admin
router.get("/", LOGIN);
router.post("/", LOGIN_PO);
router.get("/admin-home", verifyAdLogin, HOME);
router.get("/admin-logout",LOGOUT);

// User
router.get("/user-List", verifyAdLogin,USER_LIST);
router.get("/block-user/:id", verifyAdLogin, USER_BLOCK);
router.get("/unblock-user/:id", verifyAdLogin, USER_UNBLOCK);

// Product
router.get("/product-List", verifyAdLogin, PRODUCT_LIST);
router.get("/add-product", verifyAdLogin, ADD_PRODUCT);
router.post("/add-product", uploadProd, ADD_PRODUCT_PO);
router.get("/edit-product/:id", verifyAdLogin, EDIT_PRODUCT);
router.post("/edit-product/:id",uploadProd,EDIT_PRODUCT_PO);
router.get("/delete-product/:id", verifyAdLogin,PRODUCT_DELETE);

// Category
router.get("/category-List", verifyAdLogin, CATEGORY_LIST);
router.get("/add-category", verifyAdLogin,ADD_CATEGORY);
router.post("/add-category",ADD_CATEGORY_PO );
router.get("/edit-category/:id", verifyAdLogin,EDIT_CATEGORY);
router.post("/edit-category/:id", EDIT_CATEGORY_PO);
router.get("/delete-category/:id", verifyAdLogin,DELETE_CATEGORY);

// Orders
router.get("/cart-List", verifyAdLogin,CART_LIST);
router.get("/order-List", verifyAdLogin, ORDER_LIST);
router.post('/change-delivery-status',CHANGE_DELIVERY_STATUS);

// Salesreport
router.get('/sales-report',SALES_REPORT);
router.post("/searchByDate",SEARCH_BY_DATE_PO);

// Coupon
router.get("/coupon-List",Coupon_List);
router.post("/add-coupon",Add_Coupon_post)
router.post("/edit-coupon",Edit_Coupon_post);
router.post('/delete-coupon', Delete_Coupon_post);

// Banner
router.get('/banner-List',Banner_List);
router.post('/add-banner', uploadBanner , Add_Banner_post);
router.post('/edit-banner/', uploadBanner , Edit_Banner_post);
router.get('/delete-banner/:id',Delete_Banner);




// sample
router.get("/sample",SAMPLE);


module.exports = router;
