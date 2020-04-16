const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const cors = require('cors')

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
    if (req.body.email === dataBase.users[0].email && req.body.password === dataBase.users[0].password) {
        res.json('success')
    } else {
        res.status(400).json('user name or password incorrect')
    }

})

app.post('/register', (req, res) => {
    const { email, name, password, phoneNumber } = req.body;
    dataBase.users.push({
        name,
        email,
        password,
        phoneNumber
    })
    res.json(dataBase.users[dataBase.users.length - 1])
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    dataBase.users.forEach(user => {
        if (user.id === id) {
            found = true;
            return res.json(user);
        }
    });
    if (!found) {
        res.status(400).json('user data not found')
    }
})

app.get('/api', (req, res) => {
    res.send(dataBase.users)
})

app.listen(3003, () => {
    console.log('app running on port 3000')
})