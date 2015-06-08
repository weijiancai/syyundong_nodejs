Tools.DB = function() {
    var self = this;

    var dataSourceForm = new MU.ui.DataForm();
    dataSourceForm.colCount = 1;
    dataSourceForm.fieldList = [
        {name: 'name', displayName: '名称：', required: true},
        {name: 'dbType', displayName: '数据库类型：', required: true, displayStyle: MU.C_DS_COMBO_BOX, list: [{data: 'mysql', label: 'MySql'}, {data: 'sqlServer', label: 'SqlServer'}]},
        {name: 'isVpn', displayName: '是否VPN：', required: false, displayStyle: MU.C_DS_COMBO_BOX, list: [{data: 'F', label: '否'}, {data: 'T', label: '是'}]},
        {name: 'host', displayName: '主机：', required: true},
        {name: 'port', displayName: '端口：', required: true},
        {name: 'user', displayName: '用户名：', required: true},
        {name: 'password', displayName: '密码：', required: true, displayStyle: MU.C_DS_PASSWORD},
        {name: 'database', displayName: '数据库：', required: false}
    ];

    var dbOption = {
        async: {
            enable: true,
            url: '/tools/dbBrowser',
            type: 'post',
            autoParam:["id", "type"]
        },
        callback: {
            onAsyncSuccess: function (event, treeId, treeNode, msg) {
                if(treeNode) {
                    var zTree = $.fn.zTree.getZTreeObj(treeId);
                    treeNode.name = treeNode.name + '<span class="num">(' + treeNode.children.length + ')</span>';
                    zTree.updateNode(treeNode);
                }
            }
        },
        view: {
            nameIsHTML: true
        }
    };

    this.init = function() {
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
                    console.log(treeNode);
                    if(treeNode.type == 'table') {
                        var children = treeNode.children;
                        if(!children) {
                            return;
                        }
                        for(var i = 0; i < children.length; i++) {
                            if(children[i].type == 'columns') {
                                children = children[i].children;
                                break;
                            }
                        }
                        if(children) {
                            self.initTable(treeNode.id, children);
                        } else {
                            self.genTable(treeNode.id);
                        }
                    }
                },
                onAsyncSuccess: function (event, treeId, treeNode, msg) {
                    if(treeNode) {
                        var zTree = $.fn.zTree.getZTreeObj(treeId);
                        treeNode.name = treeNode.name + '<span class="num">(' + treeNode.children.length + ')</span>';
                        zTree.updateNode(treeNode);
                    }
                },
                onRightClick: function(event, treeId, treeNode) { // 右键菜单
                    if(treeNode && !treeNode.noR) {
                        var css = {"top": event.clientY + "px", "left": event.clientX + "px", "visibility":"visible"};
                        if(treeNode.type == 'datasource') {
                            $('#treeMenuDataSource').show().css(css);
                        } else if(treeNode.type == 'table') {
                            $('#treeMenuTable').show().css(css);
                        }
                    }
                }
            },
            view: {
                nameIsHTML: true
            }
        });

        var $dbFavoritesList = $('#dbFavoritesList');
        $dbFavoritesList.on('click', 'li', function() {
            $dbFavoritesList.find('li').removeClass('active');
            $(this).addClass('active');
            var dbId = $(this).find('a').text();
            self.genTable(dbId);
        });

        // 获得数据库收藏
        $.post('/tools/dbGetFavorites', function(data) {
            $dbFavoritesList.append(template('tpl_dbFavoritesList', {list: data}));

        });

        var cmSql = CodeMirror.fromTextArea($('#dbSqlConsole').get(0), {
            mode: 'text/x-sql',
            lineNumbers: true,
            indentUnit: 4
        });

        // 添加数据源
        $('#btnDbAddDataSource').click(function() {
            var dialog = new MU.ui.Dialog();
            dialog.open('新增数据源', dataSourceForm.gen(), function() {
                dataSourceForm.post('/tools/dbSaveDataSource', {}, function() {
                    dialog.close();
                    self.refreshDbTree();
                });
            });
        });

        // 数据源右键菜单
        var $treeMenuDataSource = $('#treeMenuDataSource');
        $treeMenuDataSource.find('li').on('click', function(e) {
            e.preventDefault();

            $treeMenuDataSource.hide();
            var $this = $(this);

            var treeObj = $.fn.zTree.getZTreeObj("dbBrowser");
            var nodes = treeObj.getSelectedNodes();
            if(!nodes || nodes.length == 0) {
                dialog({
                    title: '警告',
                    content: '请选择数据源！'
                }).show();
                return;
            }

            if($this.hasClass('edit')) {
                self.editDataSource(nodes[0]);
            } else if($this.hasClass('delete')) {
                self.deleteDataSource(nodes[0]);
            }
        });

        // 表右键菜单
        var $treeMenuTable = $('#treeMenuTable');
        $treeMenuTable.find('li').on('click', function(e) {
            e.preventDefault();

            $treeMenuTable.hide();
            var $this = $(this);

            var treeObj = $.fn.zTree.getZTreeObj("dbBrowser");
            var nodes = treeObj.getSelectedNodes();
            if(!nodes || nodes.length == 0) {
                dialog({
                    title: '警告',
                    content: '请选择表！'
                }).show();
                return;
            }

            if($this.hasClass('favorites')) {
                var dbId = nodes[0].id;
                $.post('/tools/dbAddFavorites', {dbId: dbId}, function() {
                    $dbFavoritesList.append('<li><a href="#">' + dbId +'</a></li>');
                });
            }
        });

        // 注册事件，隐藏右键菜单
        $treeMenuDataSource.on('mouseleave', function() {
            $treeMenuDataSource.hide();
        });

        // 搜索数据库
        $('#btnDbSearch').on('click', self.openSearch);

        // 快捷键
        $(document).shortcuts({
            "ALT N": {
                keys: [18, 78],
                desc: "打开搜索",
                func: function() {
                    self.openSearch();
                }
            }
        });
    };

    this.genTable = function(id) {
        $.post('/tools/dbBrowser', {id: id, type: 'columns'}, function(children) {
            self.initTable(id, children);
        });
    };

    this.initTable = function(id, children) {
        var columns = [], pk;
        for(var i = 0; i < children.length; i++) {
            var column = children[i];
            var name = column.id.split('.')[3];
            var obj = {data: name, title: name, dataType: column.dataType, className: column.dataType, isPk: column.isPk, isFk: column.isFk, editable: true, displayName: column.displayName, tip: column.name};
            if(obj.isFk) {
                obj.render = (function(name) {
                    return function(data, type, full, meta) {
                        return '<a href="#" onclick="showFkDetail(\''+ id +'\', \'' + name + '\', \'' + data + '\')">' + data + '</a>';
                    }
                })(name);
                obj.editable = false; // 外键不可编辑
            } else {
                obj.render = function(data) {
                    return '<div>' + (data ? data : '') + '</div>';
                }
            }
            if(obj.isPk) {
                pk = obj.data;
            }
            obj.defaultContent = '';
            columns.push(obj);
        }

        var tableName = id.split('.')[2];
        var $tabs = $('#db_tablesPanel');
        var $ul = $tabs.find('ul');
        $ul.find('li').removeClass('active');
        var isHave;
        $ul.find('a').each(function() {
            if($(this).text() == tableName) {
                isHave = true;
            }
        });
        if(isHave) {
            return;
        }
        $ul.append('<li class="active"><a href="#table_' + tableName + '" data-toggle="tab">' + tableName + '</a></li>');

        var $panel = $tabs.find('div.tab-content');
        $panel.find('> div').removeClass('active');
        var $newPanel = $('<div class="tab-pane active" id="table_' + tableName + '"></div>');
        $newPanel.append();
        $panel.append($newPanel);

        var crud = new MU.ui.DataCrud($newPanel);
        // 数据追踪
        crud.addControlButton('数据追踪', function() {
            var dt = crud.dataTable();
            var selectedData = dt.getSelectedRow();
            if(selectedData.length == 0) {
                MU.ui.Message.alert('请选择数据！');
                return;
            }
            dialog({
                title: '数据追踪',
                content: $('#tpl_dbTrace').html(),
                button: [
                    {
                        value: '保存',
                        callback: function() {
                            var $content = this._$('content');
                            var traces = [];

                            $content.find('table tbody tr').each(function() {
                                var parent = $(this).find('td:eq(0) input').val();
                                var child = $(this).find('td:eq(1) input').val();
                                traces.push({parentCol: parent, childCol: child});
                            });
                            $.post('/tools/dbSaveTrace', {table: id, traces: JSON.stringify(traces)}, function() {
                                MU.ui.Message.alert('保存成功！');
                            });

                            return false;
                        }
                    },
                    {
                        value: '追踪',
                        callback: function() {
                            window.open('/tools/dbTrace?table=' + id + '&data=' + JSON.stringify(selectedData));
                        }
                    }
                ],
                onshow: function() {
                    var $content = this._$('content');
                    var $tbody = $content.find('tbody');

                    function appendRow(value1, value2) {
                        var tr = $('<tr></tr>').appendTo($tbody);
                        var td1 = $('<td></td>').appendTo(tr);
                        var td2 = $('<td></td>').appendTo(tr);
                        var td3 = $('<td class="width:4%"></td>').appendTo(tr);
                        var plus = $('<a class="btn btn-default"><span class="glyphicon glyphicon-plus"></span></a>').appendTo(td3);

                        plus.click(function() {
                            appendRow();
                        });

                        var tree1 = new MU.ui.ComboTree(td1, dbOption);
                        tree1.getInput().css('width', '360px');
                        tree1.setTreeNodeAttrName('id');
                        tree1.setValue(value1);
                        var tree2 = new MU.ui.ComboTree(td2, dbOption);
                        tree2.getInput().css('width', '360px');
                        tree2.setTreeNodeAttrName('id');
                        tree2.setValue(value2);
                    }

                    $.post('/tools/dbGetFkRefCol', {table: id}, function(data) {
                        if(data && data.length > 0) {
                            for(var i = 0; i < data.length; i++) {
                                appendRow(data[i]['parentCol'], data[i]['childCol']);
                            }
                        } else {
                            appendRow();
                        }
                    });
                }
            }).width(800).height(350).show();
        });

        // 数据变化
        crud.addControlButton('数据变化', function() {
            var dt = crud.dataTable();

            if(!dt.setTraceDataChange()) {
                return;
            }
            var data = dt.getTraceDataChange();

            dialog({
                title: '数据变化历史',
                content: '<div><table></table></div>',
                onshow: function() {
                    var $content = this._$('content');
                    var dt = new MU.ui.DataTable($content.find('table'));
                    var columns = [];
                    for(var i = 0; i < children.length; i++) {
                        var column = children[i];
                        var name = column.id.split('.')[3];
                        var obj = {data: name, title: name, dataType: column.dataType, className: column.dataType, isPk: column.isPk, isFk: column.isFk, editable: true, displayName: column.displayName, tip: column.name};
                        obj.render = (function(colName) {
                            return function(value, type, rowData, meta) {
                                var clazz = '';
                                var row = meta.row;
                                if(row > 0) {
                                    if(value != data[row - 1][colName]) {
                                        clazz = 'differ';
                                    }
                                }
                                return '<div class="' + clazz +'">' + (value ? value : '') + '</div>';
                            }
                        })(name);
                        if(obj.isPk) {
                            pk = obj.data;
                        }
                        obj.defaultContent = '';
                        columns.push(obj);
                    }
                    dt.setColumns(columns);
                    dt.setHeight(300);
                    dt.applyOption({
                        data: data,
                        serverSide: false,
                        paginate: false
                    });
                }
            }).width(1200).height(350).show();
        });

        // 可更新属性
        crud.addControlButton('RDS', function() {
            var tName = tableName;
            for(var i = 0; i < 2; i++) {
                var idx = tName.indexOf('_');
                if(idx > -1) {
                    tName = tName.substr(idx + 1);
                }
            }
            tName = MU.UString.convertHumpStr(tName);
            tName = MU.UString.firstCharToUpper(tName);

            var pk = '';
            var data = {tableName: tableName, tableCnName: tName};
            var cols = [];
            for(i = 0; i < children.length; i++) {
                var col = children[i];
                var colName = col.id.split('.')[3];
                var cnName = MU.UString.replaceAll(colName, '_', '').toUpperCase();
                var name = 'CN_' + cnName;
                if(col.isPk) {
                    pk = cnName;
                }
                cols.push({name: colName, cnName: cnName, lowerName: cnName.toLowerCase(), displayName: col.displayName});
            }
            data['pkCnName'] = pk;
            data['list'] = cols;

            console.log(data);
            dialog({
                title: 'RDS',
                content: template('tpl_rds', data)
            }).width(950).height(500).show();
        });

        var dt = crud.dataTable();
        dt.setHeight(600);
        dt.setColumns($.extend([], columns));
        dt.setUrl('/tools/dbRetrieve?id=' + id + '&pk=' + (pk ? pk : ''));
        dt.setEditable(true, '/tools/dbEditTable', {table: id});
        dt.setDeleteUrl('/tools/dbDeleteTableRow', {table: id});
        dt.applyOption();

        // 初始化表单
        var queryForm = crud.queryForm();
        queryForm.genByDataTable(dt);
    };

    this.editDataSource = function(node) {
        var dialog = new MU.ui.Dialog();
        var $form = dataSourceForm.gen();
        for(var key in node.obj) {
            if(node.obj.hasOwnProperty(key)) {
                dataSourceForm.setValue(key, node.obj[key]);
            }
        }
        dialog.open('编辑数据源', $form , function() {
            dataSourceForm.post('/tools/dbSaveDataSource', {}, function() {
                dialog.close();
                self.refreshDbTree();
            });
        });
    };

    this.deleteDataSource = function(node) {
        $.post('/tools/dbDeleteDataSource', {name: node.id}, function() {
            self.refreshDbTree();
        });
    };

    // ztree重新加载跟节点
    this.refreshDbTree = function() {
        var treeObj = $.fn.zTree.getZTreeObj("dbBrowser");
        treeObj.reAsyncChildNodes(null, 'refresh');
    };

    this.openSearch = function() {
        var filterDiv = '<div class="dbSearchFilter" style="display: none;"><ul>' +
            '<li><label><input type="checkbox" name="types" value="TABLE" checked>表</label></li>' +
            '<li><label><input type="checkbox" name="types" value="VIEW" checked>视图</label></li>' +
            '<li><label><input type="checkbox" name="types" value="COLUMN" checked>列</label></li>' +
            '<li><label><input type="checkbox" name="types" value="CONSTRAINT" checked>约束</label></li>' +
            '<li><label><input type="checkbox" name="types" value="INDEX" checked>索引</label></li>' +
            '<li><label><input type="checkbox" name="types" value="TRIGGER" checked>触发器</label></li>' +
            '<li><label><input type="checkbox" name="types" value="PROCEDURE" checked>存储过程</label></li>' +
            '<li><label><input type="checkbox" name="types" value="FUNCTION" checked>函数</label></li>' +
            '</ul>' +
            '<div><button id="filterSelectAll" type="button" class="btn btn-primary btn-sm">全选</button> <button id="filterUnSelectAll" type="button" class="btn btn-primary btn-sm">全不选</button></div>' +
            '</div>';
        var da = dialog({
            //title: '搜索',
            content: '<div class="flex search_input"><input type="text" class="form-control" placeholder="表/视图/列/约束/索引/触发器/函数"><span id="dbFilterTag" class="glyphicon glyphicon-filter"></span></div><ul id="dbSearchResult" class="list-group" style="display: none;"></ul>' + filterDiv,
            quickClose: true,
            padding: 5,
            onshow: function () {
                var $content = this._$('content');
                var $filterDiv = $content.find('.dbSearchFilter');
                // 恢复缓存过滤条件
                var types = MU.LocalStorage.get('DB.SearchFilter', true);
                if(types) {
                    $filterDiv.find('input').each(function() {
                        var value = $(this).val();
                        this['checked'] = $.inArray(value, types) > -1;
                    });
                }

                // 过滤
                $content.find('#dbFilterTag').click(function() {
                    $filterDiv.toggle();
                });
                // 全选
                $content.find('#filterSelectAll').click(function() {
                    $filterDiv.find('input').each(function() {
                        this['checked'] = true;
                    });
                });
                // 全不选
                $content.find('#filterUnSelectAll').click(function() {
                    $filterDiv.find('input').removeAttr('checked');
                });
                // 搜索框
                $content.find('input').focus().keyup(function(event) {
                    $filterDiv.hide();

                    var types = [];
                    $filterDiv.find('input:checked').each(function() {
                        types.push($(this).val());
                    });
                    // 缓存过滤条件
                    MU.LocalStorage.put('DB.SearchFilter', types, true);

                    searchDb(event, this, types.join(','), self, da);
                });

            }
        }).width(480).focus().show();
    };
};

