exports.name = 'trending-food';

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

exports.order = {
	
}