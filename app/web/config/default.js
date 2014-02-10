module.exports.name = 'Trending Food';
module.exports.port = 4000;
module.exports.admins = ['']; // list of usernames

module.exports.xmpp = {
	hosts: [{
        domain: 'talk.google.com',
        inUsername: false
    }],
	port: 5222,
	default: 0 // index of hosts array
};

module.exports.pagination = {
	sort: 'title',
	order: 'asc',
	perPage: 32
};

module.exports.filter = {
    default: 'available'
};

module.exports.categories = {
    chicken: 'Chicken',
    pork: "Pork",
    beef: "Beef",
    fish: "Fish",
    vegan: 'Vegetarian',
    schnitzel: 'Schnitzel',
    pasta: "Pasta",
    sweets: "Sweets"
};

module.exports.api = {
	uri: 'http://127.0.0.1:3000'
};

module.exports.mealtime = {
	default: 'mealtime_2'
};

module.exports.hungry = ['hungrig', 'nälkäinen', 'flămând', 'svangur', 'aç', 'sulten', 'hungry', 'näljane', 'malsata'];
