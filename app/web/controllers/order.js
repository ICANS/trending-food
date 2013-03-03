exports.renderOrders = function (respond, next, page, limit) {

    var seq = new module.requirements.futures.sequence();

    seq

    .then(function (nextSeq) {

        module.requirements.request({
            uri     : module.config.api.uri + '/mealtimes/',
            method  : 'GET'
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var mealtimes = module.utilities.parseJSON(body);

            nextSeq(mealtimes);
        });
    })

    .then(function (nextSeq, mealtimes) {

        module.requirements.request({
            uri     : module.config.api.uri + '/orders/count',
            method  : 'GET',
            qs      : {
                offset: page * limit,
                limit : limit
            }
        }, function (error, response, body) {

            if(error) module.utilities.handleError();

            var total = module.utilities.parseJSON(body).count || 0;

            nextSeq(mealtimes, total);
        });
    })

    .then(function (nextSeq, mealtimes, total) {

        module.requirements.request({
            uri     : module.config.api.uri + '/orders/',
            method  : 'GET',
            qs      : {
                offset: page * limit,
                limit : limit
            }
        }, function (error, response, body) {

            if(error) module.utilities.handleError();

            var orders = module.utilities.parseJSON(body);
            var pages = Math.ceil(total / limit);

            nextSeq(mealtimes, orders);
        });
    })

    .then(function (nextSeq, mealtimes, orders) {

        mealtimes.forEach(function (mealtime) {

            if(typeof mealtime.orderCount === 'undefined') {
                mealtime.orderCount = 0;
            }

            orders.forEach(function (order) {
                if(order.mealtime && mealtime._id === order.mealtime._id && order.meal) {
                    mealtime.orderCount++;
                }
            });
        });

        respond(mealtimes, orders);
    });
};

exports.renderOrdersByUser = function (respond, next, session, page, limit, sort) {

    var seq = new module.requirements.futures.sequence();

    seq

    .then(function (nextSeq) {

        module.requirements.request({
            uri     : module.config.api.uri + '/mealtimes/',
            method  : 'GET'
        }, function (error, response, body) {

            if(error) module.utilities.handleError(error);

            var mealtimes = module.utilities.parseJSON(body);

            nextSeq(mealtimes);
        });
    })

    .then(function (nextSeq, mealtimes) {

        module.requirements.request({
            uri     : module.config.api.uri + '/users/' + session.user_id + '/orders/',
            method  : 'GET',
            qs      : {
                offset: page * limit,
                limit : limit,
                sort  : sort
            }
        }, function (error, response, body) {

            if(error) module.utilities.handleError();

            var orders = module.utilities.parseJSON(body);

            nextSeq(mealtimes, orders);
        });
    })

    .then(function (nextSeq, mealtimes, orders) {

        mealtimes.forEach(function (mealtime) {
            if(typeof mealtime.orderCount === 'undefined') {
                mealtime.orderCount = 0;
            }

            orders.forEach(function (order) {
                if(order.mealtime && mealtime._id === order.mealtime._id && order.meal) {
                    mealtime.orderCount++;
                }
            });
        });

        respond(mealtimes, orders);
    });
};

module.exports = function (app) {

    module.config       = app.get('config');
    module.utilities    = app.get('utilities');
    module.requirements = app.get('requirements');

    return exports;
};