var sequence = require('futures').sequence;

exports.getList = function (respond, offset, limit, sort, order, available) {

    var seq = sequence();

    limit  = limit  || 30;
    offset = offset || 0;
    sort   = sort   || '_id';
    order  = order == 'desc' ? '-' : '';

    seq

    // find all mealtimes
    .then(function (next) {
        module.model.find()
        .sort(order + sort)
        .limit(limit)
        .skip(offset)
        .exec(function (err, results) {
            if (err) {
                respond(400, err);
            } else {
                if (available) {
                    next(results); // only return available times
                } else {
                    respond(200, results);
                }
            }
        });
    })
    // select only available mealtimes
    .then(function (next, mealtimes) {
        count = 0;
        total = mealtimes.length;
        mealtimes.forEach(function(mealtime) {
            mealOrders(mealtime._id, function(ordersCount) {
                if (ordersCount >= module.config.mealtimelimit) {
                    mealtimes.splice(mealtimes.indexOf(mealtime), 1);
                }
                count++;
                if (count === total) {
                    next(mealtimes);
                }
            });

        });

    })
    .then(function (next, mealtimes) {
        respond(200, mealtimes);
    });
};

mealOrders = function (mealtimeId, callback) {
    var ObjectId     = module.mongoose.Types.ObjectId;
    var mealtimeObjectId = new ObjectId(mealtimeId.toString());
    var date = new Date();

    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    console.log(mealtimeId);
    var query = module.models.order.count({
        mealtime: mealtimeObjectId,
        deleted: false,
        created : {
            $gte : date
        }
    }, function (err, count) {
        callback(count);
    });
};

exports.add = function (respond, id, title) {

    id = id || null;
    title = title || null;

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

    id = id || null;

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

    module.models   = app.get('models');
    module.model    = app.get('models').mealtime;

    return exports;
};
