const {admin, db} = require('../utility/admin.js');

const  config = require('../utility/config.js');
const {validateSignup,validateLogin} = require('../utility/validators.js');

const firebase = require('firebase');
firebase.initializeApp(config);

exports.signup =  (req,res)=>{
    let newUser ={
      password: req.body.password,
      email : req.body.email,
      bio : req.body.bio,
      gender : req.body.gender,
      age : req.body.age,
      created_at: new Date().toISOString(),
      first_name : req.body.first_name,
      last_name :  req.body.last_name
    };
        //  validating data
    const {valid, errors } = validateSignup(newUser);
      if(!valid) return res.status(400).json(errors); 
  
    const defaultImage =  'blank_img.png';

    let userId,token;
      db.doc(`/users/${newUser.email}`).get()
      .then(doc=>{
        if(doc.exists) return res.status(400).json({message:`user ${newUser.email} already exists, try another`});
        else {
          return  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      }).then(data=>{
      //  console.log(data);
        userId = data.user.uid;
        return data.user.getIdToken();
      }).then((xyz)=>{        // INSERT USER 
        token = xyz;         
          newUser.createdAt = new Date().toISOString();
          newUser.user_image_url = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${defaultImage}?alt=media`;
          newUser.userId = userId;        
  
        return db.doc(`/users/${newUser.email}`).set(newUser);
      })
      .then(()=>{
        return res.status(201).json({message:'Signup Succesful your auth token is : ', token}); 
      })
      .catch(err=>{
        console.error(err);
        if(err.code === "auth/email-already-in-use")
        return res.json({message:`${newUser.email} already exists`});
        else 
        return res.status(500).json({message : 'Signup Error'});
      }); 
  
    //  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    //     .then( (data) =>{
    //       return res.status(201).json({message :`user ${data.user.uid} created!` });
    //     })
    //     .catch( (err) =>{
    //       console.error(err);
    //       return res.status(500).json({error: err.code});
    //     });
    //res.send("ok");
  }

  exports.login  =(req,res)=> {

    const user = {
      email : req.body.email,
      password : req.body.password
    };
    const {errors,valid} = validateLogin(user);
    if(!valid) return res.status(400).json(errors); 

    firebase.auth().signInWithEmailAndPassword(user.email,user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token=>{
      return res.json({token});
    })
    .catch(err=>{
      console.error(err);
      return res.status(500).json({error:err.code});
    });
  }
 

  exports.updateUserDetails = (req,res) => {
 //   console.log(req.params.email);
    db.doc(`/users/${req.params.email}`).get()
    .then(doc=>{
      if(!doc.exists) return res.json({message : 'User doesnot Exists'});
    })
    let newUserDetails = {};

    if(req.body.email) newUserDetails.email = req.body.email; 
    if(req.body.first_name) newUserDetails.first_name = req.body.first_name; 
    if(req.body.last_name) newUserDetails.last_name = req.body.last_name; 
    if(req.body.password) newUserDetails.password = req.body.password; 
    if(req.body.age) newUserDetails.age = req.body.age; 
    if(req.body.bio) newUserDetails.bio = req.body.bio; 

     newUserDetails.updated_at = new Date().toISOString();

    db.doc(`/users/${req.params.email}`).update(newUserDetails)
    .then(()=> {
      return res.json({message : 'Details Updated !' });
    }).catch(err => {
      console.error(err);
      return res.status(500).json({error : err.code});
    });

  }

  // get user details 

  exports.getUserDetails = (req, res) =>{ 
    let userData = {};
    db.doc(`/users/${req.params.email}`).get()
    .then(doc=>{
      if(doc.exists){
        userData.user = doc.data();
        return db.collection('posts').where('email','==', req.params.email)
        .get();
      } else return res.status(404).json({error:'user Not Found'});
    }).then(data=>{
      userData.posts = []; 
      data.forEach(doc=>{
         userData.posts.push({
          description : doc.data().description,
          createdAt : doc.data().createdAt,
          title : doc.data().title,
          image_url : doc.data().image_url,
          likeCount : doc.data().likeCount,
          commentCount : doc.data().commentCount,
          post_id : doc.id  
        }) 
       //  console.log(doc);
      });
      return res.json(userData);
    }).catch(err=>{
      console.error(err);
      res.status(501).json({error : err.code});
    })
  }
