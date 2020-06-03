const jwt = require('jsonwebtoken')

// const auth = (req,res,next) =>{

    
//     const token = req.header['Authorization']|| req.headers['x-access-token']
//     console.log(token)
//     if(token.startsWith('Bearer ')){
//         token= token.replace('Bearer ','')
//         // token = token.slice(7,token.length)
//     }
   
//     if(token){
//         jwt.verify(token, 'whosyourdady', (err,decoded)=>{
//             if(err){
//                 return res.json('token not valid')
//             }else{
//                 req.decoded=decoded
//                 req.userId=decoded.id
//                 req.userName=decoded.name
//                 req.userToken=token
//                 next()
//             }
//         })
   
    
       
//     }else{
//         res.json('no token found')
//     }
    

    

    const auth = (req,res,next) =>{

 

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
    
