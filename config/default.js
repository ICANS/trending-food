var path = require('path');

var port = 3000;
var domain = 'http://127.0.0.1';

module.exports = module.exports || {};
module.exports.name = 'trending-food';
module.exports.port = port;
module.exports.url = domain + ':' + port;

module.exports.uploadDir = path.join(__dirname, 'uploads');
module.exports.backupDir = path.join(__dirname, 'backups');

/**
 * Database
 */
module.exports.db = {
    host: '127.0.0.1',
    port: '27017',
    name: 'trending-food'
};

module.exports.meal = {
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

module.exports.mealtime = {
    minutesBeforeLock : {
        default: 60
    }
};

module.exports.mealtimelimit = 24;
