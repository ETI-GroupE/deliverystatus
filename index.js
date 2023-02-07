const express = require('express')
const app = express()
const pw = process.env.password;
const mysql = require('mysql2')
const dbwrite = mysql.createPool({
    host:"35.240.144.94",
    user:"root",
    password: pw,
    port:3306,
    database:'statusdb'
    
    
    })
const bodyParser = require('body-parser');

const port = 6326
app.use(bodyParser.json());



app.post("/api/v1/status",(req,res)=>{
 /* example of post body from purchHist(test data) */
 
  
 const purchHistarray = req.body.data;
 purchHistarray.forEach(object => {

    dbwrite.query("insert ignore into orderstatus values(?,?,?,?,?,?)",[1,"Order Placed",object.order_id,object.product_id,"China","Singapore"],function(err,results){
        if (err){
             res.status(400).end();
        }else{
            res.status(200).end();
            console.log("inserted into orderstatus");
        }
       
       }); 

})
});

app.get("/api/v1/status/:orderId/:productId",(req,res) =>{
    const orderId = req.params.orderId;
    const productId = req.params.productId;


    dbwrite.query("select * from orderstatus where orderId=? and productId=?",[orderId,productId],function(err,results){
        if (err || results.length==0) {
            res.status(400).end();
            //res.send(err)
        }else{
            res.json(results);
            res.status(200).end();
        }
        
           
            
        });

})

app.put("/api/v1/status/:orderId/:productId/:statusid",(req,res) =>{
    const orderId = req.params.orderId;
    const productId = req.params.productId;
    const statusId = req.params.statusid;

    statusName = getStatusName(statusId)

   

   dbwrite.query("update orderstatus set statusId=?,statusName=? where orderId=? and productId=?",[statusId,statusName,orderId,productId],function(err,results){
    if (err){
        res.status(400).end();
    }else{
         console.log("updated delivery status" );
         dbwrite.query("select * from orderstatus where statusId=? and orderId=? and productId=?",[statusId,orderId,productId],function(err,results){
            if (err || results.length == 0){
                res.status(400).end();
            }else{

                res.json(results);
                res.status(200).end();

            }
            
                 
            });
         
    }
   
    
    }); 
 

    
 
 });
 
 app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})

function getStatusName(statId){
    if (statId == 1){
        var statusName = "Order Placed"
   }
   else if (statId == 2){
       var statusName = "Preparing to ship from ship location"
  }
  else if (statId == 3){
   var statusName = "In transit to destination"
  }
  else if (statId == 4){
   var statusName = "Arrived in desination"
  } 
   else{
       var statusName = "Delivered"
  }

  return statusName

}