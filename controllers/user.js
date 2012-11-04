var crypto = require('crypto');

exports.add = function (respond, username, password) {

    var shasum = crypto.createHash('sha1');
    shasum.update(password);
    password_hash = shasum.digest('hex');

    var user = new module.model({
        username: username,
        password: password_hash
    });

    user.save(function (err, results) {
        if (err) {
            respond(400, err);
        } else {
            respond(201, results);
        }
    });
};

exports.getByUsername = function (respond, username) {

    module.model.findOne({
        username: username
    }, function (err, result) {
        if (err) return respond(400, err);
        return respond(200, result);
    });

}

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