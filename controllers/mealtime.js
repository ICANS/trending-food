var sequence = require('futures').sequence;

/**
 * @details Determines wether the mealtime provided can be selected for ordering right now.
 * @param mealtime The mealtime to check.
 */
var isMealtimeLocked = function (mealtime) {
    var date            = mealtime.date,
        mealtimeMinutes = date.getHours() * 60 + date.getMinutes(),
        today           = new Date(),
        todayMinutes    = today.getHours() * 60 + today.getMinutes(),
        lockMinutes     = mealtimeMinutes - mealtime.minutesBeforeLock;

    return todayMinutes > lockMinutes;
};

exports.getList = function (respond, offset, limit, sort, order, available) {

    var seq = sequence();

    limit  = limit  || 30;
    offset = offset || 0;
    sort   = sort   || 'title';
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
        var availableMealtimes = [];

        count = 0;
        total = mealtimes.length;

        // Only sort mealtimes if there are any.
        if (0 < total) {
            mealtimes.forEach(function(mealtime) {
                if (!isMealtimeLocked(mealtime)) {
                    mealOrders(mealtime._id, function(ordersCount) {
                        if (ordersCount >= module.config.mealtimelimit) {
                            // mealtimes.splice(mealtimes.indexOf(mealtime), 1);
                        }
                        else {
                            availableMealtimes.push(mealtime);
                        }

                        count++;
                        if (count === total) {
                            next(availableMealtimes);
                        }
                    });
                }
                else {
                    count++;
                    if (count === total) {
                        next(availableMealtimes);
                    }
                }
            });
        }
        else {
            next(mealtimes);
        }

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

exports.add = function (respond, id, title, date) {

    id      = id || null;
    title   = title || null;
    date    = date || null;

    var mealtime = new module.model({
        id      : id,
        title   : title,
        date    : date
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
