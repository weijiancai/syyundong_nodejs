$(function() {
    // 注册body id
    $('body').attr('id', 'signup-page');

    $('#registerForm').validate({
        rules: {
            mobile: "required",
            picCode: "required",
            password: 'required',
            confirmPass: {
                required: true,
                equalTo: '#password'
            }
        },
        messages: {
            mobile: "手机号码不能为空！",
            picCode: "验证码不能为空！",
            password: '密码不能为空！',
            confirmPass: {
                required: '确认密码不能为空！',
                equalTo: '两次输入密码不一致！'
            }
        },
        submitHandler: function (form) {
            jQuery.ajax({
                type: "post",
                url: "Register/ValidateInfo",
                data: {mobile: $("#mobile").val(), picCode: $('#picCode').val(),password: $('#password').val(),confirmPass: $('#confirmPass').val()},
                success: function (result) {
                    if (result == 1) {
                        $("#picmes").empty().html('<span style="color:red;font-size:14px">验证码错误</span>');
                        return false;
                    } else if (result == 2) {
                        $("#mobilemes").empty().html('<span style="color:red;font-size:14px">手机号码注册过</span>');
                        return false;
                    } else if (result == 3) {
                        $("#mobilemes").empty().html('<span style="color:red;font-size:14px">手机号码不正确</span>');
                        return false;
                    } else if (result == 4) {
                        $("#mobilemes").empty().html('<span style="color:red;font-size:14px">注册失败</span>');
                        return false;
                    } else if (result == 5) {
                        $("#mobilemes").empty().html('<span style="color:red;font-size:14px">注册信息全部不能为空</span>');
                        return false;
                    }
                }
            });
        }
    });

    // 图片验证码
    $('#verifyImg').click(function() {
        $(this).attr('src', 'verify');
    })
});