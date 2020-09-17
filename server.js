
const express = require('express');
const request = require('request');
const config = require('./config.json')
const app = express();
const httpRequest = require('./httpRequest');
const mongoose = require('mongoose');
const User = require('./models/user');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const UserController = require('./controllers/user');
const bcrypt = require('bcrypt');

const GetMaterial = require("./get_materials");


mongoose.connect('mongodb+srv://admin:ntMpb3yLMRHIRYxO@cluster0.xkcpi.mongodb.net/userDb?retryWrites=true&w=majority', {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    if(req.method === "OPTIONS"){
        res.header("Access-Control-Allow-Methods","PUT, POST, PATCH, DELETE, GET")
        return res.status(200).json({});
    }
    next();
});
//authentication

const authenticate =  (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);
        const decoded = jwt.verify(token, config.authentication.key);
        req.userData = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
};

//get request to get Recipie Catagory 
app.get('/api/recipie-catagory-list',
//  authenticate,
 (req, res) => {
    httpRequest.getRecipieCatagoryList()

        .then(recipieCatagoryList => {
            res.send(recipieCatagoryList)
        })
        .catch(err => {
            console.log(err);
            res.status(500).send();
        });
});


//get request to get Recipie Catagory Ranking
app.get('/api/recipie-catagory-ranking/:categoryId', 
// authenticate,
 (req, res) => {
    const categoryId = req.params.categoryId;
    httpRequest.getRecipieCatagoryRanking(categoryId)
        .then(recipieCatagoryRanking => {
            res.send(recipieCatagoryRanking)
        })
        .catch(err => {
            console.log(err);
            res.status(500).send();
        });
});

//get request to search item on Rakuten Ichiba
app.get('/api/item-search/:keyword',
//  authenticate, 
 (req, res) => {
     const keyword = req.params.keyword;
    httpRequest.getItem(keyword)
        .then(itemList => {
            res.send(itemList)
        })
        .catch(err => {
            console.log(err);
            res.status(500).send();
        });
});


app.post('/api/user', (req, res) => {
    const username = req.body ? req.body.username : null;
    const password = req.body ? req.body.password : null;


    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        username: username,
        password: password

    });


    user
        .save()
        .then(result => {
            console.log(result);
        })
        .catch(err => console.log(err));
    res.status(201).json({
        message: 'Handling Post requests to / User',
        createProduct: user
    });

});

app.post('/api/user/signup',UserController.user_signup);

app.post('/api/user/login', UserController.user_login);

app.get("/api/user-getMaterials/:id", (req, res) => {
    const id = req.params.id;
    recipieUrl = "https://recipe.rakuten.co.jp/recipe/"+id +"/";
    GetMaterial.get_materials(recipieUrl)
      .then((materials) => {
        res.send(materials);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send();
      });
  });

const port = process.env.PORT || config.app.port;

app.listen(port, () => console.log(`listening on port ${port} ... `));

