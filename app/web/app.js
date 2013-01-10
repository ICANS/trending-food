var express   = require('express')
  , http      = require('http')
  , engine    = require('ejs-locals')
  , request   = require('request')
  , futures   = require('futures')
  , http      = require('http')
  , fs        = require('fs')
  , config    = require('./config')
  , utilities = require('./utilities');

var app = express();

var requirements = {
    futures: futures,
    request: request,
};

process.on('uncaughtException', function (err) {
    console.log(err);
});

app.set('config', config);
app.set('utilities', utilities);
app.set('requirements', requirements);

// controllers - setup
// ----------------------------------------------------------------------

var controllers = {
    user    : require('./controllers/user.js')(app),
    order   : require('./controllers/order.js')(app),
    meal    : require('./controllers/meal.js')(app),
};

app.set('controllers', controllers);

// routes - setup
// ----------------------------------------------------------------------

var routes  = {
    user    : require('./routes/user.js')(app),
    order   : require('./routes/order.js')(app),
    meal    : require('./routes/meal.js')(app),
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

// routes - user
// ----------------------------------------------------------------------

app.post('/login', routes.user.login);
app.get('/login', routes.user.renderLogin);
app.get('/logout', routes.user.logout);

// routes - order
// ----------------------------------------------------------------------

app.get('/account/orders/?:page?', routes.user.checkLogin, routes.order.renderOrdersByUser);
app.get('/orders/?:page?', routes.user.checkLogin, routes.order.renderOrders);

// routes - meal
// ----------------------------------------------------------------------

app.get('/meal/:id', routes.user.checkLogin, routes.meal.renderMeal);
app.get('/meals/?:page?', routes.user.checkLogin, routes.meal.renderMeals);

// routes - general
// ----------------------------------------------------------------------

app.get('/faq', function (req, res) {
    res.render('faq', {
        config  : config,
        session : req.session
    });
});

app.get('/', routes.user.checkLogin, function (req, res, next) {

    var seq = new futures.sequence();

    seq

    .then(function (next) {

        request({
            uri     : config.api.uri + '/users/' + req.session.user_id + '/orders/',
            method  : 'GET',
            qs      : {
                limit: 5
            }
        }, function (error, response, body) {

            if(error) utilities.handleError(error);

            var meals_last = JSON.parse(body) || [];

            next(meals_last);

        });
    })

    .then(function (next, meals_last) {

        request({
            uri     : config.api.uri + '/meals/',
            method  : 'GET',
            qs      : {
                sort: 'votes',
                order: 'desc',
                limit: 3
            }
        }, function (error, response, body) {

            if(error) utilities.handleError(error);

            var meals_trending = JSON.parse(body) || [];

            next(meals_last, meals_trending);

        });
    })

    .then(function (next, meals_last, meals_trending) {

        request({
            uri     : config.api.uri + '/orders/',
            method  : 'GET',
            qs      : {
                limit: 5
            }
        }, function (error, response, body) {

            if(error) utilities.handleError(error);

            var orders_last = JSON.parse(body) || [];

            next(meals_last, meals_trending, orders_last);
        });
    })

    .then(function (next, meals_last, meals_trending, orders_last, meals_trending_maxvotes) {

        res.render('index', {
            config    : config,
            session   : req.session,
            utilities : utilities,

            meals_last      : meals_last,
            meals_trending  : meals_trending,
            orders_last     : orders_last,
        });
    });
});

app.use(function (req, res) {

    res.status(404);

    if (req.accepts('html')) {
        res.render('404', {
            config  : config,
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
