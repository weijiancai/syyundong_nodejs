define(['jquery', 'core', 'valid', 'simplevalidtips', 'timeselector', 'jqueryui', 'datadropdown'], function() {
  $(function() {
    var root = $('#match-post'),
      s = function(name) {
        return iyuesai.selector(name, root);
      };

    (function() {
      s('eventItem').dataDropDown({
        data: 'eventItem'
      });
      var form = $('form', root);
      iyuesai.ui.textareaAutoHeight(form.find('textarea'));
      form.valid({
        success: function() {
          var d = form.serializeArray();
          $(d).each(function(i,e){
            if(e.name == 'description'){
              e.value = iyuesai.util.encodeHTML(e.value);
              return false;
            }
          });
          $.ajax({
            'url':form.attr('action'),
            'type':form.attr('method'),
            'dataType':'json',
            'data':d,
            'cache':false,
            'success':function(data){
              if(data.flag == 1){
                $.dialog.success(data.msg||'赛事申请成功！',function(){
                  (data.url) && (window.location.href = iyuesai.webSitePath(data.url));
                });
              }else if(data.flag == 302){
                window.location.href = iyuesai.webSitePath(data.url);
              }else{
                data.msg && ($.dialog.error(data.msg));
              }
            }
          });
          return false;
        }
      });
      $("[validate-rules]", form).SimpleValidTips();
    })();

    // 发布赛事页面逻辑 added by yvon 20141014
    (function() {
      // 复制用户信息
      var $copyUserInfo = $('#copy_user_info'),
        $fm = $('form[name="fmPublish"]');
      getUserProfile(function(d) {
        $(document).data('user', d.user);
      }, function() {
        $copyUserInfo.parent().hide();
      });
      $copyUserInfo.on('change', function() {
        if ($(this).prop('checked')) {
          var user = $(document).data('user');
          if (user) {
            $fm.find('input[name="applyUserId"]').val(user.id);
            $fm.find('input[name="applyName"]').val(user.userName).trigger('change');
            $fm.find('input[name="applyPhone"]').val(user.mobile).trigger('change');
            $fm.find('input[name="applyEmail"]').val(user.email).trigger('change');
          }
        } else {
          $fm.find('input[name="applyUserId"]').val("");
          $fm.find('input[name="applyName"]').val("").trigger('change');
          $fm.find('input[name="applyPhone"]').val("").trigger('change');
          $fm.find('input[name="applyEmail"]').val("").trigger('change');
        }
      })

      var $sportTypeId = $fm.find('select[name="sporttypeid"]'),
        $sportTypeName = $fm.find('input[name="sporttypename"]');
      $sportTypeName.val($sportTypeId.children('option:selected').text());
      $sportTypeId.on('change', function() {
        $sportTypeName.val($sportTypeId.children('option:selected').text());
      });

      var $provinceId = $fm.find('select[name="provinceId"]'),
        $hostlocation = $fm.find('input[name="hostlocation"]');
      $hostlocation.val($provinceId.children('option:selected').text());
      $provinceId.on('change', function() {
        $hostlocation.val($provinceId.children('option:selected').text());
      });

      // 取消
      $('#i_game_cancel').click(function() {
        window.history.go(-1);
      });

      function getUserProfile(successFun, errorFun) {
        var _passport = getCookie('passport');
        if (_passport) {
          $.ajax({
            url: iyuesai.server.passportServer + 'getProfile.do',
            dataType: 'jsonp',
            data: {
              'passport': _passport,
              'loginType': 'default',
              '_t': new Date().getTime()
            },
            type: 'GET',
            success: function(d, textStatus, jqXHR) {
              if (d && d.code == 200) {
                successFun.call(window, d.messages.data);
              } else {
                errorFun.call(window, d);
              }
            },
            error: function(jqXHR, textStatus, errorThrown) {
              errorFun.call(window, {
                'code': 503
              });
            }
          });
        } else {
          errorFun.call(window, {
            'code': 503
          });
        }
      }

      function getCookie(c_name) {
        var arr = document.cookie.match(new RegExp("(^| )" + c_name + "=([^;]*)(;|$)"));
        if (arr != null)
          return unescape(arr[2]);
        return null;
      }
    })();
  });


});