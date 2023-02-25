// Step 1 - set up express & mongoose

var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
const cwd = process.cwd();
var http = require('http');
var url = require('url') ;
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
const ResponseValue = require("./models/responseModel");

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


app.get('/search', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.send(items);
        }
    });
});



app.get('/imgsearch',function(req, res)
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
    var contentType = req.headers['Content-Type'];
    console.log(req.file.mimetype);
    //console.log(req.file.filename.length);
    if (req.body.name.length === 0 ) {
        console.log("Hi");
        res.redirect('/imgsearch');
    }
    var obj = {
        name: req.body.name,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: req.file.mimetype
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

app.get('/imgsearchbyname', function(req, res) {
    if(req.query.name === undefined) {
        req.query.name ="More";
    }
    var result = req.query.name;
    imgModel.find({result}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {

            res.contentType(items[0].img.contentType);
            res.send(items[0].img.data);

        }
    });

});

app.get('/documentlist', function(req, res) {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        } else {
            var array = [];
            var hostname = req.headers.host;
            var pathname = 'http://' + hostname +"/imgsearchbyname?name=";
            for (const obj of items) {
                let object = new ResponseValue(pathname+obj.name,obj.name);
                array.push(object);
            }


        }
        var myJsonString = JSON.stringify(array);
        res.contentType("application/json");
        res.send(myJsonString);
    });

});