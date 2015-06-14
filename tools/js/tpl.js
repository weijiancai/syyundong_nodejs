Tools.tpl = {
    init: function() {
        var $container = $('#tplTable');
        var tplTable = new MU.ui.DataTable($container);
        tplTable.setColumns([
            {data: 'name', title: '名称'},
            {data: 'desc', title: '描述'}
        ]);
        tplTable.setUrl('/tools/tplBrowser');
        tplTable.applyOption();
        tplTable.query();

        var cmHtml = CodeMirror.fromTextArea($('#tplHtmlContent').get(0), {
            mode: 'text/html',
            lineNumbers: true,
            indentUnit: 4
        });
        var cmCss = CodeMirror.fromTextArea($('#tplCssContent').get(0), {
            mode: 'text/css',
            lineNumbers: true,
            indentUnit: 4
        });
        var cmJavaScript = CodeMirror.fromTextArea($('#tplJavascriptContent').get(0), {
            mode: 'text/css',
            lineNumbers: true,
            indentUnit: 4
        });
        var cmJson = CodeMirror.fromTextArea($('#tplDataContent').get(0), {
            mode: {name: "javascript", json: true},
            lineNumbers: true,
            indentUnit: 4
        });
        var cmSourceCode = CodeMirror.fromTextArea($('#tplSourceCode').get(0), {
            mode: 'text/html',
            lineNumbers: true,
            indentUnit: 4
        });

        var form = new MU.ui.DataForm();
        form.colCount = 1;
        form.addField({name: 'name', displayName: '名称'});
        form.addField({name: 'desc', displayName: '描述', displayStyle: MU.C_DS_TEXT_AREA});
        var content = form.gen();

        // 增加模板
        $('#btnAddTpl').click(function() {
            $('#tplTables').hide();
            $('#tplEdit').show();
            // 清空数据
            cmHtml.setValue('');
            cmCss.setValue('');
            cmJavaScript.setValue('');
            cmJson.setValue('');
            $('#tplPreview').attr('srcdoc', '');
        });
        // 编辑模板
        $('#btnEditTpl').click(function() {
            var selectedRow = tplTable.getSelectedRowData();
            if(selectedRow.length > 0) {
                $('#tplTables').hide();
                $('#tplEdit').show();
                $.post('/tools/tplGet', {name: selectedRow[0].name}, function(data) {
                    if(data) {
                        cmHtml.setValue(data.html);
                        cmCss.setValue(data.css);
                        cmJavaScript.setValue(data.javascript);
                        cmJson.setValue(data.data);
                        form.setValue('name', data.name);
                        form.setValue('desc', data.desc);
                    }
                });
            }
        });
        // 返回
        $('#btnTplBack').click(function() {
            $('#tplTables').show();
            $('#tplEdit').hide();
        });
        // 保存模板
        $('#btnSaveTpl').click(function() {
            window.dialog({
                title: '保存模板',
                //content: $('#dialogAddTpl').html(),
                content: content,
                okValue: '保存',
                ok: function() {
                    var html = cmHtml.getDoc().getValue();
                    var css = cmCss.getDoc().getValue();
                    var javascript = cmJavaScript.getDoc().getValue();
                    //var data = JSON.stringify(eval(cmJson.getDoc().getValue()));
                    var data = cmJson.getDoc().getValue();
                    form.post('/tools/tplSave', {html: html, css: css, javascript: javascript, data: data}, function(data) {

                    });
                }
            }).width(400).showModal();
        });
        // 模板生成
        $('#btnTplGen').on('click', function() {
            var render = template.compile(cmHtml.getDoc().getValue());

            var deps = '', indent = '        ';
            if($('#depJquery2_1_3').get(0).checked) {
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/jquery-2.1.3/jquery-2.1.3.js"></script>\r\n';
            }

            if($('#depBootstrap3_3_4').get(0).checked) {
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/bootstrap-3.3.4/dist/css/bootstrap.css"/>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/bootstrap-3.3.4/dist/js/bootstrap.js"></script>\r\n';
            }

            var isJqMobi = $('#depJqmobi2_2').get(0).checked;
            if(isJqMobi) {
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/main.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/appframework.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/lists.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/forms.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/buttons.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/badges.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/grid.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/android.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/win8.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/bb.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/ios.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/ios7.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/tizen.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/firefox.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/plugins/css/af.actionsheet.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/plugins/css/af.popup.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/plugins/css/af.scroller.css"/>\r\n';
                deps += indent + '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/plugins/css/af.selectBox.css"/>\r\n';
                //deps += '<link rel="stylesheet" type="text/css" href="css/iconfont/iconfont.css" />';
                //deps += '<link rel="stylesheet" type="text/css" href="css/bootstrap.css" />';
                //deps += '<link rel="stylesheet" type="text/css" href="css/font-awesome.css" />';
                //deps += '<link rel="stylesheet" type="text/css" href="css/common.css" />';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/appframework.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.actionsheet.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.css3animate.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.passwordBox.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.scroller.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.selectBox.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.touchEvents.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.touchLayer.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.popup.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/appframework.ui.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/fade.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/flip.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/pop.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/slide.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/slideDown.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/slideUp.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.slidemenu.js"></script>\r\n';
                deps += indent + '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.8tiles.js"></script>\r\n';
                /*deps += '';
                deps += '';
                deps += '';
                deps += '';
                deps += '';
                deps += '';
                deps += '';
                deps += '<link href="/public/js/lib/appframework-2.2/css/af.ui.base.css" rel="stylesheet" type="text/css" media="screen"/>';
                deps += '<link href="/public/js/lib/appframework-2.2/css/af.ui.css" rel="stylesheet" type="text/css" media="screen"/>';
                deps += '<link href="/public/js/lib/appframework-2.2/css/icons.css" rel="stylesheet" type="text/css" media="screen"/>';
                deps += '<script src="/public/js/lib/appframework-2.2/appframework.js" type="text/javascript"></script>';
                deps += '<script src="/public/js/lib/appframework-2.2/ui/appframework.ui.js" type="text/javascript"></script>';*/
            }

            var data = eval('(' + cmJson.getDoc().getValue() + ')');
            if($.isArray(data)) {
                data = {list: data};
            }
            var body = render(data);
            var script = cmJavaScript.getDoc().getValue();

            if(isJqMobi) {
                body = '<div id="afui" class="ios7">\r\n' +
                    '<!-- this is the splashscreen you see. -->\r\n' +
                    '    <div id="splashscreen" class="ui-loader heavy">\r\n' +
                    '        玩转机场\r\n' +
                    '        <br>\r\n' +
                    '        <br> <span class="ui-icon ui-icon-loading spin"></span>\r\n' +
                    '\r\n' +
                    '        <h1>正在启动......</h1>\r\n' +
                    '    </div>\r\n' +
                    '    <div id="header">\r\n' +
                    '        <a id="menubadge" onclick="af.ui.toggleSideMenu()" class="menuButton"></a>\r\n' +
                    '        <a id="switchAirport" href="#switchAirportPanel" class="glyphicon glyphicon-random" style="float: right;"></a>\r\n' +
                    '    </div>\r\n' +
                    '    <div id="content">\r\n' +
                    '        <!-- 首页 -->\r\n' +
                    body +
                    '    \r\n</div>\r\n' +
                    '\r\n' +
                    '    <div id="navbar">\r\n' +
                    '        <a href="#airTicketPanel" class="iconfont icon-feijipiao">飞机票</a>\r\n' +
                    '        <a href="#hbdtPanel" class="iconfont icon-hangbandongtai">航班动态</a>\r\n' +
                    '        <a href="#tripServicePanel" class="iconfont icon-gongwenbao">行程服务</a>\r\n' +
                    '        <a href="#" class="iconfont icon-gerenzhongxin">个人中心</a>\r\n' +
                    '    </div>\r\n' +
                    '\r\n' +
                    '    <nav id="main_nav">\r\n' +
                    '        <ul class="list">' +
                    '            <li><a class="iconfont icon-zhuce" href="#loginPanel">注册、登录</a></li>\r\n' +
                    '            <li><a class="iconfont icon-dingdan" href="#">我的订单</a></li>\r\n' +
                    '            <li><a class="iconfont icon-zancunfuwushixiang" href="#">服务帮助</a></li>\r\n' +
                    '            <li><a class="iconfont icon-shezhi" href="#settingPanel">设置</a></li>\r\n' +
                    '            <li><a class="iconfont icon-guanyuabout" href="#">关于</a></li>\r\n' +
                    '        </ul>\r\n' +
                    '    </nav>\r\n' +
                    '</div>\r\n';

                script = '    $.ui.useOSThemes = false;\r\n    $.ui.disableTabBar();\r\n' + script;
            }

            var html = '<html>\r\n    <head>\r\n' +
                deps +
                indent + '<style type="text/css">\r\n' +
                cmCss.getDoc().getValue() +
                indent + '</style>\r\n    </head>\r\n<body>\r\n' +
                body +
                '\r\n</body>\r\n<script type="text/javascript">\r\n' +
                    script +
                '\r\n</script>\r\n</html>';

            var $tplPreview = $('#tplPreview').attr('srcdoc', html);
            if(isJqMobi) {
                $tplPreview.css({width: '375px', height: '667px;', padding: '0'});
            }
            cmSourceCode.setValue(html);
        });
    }
};