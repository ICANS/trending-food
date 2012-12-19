exports.renderMeals = function (respond, page, limit) {

    var seq = new module.requirements.futures.sequence();

    seq

    .then(function (next) {

        module.requirements.request({
            uri     : module.config.api.uri + '/mealtime/list',
            method  : 'GET'
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var mealtimes = module.utilities.parseJSON(body);

            next(mealtimes);

        });
    })

    .then(function (next, mealtimes) {

        module.requirements.request({
            uri     : module.config.api.uri + '/meal/count',
            method  : 'GET'
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var total = module.utilities.parseJSON(body).count || 0;

            next(mealtimes, total);

        });
    })

    .then(function (next, mealtimes, total) {

        module.requirements.request({
            uri     : module.config.api.uri + '/meal/list',
            method  : 'GET',
            qs      : {
                offset: page * limit,
                limit : limit,
                sort  : 'votes',
                order : 'desc'
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
            uri     : module.config.api.uri + '/mealtime/list',
            method  : 'GET'
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var mealtimes = module.utilities.parseJSON(body);

            next(mealtimes);

        });
    })

    .then(function (next, mealtimes) {

        module.requirements.request({
            uri     : module.config.api.uri + '/meal/get/' + id,
            method  : 'GET',
            qs      : {}
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

module.exports = function(app) {

    module.config       = app.get('config');
    module.utilities    = app.get('utilities');
    module.requirements = app.get('requirements');

    return exports;
};