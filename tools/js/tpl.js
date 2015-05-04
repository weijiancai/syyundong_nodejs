Tools.tpl = {
    init: function() {
        var $container = $('#tplTable');
        var tplTable = new MU.ui.DataTable($container);
        tplTable.setColumns([
            {data: 'name', title: '名称'},
            {data: 'desc', title: '描述'}
        ]);
        tplTable.setUrl('/tools/tplBrowser');
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
            var selectedRow = tplTable.getSelectedRow();
            if(selectedRow) {
                $('#tplTables').hide();
                $('#tplEdit').show();
                $.post('/tools/tplGet', {name: selectedRow.name}, function(data) {
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

            var deps = '';
            if($('#depJquery2_1_3').get(0).checked) {
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/jquery-2.1.3/jquery-2.1.3.js"></script>';
            }

            if($('#depBootstrap3_3_4').get(0).checked) {
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/bootstrap-3.3.4/dist/css/bootstrap.css"/>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/bootstrap-3.3.4/dist/js/bootstrap.js"></script>';
            }

            if($('#depJqmobi2_2').get(0).checked) {
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/main.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/appframework.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/lists.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/forms.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/buttons.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/badges.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/grid.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/android.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/win8.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/bb.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/ios.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/ios7.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/tizen.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/css/firefox.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/plugins/css/af.actionsheet.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/plugins/css/af.popup.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/plugins/css/af.scroller.css"/>';
                deps += '<link rel="stylesheet" type="text/css" href="/public/js/lib/appframework-2.2/plugins/css/af.selectBox.css"/>';
                //deps += '<link rel="stylesheet" type="text/css" href="css/iconfont/iconfont.css" />';
                //deps += '<link rel="stylesheet" type="text/css" href="css/bootstrap.css" />';
                //deps += '<link rel="stylesheet" type="text/css" href="css/font-awesome.css" />';
                //deps += '<link rel="stylesheet" type="text/css" href="css/common.css" />';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/appframework.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.actionsheet.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.css3animate.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.passwordBox.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.scroller.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.selectBox.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.touchEvents.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.touchLayer.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.popup.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/appframework.ui.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/fade.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/flip.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/pop.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/slide.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/slideDown.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/ui/transitions/slideUp.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.slidemenu.js"></script>';
                deps += '<script type="text/javascript" charset="utf-8" src="/public/js/lib/appframework-2.2/plugins/af.8tiles.js"></script>';
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
            var html = '<html><head>' +
                deps +
                '<style type="text/css">' +
                cmCss.getDoc().getValue() +
                '</style></head><body>' +
                render({list: eval(cmJson.getDoc().getValue())}) +
                '</body><script type="text/javascript"></script></html>';

            $('#tplPreview').attr('srcdoc', html);
        });
    }
};