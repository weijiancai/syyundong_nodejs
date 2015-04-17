$(function() {
    var switchTab = new MU.ui.SwitchTab($('ul.page-sidebar-menu'));
    switchTab.onSelect(function($now, $old){
        $now.append('<span class="selected"></span>');
        $old.parent().removeClass('active').find('a span.selected').remove();
        $now.parent().addClass('active');
        // 设置标题
        $('#pageTile').text($now.text());
    });

    var $stringContent = $('#stringContent');
    var $replaceSourceText = $('#replaceSourceText');
    var $replaceTargetText = $('#replaceTargetText');
    $('#btnStringOk').click(function() {
        var str = $stringContent.val();
        $stringContent.val(stringLineConnect(str, "'"));
    });

    // 大写
    $('#btnToUpperCase').click(function() {
        commentExec();
        $stringContent.val(toUpperCase($stringContent.val()));
    });

    // 替换
    $('#btnReplace').click(function() {
        commentExec();
    });

    function commentExec() {
        // 替换
        var replaceSource = $replaceSourceText.val();
        if(replaceSource.length > 0) {
            $stringContent.val(replace($stringContent.val(), replaceSource, $replaceTargetText.val()));
        }
    }

    // 转换换行符为可显示的换行
    function convertLineSplit(str) {
        return str.replace(/\n/g, '\\n\n');
    }

    function stringLineConnect(str, connectChar) {
        return connectChar + str.replace(/\n/g, connectChar + ' + \n' + connectChar) + connectChar;
    }

    // 转换成大写
    function toUpperCase(str) {
        return str.toUpperCase();
    }

    // 转换成小写
    function toLowerCase(str) {
        return str.toLowerCase();
    }

    // 替换
    function replace(str, source, target) {
        return str.replace(new RegExp(source, 'g'), target);
    }

    // 数据库浏览
    $.fn.zTree.init($("#dbBrowser"), {
        async : {
            enable: true,
            url: '/tools/dbBrowser',
            type: 'post',
            autoParam:["id", "type"]
        }
    });
});