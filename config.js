var path = require('path');

exports.name = 'trending-food';
exports.port = port = 3000;
exports.url = "http://127.0.0.1:" + port;

exports.uploadDir = path.join(__dirname, 'uploads');
exports.sslDir 	  = path.join(__dirname, 'https');

exports.db = {
    domain 	: '127.0.0.1',
    name 	: 'trending-food'
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
}

exports.order = {}