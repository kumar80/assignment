# assignment
Flobiz assignment


** While providing auth token in http header the format should be like :
            Authorization :  Bearer <token> 



 signup { 
  url : https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/signup
  form data (body) :{ 
      "password": "abcdef",
      "email" : "req@email.com",
      "bio" : "req",
      "gender" : "req",
      "age" : "8",
      "first_name" : "abc",
      "last_name" :  "def" 
      }
   return value : auth token (required for authentication)
 }
 
 login {
    url :   https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/signup
    form data(body) : {
       "password": "abcdef",
      "email" : "req@email.com",
      }
    return value : auth token (required for authentication)
}

// update user details, use auth token for respective user
  updateUser{
   url :  https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/updateuser/:email
    form data (body) :{ 
      "password": "abcdef",
      "email" : "req@email.com",
      "bio" : "req",
      "gender" : "req",
      "age" : "8",
      "first_name" : "abc",
      "last_name" :  "def" 
      }  
}

//get respective user profile 
getUserDetails {
  url : https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/user/:email
}

// post a  blog , use auth token for respective user
post {
  url :  https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/post
  form data (body) : {
      title : req.body.title,
      image_url : req.body.image_url,
      description : req.body.description,
      likeCount : 0,
      commentCount : 0
  }
}

getAllPost {
    url : https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/feed
 }
 
//get specific post by postId
getPost {
    url : https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/ :post_id
  }
  
// delete post  use auth token for respective user
 delete {
      url : https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/delete/ :post_id 
}

//comment on post  use auth token of any user
comment {
  url : https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/comment/ :post_id 
    form data (body) : {
        "body" : "qwerty"
  }
}

//like on post  use auth token of any user
like {
  url : https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/like/ :post_id 
}

//unlike on post  use auth token of any user
unlike {
  url : https://us-central1-oldmonk-cc6c9.cloudfunctions.net/api/unlike/ :post_id 
}



