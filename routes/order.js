exports.add = function (req, res) {

    var meal     = req.param('meal') || null;
    var user     = req.param('user') || null;
    var mealtime = req.param('mealtime') || null;

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.add(callback, meal, mealtime, user);
};

exports.getList = function (req, res) {

    var offset    = req.param('offset') || 0;
    var limit     = req.param('limit') || 0;
    var sort      = req.param('sort');
    var dateStart = req.param('dateStart');
    var dateEnd   = req.param('dateEnd');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.getList(callback, offset, limit, sort, dateStart, dateEnd);
};

exports.getListByUser = function (req, res) {

    var offset    = req.param('offset');
    var limit     = req.param('limit');
    var username  = req.param('username');
    var sort      = req.param('sort');
    var order     = req.param('order');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.getListByUser(callback, username, offset, limit, sort, order);
};

exports.count = function (req, res) {

    var deleted = !!(req.param('deleted')) || 1;

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json({
                count: response
            });
    };

    module.controller.count(callback, deleted);
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

    module.controller = app.get('controllers').order;

    return exports;
};