define(['jquery', 'core', 'datadropdown', 'jquery.easing'], function() {
  $(function() {
    var root = $('#match-page'),
      s = function(name) {
        return iyuesai.selector(name, root);
      };

    /*banner*/
    (function() {
      var ul = s('banner').find('ul'),
        len = ul.find('li').length,
        start = 0,
        contoller = s('banner-controller'),
        html = '',
        timer;
      ul.css({
        'width': (len * 100) + '%'
      });
      ul.find('li').css('width', (100 / len) + '%');
      if (len > 1) {
        for (var i = 0; i < len; i++) {
          html += '<a href="javascript:;" data-index="' + i + '"';
          i == 0 && (html += ' class="current"');
          html += '></a>';
        }
        contoller.html(html);
        var player = function(index) {
          if (index == undefined) {
            start++;
            if (start > (len - 1)) start = 0;
            index = start;
          } else {
            start = parseInt(index);
          }
          ul.stop(true, true);
          ul.animate({
            left: -(index * 100) + '%'
          }, 800, 'easeInOutExpo')
          contoller.find('.current').removeClass('current');
          contoller.find('a:eq(' + index + ')').addClass('current');
        }
        contoller.delegate('a', 'click', function() {
          var index = parseInt($(this).attr('data-index'));
          clearInterval(timer);
          timer = null;
          player(index);
          timer = setInterval(player, 6000);
        });
        timer = setInterval(player, 6000);
      }
    })();

    s('cityItem').dataDropDown({
      data: 'cityList'
    });
    s('sportItem').dataDropDown({
      data: 'eventItem'
    });

    (function() {
      var hash = window.location.hash;
      s('relevantTabs').find('a').bind('click', function(event) {
        s('relevantTabs').find('a').removeClass('current');
        $(this).addClass('current');
        $(this).parents('div').find('div.tab-content-wrap').hide();
        $(this).parents('div').find('div.tab-content-wrap:eq(' + $(this).index() + ')').show();
        (window.Masonry) && (s('fluidImageWall').find('[data-selector="masonry"]').masonry('layout'));
      });
      if (hash) {
        s('relevantTabs').find('a[href="' + hash + '"]').trigger('click');
      }
    })();

    /*队列加载模块*/
    (function() {
      iyuesai.api.tplQueueLoad([{
        'tpl': 'friends-list',
        'selector': 'friends-box'
      }], s);

      s('topic-box').bind('refreshData', function() {
        iyuesai.api.tplQueueLoad([{
          'tpl': 'topic-list',
          'selector': 'topic-box'
        }, {
          'tpl': 'fluid-image-wall',
          'selector': 'fluidImageWall'
        }], s);
      }).trigger('refreshData');

    })();
    //publishbox
    define(['valid', 'simplevalidtips'], function() {
      var form = s('publish-form');
      var actionUrl = s('pub-wrap').data('action');
      var tt = form.find('textarea');
      var sm = form.find(':submit');
      if(sm.size()!=0){
        smt = sm.position().top;
      }
      iyuesai.ui.textareaAutoHeight(tt,function(pre,h){
        sm.stop(true,true).animate({'top':(smt+(pre.outerHeight()-h))+'px'},200);
      },function(){
        sm.stop(true,true).animate({'top':smt+'px'},200);
      });
      form.valid({
        success: function() {
          $.ajax({
            cache: false,
            type: "post",
            url: actionUrl,
            data: form.serializeArray(),
            error: function(request) {
              $.dialog.error('连接错误');
            },
            success: function(data) {
              if (data.flag == 1) {
                $.dialog.success('发布成功', function() {
                  s('topic-box').trigger('refreshData');
                  form.get(0).reset();
                  $('#store-wrap').html('').hide();
                });
              } else {
                $.dialog.error(data.msg);
              }
            }
          });
          return false;
        }
      });
      $("[validate-rules]").SimpleValidTips();
    });

    // 添加页面事件处理 added by yvon 20141014
    (function() {
      // 报名
      $('#i_game_apply').click(function() {
        var self=$(this);
        $.ajax({
          url:iyuesai.webSitePath('/api/GetGameInfo.json?gameId='+self.data('gameid')),
          dataType:'json',
          success:function(d){
            var json=d;
            var txt=json.messages.data.announce;
            if(txt!=''){
              $.dialog({
                title:'参赛声明',
                content:'<div style="width:800px; max-height:400px; overflow:hidden; overflow-y:scroll;">'+txt+'</div>',
                padding:'20px',
                ok:true,
                okValue:'已阅读，我同意',
                ok:function(){
                  window.location.href = iyuesai.server.websitePath + '/game/apply/' + self.data('gameid');
                }
              }).showModal();
            }else{
              window.location.href = iyuesai.server.websitePath + '/game/apply/' + self.data('gameid');
            }
          },
          cache:false
        });
      });
      s('i_team_apply').click(function() {
        var self=$(this);
        $.ajax({
          url:iyuesai.webSitePath('/api/GetGameInfo.json?gameId='+self.data('gameid')),
          dataType:'json',
          success:function(d){
            var json=d;
            var txt=json.messages.data.announce;
            if(txt!=''){
              $.dialog({
                title:'参赛声明',
                content:'<div style="width:800px; max-height:400px; overflow:hidden; overflow-y:scroll;">'+txt+'</div>',
                padding:'20px',
                ok:true,
                okValue:'已阅读，我同意',
                ok:function(){
                  window.location.href = iyuesai.webSitePath('/game/'+self.data('gameid')+'/team-apply');
                }
              }).showModal();
            }else{
              window.location.href = iyuesai.webSitePath('/game/'+self.data('gameid')+'/team-apply');
            }
          },
          cache:false
        });
      });

      // 关注和取消关注
      // 一开始先获取到赛事的follows列表
      var $gameFollow = s('gameFollow');
      iyuesai.api.getUserData(function(d){
        if(d){
          var gi = $gameFollow.data('gameid');
          $(d.follows).each(function(i,e){
            if(e == gi){
              $gameFollow.text('取消关注').removeClass('btn-danger').data('followed','1');
            }
          });
        }
      })

      $gameFollow.click(function() {
        iyuesai.api.follow($(this));
      });

      // 赛事成绩查询
      var $scoreSearch = $('#i_score_search');
      if ($scoreSearch.length) {
    	  define(['valid', 'simplevalidtips'], function() {
    	      var form = $('form[name="scoreForm"]');
    	      form.valid({
    	        success: function() {
    	          return true;
    	        }
    	      });
    	      $("[validate-rules]").SimpleValidTips();
    	    });
      }
    })();

    (function(){
      s('codeReg').click(function(event){
        var self = $(this);
        $.ajax({
          url:iyuesai.webSitePath('/api/GetGameInfo.json?gameId='+self.data('gameid')),
          dataType:'json',
          success:function(d){
            var json=d;
            var txt=json.messages.data.announce;
            if(txt!=''){
              var readme = $.dialog({
                title:'参赛声明',
                content:'<div style="width:800px; max-height:400px; overflow:hidden; overflow-y:scroll;">'+txt+'</div>',
                padding:'20px',
                ok:true,
                okValue:'已阅读，我同意',
                ok:function(){
                  NodeTpl.get('code-register', {element:self}, function(d) {
                    readme.remove();
                    setTimeout(function(){
                      $.dialog({
                        title:'邀请码验证',
                        content:d
                      }).showModal();
                    },50);
                  });
                }
              }).showModal();
            }else{
              NodeTpl.get('code-register', {element:self}, function(d) {
                $.dialog({
                  title:'邀请码验证',
                  content:d
                }).showModal();
              });
            }
          },
          cache:false
        });
      });
    })();

    (function(){
      var winHeight=$(window).height();
      maxHeight=winHeight-250;
      $(document).delegate('[data-selector=queryPhoto] li', 'click', function(event) {
        var dialog=$.dialog({
          title:'查看照片',
          content:'<div class="module-loading" style="width:150px; height:100px;"></div>',
          padding:'0px'
        }).showModal();
        var pTitle=$('.public-title').text();
        var self=$(this);
        var path=self.data('large');
        var params=self.data('params');
        var json=eval("("+params+")");
        var img=new Image();
        img.src=path;
        $(img).load(function(){
          var d='<div class="photo-wrap" data-selector="photoWrap">\
                  <h3>'+pTitle+'</h3>\
                  <img src="'+path+'" alt="" style="max-height:'+maxHeight+'px">\
                </div>\
                <div class="photo-base-bottom text-center">\
                  <a href="'+iyuesai.webSitePath(json.downloadUrl)+'" class="btn">保存原图</a>\
                </div>';
          dialog.content(d).width('800px').reset();
        });
      })
    })();

  });

});