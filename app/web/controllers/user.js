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
    if(username === null || password === null) {
        return respond();
    }

    var seq  = module.requirements.futures.sequence();

    var onSuccess = function() {

        session.auth     = true;
        session.username = username;

        seq

        // check if use exists
        .then(function (nextSeq) {

            module.requirements.request({
                uri     : module.config.api.uri + '/users/' + username,
                method  : 'GET'
            }, function (err, response, body) {

                if(err) {
                    console.error(err);
                    return respond();
                }

                var user = module.utilities.parseJSON(body);

                if(user && user._id) {
                    session.user_id = user._id; // set id for user
                    return respond();
                } else {
                    return nextSeq(); // create, user does not eixst
                }

            });

        })

        // user does not exists - create!
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

                if(err) {
                    console.error(err);
                    return respond();
                }

                session.user_id = user._id; // set id for user
                return respond();
            });

        });
    };

    var onError = function (err) {
        if(err) console.log(err);
        session.failed = true;
        return logout(respond, session);
    };

    module.xmpp.on('online', onSuccess);
    module.xmpp.on('error', onError);

    console.log(username, 'connected to:', host);

    for (var i = module.config.xmpp.hosts.length - 1; i >= 0; i--) {
        if(module.config.xmpp.hosts[i].domain === host) {
            var user = username + (module.config.xmpp.hosts[i].inUsername ? '@' + host : '');
            var domain = module.config.xmpp.hosts[i].domain;

            var opts = {
                jid         : user,
                password    : password,
                host        : domain,
                port        : module.config.xmpp.port
            };

            return module.xmpp.connect(opts);
        }
    }

    return onError();
};

exports.logout = logout = function (respond, session) {
    session.auth = false;
    return respond();
};

exports.isAdmin = function (session) {
    return module.config.admins.indexOf(session.username) != -1;
};

exports.checkLogin = function (respond, session) {

    if(typeof session.auth !== 'undefined' && session.auth === true) {
        return respond(true);
    }

    return respond(false);
};

module.exports = function(app) {

    module.config       = app.get('config');
    module.requirements = app.get('requirements');
    module.utilities    = app.get('utilities');
    module.xmpp         = require('simple-xmpp');

    return exports;
};