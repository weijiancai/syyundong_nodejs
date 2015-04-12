(function($){
  $.fn.goToTop = function(options){
    var opts = $.extend({},$.fn.goToTop.defaults,options);
    var $window = $(window),
    $body = (window.opera) ? (document.compatMode == 'CSS1Compat' ? $('html') : $('body')) : $('html,body');
    var $this = $(this),transition = $this.css('transition');
    var oldTop = $window.scrollTop();
    $window.bind('scroll.goToTop',function(){
      var controlLeft;
      if($window.width() > opts.bottom * 2 + opts.pageWidth){
        controlLeft = ($window.width() - opts.pageWidth) / 2 + opts.pageWidth + opts.distance;
      }else{
        controlLeft = $window.width() - opts.distance - $this.width();
      }
      var cssFixedSupport = $.browser.msie && parseFloat($.browser.version) < 7,
      controlTop = ($window.height() - $this.height() - opts.bottom),
      shuldVisible = ($window.scrollTop() >= opts.startline)?true:false;
      controlTop = cssFixedSupport ? ($window.scrollTop() + controlTop) : controlTop;
      if(oldTop > $window.scrollTop()){
        if(shuldVisible){
          if(!!opts.onShow){
            opts.onShow.call($this);
          }else{
            $this.show();
          }
        }else{
          $this.css('transition',transition);
          if(!!opts.onHide){
            opts.onHide.call($this);
          }else{
            $this.hide();
          }
        }
      }else{
        $this.css('transition',transition);
        if(!!opts.onHide){
          opts.onHide.call($this);
        }else{
          $this.hide();
        }
      }
      setTimeout(function(){
        oldTop = $window.scrollTop();
      },5);
      
      $this.css({
        'position': (cssFixedSupport ? 'absolute' : 'fixed'),
        'top' : controlTop,
        'left' : controlLeft
      });
      if(!!opts.bottomTarget && opts.bottomTarget.length > 0){
        var a = opts.bottomTarget,aTop = a.offset().top,wBottom = aTop-($window.scrollTop()+$window.height());
        if(wBottom<0){
          $this.css({
            'top' : controlTop + wBottom,
            'transition' : 'none'
          });
        }
      }
    }).trigger('scroll');
    $window.bind('resize.goToTop',function(){
      $window.trigger('scroll.goToTop');
    });
  };

  $.fn.goToTop.defaults = {
    pageWidth : 1190, //页面宽度
    distance : 10,//按钮与页面的间隔距离
    bottom : 50,//按钮与页面底部距离
    startline : 150,//出现时的距离
    onShow : null,
    onHide : null,
    bottomTarget : null
  }

})(jQuery);