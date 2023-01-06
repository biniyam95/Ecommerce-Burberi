var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

//importing hbs
var hbs = require('express-handlebars')

//imported db connection whole module
var db = require("./dbConnectionEstablishment/connection");

//import session
var session = require("express-session");

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// //fileupload
// var fileupload= require('express-fileupload')

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//to set default layout and default folders to use
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/',
  //helper used to import additional functions
  helpers:{
    //function to check conditional statements
    isEqual: function(status, value, options) {
      if (status == value) {
        return options.fn(this)
      }
      else{
      return options.inverse(this)
    }
    },
    isLesser:(status, value1, value2, options)=>{
      if(status <= value1 && status > value2) {
        return options.fn(this)
      }
      return options.inverse(this)
    },
    isGreater:(status, value, options)=>{
      if(status > value) {
        return options.fn(this)
      }
      return options.inverse(this)
    },
    isStatGreater:(status1, status2, options)=>{
      if(status1 >= status2) {
        return options.fn(this)
      }
      return options.inverse(this)
    },


    
    // Function to do basic mathematical operation in handlebar
    math: function(lvalue, operator, rvalue) 
    {   lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    }
}
}))

//to use imported modules
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//res.header or res.set used as a middleware because everytime you wanna use it , it will automatically use this like any other modules imported above
app.use((req,res,next)=>{
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next()
})   

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// //fileupload use
// app.use(fileupload())

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




// SESSION 
app.use(session(
  {secret:'youalreadyknowme',cookie:{maxAge:60000000000}
}))

//db connection establishment on port
db.connect((err)=>{
  if(!err){
    console.log('Database successfuly connected on the database port 27017 ')
  }
  else{
    console.log('connection error has occured'+err)
  }
})



//default setting up of user and admin routes
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
