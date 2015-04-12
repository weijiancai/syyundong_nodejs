$(function() {
    // 注册body id
    $('body').attr('id', 'login-page');

    $('#loginForm').validate({
        rules: {
            loginName: "required",
            loginPass: "required"
        },
        messages: {
            loginName: "手机号/邮箱/用户名不能为空！",
            loginPass: "登录密码不能为空！"
        },
        submitHandler: function (form) {
            form.submit();
        }
    });
});