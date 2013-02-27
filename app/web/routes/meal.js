exports.renderMeals = function (req, res, next) {

    var page      = (parseInt(req.param('page')) - 1) || 0,
        limit     = module.config.pagination.perPage,
        sort      = req.param('sort') || module.config.pagination.sort,
        order     = req.param('order') || module.config.pagination.order,
        subdomain = 'meals'; // for pagination 

    var callback = function (mealtimes, pages, meals) {

        res.render('meals', {
            config      : module.config,
            session     : req.session,
            meals       : meals,
            mealtimes   : mealtimes,
            page_domain : subdomain,
            page        : page,
            pages       : pages,
            isAdmin     : module.controllers.user.isAdmin
        });
    };

    module.controller.renderMeals(callback, page, sort, order, limit);
};

exports.renderMeal = function (req, res, next) {

    var id = req.param('id');

    var callback = function (mealtimes, meal) {

        res.render('meal', { 
            config      : module.config,
            session     : req.session,
            meal        : meal,
            mealtimes   : mealtimes,
            isAdmin     : module.controllers.user.isAdmin
        });
    };

    module.controller.renderMeal(callback, id);
};

module.exports = function (app) {

    module.config      = app.get('config');
    module.controllers = app.get('controllers');
    module.controller  = app.get('controllers').meal;
    module.utilities   = app.get('utilities');

    return exports;
};