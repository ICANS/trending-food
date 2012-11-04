exports.getList = function (respond, offset, limit, sort, order) {

    var limit  = limit  || 30;
    var offset = offset || 0;
    var sort   = sort   || '_id';
    var order  = order == 'desc' ? '-' : '';

    module.model.find()
    .sort(order + sort)
    .limit(limit)
    .skip(offset)
    .exec(function (err, results) {
        if (err) {
            respond(400, err);
        } else {
            respond(200, results);
        }
    });
};

module.exports = function(app) {

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.model    = app.get('models').mealtime;

    return exports;
};