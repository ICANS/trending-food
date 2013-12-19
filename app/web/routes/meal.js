exports.renderMeals = function (req, res, next) {

    var page      = (parseInt(req.param('page'), 10) - 1) || 0,
        limit     = module.config.pagination.perPage,
        sort      = req.param('sort') || module.config.pagination.sort,
        order     = req.param('order') || module.config.pagination.order,
        filter    = req.filter || req.param('filter'),
        filterVal = req.value || req.param('value'),
        subdomain = 'meals'; // for pagination

    if (!filterVal && filter == 'amount') {
        filterVal = module.config.filter.default;
    }

    if ('category' == req.param('filter') && filterVal) {
        subdomain += '/category/' + filterVal;
    }
    else if ('amount' == req.param('filter')) {
        subdomain += '/amount/' + req.param('value');
    }

    var callback = function (mealtimes, pages, meals, favoriteMealtimeId) {
        var keyValueCategories  = module.config.categories,
            categories          = [],
            key,
            category,
            defaultMealtime     = module.config.mealtime.default,
            selectedMealtimeId  = 0 === favoriteMealtimeId.length ? defaultMealtime : favoriteMealtimeId;

        for (key in keyValueCategories) {
            if (keyValueCategories.hasOwnProperty(key)) {
                // Create object from key/value pair.
                category = {
                    'key'   : key,
                    'title' : keyValueCategories[key]
                };

                categories.push(category);
            }
        }

        // Sort categories alphabetically.
        categories = categories.sort(function (firstCategory, secondCategory) {
            var firstTitle  = firstCategory.title,
                secondTitle = secondCategory.title;

            return firstTitle.localeCompare(secondTitle);
        });

        res.render('meals', {
            config              : module.config,
            session             : req.session,
            meals               : meals,
            mealtimes           : mealtimes,
            categories          : categories,
            page_domain         : subdomain,
            page                : page,
            pages               : pages,
            selectedMealtimeId  : selectedMealtimeId,
            isAdmin             : module.controllers.user.isAdmin
        });
    };

    module.controller.renderMeals(callback, page, sort, order, limit, filter, filterVal, req.session);
};

exports.renderMeal = function (req, res, next) {

    var id = req.param('id');

    var callback = function (mealtimes, meal, favoriteMealtimeId) {
        var defaultMealtime     = module.config.mealtime.default,
            selectedMealtimeId  = 0 === favoriteMealtimeId.length ? defaultMealtime : favoriteMealtimeId;

        res.render('meal', {
            config              : module.config,
            session             : req.session,
            meal                : meal,
            mealtimes           : mealtimes,
            categories          : module.config.categories,
            selectedMealtimeId  : selectedMealtimeId,
            isAdmin             : module.controllers.user.isAdmin
        });
    };

    module.controller.renderMeal(callback, id, req.session);
};

module.exports = function (app) {

    module.config      = app.get('config');
    module.controllers = app.get('controllers');
    module.controller  = app.get('controllers').meal;
    module.utilities   = app.get('utilities');

    return exports;
};
