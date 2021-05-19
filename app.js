require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static('public'))


// connect to mongodb Atlas
mongoose
    .connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('connected to mongodb'))
    .catch(err => console.log(err));

const Schema = mongoose.Schema;

const urlSchema = new Schema({
    url: String,
    hash: String
})

const Url = mongoose.model('Url', urlSchema);


// check whether url begins with 'http:' or 'https:'
const isValidHttpUrl = string => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


app.post('/api/shorturl', (req, res) => {
    let url = req.body.url;
    // if it is not a valid url, respond error
    if(!isValidHttpUrl(url)){
        return res.status(400).json({ error: 'Invalid URL'} )
    }
    Url.findOne({ url })
        .then(url => {
            // if the url is already in the database, it fetches the url
            if(url) {
                res.json({
                        original_url: url.url,
                        short_url: url.hash
                    })
            // it creates another collection in the database
            }else {
                let hash = nanoid(5);
                const newUrl = new Url({
                    url: req.body.url, hash
                })
                newUrl
                    .save()
                    .then(url => res.json({
                        original_url: url.url,
                        short_url: url.hash
                    }))
                    .catch(err => console.log(err))
            }
        })
})

// fetches the original url via short url
app.get('/api/shorturl/:url', (req,res) => {
    const url = req.params.url;
    Url.findOne({hash: url})
        .then(foundUrl => {
            res.redirect(foundUrl.url)
        })
        .catch(() => {
            res.redirect('/')
        })
})

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port: ${port}`))