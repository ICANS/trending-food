exports.add = function (req, res) {

    var title  = req.param('title');
    var amount = req.param('amount');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.add(callback, title, amount);
};

exports.count = function (req, res) {

    var id     = req.param('id');
    var title  = req.param('title');
    var amount = req.param('amount');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json({
                count: response
            });
    };

    module.controller.count(callback, id, title, amount);
};

exports.getById = function (req, res) {

    var id = req.param('id');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.getById(callback, id);
};

exports.getList = function (req, res) {

    var offset  = req.param('offset');
    var limit   = req.param('limit');
    var sort    = req.param('sort');
    var order   = req.param('order');

    var callback = function (statusCode, response) {
        
        // console.log(response);

        res
            .status(statusCode)
            .json(response);
    };

    module.controller.getList(callback, offset, limit, sort, order);
};

exports.delete = function (req, res) {

    var id = req.param('id');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.delete(callback, id);
};

exports.voteDown = function (req, res) {

    var id = req.param('id');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.voteDown(callback, id);
};

exports.voteUp = function (req, res) {

    var id = req.param('id');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.voteUp(callback, id);
};

module.exports = function(app, controller) {

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.controller = app.get('controllers').meal;

    return exports;
};