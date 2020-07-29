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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const db = knex({
    client: 'pg',
    connection: {
        connectionString : process.env.DATABASE_URL,
        ssl:true
    }
});


const app = express();


app.use(cors());
app.use(bodyParser.json());





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



// //create a v-card
// app.get('/vCard',(req,res)=>{
//     const vCardsJS = require('vcards-js');
    
//     //create new vCard
//     vCard = vCardsJS();

//     //set props
//     vCard.Name = req.body.name
//     vCard.business = req.body.business
//     vCard.share = req.body.share
//     //set content-type and disposition including desired filename
//     res.set('Content-Type', 'text/vcard; name="enesser.vcf"');
//     res.set('Content-Disposition', 'inline; filename="enesser.vcf"');
    
//     try{
//         //send the response
//         res.send(vCard.getFormattedString());
//     }catch(e){
//         res.status(401).json('could not send data: ',e)
//     }
    


// })



//create a v-card
app.get('/vCard/:id',(req,res)=>{
    const vCardsJS = require('vcards-js');
    console.log('called')
    //create new vCard
    vCard = vCardsJS();

    // get params for user from DB
    const { id } = req.params;
    db.select("*").from('users')
    .where({id:id})
    .then(users=>{

        console.log('user: ', users[0])
         //set props
    vCard.Name = users[0].name
    vCard.business = users[0].business
    vCard.share = users[0].share
    //set content-type and disposition including desired filename
    res.set('Content-Type', 'text/vcard; name="enesser.vcf"');
    res.set('Content-Disposition', 'inline; filename="enesser.vcf"');
     //send the response
     res.send(vCard.getFormattedString());  
    
    }
    ).catch(err =>res.status(401).json('could not send data: ',err))
})



// get data from user for images url, and upload to db
app.post('/uploadImg/:id',auth, (req,res)=>{
    let tempUrl = req.body.url
    const { id } = req.params; 
    db("users").where({id:req.userId})
    .update( id === "1" ? {
        business_background_pic:tempUrl,
    } : {
        business_small_pic:tempUrl
    }).then(res.json('uploaded'))
    .catch(err => console.log(err))
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





app.post('/profile',auth, (req,res)=>{
    const { email, name, location, phone, website, faceBookPage, InstagramPage, youTube, arrayOfCards, mybizz, BizzNetArray,linkedIn,twitter,jobdescription, userData } = req.body
            console.log(req.userId)
            return db('users')
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
                business_linkedin:linkedIn,
                business_twitter:twitter,
                jobdescription:jobdescription,
                userdata:userData
                
    
            }).then(res.json('all is well'))
           
            
            .catch(err =>{
                // res.status(400).json('no good')
                 console.log(err)

        })
      
    })





app.get('/profile/',auth, (req, res) => {
    db.select('*').from('users').where({id:req.userId})
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('no user found')
            }
        }).catch(err => res.status(400).json('not found'))
})




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

// app.get('/service-worker.js', (req,res)=>{
//     res.sendFile(path.resolve(__dirname, '..','build', 'service-worker.js'))
// })

app.listen(ServerConfiguration.listeningPort, () => {
    console.log(`app running on port ${ServerConfiguration.listeningPort}`)
})

