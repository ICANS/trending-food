var express   = require('express'),
    http      = require('http'),
    engine    = require('ejs-locals'),
    request   = require('request'),
    futures   = require('futures'),
    http      = require('http'),
    fs        = require('fs'),
    colors    = require('colors'),
    config    = require('./config'),
    utilities = require('./utilities');

var app = express();

var requirements = {
    futures: futures,
    request: request
};

var urlHelper = {
    meal: function (id) {
        return '/meal/' + id;
    }
};

utilities.moment = require('moment');
utilities.moment.lang('de');

utilities.url = urlHelper;

app.set('config', config);
app.set('utilities', utilities);
app.set('requirements', requirements);

process.on('uncaughtException', function (error) {
    utilities.handleError(error);
});

/**
 * Request alive status
 *
 * Lets check if the app is already running
 */

request({
    uri     :  config.api.uri + '/alive',
    method  : 'GET'
}, function (error, response) {
    if(typeof response === 'undefined' || response.statusCode !== 418) {
        console.log();
        console.error('Please start the API app. "cd ../../ && node app"'.red);
        console.log();
        process.exit();
    }
});

// controllers - setup
// ----------------------------------------------------------------------

var controllers = {
    user    : require('./controllers/user.js')(app),
    order   : require('./controllers/order.js')(app),
    meal    : require('./controllers/meal.js')(app)
};

app.set('controllers', controllers);

// routes - setup
// ----------------------------------------------------------------------

var routes  = {
    user    : require('./routes/user.js')(app),
    order   : require('./routes/order.js')(app),
    meal    : require('./routes/meal.js')(app)
};

// express - config
// ----------------------------------------------------------------------

app.configure(function(){

    app.engine('ejs', engine);
    app.set('port', config.port);

    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('dawuH27)"&e2g769dshw'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

// app locals
// ----------------------------------------------------------------------

app.locals.config      = config;
app.locals.utilities   = utilities;

app.locals.global = {};

var updateInterval = function () {

    controllers.meal.getMeals(function (meals) {
        app.locals.global.meals = meals;
    });

    controllers.meal.getVotes(function (votes) {
        app.locals.global.votes = votes;
    });

    console.log(utilities.moment().format('HH:ss') + ' – Updated: max votes, meal search index');
};

updateInterval();

setInterval(updateInterval, 20000);

// routes - user
// ----------------------------------------------------------------------

app.post('/login', routes.user.login);
app.get('/login', routes.user.renderLogin);
app.get('/logout', routes.user.logout);

// routes - order
// ----------------------------------------------------------------------

app.get('/account/orders/?:page?', routes.user.checkLogin, routes.order.renderOrdersByUser);
app.get('/orders/?:date?/', routes.user.checkLogin, routes.order.renderOrders);

// routes - meal
// ----------------------------------------------------------------------

app.get('/meal/:id', routes.user.checkLogin, routes.meal.renderMeal);
app.get('/meals/?:page?', routes.user.checkLogin, function (req, res, next) {
    if (typeof req.param('page') == 'string') {
        req.filter = req.param('page');
    }
    next();
}, routes.meal.renderMeals);
app.get('/meals/:filter/:value/:page?', routes.user.checkLogin, routes.meal.renderMeals);

// routes - general
// ----------------------------------------------------------------------

app.get('/faq', function (req, res) {
    res.render('faq', {
        session : req.session
    });
});

app.get('/', routes.user.checkLogin, function (req, res, next) {

    var seq = new futures.sequence();

    seq

    .then(function (next, user_orders) {

        request({
            uri     : config.api.uri + '/meals/',
            method  : 'GET',
            qs      : {
                sort: 'votes',
                order: 'desc',
                limit: 5
            }
        }, function (error, response, body) {

            if(error) utilities.handleError(error);

            var meals_trending = JSON.parse(body) || [];

            console.log(meals_trending);

            next(user_orders, meals_trending);

        });
    })

    .then(function (next, user_orders, meals_trending) {

        request({
            uri     : config.api.uri + '/orders/',
            method  : 'GET',
            qs      : {
                limit: 5,
                order: 'desc'
            }
        }, function (error, response, body) {

            if(error) utilities.handleError(error);

            var orders_last = JSON.parse(body) || [];

            next(user_orders, meals_trending, orders_last);
        });
    })

    .then(function (next, user_orders, meals_trending, orders_last, meals_trending_maxvotes) {

        res.render('index', {
            session   : req.session,

            user_orders     : user_orders,
            meals_trending  : meals_trending,
            orders_last     : orders_last
        });
    });
});

app.use(function (req, res) {

    res.status(404);

    if (req.accepts('html')) {
        res.render('404', {
            session : req.session
        });
        return;
    }

    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("HTTP: " + app.get('port'));
});
