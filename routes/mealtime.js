exports.getList = function (req, res) {

    var offset  = req.param('offset');
    var limit   = req.param('limit');
    var sort    = req.param('sort');
    var order   = req.param('order');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.getList(callback, offset, limit, sort, order);
};

exports.add = function (req, res) {

    var id      = req.param('id') || null;
    var title   = req.param('title') || null;

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.add(callback, id, title);
};

exports.count = function (req, res) {
    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json({
                count: response
            });
    };

    module.controller.count(callback);
};

exports.delete = function (req, res) {

    var id = req.param('id') || null;

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.delete(callback, id);
};


module.exports = function(app, controller) {

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.controller = app.get('controllers').mealtime;

    return exports;
};