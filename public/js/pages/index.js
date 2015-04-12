$(function() {
    // 注册body id
    $('body').attr('id', 'index');
    // 显示导航
    $('#navigation').find('ul.navigation-list').show();

    //$('#myModal').modal({show: true, backdrop: 'static'});
    // 精选赛事描述
    $('ul.events-list').find('li').hover(function() {
        $(this).find('dd').show();
    }, function() {
        $(this).find('dd').hide();
    });

    // 赛事 - 运动项目
    var $eventItem = $('#eventItem');
    var $eventContent = $eventItem.find('div.datadropdown-content');
    $eventItem.find('input[type="text"]').focus(function() {
        $eventContent.show();
    });
    $eventItem.find('.datadropdown-close').click(function() {
        $eventContent.hide();
    });
    // tab切换
    $eventContent.find('dt > a').each(function (index) {
        $(this).click(function() {
            $eventContent.find('dt > a').removeClass('current');
            $(this).addClass('current');
            $eventContent.find('dd').hide().eq(index).show();
        });
    });
    $eventContent.find('dd a').click(function() {
        $eventContent.find('dd a').removeClass('current');
        $(this).addClass('current');
        $eventContent.hide();
        $eventItem.find('input[name="sportTypeId"]').val($(this).data('value'));
        $eventItem.find('input[type="text"]').val($(this).text());
    });

    // 活动 - 运动项目
    var $activityItem = $('#activityItem');
    var $activityContent = $activityItem.find('div.datadropdown-content');
    $activityItem.find('input[type="text"]').focus(function() {
        $activityContent.show();
    });
    $activityItem.find('.datadropdown-close').click(function() {
        $activityContent.hide();
    });
    $activityContent.find('dd a').click(function() {
        $activityContent.find('dd a').removeClass('current');
        $(this).addClass('current');
        $activityContent.hide();
        $activityItem.find('input[name="sportTypeId"]').val($(this).data('value'));
        $activityItem.find('input[type="text"]').val($(this).text());
    });

    // 场馆 - 运动项目
    var $venuesItem = $('#venuesItem');
    var $venueContent = $venuesItem.find('div.datadropdown-content');
    $venuesItem.find('input[type="text"]').focus(function() {
        $venueContent.show();
    });
    $venuesItem.find('.datadropdown-close').click(function() {
        $venueContent.hide();
    });
    $venueContent.find('dd a').click(function() {
        $venueContent.find('dd a').removeClass('current');
        $(this).addClass('current');
        $venueContent.hide();
        $venuesItem.find('input[name="sportTypeId"]').val($(this).data('value'));
        $venuesItem.find('input[type="text"]').val($(this).text());
    });

});