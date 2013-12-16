exports.login = function (req, res, next) {

    var username = req.param('username') || null,
        password = req.param('password') || null,
        host = req.param('host') || null;

    var callback = function () {
        return renderLogin(req, res, next);
    };

    module.controller.login(callback, req.session, username, password, host);
};

exports.checkLogin = function (req, res, next) {

    var callback = function (isLoggedIn) {

        if (isLoggedIn) {
            return next();
        }

        return res.redirect('/login');
    };

    module.controller.checkLogin(callback, req.session);
};

exports.logout = function (req, res, next) {

    var callback = function () {
        return renderLogin(req, res, next);
    };

    module.controller.logout(callback, req.session);
};

exports.renderLogin = renderLogin = function (req, res, next) {

    if (req.session.auth) {
        return res.redirect('/meals/amount/available/');
    }

    return res.render('login', {
        config  : module.config,
        session : req.session
    });
};

module.exports = function (app) {

    module.config     = app.get('config');
    module.controller = app.get('controllers').user;

    return exports;
};
