exports.add = function (req, res) {

    var mealId  = req.param('mealId') || null,
        userId  = req.param('userId') || null;

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.add(callback, userId, mealId);
};

exports.getList = function (req, res) {
    var userId      = req.param('userIdToAggregateBy'),
        callback    = function (statusCode, response) {
            res
                .status(statusCode)
                .json(response);
        };

    module.controller.getList(callback, userId);
};

exports.getListByUser = function (req, res) {
    var userId = req.param('userId');

    var callback = function (statusCode, response) {
        res
            .status(statusCode)
            .json(response);
    };

    module.controller.getListByUser(callback, userId);
};

// exports.getFavoriteMealtimeIdByUser = function (req, res) {
//     var userID  = req.param('username');

//     var callback = function (statusCode, response) {
//         res
//             .status(statusCode)
//             .json(response);
//     };

//     module.controller.getFavoriteMealtimeIdByUser(callback, userID);
// };

// exports.count = function (req, res) {

//     var deleted = !!(req.param('deleted')) || 1;

//     var callback = function (statusCode, response) {
//         res
//             .status(statusCode)
//             .json({
//                 count: response
//             });
//     };

//     module.controller.count(callback, deleted);
// };

exports.delete = function (req, res) {
    var mealId      = req.param('mealId') || null,
        userId      = req.param('userId') || null,
        callback    = function (statusCode) {
            res
                .status(statusCode)
                .send();
        };

    module.controller.delete(callback, userId, mealId);
};

module.exports = function(app, controller) {

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.controller = app.get('controllers').favorite;

    return exports;
};
