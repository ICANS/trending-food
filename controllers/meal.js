var sequence = require('futures').sequence;
var fs       = require('fs');

var _updateById = function(respond, id, options) {

    module.model.findOne({ _id: id }, function (err, foundDocument) {

        for (var optionsProp in options) {

            if (typeof options[optionsProp] === 'object') {

                if (optionsProp === '$inc') {
                    for (var incProp in options[optionsProp]) {
                        foundDocument[incProp] += options[optionsProp][incProp];
                    }
                }
                else if (optionsProp === '$set') {
                    for (var propertyName in options[optionsProp]) {
                        foundDocument[propertyName] = options[optionsProp][propertyName];
                    }
                }

            } else {
                foundDocument[optionsProp] += options[optionsProp];
            }
        }

        foundDocument.validate(function (err) {
            if (err) return respond(400, err);

            foundDocument.save(function (err, savedDocument) {
                if (err) return respond(400, err);

                return respond(200, savedDocument);
            });
        });
    });
};

var filterOptions = function(filter, filterVal) {
    if (filter == 'amount') {
        switch (filterVal) {
            case 'available':
                return { $gt: 0 };
            case 'outofstock':
                return { $lt: 1};
            case 'all':
                return { $gt: -1};
            default:
              return { $gt: 0 };
        }
    }

    return { $in: [filterVal] };
};

exports.add = function (respond, title, amount, vegetarian, image, category) {
    var imageData = null;
    var imageType = null;

    if (image && image.size > 0) {
        imageData = fs.readFileSync(image.path);
        imageType = image.type;

        fs.unlink(image.path, function(err) {
            if(err) throw err;
            console.log('deleted: ' + image.path);
        });
    }

    var meal = new module.model({
        title : title,
        amount: amount,
        vegetarian: vegetarian,
        category: category,
        image: {
            data        : imageData,
            contentType : imageType
        }
    });

    meal.save(function (err, results) {
        if (err) {
            respond(400, err);
        } else {
            respond(201, results);
        }
    });
};

exports.update = function (respond, id, title, category, image) {

    sequence()

    .then(function (next) {
        var imageData = null;
        var imageType = null;

        module.model.findById(id, function (err, meal) {
            meal.title = title;
            meal.category = category;

            if (image && image.size > 0) {
                imageData = fs.readFileSync(image.path);
                imageType = image.type;

                fs.unlink(image.path, function(err) {
                    if (err) throw err;
                    console.log('deleted: ' + image.path);
                });

                meal.image = {
                    data        : imageData,
                    contentType : imageType
                };
            }

            next(meal);
        });
    })

    .then(function (next, meal) {

        meal.validate(function (err) {
            if (err) return respond(400, err);

            meal.save(function (err) {
                if (err) return respond(400, err);

                return respond(200, meal);
            });
        });
    });

};

exports.count = function (respond, title, amount) {

    var options = {
        title   : title  || null,
        amount  : amount || null,
        deleted : false
    };

    for (var option in options) {
        if(options[option] === null) delete options[option];
    }

    module.model.count(options, function (err, count) {
        if (err) {
            respond(400, err);
        } else {
            respond(200, count);
        }
    });

};

exports.getById = function (respond, id) {

    var ObjectId = module.mongoose.Types.ObjectId;

    if (id.toString().length !== 24) {
        return respond(400, {
            error: true,
            message: 'submitted a invalid ID'
        });
    }

    var mealObjectID = new ObjectId(id);

    module.model.findOne({
        _id: mealObjectID,
        deleted: false
    }).exec(function(err, result) {
        if (!result || err) return respond(400, err);
        respond(200, result);
    });
};

exports.getList = function (respond, offset, limit, sort, order, filter, filterVal) {

    limit  = limit  || 30;
    offset = offset || 0;
    sort   = sort   || 'created';
    order  = order == 'desc' ? '-' : '';
    var query = {
        deleted: false
    };
    query[filter] = filterOptions(filter, filterVal);

    var seq = sequence();

    seq

    .then(function (next) {
        module.model.find(query)
        .select('_id title category deleted vegetarian votes amount')
        .limit(limit)
        .skip(offset)
        .sort(order + sort)
        .exec(function (err, results) {
            if (err) return respond(400, err);
            respond(200, results);
        });
    });
};

exports.getImageById = function (respond, id) {
    module.model.findById(id, function (err, result) {

        result = result || {};

        if (!result || err || !result.image.data || !result.image.contentType) {
            result.image = {
                data: fs.readFileSync('./assets/default.jpg'),
                contentType: 'image/jpeg'
            };
        }

        return respond(200, result.image);
    });
};

exports.getVotes = function (respond) {

    sequence()

    .then(function (next) {

        module.model.findOne().sort('-votes').exec(function (err, doc) {
            if(err) return respond(400, err);
            if(!doc) return respond(400, []);

            var votesMax = doc.votes;

            next(votesMax);
        });
    })

    .then(function (next, votesMax) {

        module.model.find().exec(function (err, docs) {
            if(err) return respond(400, err);
            if(!docs) return respond(400, []);

            var votesSum = 0;

            docs.forEach(function (doc, index) {
                votesSum += doc.votes;
            });

            respond(200, {
                max: votesMax,
                sum: votesSum
            });
        });

    });
};

exports.delete = function (respond, id) {
    _updateById(respond, id, {
        deleted: true
    });
};

exports.voteUp = function (respond, id) {
    _updateById(respond, id, {
        $inc: { votes: 1 }
    });
};

exports.voteDown = function (respond, id) {
    _updateById(respond, id, {
        $inc: { votes: -1 }
    });
};

exports.amountUp = function (respond, id) {
    _updateById(respond, id, {
        $inc: { amount: 1 }
    });
};

exports.amountDown = function (respond, id) {
    _updateById(respond, id, {
        $inc: { amount: -1 }
    });
};

exports.setVegetarian = function (respond, id, vegetarian) {
    _updateById(respond, id, {
        $set: { vegetarian: vegetarian }
    });
};

module.exports = function(app) {

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.model    = app.get('models').meal;

    return exports;
};
