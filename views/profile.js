$('.editButton').click(function(){             
    var prod_id = $(this).data('productId')
    alert(prod_id);
});

$('.deleteButton').click(function(){             
    var prod_id = $(this).data('productId');
    $('[data-toggle="popover"]').popover();
});

$('body').on('click', function (e) {
    $('[data-toggle="popover"]').each(function () {
        //the 'is' for buttons that trigger popups
        //the 'has' for icons within a button that triggers a popup
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
            $(this).popover('hide');
        }
    });
});