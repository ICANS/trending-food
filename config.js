var path = require('path');

var port = process.env.PORT;
var domain = 'http://' + process.env.IP;

exports.name = 'trending-food';
exports.port = port;
exports.url = domain + ':' + port;

exports.uploadDir = path.join(__dirname, 'uploads');

var db = {};

exports.db = {
    domain: 'mongodb://' + db.username + ':' + db.password + '@' + db.domain + ':' + db.port + '/' + db.name
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