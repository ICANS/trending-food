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

module.exports = function(app, controller) {

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.controller = app.get('controllers').mealtime;

    return exports;
};