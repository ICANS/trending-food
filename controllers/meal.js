var sequence = require('futures').sequence;
var fs       = require('fs');

var _updateById = function(respond, id, options) {

    module.model.findOne({ _id: id }, function (err, foundDocument) {

        for(var optionsProp in options) {

            if(typeof options[optionsProp] === 'object') {

                if(optionsProp === '$inc') {
                    for(var incProp in options[optionsProp]) {
                        foundDocument[incProp] += options[optionsProp][incProp];
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
}

exports.add = function (respond, title, amount, image, category) {

    if(image && image.size > 0) {
        var imageData = fs.readFileSync(image.path);
        var imageType = image.type;
    } else {
        var imageData = null;
        var imageType = null;
    }

    var meal = new module.model({
        title : title,
        amount: amount,
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

exports.count = function (respond, id, title, amount) {

    var options = {
        _id     : id     || null,
        title   : title  || null,
        amount  : amount || null,
        deleted : false
    };

    for (option in options) {
        if(options[option] === null) delete options[option];
    };

    module.model.count(options, function (err, count) {
        if (err) {
            respond(400, err);
        } else {
            respond(200, count);
        }
    });

};

exports.getById = function (respond, id) {

    var ObjectId     = module.mongoose.Types.ObjectId;
    var userObjectID = new ObjectId(id);

    module.model
        .findOne({ _id: id, deleted: false })
        .exec(function (err, results) {
            if (err) return respond(400, err);
            respond(200, results);
        });

};

exports.getList = function (respond, offset, limit, sort, order) {

    var limit  = limit  || 30;
    var offset = offset || 0;
    var sort   = sort   || 'created';
    var order  = order == 'desc' ? '-' : '';

    var seq = sequence();

    seq

    .then(function (next) {

        module.model.find({
            deleted: false
        })
        .sort(order + sort)
        .limit(limit)
        .skip(offset)
        .exec(function (err, results) {
            if (err) return respond(400, err);
            next(results);
        });
    })

    .then(function (next, results) {
        module.model.findOne().sort('-votes').exec(function (err, maxVotesResult) {
            if(err) return respond(400, err);
            if(!maxVotesResult) return respond(400, []);

            respond(200, {
                max: maxVotesResult.votes,
                items: results
            });
        });
    });
};

exports.getImageById = function (respond, id) {
    module.model.findById(id, function (err, result) {

        var result = result || {};

        if(!result || err || !result.image.data || !result.image.contentType) {
            result.image = {
                data: fs.readFileSync('./assets/default.jpg'),
                contentType: 'image/jpeg'
            }
        }

        return respond(200, result.image);
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

module.exports = function(app) {

    module.ex       = module.exports;
    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.model    = app.get('models').meal;

    return exports;
};