exports.renderOrders = function (req, res, next) {

    var page      = (parseInt(req.param('page'), 10) - 1) || 0;
    var limit     = module.config.pagination.perPage;
    var subdomain = 'orders'; // for pagination
    var dateTemp  = req.param('date');
    dateTemp      = undefined !== dateTemp ? new Date(dateTemp) : new Date();
    var selectedDate = new Date(dateTemp.getFullYear(), dateTemp.getMonth(), dateTemp.getDate());

    var callback = function (mealtimes, orders) {
        return res.render('orders', {
            title       : 'All Orders',
            config      : module.config,
            utilities   : module.utilities,
            session     : req.session,
            page_domain : subdomain,
            orders      : orders,
            mealtimes   : mealtimes,
            date        : selectedDate
        });
    };

    module.controller.renderOrders(callback, next, page, limit, selectedDate);
};

exports.renderOrdersByUser = function (req, res, next) {

    var page      = (parseInt(req.param('page'), 10) - 1) || 0;
    var limit     = module.config.pagination.perPage;
    var sort      = req.param('sort');
    var subdomain = 'account/orders'; // for pagination

    var callback = function (mealtimes, orders) {
        return res.render('user/orders', {
            title       : 'Your Orders',
            config      : module.config,
            utilities   : module.utilities,
            session     : req.session,
            page_domain : subdomain,
            orders      : orders,
            mealtimes   : mealtimes
        });
    };

    module.controller.renderOrdersByUser(callback, next, req.session, page, limit);
};

module.exports = function (app) {

    module.config     = app.get('config');
    module.controller = app.get('controllers').order;
    module.utilities  = app.get('utilities');

    return exports;
};
