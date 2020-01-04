const {admin,db}  = require('./admin.js');

module.exports = (req,res,next) =>{
    let idToken;
  //console.log('dsad');
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else  {
      console.error('Oops! NO Token found');
      return res.status(403).json({error : 'Unauthorized Access'});
    } 
  
    admin.auth().verifyIdToken(idToken)
    .then(decodedToken =>{
      req.user = decodedToken;
      console.log(decodedToken); 
      return db.collection('users')
      .where('userId','==',req.user.uid)
      .limit(1)
      .get();   
    })
    .then(data=>{
      req.user.first_name = data.docs[0].data().first_name;
      req.user.last_name = data.docs[0].data().last_name;
      req.user.email  = data.docs[0].data().email;
    //  console.log(req.user.first_name); console.log(req.user.image_url);
      return next();
    })
    .catch(err=>{
      console.error('Error Token', err);
      return res.status(400).json(err);
    })
  }