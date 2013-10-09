exports.add = function (req, res) {

    var username = req.param('username');
    var password = req.param('password');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.add(callback, username, password);
};

exports.login= function (req, res) {

    var username = req.param('username');
    var password = req.param('password');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.login(callback, username, password);
};

exports.getByUsername = function (req, res) {

    var username = req.param('username') || null;

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.getByUsername(callback, username);
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

    module.controller = app.get('controllers').user;

    return exports;
};
