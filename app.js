// Step 1 - set up express & mongoose

var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
// Step 6 - load the mongoose model for Image

var imgModel = require('./models/model');

var urlencodedParser = bodyParser.urlencoded({ extended: true })

var fs = require('fs');
var path = require('path');
require('dotenv/config');
mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected')
    });

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Set EJS as templating engine
app.set("view engine", "ejs");

// Step 5 - set up multer for storing uploaded files

var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });
// Step 7 - the GET request handler that provides the HTML UI

app.use(express.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
           res.render('imagesPage', { items: items });
        }
    });
});

app.get('/imgsearch',function(req, res) {
    console.log("Hi am i here");
    console.log(req.query.name);
    if(req.query.name === undefined) {
        req.query.name ="More";
    }
        var array = req.query.name.split(',');
        var key = " name :"
        var string = "";
        var result = [];

        for (const val of array) {
            result.push({name: val.trim()});
            string = string + "{" + key + ' ' + "'" + val.trim() + "'},";
        }
        string = string.substr(0, string.length - 1)
        //string = "["+ string + "]"
        console.log(result);


        imgModel.find({$or: result}, (err, items) => {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred', err);
            } else {
                console.log(items);
                res.render('imagesShowPage', {items: items});
            }
        });

});

app.post('/a', upload.single('image'), (req, res, next) => {
    console.log(req.body.name.length);
    //console.log(req.file.filename.length);
    if (req.body.name.length === 0 ) {
        console.log("Hi");
        res.redirect('/imgsearch');
    }
    var obj = {
        name: req.body.name,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/');
        }
    });
});
var port = process.env.PORT || '3000'
app.listen(port, err => {
    if (err)
        throw err
    console.log('Server listening on port', port)
})