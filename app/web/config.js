exports.name = 'Trending Food';
exports.port = 4000;
exports.admins = ['']; // list of usernames

exports.xmpp = {
	hosts: ['talk.google.com'],
	port: 5222,
	default: 0 // index of hosts array
};

exports.pagination = {
	perPage: 30
};

exports.api = {
	uri: 'https://127.0.0.1:3000'
}

exports.mealtime = {
	default: 'mealtime_2'
}

exports.hungry = ['hungrig', 'nälkäinen', 'flămând', 'svangur', 'aç', 'sulten', 'hungry', 'näljane', 'malsata'];