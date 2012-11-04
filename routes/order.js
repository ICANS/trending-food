exports.add = function (req, res) {

    var meal     = req.param('meal');
    var user     = req.param('user');
    var mealtime = req.param('mealtime');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.add(callback, meal, mealtime, user);
};

exports.getList = function (req, res) {

    var offset  = req.param('offset');
    var limit   = req.param('limit');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.getList(callback, offset, limit);
};

exports.getListByUser = function (req, res) {

    var offset  = req.param('offset');
    var limit   = req.param('limit');
    var user    = req.param('user');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.getListByUser(callback, user, offset, limit);
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

    var id = req.param('id');

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

    module.controller = app.get('controllers').order;

    return exports;
};