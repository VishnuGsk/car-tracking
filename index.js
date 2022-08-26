const express = require ('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { urlencoded } = require('express');
const {body,checkSchema, validationResult} = require('express-validator')

app.use(express.json())
app.use(cors({
  origin:["http://localhost:3000"],
  methods:["GET" ,"POST"],
  credentials : true
}));
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())
app.use(session({
  key:"name",
  secret:"vishnu",
  resave:false,
  saveUninitialized:false,
  cookie:{
    expires:60*60*24,
  },
  

}));
const db = mysql.createConnection(
    {
      user:'root',
      host:'localhost',
      password:'password',
      database:"db_secure",
    }
  );

  app.post("/Signup" , (req, res)=>{
      const username = req.body.username;
      const password = req.body.password;
      console.log(username);
    
        db.query("INSERT INTO user (name ,password) VALUES(?,?)",
        [username,password],
        (err,result)=>{
          res.send(result);
          console.log(result);
    
        }
       )
       
  

      
   

});
app.post("/delete",(req,res)=>{
  const  iduser=req.session.iduser
  db.query("UPDATE car_details SET lattitude = ? ,longitude=? WHERE iduser = ?",
    [null,null,iduser ],
    (err,result)=>{
    if(err){
        console.log(err)
      }
      res.send(result);
      console.log(result);
  
    })
})
app.get("/Main",
 (req,res)=>{

  const  iduserr=req.session.iduser
 
  db.query("SELECT * from car_details Where iduser = ? ",[iduserr],(err,result)=>{
   const latt = result;
    console.log(req.session.iduser)
    res.send ({id:iduserr });
    console.log(result);
   
  })
})
app.get("/LoginPage" ,(req,res)=>{
    
  if(req.session.loggedin ){
    res.send({loggedin : true , user : req.session.username , id :req.session.iduser });
  }else if (req.session.loggedin === false ){
    // Not logged in
    res.send({loggedin :false });
  }
  else {
    res.send("no data found");
  }
});
// app.post("/Main" ,(req,res)=>{
//   const location = req.body.location;
//   const username = req.body.username;
//   // console.log(username);
//   console.log(location);
//   db.query("UPDATE user SET location = ?  WHERE name = ?",
//   [location , username],
//   (err,result)=>{
//   if(err){
//       console.log(err)
//     }
//     res.send(result);
//     console.log(result);

//   }
//  )

// })

const check= {
  lattitude: {
    notEmpty: true,
    errorMessage: "Lattitude field cannot be empty"
},
}
app.post('/Main' ,checkSchema(check)
,async (req,res)=>{
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(400).json({
          errors: errors.array()
      });
  }

  res.status(200).json({
      success: true,
      message: 'All Values Ok ',
  });
  const iduser=  req.session.iduser
  const location=req.body.location;
  const carname =req.body.carname;  
  const cartype=req.body.cartype;
  const regno =req.body.regno;
  const carcolor=req.body.carcolor;
  const lattitude=req.body.lattitude;
  const longitude=req.body.longitude;
 
  
    console.log(iduser + "is the user id");
try{
  const query = await db.query("INSERT INTO car_details (iduser,car_name,car_type,car_color,reg_no,lattitude,longitude,location) VALUES(?,?,?,?,?,?,?,?)",
  [iduser,carname,cartype,carcolor,regno,lattitude,longitude,location],
  (err,result)=>{
  if(err){
      console.log(err)
    }
    req.session.error=false;
    // res.send(result);
    console.log(result);
   
  }
 )
 

}
finally{
  db.end();
}

   
  




  

})

app.post('/update',(req,res)=>{
  const lattitude = req.body.lattitude
  const longitude = req.body.longitude
  const  iduser=req.session.iduser
  console.log(iduser);
  console.log(lattitude);
  db.query("UPDATE car_details SET lattitude = ? ,longitude=? WHERE iduser = ?",
    [lattitude,longitude,iduser ],
    (err,result)=>{
    if(err){
        console.log(err)
      }
      res.send(result);
      console.log(result);
  
    })
})
app.post('/LoginPage' , (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  db.query("SELECT *  FROM user where name = ? AND password = ? ;",
  [username,password],
  (error,results)=>{
    if (error) throw error;
    // If the account exists
    console.log(results);
    if (results.length >0) {
      // Authenticate the user
      req.session.loggedin = true;
     
      req.session.username = results[0].name;
      req.session.iduser=results[0].iduser;
      console.log(req.session.iduser);
      console.log('Logged in ');
       // Redirect to home page
      res.send(results);
    } else if (results.length == 0){
      req.session.loggedin = false ;
      console.log(req.session.loggedin)
      console.log("Incorrect uss pass")
     
    }			
    res.end();
        })

 });
app.listen(3003,()=>{
    console.log('Server running')
})



