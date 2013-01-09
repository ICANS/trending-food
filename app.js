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

app.post('/order', routes.order.add);
app.get('/order/list', routes.order.getList);
app.get('/order/list_by_user', routes.order.getListByUser);
app.get('/order/count', routes.order.count);
app.delete('/order/item/:id', routes.order.delete);

// routes - meal

app.post('/meal', routes.meal.add);
app.get('/meal/item/:id', routes.meal.getById);
app.get('/meal/image/:id', routes.meal.getImageById);
app.get('/meal/list', routes.meal.getList);
app.get('/meal/count', routes.meal.count);
app.put('/meal/vote/up/:id', routes.meal.voteUp);
app.put('/meal/vote/down/:id', routes.meal.voteDown);
app.put('/meal/amount/up/:id', routes.meal.amountUp);
app.put('/meal/amount/down/:id', routes.meal.amountDown);
app.delete('/meal/item/:id', routes.meal.delete);

// routes - mealtimes

app.post('/mealtime', routes.mealtime.add);
app.get('/mealtime/list', routes.mealtime.getList);
app.get('/mealtime/count', routes.mealtime.count);
app.delete('/mealtime/item/:id', routes.mealtime.delete);

// routes - user

app.post('/user', routes.user.add);
app.get('/user/get_by_username', routes.user.getByUsername);
app.delete('/user/item/:id', routes.user.delete);

http.createServer(app).listen(app.get('port'), function() {
    console.log("HTTP: " + app.get('port'));
});