var path = require('path');

var port = process.env.PORT;
var domain = 'http://' + process.env.IP;

exports.name = 'trending-food';
exports.port = 3000;
exports.url = domain + ':' + port;

exports.uploadDir = path.join(__dirname, 'uploads');

var db = {
    domain: '127.0.0.1',
    port: '27017',
    name: 'trending-food'
};

exports.db = {
    domain: 'mongodb://' + db.domain + ':' + db.port + '/' + db.name
};

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