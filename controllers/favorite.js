var sequence = require('futures').sequence;

exports.add = function (respond, userId, mealId) {

    var seq                 = sequence(),
        ObjectId            = module.mongoose.Types.ObjectId,
        userObjectId        = new ObjectId(userId),
        mealObjectId        = new ObjectId(mealId);

    seq

    // Check wether the favorite has already been added.
    .then(function (next) {
        module.model
            .findOne({ user: userObjectId, meal: mealObjectId })
            .exec(function (err, result) {
                if (err) return respond(400, err);

                if(result) {
                    // The favorite has already been added.
                    return respond(200, {
                        statusText: 'Favorite has already been added.'
                    });
                }
                else {
                    next();
                }
            });
    })

    // amount of meals < 0
    .then(function (next) {

        module.models.meal
            .findOne({ _id: mealObjectId })
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

    // save
    .then(function (next) {

        var favorite = new module.model({
            meal    : mealObjectId,
            user    : userObjectId
        });

        favorite.save(function (err, results) {
            if (err) {
                respond(400, err);
            } else {
                respond(201, favorite);
            }
        });

    });
};

// exports.getList = function (respond, offset, limit, sort, order, dateStart, dateEnd) {

//     var date   = new Date();
//     limit  = limit || 30;
//     offset = offset || 0;
//     sort   = sort || 'created';
//     order  = order == 'desc' ? '-' : '';
//     if (dateStart) {
//         dateStart = new Date(dateStart);
//     } else {
//         dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
//     }

//     if (dateEnd) {
//         dateEnd = new Date(dateEnd);
//     } else {
//         dateEnd = new Date(dateStart.getTime() + (24 * 60 * 60 * 1000));
//     }

//     module.model.find({
//         created : {
//             $gte : dateStart,
//             $lte : dateEnd
//         }
//     })
//     .populate('mealtime')
//     .populate('user', '_id username')
//     .populate('meal', '_id title amount votes')
//     .sort(order + sort)
//     .limit(limit)
//     .skip(offset)
//     .exec(function (err, results) {
//         if (err) return respond(400, err);

//         return respond(200, results);
//     });
// };

exports.getListByUser = function (respond, userId) {
    var seq = sequence();
    var ObjectId     = module.mongoose.Types.ObjectId;
    var userObjectId = null;

    seq

    if(userId.toString().length !== 24) {
        return respond(400, {});
    } else {
        userObjectId = new ObjectId(userId);
    }

    module.model
        .find({
            user: userObjectId
        })
        .populate('user', '_id username')
        .populate('meal', '_id title')
        .exec(function (err, results) {
            if (err) return respond(400, err);

            respond(200, results);
        });
};

// exports.getFavoriteMealtimeIdByUser = function (respond, userID) {
//     var ObjectId            = module.mongoose.Types.ObjectId,
//         userObjectId        = null;

//     if(userID.toString().length !== 24) {
//         return respond(400, {});
//     } else {
//         userObjectId = new ObjectId(userID);
//     }

//     module.model
//         .find({
//             user: userObjectId,
//             deleted : false
//         })
//         .populate('mealtime')
//         .exec(function (err, results) {
//             var ordersByMealtime        = {},
//                 mealtimeId,
//                 favoriteMealtimeId      = '',
//                 numberOfOrders,
//                 maximumNumberOfOrders   = 0;

//             if (err) return respond(400, err);

//             results.forEach(function (order) {
//                 mealtimeId = order.mealtime.id;

//                 if ('undefined' === typeof ordersByMealtime[mealtimeId]) {
//                     ordersByMealtime[mealtimeId] = 0;
//                 }

//                 ordersByMealtime[mealtimeId]++;
//             });

//             for (mealtimeId in ordersByMealtime) {
//                 if (ordersByMealtime.hasOwnProperty(mealtimeId)) {
//                     numberOfOrders = ordersByMealtime[mealtimeId];

//                     if (maximumNumberOfOrders < numberOfOrders) {
//                         maximumNumberOfOrders = numberOfOrders;

//                         favoriteMealtimeId = mealtimeId;
//                     }
//                 }
//             }

//             respond(200, favoriteMealtimeId);
//         });
// };

// exports.count = function (respond, deleted) {

//     module.model.count({
//         deleted: deleted
//     }, function (err, count) {
//         if (err) {
//             respond(400, err);
//         } else {
//             respond(200, count);
//         }
//     });

// };

exports.delete = function (respond, id) {

    var seq = sequence();
    var ObjectId = module.mongoose.Types.ObjectId;
    var orderObjectID = new ObjectId(id);


    seq

    .then(function (next) {
        module.model.findByIdAndRemove(id, function (err, favorite) {
            if (err) {
                return respond(400, err);
            }
            else if (!favorite) {
                return respond(404, err);
            }
            else {
                respond(204);
            }
        });

    });
};

module.exports = function(app, model) {

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.models   = app.get('models');
    module.model    = app.get('models').favorite;

    return exports;
};