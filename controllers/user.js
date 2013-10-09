var crypto = require('crypto');

var cryptPassword = function(password) {
    var shasum = crypto.createHash('sha1');
    shasum.update(password);

    return shasum.digest('hex');
};

var sequence = require('futures').sequence;

exports.add = function (respond, username, password) {

    var password_hash = cryptPassword(password);
    var seq = sequence();
    var user = new module.model({
        username: username,
        password: password_hash
    });

    seq

    .then(function (next) {
        module.model.findOne({
            username: username
        }, function (err, result) {
            if (result) {
                return respond(400); // username is already taken
            } else {
                next();
            }
        });
    })

    // save
    .then(function (next) {
        user.save(function (err, results) {
            if (err) {
                return respond(400, err);
            } else {
                return respond(201, results);
            }
        });
    });
};

exports.login = function (respond, username, password) {

    var password_hash = cryptPassword(password);

    module.model.findOne({
        username: username,
        password: password_hash
    }, function (err, result) {
        if (err || !result) return respond(400, err);
        return respond(200, result);
    });
};

exports.getByUsername = function (respond, username) {

    module.model.findOne({
        username: username
    }, function (err, result) {
        if (err) return respond(400, err);
        return respond(200, result);
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

module.exports = function(app, model) {

    module.db       = app.get('db');
    module.mongoose = app.get('mongoose');
    module.config   = app.get('config');

    module.model    = app.get('models').user;

    return exports;
};
