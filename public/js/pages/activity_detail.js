/**
 * Created by wei_jc on 2015/4/6.
 */
$(function () {
    // 注册body id
    $('body').attr('id', 'activity-details');

    // 活动详情、已报名
    $('#relevantTabs').find('a').each(function (index) {
        $(this).click(function () {
            var $parent = $(this).parent();
            $parent.find('a').removeClass('current');
            $(this).addClass('current');
            var $dd = $parent.parent().find('dd');
            if(index == 0) {
                $dd.eq(1).hide();
            } else {
                $dd.eq(0).hide();
            }
            $dd.eq(index).show();
        });
    });

    // 回复
    var $replyPanel = $('.reply-panel');
    $replyPanel.find('a').click(function() {
        var $panel = $(this).parent().parent();
        $panel.find('.reply-form').toggle();
    });
    // 验证，提交回复
    $replyPanel.find('.reply-form form').validate({
        rules: {
            content: 'required'
        },
        messages: {
            content: '回复内容不能为空！'
        },
        submitHandler: function (form) {
            form.submit();
            $(form).parent().hide();
        }
    });
});