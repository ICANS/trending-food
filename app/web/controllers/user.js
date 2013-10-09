exports.login = function (respond, session, username, password, host) {

    // never seen the user before
    if (typeof session.auth === 'undefined') {
        session.auth = false;
    }

    // Is user already validated
    if (session.auth === true) {
        return respond();
    }

    // credentials not set
    if (username === null || password === null) {
        return respond();
    }

    var seq  = module.requirements.futures.sequence();
    var onError = function (err) {
        if (err) console.error(err);
        session.failed = true;

        return logout(respond, session);
    };

    session.auth     = true;
    session.username = username;

    seq

    // check if user can login
    .then(function (nextSeq) {
        module.requirements.request({
            uri     : module.config.api.uri + '/users/' + username + '/login',
            method  : 'POST',
            json    : true,
            body    : {
                password: password
            }
        }, function (err, response, user) {
            if (err) {
                console.error(err);
                nextSeq(); // create, user does not eixst
            }

            if (user && user._id) {
                session.user_id = user._id; // set id for user
                return respond();
            } else {
                nextSeq(); // create, user does not exist or credentials wrong
            }

        });

    })

    // user does not exist - create!
    .then(function (nextSeq) {
        module.requirements.request({
            uri     : module.config.api.uri + '/users/',
            method  : 'POST',
            json    : true,
            body    : {
                username: username,
                password: password
            }
        }, function (err, response, user) {
            if (err) {
                console.error(err);
                return respond();
            }

            if (user && user._id) {
                session.user_id = user._id; // set id for user
                return respond();
            } else {
                return onError('User account already taken');
            }
        });

    });
};

exports.logout = logout = function (respond, session) {
    session.auth = false;

    return respond();
};

exports.isAdmin = function (session) {
    return module.config.admins.indexOf(session.username) != -1;
};

exports.checkLogin = function (respond, session) {

    if (typeof session.auth !== 'undefined' && session.auth === true) {
        session.failed = false;

        return respond(true);
    }

    return respond(false);
};

module.exports = function(app) {

    module.config       = app.get('config');
    module.requirements = app.get('requirements');
    module.utilities    = app.get('utilities');

    return exports;
};
