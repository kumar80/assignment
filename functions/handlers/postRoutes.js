const {admin, db} = require('../utility/admin.js');

exports.getAllFeed  =(req, res) => {
    admin
      .firestore()
      .collection('posts')
      .get()
      .then((data) => {
        let allPosts = [];   
        data.forEach((doc) => {                             
          allPosts.push({
            title : doc.data().title,
            description : doc.data().description,
            image_url : doc.data().image_url,
            post_id: doc.id,
            author: doc.data().author, 
            created_at: doc.data().created_at,
            updated_at: doc.data().updated_at,
            commentCount: doc.data().commentCount,
            likeCount: doc.data().likeCount
          });
          //console.log('45600')
        });
        return res.json(allPosts);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
  }

  exports.createPost = (req, res) => {
    if (req.body.description.trim() === '') {
      return res.status(400).json({ body: 'Body must not be empty' });
    }
  
    const newPost = {
      title : req.body.title,
      author: req.user.first_name + " " + req.user.last_name,
      image_url : req.body.image_url,
      description : req.body.description,
      created_at: new Date().toISOString(),
      likeCount : 0,
      email : req.user.email,
      userId : req.user.uid,
      commentCount : 0
    }; 
    newPost.updated_at = newPost.created_at;
    admin
      .firestore()
      .collection('posts')
      .add(newPost)
      .then((doc) => {
        const resPost = newPost;
        resPost.post_id = doc.id;
        res.json(resPost);
      })
      .catch((err) => {
        res.status(500).json({ error: 'something went wrong' });
        console.error(err);
      });
  }

  exports.getPost = (req,res) =>{
    let postData ={};
    //console.log(req);
    db.doc(`/posts/${req.params.post_id}`).get()
    .then(doc =>{
      if(!doc.exists) return res.status(400).json({error:'Post Not Found'});
     
      postData = doc.data();

     // console.log(postData);
      postData.post_id = doc.id;
      return db.collection('comments').
      orderBy('createdAt','desc').where('post_id','==', req.params.post_id).get();
    })
    .then (data =>{
      postData.comments=[];
      data.forEach(doc =>{
        postData.comments.push(doc.data());
      }); 
      return res.json(postData);
    }).catch(err => {
      console.error(err);
      res.status(500).json({error : err.code});
    });
  }
  
  exports.updatePost = (req,res) =>{
    //console.log(req);
    db.doc(`/posts/${req.params.post_id}`).get()
    .then(doc =>{
      if(!doc.exists) return res.status(400).json({error:'Post Not Found'});
     
    // INSERTING NEW DATA  
    let newData  = {};
    if(req.body.title) newData.title = req.body.title; 
    if(req.body.author) newData.author = req.body.author;
    if(req.body.image_url) newData.image_url = req.body.image_url;
    if(req.body.description) newData.description = req.body.description;
    newData.updated_at = new Date().toISOString();
    db.doc(`/posts/${req.params.post_id}`).update(newData);

    return res.json({message : ' Data updated!'} );
  })
}

  // commenting 
  exports.comment = (req,res) =>{
      if(req.body.body.trim()==='') return res.status(400).json({comment :'Empty comment not allowed'});

      const newComment = {
         body: req.body.body,
         createdAt : new Date().toISOString(),
         post_id : req.params.post_id,
         commented_by : req.user.first_name + " " +  req.user.last_name,
         commented_by_uid : req.user.uid
       //  userImage : req.user.image_url
        };

        db.doc(`/posts/${req.params.post_id}`).get()
        .then(doc =>{
          if(!doc.exists){
            return res.status(400).json({error : 'Post doest not exists'});
          }
          return doc.ref.update({commentCount : doc.data().commentCount + 1});
        })
        .then(()=>{
          return db.collection('comments').add(newComment);
        })
        .then(()=>{
          return res.json(newComment);
        }) 
        .catch(err =>{
          console.error(err);
          res.status(500).json({error : 'Oops!'});
        })
  }

  exports.likePost = (req, res) => {
     
    const likeDoc =db.collection('likes').where('liked_by_uid','==', req.user.uid)
    .where('post_id','==',req.params.post_id).limit(1);

        const postDoc = db.doc(`/posts/${req.params.post_id}`);
        let postData = {};

        postDoc.get() 
          .then(doc=>{
            if(doc.exists){
              postData = doc.data();
              postData.postId = doc.id;
              return likeDoc.get();
            }
            else {
              res.status(500).json({message : 'Post Does Not Exists'});
            }
          })
          .then(data => {
            if(data.empty){
              return db.collection('likes').add({
                post_id : req.params.post_id,
                liked_by_uid : req.user.uid,
                liked_by_email : req.user.email,
                created_at : new Date().toISOString()                
              }).then (()=> {
                postData.likeCount++;
                return postDoc.update({likeCount : postData.likeCount});
              }).then(()=>{
                return res.json(postData);
              })
            }
              else {
                return res.status(400).json({error : 'Cannot like twice'});
              }
          }).catch(err=>{
            console.error(err);
            return res.status(500).json({error : err.code});
          })
  }

  exports.unlikePost = (req, res)=>{
      
    const likeDoc =db.collection('likes').where('liked_by_uid','==', req.user.uid)
    .where('post_id','==',req.params.post_id).limit(1);

        const postDoc = db.doc(`/posts/${req.params.post_id}`);
        let postData = {};

        postDoc.get() 
          .then(doc=>{
            if(doc.exists){
              postData = doc.data();
              postData.post_id = doc.id;
              return likeDoc.get();
            }
            else {
              res.status(500).json({message : 'post Doest Exists'});
            }
          })
          .then(data => {
            if(data.empty){
              return res.status(400).json({error : 'Cannot unlike'});
            }
              else {
                console.log(data.docs[0].id);
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                .then(()=>{
                    postData.likeCount--;
                    return postDoc.update({likeCount : postData.likeCount});
                })
                .then(()=>{
                  return res.json(postData);
                })
              }
          }).catch(err=>{
            console.error(err);
            return res.status(500).json({error : err.code});
          })
  }

  exports.deletePost = (req, res) =>{
        const post =db.doc(`/posts/${req.params.post_id}`); 
        post.get().then( doc =>{
         // console.log(doc.data().email);

            if(!doc.exists) {
              return res.status(500).json({error : 'Post not found'});
            }
            if(doc.data().email !== req.user.email){
              return res.status(403).json({error :'You cannot delete others Post '});
            } else {
              return post.delete();
            }
        })
        .then(()=>{
          
          res.json({message : 'Post deleted successfully'});
        })
        .catch(err=>{
          console.error(err);
          res.status(500).json({error : err.code});
        })
}