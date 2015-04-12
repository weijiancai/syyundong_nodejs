/**
 * Created by wei_jc on 15-4-8.
 */
$(function () {
    // 注册body id
    $('body').attr('id', 'social-home');

    // 热门帖子
    $('#hotTopicTabs').find('a').click(function() {
        $(this).parent().find('a').removeClass('current');
        $(this).addClass('current');
    });
});