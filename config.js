var path = require('path');

var port = 3000;
var domain = 'http://127.0.0.1';

exports.name = 'trending-food';
exports.port = port;
exports.url = domain + ':' + port;

exports.uploadDir = path.join(__dirname, 'uploads');
exports.backupDir = path.join(__dirname, 'backups');

exports.db = db = {
    host: '127.0.0.1',
    port: '27017',
    name: 'trending-food'
};

exports.db.domain = 'mongodb://' + db.host + ':' + db.port + '/' + db.name;

exports.meal = {
    amount: {
        default: 0,
        min: 0,
        max: 99
    },
    votes: {
        default: 0,
        min: 0
    }
};