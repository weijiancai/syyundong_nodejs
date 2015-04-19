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

    // 小写
    $('#btnToLowerCase').click(function() {
        commentExec();
        $stringContent.val(toLowerCase($stringContent.val()));
    });

    // 替换
    $('#btnReplace').click(function() {
        commentExec();
    });

    // 驼峰字符串
    $('#btnToHumpStr').click(function() {
        $stringContent.val(convertHumpStr($stringContent.val()));
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

    // 转换成驼峰字符串
    function convertHumpStr(str) {
        var result = '';
        str = str.toLowerCase();
        for(var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            if(c == '_') {
                result += str.charAt(i + 1).toUpperCase();
                i++;
            } else {
                result += c;
            }
        }

        return result;
    }

    // 数据库浏览
    $.fn.zTree.init($("#dbBrowser"), {
        async: {
            enable: true,
            url: '/tools/dbBrowser',
            type: 'post',
            autoParam:["id", "type"]
        },
        callback: {
            onClick: function(event, treeId, treeNode) {
                if(treeNode.type == 'table') {
                    console.log(treeNode);
                    var children = treeNode.children;
                    for(var i = 0; i < children.length; i++) {
                        if(children[i].type == 'column') {
                            children = children[i].children;
                            break;
                        }
                    }
                    var columns = [];
                    for(i = 0; i < children.length; i++) {
                        var column = children[i];
                        columns.push({data: column.name, title: column.name});
                    }
                    var dt = new MU.ui.DataTable($('#dbTable'));
                    dt.setColumns(columns);
                    dt.setHeight(600);
                    dt.initDataTable();
                }
            }
        }
    });
});