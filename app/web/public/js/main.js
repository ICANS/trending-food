$(function() {

    $('#modal-order-add-container, #modal-meal-add-container').modal({
        show: false
    });

    var container = $('#meal-container');
    var api_url = $('#api').data('url');

    var meal_id = '',
        user = '';

    $('.order-modal-open').click(function(e) {

        e.preventDefault();

        var parent = $(this).parents('.meal-item');
        var meal_title = parent.data('meal-title');

        meal_id = parent.data('meal-id');
        user = $('[data-user-id]').data('user-id');

        $('#modal-order-add-title').val(meal_title);
    });

    $('.modal-order-add-action').click(function() {

        var data = {
            meal: meal_id,
            mealtime: $('#modal-order-add-time').val(),
            user: user
        };

        $.ajax({
            type: 'POST',
            url: api_url + '/orders/',
            data: data,
            success: function(data) {
                window.location.href = '/account/orders';
            }
        }).fail(function(jqXHR, textStatus) {
            if (jqXHR.status === 400) {

                var msg = 'Something went wrong, sorry :/';

                switch ($.parseJSON(jqXHR.responseText).statusInternal) {
                case 1:
                    msg = 'Meep, Something goes wrong oÔ';
                    break;
                case 2:
                    msg = 'This meals are empty, sorry :/';
                    break;
                case 3:
                    msg = 'Meal could not be found, sorry :/';
                    break;
                case 4:
                    msg = 'Mealtime is already fully booked. Please choose another one.';
                }

                var html = '<div class="alert alert-error">';
                html += '<button type="button" class="close" data-dismiss="alert">×</button>';
                html += '<strong>Oh snap!</strong> ' + msg;
                html += '</div>';

                $('#modal-order-add-container .modal-body').prepend(html);

            }
        });

    });

    $('#modal-meal-add-action').click(function() {

        var data = new FormData($('#modal-meal-add-form')[0]);

        $.ajax({
            type: 'POST',
            url: api_url + '/meals/',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {
                window.location.reload();
            }
        });

    });

    $('#meal-modal-open').click(function(e) {
        e.preventDefault();

        var parent = $(this).parents('.meal-item');
        meal_id = parent.data('meal-id');
    });

    $('#modal-meal-edit-action').click(function() {
        var data    = new FormData($('#modal-meal-edit-form')[0]);

        $.ajax({
            type: 'PUT',
            url: api_url + '/meals/' + meal_id,
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {
                window.location.reload();
            }
        });
    });

    $('.meal-delete-action').click(function() {

        var parent = $(this).parents('.meal-item');
        var meal_id = parent.data('meal-id');

        if (!confirm("Are you sure you want to delete this meal?")) return;

        $.ajax({
            type: 'POST',
            url: api_url + '/meals/' + meal_id + '/delete',
            success: function(data) {
                window.location.reload();
            }
        });
    });


    $('.order-delete').click(function() {

        if (!confirm("Are you sure you want to delete your order?")) return;

        var parent = $(this).parents('[data-order-id]');
        var order_id = parent.data('order-id');

        $.ajax({
            type: 'POST',
            url: api_url + '/orders/' + order_id + '/delete',
            success: function(data) {
                window.location.reload();
            }
        });

    });

    $('.order-datepicker').datepicker().on('changeDate', function(ev){
        $(this).data('datepicker').hide();
        var newDate = new Date(ev.date);
        window.location.href = '/orders/'+ newDate.getFullYear() +'-'+ (newDate.getMonth()+1) +'-'+ newDate.getDate() +'/';
    });

    var meals = [];

    $('.meal-item').each(function (i, ele) {
        meals.push({
            id   : $(ele).data('meal-id'),
            title: $(ele).data('meal-title')
        });
    });

    $('#meal-search').typeahead({
        property: 'title',
        onselect: function (selectedItem) {
            window.location.href = '/meal/' + selectedItem.id;
        },
        source: function (q) {

            var foundMeals = [];

            $(source).each(function (i, item) {
                if(item.title.indexOf(q) === -1) {
                    foundMeals.push(item);
                }
            });

            return foundMeals;
        }
    });

    $('.meal-amount-up-action').click(function() {

        var parent = $(this).parents('.meal-item');
        var meal_id = parent.data('meal-id');
        var meal_amount = parent.data('meal-amount');

        $.ajax({
            type: 'POST',
            url: api_url + '/meals/' + meal_id + '/amountup',
            success: function(data) {
                console.log(meal_amount);
                meal_amount++;
                console.log(meal_amount);
                console.log(parent);
                parent.data('meal-amount', meal_amount).find('.meal-amount').text(meal_amount);
            }
        });
    });

    $('.meal-amount-down-action').click(function() {

        var parent = $(this).parents('.meal-item');
        var meal_id = parent.data('meal-id');
        var meal_amount = parent.data('meal-amount');

        $.ajax({
            type: 'POST',
            url: api_url + '/meals/' + meal_id + '/amountdown',
            success: function(data) {
                console.log(meal_amount);
                meal_amount--;
                console.log(meal_amount);
                console.log(parent);
                parent.data('meal-amount', meal_amount).find('.meal-amount').text(meal_amount);
            }
        });
    });

    $('.meal-vegetarian-toggle').change(function () {
        var parent = $(this).parents('.meal-item');
        var vegetarianIndicator = parent.find('.meal-vegetarian');
        var meal_id = parent.data('meal-id');
        var vegetarian = $(this).is(':checked');

        $.ajax({
            type: 'POST',
            url: api_url + '/meals/' + meal_id + '/setvegetarian/' + vegetarian,
            success: function(data) {
                console.log(vegetarian ? 'yes' : 'no');
                console.log(parent);
                parent.data('meal-vegetarian', vegetarian);

                if (vegetarian) {
                    vegetarianIndicator.show();
                }
                else {
                    vegetarianIndicator.hide();
                }
            }
        });
    });

    var getButtonTitleForNumberOfFavorites = function (numberOfFavorites) {
        var buttonTitle = '';

        if (0 === numberOfFavorites) {
            buttonTitle = 'No favorites yet';
        }
        else if (1 === numberOfFavorites) {
            buttonTitle = '1 favorite';
        }
        else {
            buttonTitle = numberOfFavorites + ' favorites';
        }

        return buttonTitle;
    };

    var markMealAsFavorite = function (mealId, isFavorite) {
        var isFavorite          = isFavorite !== false,
            mealContainerId     = 'meal-' + mealId,
            mealContainer       = jQuery('#' + mealContainerId),
            button              = mealContainer.find('.toggleFavorite'),
            icon                = button.find('.icon'),
            countLabel          = button.find('.count-label'),
            numFavorites        = mealContainer.data('meal-numberoffavorites'),
            updatedNumFavorites = isFavorite ? numFavorites + 1 : numFavorites - 1,
            buttonTitle         = getButtonTitleForNumberOfFavorites(updatedNumFavorites);

        if (isFavorite) {
            button.addClass('btn-success');

            icon.removeClass('icon-star-empty').addClass('icon-star');
        }
        else {
            button.removeClass('btn-success');

            icon.removeClass('icon-star').addClass('icon-star-empty');
        }

        // Update count label.
        countLabel.text(buttonTitle);

        // Update data
        mealContainer.data('meal-isuserfavorite', isFavorite);
        mealContainer.data('meal-numberoffavorites', updatedNumFavorites);

        button.blur();
    };

    var addMealAsFavorite = function (mealId) {
        var userId  = jQuery('[data-user-id]').data('user-id');

        jQuery.ajax({
            type    : 'POST',
            url     : api_url + '/favorites',
            data    : {
                userId  : userId,
                mealId  : mealId
            },
            statusCode  : {
                200 : function () {
                    // The meal is already a favorite.
                    markMealAsFavorite(mealId);
                },
                201 : function () {
                    // The favorite has been added.
                    markMealAsFavorite(mealId);
                },
                404 : function () {
                    // Todo: Should we notify the user?
                }
            }
        });
    };

    var removeMealFromFavorites = function (mealId) {
        var userId  = jQuery('[data-user-id]').data('user-id');

        jQuery.ajax({
            type    : 'DELETE',
            url     : api_url + '/favorites',
            data    : {
                userId  : userId,
                mealId  : mealId
            },
            statusCode  : {
                204 : function () {
                    // The favorite has been deleted.
                    markMealAsFavorite(mealId, false);
                },
                404 : function () {
                    // The meal has not been a favorite.
                    markMealAsFavorite(mealId, false);
                }
            }
        });
    };

    $('.toggleFavorite').click(function(e) {
        var mealContainer   = $(this).parents('.meal-item'),
            mealId          = mealContainer.data('meal-id'),
            isUserFavorite  = mealContainer.data('meal-isuserfavorite');

        if (isUserFavorite) {
            removeMealFromFavorites(mealId);
        }
        else {
            addMealAsFavorite(mealId);
        }

        e.preventDefault();
    });

    // container.isotope({
    //     itemSelector: '.meal-item',
    //     getSortData: {
    //         amount: function($elem) {
    //             return $elem.data('meal-amount');
    //         },
    //         title: function($elem) {
    //             return $elem.data('meal-title');
    //         },
    //         votes: function($elem) {
    //             return $elem.data('meal-votes');
    //         }
    //     },
    //     layoutMode: 'cellsByRow',
    //     cellsByRow: {
    //         columnWidth: 290,
    //         rowHeight: 374
    //     },
    //     sortBy: 'votes',
    //     sortAscending: false
    // });


    // $('#sort-by a').click(function(e) {

    //     e.preventDefault();

    //     var parent = $(this).parents('ul');
    //     parent.find('li').removeClass('active');

    //     $(this).parents('li').addClass('active');

    //     var sortName = $(this).data('option-value');
    //     var sortAsce = $(this).data('option-asce');

    //     container.isotope({
    //         sortBy: sortName,
    //         sortAscending: Boolean(sortAsce)
    //     });
    // });

    // $('#filter-by a').click(function(e) {

    //     e.preventDefault();

    //     var parent = $(this).parents('ul');
    //     parent.find('li').removeClass('active');

    //     $(this).parents('li').addClass('active');

    //     var filterName = $(this).data('option-value');
    //     container.isotope({
    //         filter: 'votes'
    //     });
    // });

});
