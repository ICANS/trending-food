var path = require('path');

var port = 3000;
var domain = 'http://127.0.0.1';

exports.name = 'trending-food';
exports.port = port;
exports.url = domain + ':' + port;

exports.uploadDir = path.join(__dirname, 'uploads');
exports.backupDir = path.join(__dirname, 'backups');

exports.databases = databases = {
    test: {
        host: '127.0.0.1',
        port: '27017',
        name: 'trending-food-test'
    },
    prod: {
        host: '127.0.0.1',
        port: '27017',
        name: 'trending-food'
    }
};

for(var name in databases) {
    exports.databases[name].domain = 'mongodb://' + databases[name].host + ':' + databases[name].port + '/' + databases[name].name;
}

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