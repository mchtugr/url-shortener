require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
//app.use(express.static('public'))

mongoose
    .connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('connected to mongodb'))
    .catch(err => console.log(err));



app.get('/', (req, res) => {
    res.json({
        msg: 'success'
    })
})

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port: ${port}`))