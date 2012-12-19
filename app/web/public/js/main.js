$(function () {

    $('#modal-order-add-container, #modal-meal-add-container').modal({
        show: false
    });

    var container = $('#meal-container');
    var api_url = $('#api').data('url');

    var meal_id     = '',
        meal_time   = '',
        user        = '';

    $('.order-modal-open').click(function (e) {

        e.preventDefault();

        var parent      = $(this).parents('.meal-item');
        var meal_title  = parent.data('meal-title');

        meal_id     = parent.data('meal-id');
        meal_time   = $('#modal-order-add-time').val();
        user        = $('[data-user-id]').data('user-id');

        $('#modal-order-add-title').val(meal_title);
    });

    $('#modal-order-add-action').click(function () {

        var data = {
            meal    : meal_id,
            mealtime: meal_time,
            user    : user
        };

        console.log(data);

        $.ajax({
            type : 'POST',
            url  : api_url + '/order/add',
            data: data,
            success: function (data) {
                window.location.href = '/account/orders'
            }
        }).fail(function(jqXHR, textStatus) {
            if(jqXHR.status === 400) {

                var msg = 'Something went wrong, sorry :/';

                switch ($.parseJSON(jqXHR.responseText).statusInternal) {
                    case 1:
                        msg = 'You already ordered some meal today! (<a href="/account/orders" title="My Orders">Here you can see it</a>). First delete your meal for today to order a new one.';
                    break;
                    case 2:
                        msg = 'This meals are empty, sorry :/';
                    break;
                }

                var html =  '<div class="alert alert-error">';
                    html += '<button type="button" class="close" data-dismiss="alert">×</button>';
                    html += '<strong>Oh snap!</strong> ' + msg;
                    html += '</div>';

                $('#modal-order-add-container .modal-body').prepend(html);

            }
        });

    });

    $('#modal-meal-add-action').click(function () {

        var meal_title  = $('#modal-meal-add-title').val();
        var meal_amount = $('#modal-meal-add-amount').val();

        var data = {
            title   : meal_title,
            amount  : meal_amount,
        };

        console.log(data);

        $.ajax({
            type : 'POST',
            url  : api_url + '/meal/add',
            data: data,
            success: function (data) {
                window.location.reload();
            }
        })

    });

    $('.meal-delete-action').click(function () {

        var parent  = $(this).parents('.meal-item');
        var meal_id = parent.data('meal-id');

        if(!confirm("Are you sure you want to delete this meal?")) return;

        $.ajax({
            url  : api_url + '/meal/delete/' + meal_id,
            success: function (data) {
                container.isotope( 'remove', parent, function() {});
            }
        });
    });


    $('.order-delete').click(function () {

        if(!confirm("Are you sure you want to delete your order?")) return;

        var parent = $(this).parents('[data-order-id]');
        var order_id = parent.data('order-id');

        $.ajax({
            url  : api_url + '/order/delete/' + order_id,
            success: function (data) {
                window.location.reload();
            }
        });

    });

    $('.meal-amount-up-action').click(function () {

        var parent      = $(this).parents('.meal-item');
        var meal_id     = parent.data('meal-id');
        var meal_amount = parent.data('meal-amount');

        $.ajax({
            url  : api_url + '/meal/amount/up/' + meal_id,
            success: function (data) {
                console.log(meal_amount);
                meal_amount++;
                console.log(meal_amount);
                console.log(parent);
                parent
                    .data('meal-amount', meal_amount)
                    .find('.meal-amount')
                    .text(meal_amount + 'x');
            }
        });
    });

    $('.meal-amount-down-action').click(function () {

        var parent      = $(this).parents('.meal-item');
        var meal_id     = parent.data('meal-id');
        var meal_amount = parent.data('meal-amount');

        $.ajax({
            url  : api_url + '/meal/amount/down/' + meal_id,
            success: function (data) {
                console.log(meal_amount);
                meal_amount--;
                console.log(meal_amount);
                console.log(parent);
                parent
                    .data('meal-amount', meal_amount)
                    .find('.meal-amount')
                    .text(meal_amount + 'x');
            }
        });
    });

    container.isotope({
        itemSelector : '.meal-item',
        getSortData : {
            amount : function( $elem ) {
                return $elem.data('meal-amount');
            },
            title : function( $elem ) {
                return $elem.data('meal-title');
            },
            votes : function( $elem ) {
                return $elem.data('meal-votes');
            }
        },
        layoutMode: 'cellsByRow',
        cellsByRow: {
            columnWidth: $('.meal-item').outerWidth() + 10,
            rowHeight: 320
        },
        sortBy : 'votes',
        sortAscending : false
    });


    $('#sort-by a').click(function(e) {

        e.preventDefault();

        var parent = $(this).parents('ul');
        parent.find('li').removeClass('active');

        $(this).parents('li').addClass('active');

        var sortName = $(this).data('option-value');
        var sortAsce = $(this).data('option-asce');

        container.isotope({ 
            sortBy : sortName,
            sortAscending : Boolean(sortAsce)
        });
    });

    $('#filter-by a').click(function(){

        e.preventDefault();

        var parent = $(this).parents('ul');
        parent.find('li').removeClass('active');

        $(this).parents('li').addClass('active');

        var filterName = $(this).data('option-value');
        container.isotope({ filter : 'votes' });
    });

});