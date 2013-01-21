var express    = require('express')
    , http     = require('http')
    , mongoose = require('mongoose')
    , http     = require('http')
    , config   = require('./config');

var app = express();
var db  = mongoose.createConnection(config.db.domain);

app.use(express.bodyParser({
    keepExtensions: true,
    uploadDir: config.uploadDir
}));

app.set('config', config);
app.set('mongoose', mongoose);
app.set('db', db);

var models = {
    user        : require('./models/user.js')(app),
    meal        : require('./models/meal.js')(app),
    mealtime    : require('./models/mealtime.js')(app),
    order       : require('./models/order.js')(app)
};

app.set('models', models);

var controllers = {
    user        : require('./controllers/user.js')(app),
    meal        : require('./controllers/meal.js')(app),
    mealtime    : require('./controllers/mealtime.js')(app),
    order       : require('./controllers/order.js')(app),
};

app.set('controllers', controllers);

var routes  = {
    user        : require('./routes/user.js')(app),
    meal        : require('./routes/meal.js')(app),
    mealtime    : require('./routes/mealtime.js')(app),
    order       : require('./routes/order.js')(app)
};

app.configure(function() {
    app.set('port', config.port);
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.all('*', function(req, res, next) {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "X-Requested-With"
    });
    next();
});

// routes - order

app.post('/orders/', routes.order.add);
app.get('/orders/', routes.order.getList);
app.get('/orders/count', routes.order.count);
app.post('/orders/:id/delete', routes.order.delete);

// routes - meal

app.post('/meals/', routes.meal.add);
app.post('/meals/:id/voteup', routes.meal.voteUp);
app.post('/meals/:id/votedown', routes.meal.voteDown);
app.post('/meals/:id/amountup', routes.meal.amountUp);
app.post('/meals/:id/amountdown', routes.meal.amountDown);
app.get('/meals/count', routes.meal.count);
app.get('/meals/:id', routes.meal.getById);
app.get('/meals/:id/image', routes.meal.getImageById);
app.get('/meals/', routes.meal.getList);
app.post('/meals/:id/delete', routes.meal.delete);

// routes - mealtimes

app.post('/mealtimes/', routes.mealtime.add);
app.get('/mealtimes/', routes.mealtime.getList);
app.get('/mealtimes/count', routes.mealtime.count);
app.post('/mealtimes/:id/delete', routes.mealtime.delete);

// routes - user

app.post('/users/', routes.user.add);
app.post('/users/:username/login', routes.user.login);
app.get('/users/:username/orders/', routes.order.getListByUser);
app.get('/users/:username', routes.user.getByUsername);
app.post('/users/:id/delete', routes.user.delete);

http.createServer(app).listen(app.get('port'), function() {
    console.log("HTTP: " + app.get('port'));
});