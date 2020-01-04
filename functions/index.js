

const functions = require('firebase-functions');
//const  config = require('./utility/config.js');


const {admin, db} = require('./utility/admin.js')

const express = require('express');
const app = express();
//Auth 
const firebaseAuth  = require('./utility/firebaseAuth.js');
const {getAllFeed,createPost,getPost,updatePost,comment,likePost,unlikePost,deletePost}  = require('./handlers/postRoutes.js');
const {signup,login,updateUserDetails,getUserDetails}  = require('./handlers/users.js');


// output all posts
app.get('/feed',getAllFeed);
// create a post 
app.post('/post',firebaseAuth,  createPost);
//retrieve post
app.get('/:post_id', getPost) ;
//delete
app.delete('/delete/:post_id', firebaseAuth,  deletePost );
app.post('/update/:post_id', firebaseAuth, updatePost);

//comment
app.post('/comment/:post_id',firebaseAuth, comment) ;
//like & unlike
app.get('/like/:post_id', firebaseAuth,  likePost);
app.get('/unlike/:post_id',firebaseAuth, unlikePost);

//signup
app.post('/signup',signup);
//login
app.post('/login',login);

//adding User Details 
app.post('/updateUser/:email', firebaseAuth,updateUserDetails);

app.get('/user/:email',getUserDetails);
exports.api = functions.https.onRequest(app);

