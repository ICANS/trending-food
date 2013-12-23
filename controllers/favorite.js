var sequence = require('futures').sequence;

exports.add = function (respond, userId, mealId) {

    var seq                 = sequence(),
        ObjectId            = module.mongoose.Types.ObjectId;

    seq

    // Check wether the user exists.
    .then(function (next) {
        module.models.user
            .findOne({ _id: userId })
            .exec(function (err, result) {
                if (err) {
                    // Assume that the id is not valid.
                    return respond(404, err);
                }
                else if ('undefined' === typeof result) {
                    // No user with this id found.
                    return respond(404, {
                        statusText: 'User not found.'
                    });
                }

                var userObjectId = new ObjectId(userId);
                next(userObjectId);
            });
    })

    // Check wether the meal exists.
    .then(function (next, userObjectId) {
        module.models.meal
            .findOne({ _id: mealId })
            .exec(function (err, result) {
                if (err) {
                    // Assume that the id is not valid.
                    return respond(404, err);
                }
                else if ('undefined' === typeof result) {
                    // No meal with this id found.
                    return respond(404, {
                        statusText: 'Meal not found.'
                    });
                }

                var mealObjectId = new ObjectId(mealId);

                next(userObjectId, mealObjectId);
            });
    })

    // Check wether the favorite has already been added.
    .then(function (next, userObjectId, mealObjectId) {
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
                    next(userObjectId, mealObjectId);
                }
            });
    })

    // save
    .then(function (next, userObjectId,  mealObjectId) {

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

exports.getList = function (respond, userId) {
    module.model.find()
    .exec(function (err, results) {
        var aggregatedFavorites = {};

        if (err) return respond(400, err);

        results.map(function (favorite) {
            var favoriteMealId  = favorite.meal,
                favoriteUserId  = favorite.user;

            if ('undefined' === typeof aggregatedFavorites[favoriteMealId]) {
                aggregatedFavorites[favoriteMealId] = {
                    count   : 0
                };

                if (userId) {
                    aggregatedFavorites[favoriteMealId].isUserFavorite = false;
                }
            }

            // Increase counter.
            aggregatedFavorites[favoriteMealId].count++;

            // Check wether this is a favorite by the user with the id provided.
            if (userId && userId == favoriteUserId) {
                aggregatedFavorites[favoriteMealId].isUserFavorite = true;
            }
        });

        return respond(200, aggregatedFavorites);
    });
};

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

exports.delete = function (respond, userId, mealId) {
    var seq = sequence();

    seq

    // Get id.
    .then(function (next) {
        module.model
            .findOne({
                user    : userId,
                meal    : mealId
            })
            .exec(function (err, result) {
                if (err) return respond(400, err);

                if (!result) {
                    return respond(404, {
                        statusText: 'The favorite could not be found.'
                    });
                }

                next(result.id);
            });
    })

    .then(function (next, favoriteId) {
        module.model.findByIdAndRemove(favoriteId, function (err, favorite) {
            if (err) {
                return respond(400, err);
            }
            else {
                // The favorite has been deleted.
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