exports.renderMeals = function (respond, page, sort, order, limit) {

    var seq = new module.requirements.futures.sequence();

    seq

    .then(function (next) {

        module.requirements.request({
            uri     : module.config.api.uri + '/mealtimes/',
            method  : 'GET',
            qs      : {
                available: true
            }
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var mealtimes = module.utilities.parseJSON(body);

            next(mealtimes);
        });
    })

    .then(function (next, mealtimes) {

        module.requirements.request({
            uri     : module.config.api.uri + '/meals/count',
            method  : 'GET'
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var total = module.utilities.parseJSON(body).count || 0;

            next(mealtimes, total);
        });
    })

    .then(function (next, mealtimes, total) {

        module.requirements.request({
            uri     : module.config.api.uri + '/meals/',
            method  : 'GET',
            qs      : {
                offset: page * limit,
                limit : limit,
                sort  : sort,
                order : order
            }
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var meals = module.utilities.parseJSON(body);
            var pages = Math.ceil(total / limit);

            next(mealtimes, pages, meals);
        });
    })

    .then(function (next, mealtimes, pages, meals) {
        respond(mealtimes, pages, meals);
    });

};

exports.renderMeal = function (respond, id) {

    var seq = new module.requirements.futures.sequence();

    seq

    .then(function (next) {

        module.requirements.request({
            uri     : module.config.api.uri + '/mealtimes/',
            method  : 'GET'
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var mealtimes = module.utilities.parseJSON(body);

            next(mealtimes);

        });
    })

    .then(function (next, mealtimes) {

        module.requirements.request({
            uri     : module.config.api.uri + '/meals/' + id,
            method  : 'GET',
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var meal = module.utilities.parseJSON(body);

            next(mealtimes, meal);

        });
    })

    .then(function (next, mealtimes, meal) {
        respond(mealtimes, meal);
    });
};

exports.getMeals = function (respond) {

    module.requirements.request({
        uri     : module.config.api.uri + '/meals/',
        method  : 'GET',
        qs      : {
            minAmount: -1
        }
    }, function (error, response, body) {

        if(error) module.utilities.handleError(error);

        var meals = module.utilities.parseJSON(body);

        respond(meals);
    });
};

exports.getVotes = function (respond) {

    module.requirements.request({
        uri     : module.config.api.uri + '/meals/votes/',
        method  : 'GET'
    }, function (error, response, body) {

        if(error) module.utilities.handleError(error);

        var votes = module.utilities.parseJSON(body);

        respond(votes);
    });
};

module.exports = function(app) {

    module.config       = app.get('config');
    module.utilities    = app.get('utilities');
    module.requirements = app.get('requirements');

    return exports;
};