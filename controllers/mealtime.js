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

exports.add = function (respond, id, title) {

    var id = id || null;
    var title = title || null;

    var mealtime = new module.model({
        id   : id,
        title: title,
    });

    mealtime.save(function (err, doc) {
        if (err) {
            respond(400, err);
        } else {
            respond(201, doc);
        }
    });
};

exports.delete = function (respond, id) {

    var id = id || null;

    module.model.remove({
        _id: id
    }, function (err, docs) {
        if(docs === 0) return respond(404, 'id not found');
        if(err) return respond(400, err);

        return respond(200, {
            _id: id
        });
    });
};

exports.count = function (respond) {

    module.model.count({}, function (err, count) {
        if (err) {
            respond(400, err);
        } else {
            respond(200, count);
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