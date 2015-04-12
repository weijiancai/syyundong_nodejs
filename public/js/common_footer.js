/**
    * @author wei_jc
    * @since 1.0.0
    */
/* 主页导航 */
$(function() {
    var $navigation = $('#navigation');

    if($(document.body).attr('id') != 'index') {
        $navigation.hover(function() {
            $navigation.find('> ul').addClass('hover');
        }, function() {
            $navigation.find('> ul').removeClass('hover');
        });

        $navigation.find('ul').mouseleave(function () {
            $navigation.find('> ul').removeClass('hover');
        });
    } else {
        $navigation.find('ul').mouseleave(function() {
            $navigation.find('div.navigation-item-content').hide();
        });
    }

    $navigation.find('div.navigation-item-static').hover(function () {
        $navigation.find('div.navigation-item-content').hide();
        $(this).parent().find('div.navigation-item-content').show();
    });
});
