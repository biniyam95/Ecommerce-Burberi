const mongoClient = require('mongodb').MongoClient
const state = { db: null }


module.exports.connect = function(done){
    /* const url = 'mongodb://localhost:27017'  */ //for local collection in local storage
 const url = "mongodb+srv://MongoMan:mongoman@cluster0.hok12py.mongodb.net/?retryWrites=true&w=majority"  //for cluster collection in atlas storage 
    const dbname = 'Ecommerce2'


    mongoClient.connect(url,(err,data)=>{
        if(err) 
        {return done(err)}
        else{   
            state.db = data.db(dbname) 
            done()       
        }
    })
}
module.exports.get = function(){
    return state.db
}