// 显示外键详细信息
function showFkDetail(table, column, value) {
    $.post('/tools/dbShowFkDetail', {table: table, column: column, value: value}, function(data) {
        var children = data.columns;
        var form = new MU.ui.DataForm();
        form.colCount = 3;

        var columns = [];
        for(var i = 0; i < children.length; i++) {
            var column = children[i];
            var name = column.id.split('.')[3];
            var obj = {name: name, displayName: name, dataType: column.dataType, isPk: column.isPk, isFk: column.isFk};
            columns.push(obj);
        }
        form.fieldList = columns;
        var content = form.gen();
        form.setValues(data.data);

        dialog({
            title: data.fkTable,
            content: content
        }).width(1000).showModal();
    });
}

// 搜索数据库
function searchDb(event, input, types, db, dialog) {
    console.log(types);
    if(event.keyCode != 13) {
        return;
    }
    var value = $(input).val();
    if(MU.UString.isEmpty(value)) {
        return;
    }
    var params = {value: value};

    var treeObj = $.fn.zTree.getZTreeObj("dbBrowser");
    var nodes = treeObj.getSelectedNodes();
    if(nodes && nodes.length > 0) {
        var node = nodes[0];
        params.type = node.type;
        params.id = node.id;
        // 缓存数据源
        MU.LocalStorage.put('DB.SearchId', node.id);
    } else {
        var id = MU.LocalStorage.get('DB.SearchId');
        if(!id) {
            MU.ui.Message.alert('请选择数据源');
            return;
        } else {
            params.id = id;
        }
    }

    params.filter = types;

    $.post('/tools/dbSearch', params, function(data) {
        if(data) {
            var $result = $(input).parent().parent().find('#dbSearchResult').empty().show();
            for(var i = 0; i < data.length; i++) {
                $result.append(data[i]);
            }
            $result.find('li').click(function() {
                var id = $(this).data('id');
                var type = $(this).data('type');
                if(type == 'TABLE' || type == 'VIEW') {
                    db.genTable(id);
                    dialog.close();
                }
            })
        }
    });
}