var request = require('request');
var config  = require('../config');

var fs   = require('fs');
var path = require('path');
var fut  = require('futures').sequence;

var assetDir = path.join(__dirname, '/assets/images/');

// 'node index.js demo'
// should use demo mode ?
if(process.argv.length === 3 && process.argv[2] === 'demo') {
    assetDir = path.join(__dirname, '/assets/images_demo/');
}

fs.exists(config.uploadDir, function (exists) {
    if(!exists) fs.mkdir(config.uploadDir);
});

var assetsSeq = new fut();

fs.readdir(assetDir, function (err, files) {
    if(err) throw err;

    files.forEach(function (file) {

        assetsSeq.then(function (next) {

            var req  = request.post(config.url + '/meals/');
            var form = req.form()

            form.append('title', path.basename(file, '.jpg'));
            form.append('amount', 1);
            form.append('image', fs.createReadStream(assetDir + path.basename(file)));

            req.on('response', function (response) {
                console.log(file + ' added.');
                next();
            });

        });
    });
});

var mealtimesMigration = [
    { id: 'mealtime_1', title: 'A - 12:30'},
    { id: 'mealtime_2', title: 'B - 13:15'},
    { id: 'mealtime_3', title: 'C - 14:00'},
];

var mealtimeSeq = new fut();

mealtimeSeq

    .then(function (next) {

        request({
            uri     :  config.url + '/mealtimes/',
            method  : 'GET',
            json: true
        }, function (error, response, mealtimes) {
            if(mealtimes.length < mealtimesMigration.length) {
                next();
            } else {
                console.log('mealtimes already exists.');
            }
        });

    })

    .then(function () {

        mealtimesMigration.forEach(function (item) {
            request({
                uri     :  config.url + '/mealtimes/',
                method  : 'POST',
                body    : {
                    id   : item.id,
                    title: item.title
                },
                json: true
            }, function () {
                console.log('Added mealtime: ' + item.id + ' ' + item.title);
            });
        });
    })


