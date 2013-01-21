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

    var imageData = null;
    var imageType = null;

    if(image && image.size > 0) {
        imageData = fs.readFileSync(image.path);
        imageType = image.type;

        fs.unlink(image.path, function(err) {
            if(err) throw err;
            console.log('deleted: ' + image.path)
        });
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

    var ObjectId     = module.mongoose.Types.ObjectId;
    var userObjectID = new ObjectId(id);

    module.model.findOne({
        _id: userObjectID,
        deleted: false
    }).exec(function(err, results) {
        if (err) return respond(400, err);
        respond(200, results);
    });
};

exports.getList = function (respond, offset, limit, sort, order) {

    limit  = limit  || 30;
    offset = offset || 0;
    sort   = sort   || 'created';
    order  = order == 'desc' ? '-' : '';

    var seq = sequence();

    seq

    .then(function (next) {
        module.model.find({
            deleted: false,
            amount : {
                $gt: 0
            }
        })
        .select('_id title category deleted votes amount')
        .limit(limit)
        .skip(offset)
        .sort(order + sort)
        .exec(function (err, results) {
            if (err) return respond(400, err);
            next(results);
        });
    })

    .then(function (next, results) {
        module.model.findOne().sort('-votes').exec(function (err, doc) {
            if(err) return respond(400, err);
            if(!doc) return respond(400, []);

            respond(200, {
                max: doc.votes,
                items: results
            });
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

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.model    = app.get('models').meal;

    return exports;
};