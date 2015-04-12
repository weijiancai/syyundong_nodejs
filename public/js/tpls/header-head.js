(function(N, undefined){
  var PATH = '/header-head.js';
  if(!N || !N._tpls) return false;
  N._tpls[PATH] = N._tpls[PATH] ||
{
  "main": function($DATA, guid){
    var css = '', dguid = N.dguid();
    var template = {
      init: function(){
        this.v8 = !!''.trim;
        this.result = this.v8 ? '' : [];
      },
      push: function(str){
        this.v8 ? (this.result += str) : this.result.push(str);
      },
      html: function(){
        return this.v8 ? this.result : this.result.join('');
      }
    };
    guid = guid || N.guid();
    template.init();

    template.push('<div id="'+ guid +'"></div>\n  \n');
    template.push('<script>');
    template.push('(function(window, document, undefined){\n');
    template.push('  var $ROOT = $("#'+ guid +'");\n');
    template.push('  var $TPLS = NodeTpl._tpls["'+ PATH +'"];\n');
    template.push('  var $DATA = NodeTpl._data["'+ dguid +'"];\n');
    template.push('var s = function(name){\n');
    template.push('      return iyuesai.selector(name,$ROOT);\n');
    template.push('    },_passport = iyuesai.util.getCookie(\'passport\');\n');
    template.push('    if (_passport) {\n');
    template.push('      $.ajax({\n');
    template.push('        url: iyuesai.contentServer(\'GetUserData\'),\n');
    template.push('        dataType: \'json\',\n');
    template.push('        data: {\'passport\':_passport,\'loginType\':\'default\',\'_t\':new Date().getTime()},\n');
    template.push('        type: \'GET\',\n');
    template.push('        success: function (d, textStatus, jqXHR) {\n');
    template.push('          if(d && d.code == 200){\n');
    template.push('            $DATA.data = d.messages.data;\n');
    template.push('            $ROOT.html($TPLS[\'content\']($DATA, "'+ guid +'"));\n');
    template.push('            iyuesai.selector(\'userCenterInfo\',$(\'body\')).html($TPLS[\'userinfo\']($DATA, "'+ guid +'"));\n');
    template.push('          }else{\n');
    template.push('            $ROOT.html($TPLS[\'content\']($DATA, "'+ guid +'"));\n');
    template.push('          }\n');
    template.push('        },\n');
    template.push('        error: function (jqXHR, textStatus, errorThrown) {\n');
    template.push('          $ROOT.html($TPLS[\'content\']($DATA, "'+ guid +'"));\n');
    template.push('        }\n');
    template.push('      });\n');
    template.push('    }else{\n');
    template.push('      $ROOT.html($TPLS[\'content\']($DATA, "'+ guid +'"));\n');
    template.push('    }\n');
    template.push('    $ROOT.delegate(\'[data-selector="logOut"]\', \'click\', function(event) {\n');
    template.push('      $.ajax({\n');
    template.push('        url: iyuesai.passportServer(\'logout.do\'),\n');
    template.push('        dataType: \'jsonp\',\n');
    template.push('        data: {\n');
    template.push('          \'passport\': iyuesai.util.getCookie(\'passport\')\n');
    template.push('        },\n');
    template.push('        type: \'POST\',\n');
    template.push('        success: function(d, textStatus, jqXHR) {\n');
    template.push('          iyuesai.util.checkIndex();\n');
    template.push('        },\n');
    template.push('        error: function(jqXHR, textStatus, errorThrown) {\n');
    template.push('          iyuesai.util.checkIndex();\n');
    template.push('        }\n');
    template.push('      });\n');
    template.push('    });\n');
    template.push('  \n');
    template.push('})(window, document);\n');
    template.push('delete NodeTpl._data["'+ dguid +'"];\n');
    template.push('</script>\n');
    $DATA && (N._data[dguid] = $DATA);
    return template.html();
  },
  "content": function($DATA, guid){
    var css = '', dguid = N.dguid();
    var template = {
      init: function(){
        this.v8 = !!''.trim;
        this.result = this.v8 ? '' : [];
      },
      push: function(str){
        this.v8 ? (this.result += str) : this.result.push(str);
      },
      html: function(){
        return this.v8 ? this.result : this.result.join('');
      }
    };
    guid = guid || N.guid();
    template.init();

    template.push('<div class="pull-left">\n    ');
if(!$DATA.data){
    template.push('\n    <a href="');
    template.push(((iyuesai.webSitePath('/auth/login')) == null ? '' : (iyuesai.webSitePath('/auth/login'))));
    template.push('">登录</a>\n    <a href="');
    template.push(((iyuesai.webSitePath('/auth/register')) == null ? '' : (iyuesai.webSitePath('/auth/register'))));
    template.push('">注册</a>\n    ');
}else{
    template.push('\n    <a href="');
    template.push(((iyuesai.webSitePath('/userCenter/timeline')) == null ? '' : (iyuesai.webSitePath('/userCenter/timeline'))));
    template.push('" href="javascript:;" class="user-name">');
    template.push((($DATA.data.user.nickName) == null ? '' : ($DATA.data.user.nickName)));
    template.push('</a>，欢迎来到爱约赛！\n    <a data-selector="logOut" href="javascript:;" class="logout">[退出]</a>\n    ');
}
    template.push('\n  </div>\n  <div class="pull-right">\n    ');
if(!!$DATA.data){
    template.push('\n    <a href="');
    template.push(((iyuesai.webSitePath('/userCenter/timeline')) == null ? '' : (iyuesai.webSitePath('/userCenter/timeline'))));
    template.push('" href="javascript:;">个人中心</a>\n    <a href="');
    template.push(((iyuesai.webSitePath('/userCenter/message/msg-game')) == null ? '' : (iyuesai.webSitePath('/userCenter/message/msg-game'))));
    template.push('">消息<span data-selector="unreadMsgCount"></span></a>\n  \n    ');
}
    template.push('\n    <a href="http://www.iyuesai.com/m/download.html">爱约赛移动端</a>\n  </div>\n');
    $DATA && (N._data[dguid] = $DATA);
    return template.html();
  },
  "userinfo": function($DATA, guid){
    var css = '', dguid = N.dguid();
    var template = {
      init: function(){
        this.v8 = !!''.trim;
        this.result = this.v8 ? '' : [];
      },
      push: function(str){
        this.v8 ? (this.result += str) : this.result.push(str);
      },
      html: function(){
        return this.v8 ? this.result : this.result.join('');
      }
    };
    guid = guid || N.guid();
    template.init();
if(!!$DATA.data){
    template.push('\n  <table>\n    <tbody>\n      <tr>\n        <th><a href="');
    template.push(((iyuesai.webSitePath('/userCenter/timeline')) == null ? '' : (iyuesai.webSitePath('/userCenter/timeline'))));
    template.push('"><img name="user-head" src="');
    template.push(((iyuesai.util.replaceImageName(iyuesai.imageServer($DATA.data.user.avatar),'60x60')) == null ? '' : (iyuesai.util.replaceImageName(iyuesai.imageServer($DATA.data.user.avatar),'60x60'))));
    template.push('" /></a></th>\n        <td><a href="');
    template.push(((iyuesai.webSitePath('/userCenter/game')) == null ? '' : (iyuesai.webSitePath('/userCenter/game'))));
    template.push('"> <span>');
    template.push((($DATA.data.gameCount) == null ? '' : ($DATA.data.gameCount)));
    template.push('</span><br> <em>赛事</em>\n        </a> <i></i> <a href="');
    template.push(((iyuesai.webSitePath('/userCenter/activity')) == null ? '' : (iyuesai.webSitePath('/userCenter/activity'))));
    template.push('"> <span>');
    template.push((($DATA.data.createActivityCount + $DATA.data.signupActivityCount) == null ? '' : ($DATA.data.createActivityCount + $DATA.data.signupActivityCount)));
    template.push('</span><br> <em>活动</em>\n        </a> <i></i> <a href="');
    template.push(((iyuesai.webSitePath('/userCenter/topic')) == null ? '' : (iyuesai.webSitePath('/userCenter/topic'))));
    template.push('"> <span name="user-topic">');
    template.push((($DATA.data.topicCount) == null ? '' : ($DATA.data.topicCount)));
    template.push('</span><br> <em>话题</em>\n        </a></td>\n      </tr>\n    </tbody>\n  </table>\n  ');
}
    template.push('\n');
    $DATA && (N._data[dguid] = $DATA);
    return template.html();
  }
};
})(window.NodeTpl);