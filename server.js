const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const cors = require('cors')
const knex = require('knex')
const jwt = require('jsonwebtoken')
const auth = require('./helper')

const saltRounds = 10;

const ServerConfiguration = {
    listeningPort: process.env.PORT || 3003
}

const db = knex({
    client: 'pg',
    connection: {
        connectionString : process.env.DATABASE_URL,
        ssl:true
    }
});


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.json({limit: '200mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}))
app.use(cors());





app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid ) {
            
              db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        const token =  jwt.sign({id:user[0].id,name:user[0].name},'whosyourdady')
                        console.log("token is the best token: ",token)
                       res.status(200).send({token: token, user:user[0]})
                    })
                    .catch(err => res.status(400).json("no good"))
            } else {
                res.status(400).json('wrong info')
            }
        })
        .catch(err => res.status(400).json('wrong information entered'))
})


//get data from user for images url, and upload to db
app.post('/uploadImg',auth, (req,res)=>{
    // console.log(req.userId) 
    db("users").where({id:req.userId})
    .update({
        business_background_pic:req.body.url1,
        business_small_pic:req.body.url2
    }).then(res.json('uploaded'))
    
    .catch(err => res.status(400).json('no good'))
})



app.post('/register', (req, res) => {
    const { email, name, password, phone } = req.body;
    const hash = bcrypt.hashSync(password, saltRounds);
    db.transaction(trx => {
        trx.insert({
                hash: hash,
                email: email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0],
                        name: name,
                        phone: phone
                    }).then(user => {
                        const token =  jwt.sign({id:user[0].id},'whosyourdady')
                        console.log("token is the best token: ",token)
                        res.status(200).send({token: token, user:user[0]})
                        // .json(user[0])
                     })
                    .then(trx.commit)
                    .catch(trx.rollback)

            })
            .catch(err => res.status(400).json('something is not right: ', err))
    })

})


//signout option....

// app.post('/logout',auth,(req,res)=>{
//     req.token=''
//     res.json('signed out safely')
    
        
    
// }).catch(e =>res.status(500).json('could not sign out'))

// console.log(db.select('*').from('users').then(user=>{console.log(user[0].id)}));



app.post('/profile',auth,(req,res)=>{
    const { email, name, location, phone, website, faceBookPage, InstagramPage, youTube, arrayOfCards, mybizz, BizzNetArray,linkedIn} = req.body
            console.log(req.userId)
            db('users')
            .where({id:req.userId})
            .update({
                business_name: name,
                business_phone: phone,
                business_email: email,
                business_location: location,
                business_website: website,
                business_facebook: faceBookPage,
                business_instagram: InstagramPage,
                business_youtube: youTube,
                business_arrayofcards: arrayOfCards,
                business_mybizz: mybizz,
                business_network: BizzNetArray,
                business_linkedIn:linkedIn
    
            }).then(res.json('all is well'))
           
            
            .catch(err =>{
                 res.status(400).json('no good')
                 console.log(err)

        })
      
    })





// app.get('/profile/:id', (req, res) => {
//     const { id } = req.params;
//     db.select('*').from('users').where({ id })
//         .then(user => {
//             if (user.length) {
//                 res.json(user[0])
//             } else {
//                 res.status(400).json('no user found')
//             }
//         }).catch(err => res.status(400).json('not found'))
// })




app.get('/personalprofile/:id', (req, res) => {
    const { id } = req.params;
    console.log(req.params)
    db.select("*").from('users')
    .where({id:id})
    .then(users=>{

        res.send(users[0])
    }
    )
    .catch(err=>res.status(400).json('did not get users'))
})



app.listen(ServerConfiguration.listeningPort, () => {
    console.log(`app running on port ${ServerConfiguration.listeningPort}`)
})

