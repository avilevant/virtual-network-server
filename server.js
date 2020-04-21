const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const cors = require('cors')
const knex = require('knex')

const saltRounds = 10;

const ServerConfiguration = {
    listeningPort: 3003
}

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: '011029519',
        database: 'virtual-networking'
    }
});


const app = express();
app.use(bodyParser.json());
app.use(cors());

const dataBase = {
    users: [{
            id: "123",
            name: "jack",
            email: "jack@gmail.com",
            password: "123"
        },
        {
            id: "456",
            name: "jane",
            email: "jane@gmail.com",
            password: "456"
        }
    ]
}

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('no user'))
            } else {
                res.status(400).json('wrong info')
            }
        })
        .catch(err => res.status(400).json('wrong information entered'))
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
                    }).then(user => { res.json(user[0]) })
                    .then(trx.commit)
                    .catch(trx.rollback)

            })
            .catch(err => res.status(400).json('something is not right'))
    })

})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({ id })
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('no user found')
            }
        }).catch(err => res.status(400).json('not found'))
})




app.get('/api', (req, res) => {
    res.send(dataBase.users)
})

app.listen(ServerConfiguration.listeningPort, () => {
    console.log(`app running on port ${ServerConfiguration.listeningPort}`)
})