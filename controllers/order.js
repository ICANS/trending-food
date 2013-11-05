var sequence = require('futures').sequence;

exports.add = function (respond, mealID, mealtimeID, userID) {

    var seq = sequence();
    var ObjectId = module.mongoose.Types.ObjectId;

    var mealObjectID     = new ObjectId(mealID);
    var userObjectID     = new ObjectId(userID);
    var mealtimeObjectID = new ObjectId(mealtimeID);

    seq

    // amount of meals < 0
    .then(function (next) {

        module.models.meal
            .findOne({ _id: mealObjectID })
            .exec(function (err, result) {
                if (err) return respond(400, err);

                if(!result) {
                    return respond(400, {
                        statusInternal: 3,
                        statusText: 'meal not found'
                    });
                }

                if(!result.amount || result.amount < 1) {
                    return respond(400, {
                        statusInternal: 2,
                        statusText: 'amount of meal is too small'
                    });
                } else {
                    next();
                }
            });
    })

    // check if mealtime is already full
    .then(function (next) {
        var date = new Date();
        module.model.count({
            mealtime: mealtimeObjectID,
            deleted: false,
            created : {
                $gte : new Date(date.getFullYear(), date.getMonth(), date.getDate())
            }
        }).exec(function (err, count) {
            if (err) return respond(400, err);

            if (count >= module.config.mealtimelimit) {
                return respond(400, {
                    statusInternal: 4,
                    statusText: 'mealtime is full'
                });
            }

            next();
        });
    })

    // save
    .then(function (next) {

        var order = new module.model({
            meal    : mealObjectID,
            mealtime: mealtimeObjectID,
            user    : userObjectID,
        });

        order.save(function (err, results) {
            if (err) {
                respond(400, err);
            } else {
                next(order);
            }
        });

    })

    .then(function (next, order) {

        module.models.meal
            .findByIdAndUpdate(mealObjectID, {
                $inc: { amount: -1, votes: 1 }
            }, function(err, result) {
                respond(201, {
                    meal: result,
                    order: order
                });
            });
    });
};

exports.getList = function (respond, offset, limit, sort, order, dateStart, dateEnd) {

    var date   = new Date();
    limit  = limit || 30;
    offset = offset || 0;
    sort   = sort || 'created';
    order  = order == 'desc' ? '-' : '';
    if (dateStart) {
        dateStart = new Date(dateStart);
    } else {
        dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    if (dateEnd) {
        dateEnd = new Date(dateEnd);
    } else {
        dateEnd = new Date(dateStart.getTime() + (24 * 60 * 60 * 1000));
    }

    module.model.find({
        created : {
            $gte : dateStart,
            $lte : dateEnd
        }
    })
    .populate('mealtime')
    .populate('user', '_id username')
    .populate('meal', '_id title amount votes')
    .sort(order + sort)
    .limit(limit)
    .skip(offset)
    .exec(function (err, results) {
        if (err) return respond(400, err);

        return respond(200, results);
    });
};

exports.getListByUser = function (respond, userID, offset, limit, sort, order) {

    var ObjectId     = module.mongoose.Types.ObjectId;
    var userObjectID = null;

    var date   = new Date();
    limit  = limit || 30;
    offset = offset || 0;
    sort   = sort || 'created';
    order  = order == 'desc' ? '-' : '';

    if(userID.toString().length !== 24) {
        return respond(400, {});
    } else {
        userObjectID = new ObjectId(userID);
    }

    module.model
        .find({
            user: userObjectID
        })
        .populate('mealtime')
        .populate('user', '_id username')
        .populate('meal', '_id title amount votes')
        .sort(order + sort)
        .limit(limit)
        .skip(offset)
        .exec(function (err, results) {
            if (err) return respond(400, err);

            respond(200, results);
        });
};

exports.count = function (respond, deleted) {

    module.model.count({
        deleted: deleted
    }, function (err, count) {
        if (err) {
            respond(400, err);
        } else {
            respond(200, count);
        }
    });

};

exports.delete = function (respond, id) {

    var seq = sequence();
    var ObjectId = module.mongoose.Types.ObjectId;
    var orderObjectID = new ObjectId(id);

    seq.then(function (next) {
        module.model
            .findById(orderObjectID)
            .populate('meal')
            .exec(function(err, result) {
                if(result.length === 0) return respond(400, 'order id not found');
                if(err) return respond(400, err);

                result.meal.update({
                    $inc: { amount: 1, votes: -1 }
                }, function(err, meal) {
                    if(meal === 0) return respond(404, 'sub document meal not found');
                    if(err) return respond(400, err);

                    next();
                });
            });
    })

    .then(function (next) {

        module.model.findByIdAndUpdate(id, {
            deleted: true
        }, function (err, order) {
            if(err) return respond(400, err);

            return respond(200, order);
        });

    });
};

module.exports = function(app, model) {

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.models   = app.get('models');
    module.model    = app.get('models').order;

    return exports;
};
