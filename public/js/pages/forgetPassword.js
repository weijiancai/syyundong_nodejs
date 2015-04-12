$(function() {
    $('#forgetPasswordForm').validate({
        rules: {
            mobile: 'required',
            picCode: 'required',
            verifyCode: 'required',
            password: 'required',
            confirmPass: {
                required: true,
                equalTo: '#password'
            }
        },
        messages: {
            mobile: '手机号码不能为空！',
            picCode: '图片验证码不能为空！',
            verifyCode: '验证码不能为空！',
            password: '密码不能为空！',
            confirmPass: {
                required: '确认密码不能为空！',
                equalTo: '两次输入密码不一致！'
            }
                
        },
        submitHandler: function (form) {
            form.submit();
        }
    });
});