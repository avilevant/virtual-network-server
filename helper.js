const jwt = require('jsonwebtoken')

     const auth = (req,res,next) =>{

 
        console.log(req.header)
        const token = req.header('Authorization').replace('Bearer ','')
        let decoded = null;
        try{
        decoded = jwt.verify(token, 'whosyourdady')
    }catch(e){
        res.status(401).json('could not auth: ', e)
    }   
        // console.log(decoded.id)
        req.userId=decoded.id
        req.userName=decoded.name
        req.userToken=token
        next()
    

}

// try{

//     const token = req.header['Authorization']|| req.headers['x-access-token']
//     if(token.startsWith('Bearer ')){
//         token= token.replace('Bearer ','')
//     }
   
//     const decoded = jwt.verify(token, 'whosyourdady')
   
//     // console.log(decoded.id)
//     req.userId=decoded.id
//     req.userName=decoded.name
//     req.userToken=token
//     next()
// }catch(e){
//     res.status(401).json('could not auth')
// }




module.exports=auth;
    
