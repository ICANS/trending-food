exports.add = function (req, res) {

    var title       = req.param('title');
    var amount      = req.param('amount');
    var category    = req.param('category');
    var vegetarian  = req.param('vegetarian');
    var image       = req.files && req.files.image ? req.files.image : null;

    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.add(callback, title, amount, vegetarian, image, category);
};

exports.count = function (req, res) {

    var title  = req.param('title');
    var amount = req.param('amount');

    var callback = function(statusCode, response) {
        res.status(statusCode).json({
            count: response
        });
    };

    module.controller.count(callback, title, amount);
};

exports.getById = function (req, res) {

    var id = req.param('id');

    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.getById(callback, id);
};

exports.getList = function (req, res) {

    var offset  = req.param('offset'),
        limit   = req.param('limit'),
        sort    = req.param('sort'),
        order   = req.param('order'),
        filter  = req.param('filter'),
        filterVal = req.param('filterVal');

    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.getList(callback, offset, limit, sort, order, filter, filterVal);
};
    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.getList(callback, offset, limit, sort, order, filter);
};

exports.delete = function (req, res) {

    var id = req.param('id');

    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.delete(callback, id);
};

exports.voteDown = function (req, res) {

    var id = req.param('id');

    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.voteDown(callback, id);
};

exports.voteUp = function (req, res) {

    var id = req.param('id');

    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.voteUp(callback, id);
};

exports.amountUp = function (req, res) {

    var id = req.param('id');

    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.amountUp(callback, id);
};

exports.amountDown = function (req, res) {

    var id = req.param('id');

    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.amountDown(callback, id);
};

exports.setVegetarian = function (req, res) {

    var id          = req.param('id'),
        vegetarian  = req.param('vegetarian');

    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.setVegetarian(callback, id, vegetarian);
};

exports.getVotes = function (req, res) {

    var callback = function(statusCode, response) {
        res.status(statusCode).json(response);
    };

    module.controller.getVotes(callback);
};

exports.getImageById = function (req, res) {

    var id = req.param('id');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .type(response.contentType)
            .end(response.data, 'binary');
    };

    module.controller.getImageById(callback, id);
};

module.exports = function(app) {

    module.db         = app.get('db');
    module.mongoose   = app.get('mongoose');
    module.config     = app.get('config');
    module.controller = app.get('controllers').meal;

    return exports;
};
