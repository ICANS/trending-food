var sequence = require('futures').sequence;
var _ = require('underscore');

exports.add = function (respond, title, amount) {

    var meal = new module.model({
        title : title,
        amount: amount
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
        amount  : amount || null
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
        .findOne({ _id: id })
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

        module.model.find()
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
            respond(200, {
                max: maxVotesResult.votes,
                items: results
            });
        });
    });
};

exports.delete = function (respond, id) {

    module.model.remove({
        _id: id
    }, function (err, results) {

        if(results === 0) return respond(404, 'id not found');
        if (err) return respond(400, err);

        return respond(200, {
            _id: id
        });
    });
};

exports.voteUp = function (respond, id) {

    module.model.update(
        { _id: id }, 
        { $inc: { votes: 1 } }, 
        { safe: true }, 
        function (err, results) {
            if (err || results == 0) return respond(400, err);

            module.model.findOne({ _id: id }, function (err, results) {
                if (err) return respond(400, err);

                results.validate(function (err) {
                    if (err) return respond(400, err);

                    respond(200, results);
                });
            });
        }
    );
};

exports.voteDown = function (respond, id) {

    module.model.update(
        { _id: id }, 
        { $inc: { votes: -1 } }, 
        { safe: true }, 
        function (err, results) {
            if (err || results == 0) return respond(400, err);

            module.model.findOne({ _id: id }, function (err, results) {
                if (err) return respond(400, err);

                results.validate(function (err) {
                    if (err) return respond(400, err);
                    
                    respond(200, results);
                });
            });
        }
    );
};

module.exports = function(app) {

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.model    = app.get('models').meal;

    return exports;
};