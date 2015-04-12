/**
 * Created by wei_jc on 15-4-8.
 */
$(function () {
    // 注册body id
    $('body').attr('id', 'topic-detail');

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