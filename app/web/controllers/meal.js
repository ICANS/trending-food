exports.renderMeals = function (respond, page, sort, order, limit, filter, filterVal, session) {

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
            method  : 'GET',
            qs      : {
                filter      : filter,
                filterVal   : filterVal
            }
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
                order : order,
                filter: filter,
                filterVal : filterVal
            }
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var meals = module.utilities.parseJSON(body);
            var pages = Math.ceil(total / limit);

            next(mealtimes, pages, meals);
        });
    })

    // Get the id of the mealtime the user has used the most when placing an order.
    .then(function (next, mealtimes, pages, meals) {
        module.requirements.request({
            uri     : module.config.api.uri + '/users/' + session.user_id + '/favoritemealtime',
            method  : 'GET'
        }, function (error, response, body) {

            if(error) module.utilities.handleError();

            var favoriteMealtimeId = module.utilities.parseJSON(body);

            next(mealtimes, pages, meals, favoriteMealtimeId);
        });
    })

    .then(function (next, mealtimes, pages, meals, favoriteMealtimeId) {
        respond(mealtimes, pages, meals, favoriteMealtimeId);
    });

};

exports.renderMeal = function (respond, id, session) {

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

            if (error) module.utilities.handleError(error);

            var mealtimes = module.utilities.parseJSON(body);

            next(mealtimes);

        });
    })
    
    .then(function (next, mealtimes) {

        module.requirements.request({
            uri     : module.config.api.uri + '/meals/' + id,
            method  : 'GET',
        }, function (error, response, body) {

            if (error) module.utilities.handleError(error);
            var meal = module.utilities.parseJSON(body);

            next(mealtimes, meal);

        });
    })

    // Get the id of the mealtime the user has used the most when placing an order.
    .then(function (next, mealtimes, meal) {
        module.requirements.request({
            uri     : module.config.api.uri + '/users/' + session.user_id + '/favoritemealtime',
            method  : 'GET'
        }, function (error, response, body) {

            if(error) module.utilities.handleError();

            var favoriteMealtimeId = module.utilities.parseJSON(body);

            next(mealtimes, meal, favoriteMealtimeId);
        });
    })

    .then(function (next, mealtimes, meal, favoriteMealtimeId) {
        respond(mealtimes, meal, favoriteMealtimeId);
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

        if (error) module.utilities.handleError(error);

        var meals = module.utilities.parseJSON(body);

        respond(meals);
    });
};

exports.getVotes = function (respond) {

    module.requirements.request({
        uri     : module.config.api.uri + '/meals/votes/',
        method  : 'GET'
    }, function (error, response, body) {

        if (error) module.utilities.handleError(error);

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
