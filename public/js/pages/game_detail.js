/**
 * Created by wei_jc on 2015/4/6.
 */
$(function () {
    // 注册body id
    $('body').attr('id', 'match-page');
    //
    var $detailTabs = $('#detailTabs');
    var $tabs = $('#tabs');
    $detailTabs.find('a').each(function (index) {
        $(this).click(function () {
            if($(this).text() == '赛友圈') {
                alert('跳转到赛友圈！');
                return;
            }
            $detailTabs.find('a').removeClass('current');
            $(this).addClass('current');

            $tabs.find('.tab').hide().eq(index).show();
            if(index == 0) {
                $('#detail_bottom').show();
            } else {
                $('#detail_bottom').hide();
            }
        });
    });

    $('#relevantTabs').find('a').each(function (index) {
        $(this).click(function () {
            $(this).parent().find('a').removeClass('current');
            $(this).addClass('current');
            if(index == 0) {
                $('#gameTopic').show();
                $('#gameFlow').hide();
            } else {
                $('#gameTopic').hide();
                $('#gameFlow').show();
            }
        });
    });
});