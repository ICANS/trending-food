var request = require('request');
var config  = require('../../config');

var fs      = require('fs');
var path    = require('path');
var seq     = require('futures').sequence;
var colors  = require('colors');

var assetDir = path.join(__dirname, '/assets/images/');

var sys = require("sys");
var stdin = process.openStdin();

var say = function (message) {
    message.forEach(function (e, i) {
        console.log(e);
    });
};

var exec = require('child_process').exec,
    child;

/**
 * Request alife status
 *
 * Lets check if the app is already running
 */

request({
    uri     :  config.url + '/alife',
    method  : 'GET'
}, function (error, response) {
    if(response && response.statusCode === 418) {
        say(generalHandler.messages.welcome);
    } else {
        say(generalHandler.messages.notAlife);
        process.exit();
    }
});

/**
 * Input Listener
 *
 * Keep tracking of the user input
 */

var validateInput = function(d) {

    var input = d ? d.toString().substring(0, d.length-1) : null;
    var respond = validateInput;

    console.log("=====================================================".grey);

    switch(input) {
        case '1': generalHandler.addDirectories(respond); break;

        case '2': mealsHandler.addBunch(respond, 8); break;
        case '3': mealsHandler.addBunch(respond); break;
        case '4': mealtimesHandler.addBunch(respond); break;

        case '5': backupHandler.dump(respond); break;
        case '6': backupHandler.restore(respond); break;

        case 'q':
                console.log('Bye');
                process.exit();
            break;
        default:
            say(generalHandler.messages.welcome);
        break;
    }
}

stdin.addListener("data", validateInput);

/**
 * General Hanlder
 * ===================================================================================================
 */

var generalHandler = {

    messages: {
        welcome: [
            '',
            'Hey there, what do you want to ' + 'bake'.inverse + '?',
            '',
            'General'.cyan + ' -------------------------------------------------------'.grey,
            '',
            '[1]'.green + ' – Bake directories for [production] mode',
            '',
            'Database'.cyan + ' ------------------------------------------------------'.grey,
            '',
            '[2]'.green + ' - Bake meals for [development] mode (8 meals)',
            '[3]'.green + ' - Bake meals for [production] mode',
            '[4]'.green + ' – Bake mealtimes for [production] mode',
            '',
            'Backup'.cyan + ' --------------------------------------------------------'.grey,
            '',
            '[5]'.green + ' – Create internal backup (overwrites the previous backup)',
            '[6]'.green + ' – Restore internal backup (latest)',
            '',
            '[q]'.green + ' – Quit baking',
            '',
        ],
        notAlife: [
            '',
            'Please start the API app. "cd ../../ && node app"'.red,
            '',
        ],
        directories: {
            exists: [
                '',
                'Directories already exists'.yellow,
                '',
            ],
            created: [
                '',
                'Directories created'.green,
                '',
            ],
        }
    },

    addDirectories: function (respond) {
        fs.exists(config.uploadDir, function (exists) {
            if(!exists) {
                fs.mkdir(config.uploadDir);
                say(generalHandler.messages.directories.created);
            } else {
                say(generalHandler.messages.directories.exists);
            }
            respond();
        });

        fs.exists(config.backupDir, function (exists) {
            if(!exists) {
                fs.mkdir(config.backupDir);
                say(generalHandler.messages.directories.created);
            } else {
                say(generalHandler.messages.directories.exists);
            }
            respond();
        });
    }
}

/**
 * Meals Hanlder
 * ===================================================================================================
 */

var mealsHandler = {

    addBunch: function (respond, limit) {

        var s = new seq();
        var filesAdded = 0;

        console.log('Please hold the line...'.inverse);

        fs.readdir(assetDir, function (err, files) {
            if(err) throw err;

            files.forEach(function (file, index) {

                var amount = 1;

                if(limit && index > limit - 1) {
                    return;
                }

                // add random amount in dev mode
                if(limit) amount = Math.floor((Math.random()*10)+1);

                s.then(function (next) {
                    var req  = request.post(config.url + '/meals/');
                    var form = req.form();

                    form.append('title', path.basename(file, '.jpg'));
                    form.append('amount', amount);
                    form.append('image', fs.createReadStream(assetDir + path.basename(file)));

                    // callback after adding
                    req.on('response', function (response) {
                        next();
                    });
                });

                // last element in chain
                if(index + 1 === (limit || files.length)) {
                    s.then(function (next) {
                        filesAdded = index + 1;
                        console.log(filesAdded + ' meals added.'.green);
                        respond();
                    })
                }
            });
        });
    }
};

/**
 * Mealtimes Hanlder
 * ===================================================================================================
 */

var mealtimesHandler = {

    data: [
        { id: 'mealtime_1', title: 'A - 12:30'},
        { id: 'mealtime_2', title: 'B - 13:15'},
        { id: 'mealtime_3', title: 'C - 14:00'}
    ],

    messages: {
        exists: [
            '',
            'Mealtimes already exists'.yellow,
            '',
        ]
    },

    exists: function(next, respond) {

        var data = this.data;

        request({
            uri     :  config.url + '/mealtimes/',
            method  : 'GET',
            json    : true
        }, function (error, response, responseMealtimes) {
            if(responseMealtimes.length < data.length) {
                next();
            } else {
                say(mealtimesHandler.messages.exists);
                respond();
            }
        });
    },

    addBunch: function(respond) {

        var data = this.data;

        mealtimesHandler.exists(function () {
            data.forEach(function (item) {
                request({
                    uri     :  config.url + '/mealtimes/',
                    method  : 'POST',
                    body    : {
                        id   : item.id,
                        title: item.title
                    },
                    json: true
                }, function () {
                    // callback: mealtime added
                });
            });

            console.log(data.length + ' mealtimes added'.green);
            respond();
        });
    }
}

var backupHandler = {

    messages: {
        dumped: [
            'Dump was successfully'.green
        ],
    },

    restore: function (respond) {
        var host = config.db.host + ':' + config.db.port;
        var dbName = config.db.name;
        var path = '../../backups';

        var command = 'mongorestore --host ' + host + ' --db ' + dbName + ' ' + path + '/' + dbName;

        console.log('Running: ' + command);

        child = exec(command, function (error, stdout, stderr) {
            if(stdout!==''){
                console.log('---------stdout: ---------\n' + stdout);
            }
            if(stderr!==''){
                console.log('---------stderr: ---------\n' + stderr);
            }
            if (error !== null) {
                console.log('---------exec error: ---------\n[' + error+']');
            }

            respond();
        });
    },

    dump: function (respond) {

        var host = config.db.host + ':' + config.db.port;
        var dbName = config.db.name;
        var path = '../../backups';

        var command = 'mongodump --host ' + host + ' --db ' + dbName + ' --out ' + path;

        console.log('Running: ' + command);

        child = exec(command, function (error, stdout, stderr) {
            if(stdout!==''){
                console.log('---------stdout: ---------\n' + stdout);
            }
            if(stderr!==''){
                console.log('---------stderr: ---------\n' + stderr);
            }
            if (error !== null) {
                console.log('---------exec error: ---------\n[' + error+']');
            }

            respond();
        });
    }

}

