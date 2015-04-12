/**
 * Created by wei_jc on 2015/4/6.
 */
$(function () {
    // 注册body id
    $('body').attr('id', 'venues-details');

    // 评分
    var $commentStar = $('#commentStar');
    $commentStar.find('i').each(function(index) {
        $(this).hover(function() {
            var $i = $commentStar.find('i');
            for(var i = 0; i <= index; i++) {
                $i.eq(i + 1).removeClass('icon16-starout').addClass('icon16-starin');
            }
            for(i = index; i < 5; i++) {
                $i.eq(i + 1).removeClass('icon16-starin').addClass('icon16-starout');
            }
        }).click(function() {
            $('#starTotal').val(index);
        });
    });
    //评论
    $('.clearfix').validate({
        rules: {
            content: 'required'
        },
        messages:{
            content:'评论内容不能为空'
        },
        submitHandler: function (form) {
            form.submit();
        }
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