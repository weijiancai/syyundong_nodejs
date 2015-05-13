var MU = {};

MU.ui = {
    SwitchTab: function($container) {
        var onSelectCallback;

        var $a = $container.find('a');
        var $current = $a.eq(0);

        $a.click(function() {
            console.log($current);
            var $this = $(this);
            // 隐藏
            $('#' + $current.data('target')).hide();
            // 显示
            var $target = $('#' + $this.data('target')).show();
            if(onSelectCallback) {
                onSelectCallback($this, $current, $target);
            } else {
                $target.addClass('active');
            }

            $current = $this;
        });

        /**
         * 选中回调
         * @param callback
         */
        this.onSelect = function(callback) {
            onSelectCallback = callback;
        }
    },
    /**
     * 数据表格
     *
     * @param $container
     * @constructor
     */
    DataTable: function($container) {
        var dt, self = this, initComplete, loadDataEnd;
        var isInit; // 是否已初始化
        var selectedRow;

        var option = {
            "searching": false,
            "lengthChange": false,
            "processing": true,
            "serverSide": false, // 服务器端排序
            "paginate": true, // 分页
            "info": false,
            //"paginationType": "bootstrap",
            //"scrollX": true,
            "columns": [],
            "ajax": {url: '', type: 'POST', data: {}},
            //"retrieve": true,
            "destroy": true,
            "initComplete": function(setting) {
                if(!isInit) {
                    $container.find('th').eq(0).removeClass('sorting_asc').css({paddingLeft: '10px', paddingRight: '10px'});
                    $container.find("select, input, a.button, button").uniform();

                    $container.find('.group-checkable').change(function () {
                        var checked = $(this).is(":checked");
                        $container.find('.checkboxes').each(function (index) {
                            console.log(this);
                            if (checked) {
                                $(this).attr("checked", true);
                            } else {
                                $(this).attr("checked", false);
                            }
                            $.uniform.update($(this));
                        });
                    });

                    // 选中行
                    $container.find('tbody').on( 'click', 'tr', function () {
                        console.log('click tr' + this);
                        // 获得行号
                        var row = dt.row(this).index();
                        if ($(this).hasClass('selected')) {
                            $(this).removeClass('selected');
                            self.setValue(row, 0, false);
                            selectedRow = null;
                        } else {
                            dt.$('tr.selected').removeClass('selected');
                            $(this).addClass('selected');
                            self.setValue(row, 0, 'T');
                            //self.setValue(row, 1, 12);
                            selectedRow = dt.row(this).data();
                        }
                    } );


                    // 回调初始化完成
                    if(initComplete) {
                        initComplete();
                    }
                    isInit = true;
                }
            }
        };

        $container.on('init.dt', function() {
            // 复选框全选
            $(dt.table().header()).find('.group-checkable').change(function () {
                var set = $(this).attr("data-set");
                var checked = $(this).is(":checked");
                $container.find(set).each(function () {
                    if (checked) {
                        $(this).attr("checked", "checked");
                    } else {
                        $(this).removeAttr('checked');
                    }
                });
                $.uniform.update(set);
            });
        });

        this.showPaginate = function(isShow) {
            option.paginate = isShow;
        };

        this.showInfo = function(isShow) {
            option.info = isShow;
        };

        this.showSearching = function(isShow) {
            option.searching = isShow;
        };

        this.setUrl = function(url, params) {
            option.ajax.url = url;
            option.ajax.data = params;
        };

        this.setHeight = function(height) {
            option.scrollY = height;
        };

        this.setColumns = function(columns) {
            columns.unshift({
                "render": function ( data, type, row ) {
                    var check = data ? 'checked="checked"' : '';
                    return '<input type="checkbox" class="checkboxes" ' + check + '/>';
                },
                title: '<input type="checkbox" class="group-checkable" data-set=".checkboxes" />',
                orderable: false,
                //width: 1,
                className: 'sorting_disabled'
                //type: 'string'
                //orderSequence: []
            });
            option.columns = columns;
            if(columns.length > 0) {
                option.scrollX = true;
            }
        };

        this.applyOption = function() {
            if(dt) {
                dt.destroy();
                // 清空列
                $container.empty();
            }
            dt = $container.DataTable($.extend({}, option));
        };

        this.loadData = function(data) {
            dt.clear();
            dt.rows.add(data.data ? data.data : data).draw();
            // 加载数据完成后回调
            if(loadDataEnd) {
                loadDataEnd(data);
            }
        };

        this.query = function(params) {
            option.ajax.data = params;
            dt.ajax.reload();
        };

        this.getOption = function() {
            return option;
        };

        /**
         * 设置单元格的值
         *
         * @param row 行
         * @param col 列
         * @param value 值
         */
        this.setValue = function(row, col, value) {
            dt.cell(row, col).data(value).draw();
        };

        /**
         * 获得选中行数据
         *
         * @returns {Object}
         */
        this.getSelectedRow = function() {
            return selectedRow;
        };

        /**
         * 获得DataTables API
         * @returns {*}
         */
        this.getApi = function() {
            return dt;
        };

        this.onInitComplete = function(callback) {
            initComplete = callback;
        };

        this.onLoadDataEnd = function(callback) {
            loadDataEnd = callback;
        }
    }
};
/* 常量 */
// 表单类型
MU.C_FT_EDIT = 0;
MU.C_FT_QUERY = 1;
// 显示风格
MU.C_DS_TEXT = 0;
MU.C_DS_TEXT_AREA = 1;
MU.C_DS_PASSWORD = 2;
MU.C_DS_COMBO_BOX = 3;
// 数据类型
MU.C_DT_STRING = ['varchar', 'char'];
MU.C_DT_INTEGER = ['int'];
MU.C_DT_NUMBER = ['number'];
MU.C_DT_DATE = ['date', 'datetime'];
MU.C_DT_EMAIL = ['email'];
MU.C_DT_IP = ['ip'];
MU.C_DT_URL = ['url'];
// 查询模式
MU.C_QM_EQUAL = 0;
MU.C_QM_NOT_EQUAL = 1;
MU.C_QM_LESS_THAN = 2;
MU.C_QM_LESS_EQUAL = 3;
MU.C_QM_GREATER_THAN = 4;
MU.C_QM_GREATER_EQUAL = 5;
MU.C_QM_BETWEEN = 6;
MU.C_QM_LIKE = 7;
MU.C_QM_LEFT_LIKE = 8;
MU.C_QM_RIGHT_LIKE = 9;


MU.ui.DataForm = function($conainer) {
    this.id = null;
    this.name = null;
    this.formType = MU.C_FT_EDIT;
    this.colCount = 3;
    this.colWidth = 185;
    this.labelGap = 5;
    this.fieldGap = 15;
    this.hgap = null;
    this.vgap = null;
    this.fieldList = [];
    this.fieldset = null;
    this.actionBar = null;
    this.width = null;
    this.height = null;
    this.includeFields = [];
    var queryMode = ['=', '!=', '<', '<=', '>', '>=', '%%', '*%', '%*'];

    var self = this;
    var $form;

    this.submit = function() {
        $form.submit();
    };

    this.genByDataTable = function(dt) {
        this.fieldList = [];
        var columns = dt.getOption().columns;
        var fieldList = this.fieldList;
        for(var i = 1; i < columns.length; i++) {
            var column = columns[i];
            fieldList.push({name: column.data, displayName: column.title, dataType: column.dataType});
        }

        return this.gen();
    };

    // 添加字段
    this.addField = function(field) {
        this.fieldList.push(field);
    };

    // 设置字段值
    this.setValue = function(name, value) {
        $form.find('[name="' + name + '"]').val(value);
    };

    // ajax post提交表单
    this.post = function(url, params, callback) {
        $.post(url, $.extend(this.serialize(), params), callback);
    };

    this.serialize = function () {
        var serializeObj = {};
        var array = $form.serializeArray();
        $(array).each(function (index, element) {
            var name = element.name;
            if (serializeObj[name]) {
                if ($.isArray(serializeObj[name])) {
                    serializeObj[name].push(this.value);
                } else {
                    serializeObj[name] = [serializeObj[name], this.value];
                }
            } else {
                serializeObj[name] = this.value;
            }
        });
        return serializeObj;
    };

    this.gen = function() {
        var formGrid = new MU.ui.GuidePane(this.hgap, this.vgap);

        var idxRow = 0; // 行号
        var idxCol = 0; // 列号
        var fieldList = this.fieldList;
        var field, rules = {};
        for(var i = 0; i < fieldList.length; i++) {
            field = fieldList[i];
            field.width = field.width || this.colWidth;
            if(this.includeFields && this.includeFields.length > 0 && $.inArray(field.name, this.includeFields) < 0) {
                continue;
            }

            if(field.isSingleLine) {
                idxRow++;
                formGrid.add(getLabelTd(field, this.formType), idxRow, 0);
                formGrid.add(getGapTd(this.labelGap), idxRow, 1);
                formGrid.add(getInputNode(field, this.colCount), idxRow, 2);
                idxCol = 0;
                idxRow++;
                this.height += field.height;

                continue;
            }

            formGrid.add(getLabelTd(field, this.formType), idxRow, idxCol++);
            formGrid.add(getGapTd(this.labelGap), idxRow, idxCol++);
            formGrid.add(getInputNode(field, this.colCount), idxRow, idxCol++);

            if(this.colCount == 1) {
                idxCol = 0;
                idxRow++;
            } else {
                if(idxCol == this.colCount * 4 - 1) {
                    idxCol = 0;
                    idxRow++;
                } else {
                    formGrid.add(getGapTd(this.fieldGap), idxRow, idxCol++);
                }
            }

            if(field.required) {
                rules[field.name] = 'required';
            }
            if(isDataType(MU.C_DT_DATE, field.dataType)) {
                rules[field.name] = 'date';
            } else if(isDataType(MU.C_DT_INTEGER, field.dataType)) {
                rules[field.name] = 'number';
            } else if(isDataType(MU.C_DT_NUMBER, field.dataType)) {
                rules[field.name] = 'number';
            } else if(isDataType(MU.C_DT_URL, field.dataType)) {
                rules[field.name] = 'url';
            } else if(isDataType(MU.C_DT_IP, field.dataType)) {
                rules[field.name] = 'ip';
            } else if(isDataType(MU.C_DT_EMAIL, field.dataType)) {
                rules[field.name] = 'email';
            }
        }

        $form = $('<form></form>').append(formGrid.gen());
        if(this.formType == MU.C_FT_EDIT) {
            $form.validate({rules: rules});
        }

        if($conainer) {
            $conainer.empty().append($form);
        }
        // 日期控件
        $form.find('.dateRange').daterangepicker({
            format: 'YYYY-MM-DD'
        }).on('apply.daterangepicker', function(ev, picker) {
            $(this).data('star', picker.startDate.format('YYYY-MM-DD')).data('end', picker.endDate.format('YYYY-MM-DD'));
        });
        // 查询条件切换
        if(this.formType == MU.C_FT_QUERY) {
            $form.find('.queryMode').click(function() {
                var mode = $(this).data('mode');
                var newMode = (parseInt(mode) + 1) % queryMode.length;
                $(this).data('mode', newMode).find('i').text(queryMode[newMode]);
            });
        }

        return $form;

        function getInputNode(field, colCount) {
            if(MU.C_DS_TEXT_AREA == field.displayStyle) {
                if(field.isSingleLine) {
                    return getFormInputTd(field, 'textarea', colCount * 4 - 3);
                } else {
                    return getFormInputTd(field, 'textarea');
                }
            } else if(MU.C_DS_PASSWORD == field.displayStyle) {
                if(field.isSingleLine) {
                    return getFormInputTd(field, 'password', colCount * 4 - 3);
                } else {
                    return getFormInputTd(field, 'password');
                }
            } else if(MU.C_DS_COMBO_BOX == field.displayStyle) {
                if(field.isSingleLine) {
                    return getFormInputTd(field, 'select', colCount * 4 - 3);
                } else {
                    return getFormInputTd(field, 'select');
                }
            } else {
                if(isDataType(MU.C_DT_DATE, field.dataType)) {
                    return getFormInputTd(field, 'date');
                } else if(isDataType(MU.C_DT_INTEGER, field.dataType)) {
                    return getFormInputTd(field, "int");
                } else if(isDataType(MU.C_DT_NUMBER, field.dataType)) {
                    return getFormInputTd(field, "number");
                } else if(isDataType(MU.C_DT_URL, field.dataType)) {
                    return getFormInputTd(field, "url");
                } else if(isDataType(MU.C_DT_IP, field.dataType)) {
                    return getFormInputTd(field, "ip");
                } else if(isDataType(MU.C_DT_EMAIL, field.dataType)) {
                    return getFormInputTd(field, "email");
                } else {
                    if(field.isSingleLine) {
                        return getFormInputTd(field, 'text', colCount * 4 - 3);
                    } else {
                        return getFormInputTd(field, 'text');
                    }
                }
            }
        }

        function getGap(width) {
            return $('<span style="display: block"></span>').css({width: width + 'px'});
        }

        function getGapTd(width) {
            return $('<td></td>').append(getGap(width));
        }

        function getHGap(colspan, hGap) {
            return $('<td></td>').attr('colspan', colspan).css({height: hGap + 'px'});
        }


        function getLabelTd(field, formType) {
            return $('<td></td>').append(getLabel(field, formType));
        }

        function getFormInputTd(field, type, colspan, rowspan) {
            var $td = $('<td></td>');
            if(colspan) {
                $td.attr('colspan', colspan);
                field.width = '100%';
            }
            if(rowspan) {
                $td.attr('rowspan', rowspan);
            }
            return $td.append(getFormInput(field, type));
        }


        function getLabel(field) {
            var $label = $('<label style="display: block;" class="control-label"></label>').attr('for', field.name).text(field.displayName);
            if(field.required && self.formType == MU.C_FT_EDIT) {
                $label.append('<span class="required">*</span>');
            }

            return $label;
        }

        function getFormInput(field, type) {
            var inputName = field.colName || field.name;
            var $input = $('<input>');

            if('textarea' == type) {
                $input = $('<textarea></textarea>');
            } else if('select' == type) {
                $input = $('<select></select>');
            } else if('text' == type || 'date' == type || 'email' == type || 'ip' == type || 'url' == type || 'int' == type || 'double' == type || 'number' == type) {
                if('date' == type) {
                    $input.addClass('dateRange');
                    /*if(self.formType == MU.C_FT_QUERY) {
                        var $div = $('<div class="flex"></div>');
                        var $startGroup = $('<div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span></div>').appendTo($div);
                        $('<input class="form-control date" type="text" data-date-format="yyyy-mm-dd">').attr('id', field.name).attr('name', 'D_start' + inputName).attr('queryMode', MU.C_QM_GREATER_EQUAL).prependTo($startGroup);
                        $div.append('&nbsp;至&nbsp;');
                        var $endGroup = $('<div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span></div>').appendTo($div);
                        $('<input class="form-control date" type="text">').attr('id', field.name).attr('name', 'D_end' + inputName).attr('queryMode', MU.C_QM_LESS_THAN).prependTo($endGroup);
                        return $div;
                    }*/
                } else if('int' == type || 'double' == type || 'number' == type) {
                    if(self.formType == MU.C_FT_QUERY) {
                        var $div = $('<div class="flex"></div>');
                        $('<input class="form-control" type="text">').attr('id', field.name).attr('name', 'N_start' + inputName).attr('queryMode', MU.C_QM_GREATER_EQUAL).appendTo($div);
                        $div.append('<div style="line-height: 34px;width: 50px;text-align: center">至</div>');
                        $('<input class="form-control" type="text">').attr('id', field.name).attr('name', 'N_end' + inputName).attr('queryMode', MU.C_QM_LESS_THAN).appendTo($div);
                        return $div;
                    }
                }

                if('date' != type) {
                    $input.attr('type', type);
                }
            }
            $input.addClass('form-control').attr('id', field.name).attr('name', inputName);
            if(field.readonly) {
                $input.attr('readonly', 'readonly');
            }
            /*if(field.required) {
                $input.addClass('required');
            }*/
            if(field.width) {
                var width;
                if('100%' == field.width) {
                    width = '100%';
                } else {
                    /*if('date' == type && self.formType == MU.MU.C_FT_QUERY) {
                        width = (field.width/2 - 10) + "px";
                    } else {
                        width = field.width + "px";
                    }*/
                }
                $input.css('width', width);
            }
            if(field.height) {
                $input.css('height', field.height + "px")
            }

            if(self.formType == MU.C_FT_QUERY) {
                $div = $('<div></div>');
                var mode = field.queryMode || '0';
                var $group = $('<div class="input-group"><span class="input-group-addon"><i class="">' + queryMode[parseInt(mode)] + '</i></span></div>').appendTo($div);
                if('date' == type) {
                    $group.find('i').text('').addClass('glyphicon glyphicon-calendar');
                } else if('text' == type || 'textarea' == type || 'email' == type || 'ip' == type || 'url' == type) {
                    $group.find('.input-group-addon').addClass('queryMode').data('mode', mode);
                }
                $input.prependTo($group);
                return $div;
            }

            return $input;
        }

        function isDataType(dataTypeArray, dataType) {
            return $.inArray(dataType, dataTypeArray) > -1;
        }
    };

    // 获得查询条件
    this.getConditions = function() {
        var array = [];
        if($form) {
            $form.find('input, textarea, select').each(function() {
                var $this = $(this);
                var name = $this.attr('name');
                var value = $this.val();
                if(name && value) {
                    var mode = $this.parent().find('.queryMode').data('mode') || '0';
                    if(MU.UString.startsWith(name, 'N_start')) {
                        name = name.substr(7);
                        mode = '5';
                    } else if(MU.UString.startsWith(name, 'N_end')) {
                        name = name.substr(5);
                        mode = '2';
                    } else if($this.hasClass('dateRange')) { // 日期范围
                        array.push({name: name, value: $this.data('star'), mode: '>='});
                        array.push({name: name, value: $this.data('end'), mode: '<'});
                        return;
                    }
                    array.push({name: name, value: value, mode: queryMode[parseInt(mode)]});
                }
            });
        }
        return array;
    }
};

MU.ui.GuidePane = function(hgap, vgap) {
    var table = [];

    this.add = function(node, row, col) {
        var array = table[row];
        if(!(array && array.length)) {
            array = [];
            table[row] = array;
        }
        array[col] = node;
    };

    this.gen = function() {
        var $table = $('<table class="gridPane"></table>');
        for(var i = 0; i < table.length; i++) {
            var tr = table[i];
            var $tr = $('<tr></tr>').appendTo($table);
            for(var j = 0; j < tr.length; j++) {
                $tr.append($(tr[j]));
            }
        }

        return $table;
    }
};

MU.ui.Dialog = function() {
    var $dialog;

    /**
     * 打开对话框
     *
     * @param title
     * @param content
     */
    this.open = function(title, content, onOk) {
        $dialog = $('<div class="modal fade">' +
        '  <div class="modal-dialog">' +
        '    <div class="modal-content">' +
        '      <div class="modal-header">' +
        '        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"></span></button>' +
        '        <h4 class="modal-title">' + title + '</h4>' +
        '      </div>' +
        '      <div class="modal-body">' + $(content).html() + '</div>' +
        '      <div class="modal-footer">' +
        '        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>' +
        '        <button id="btnOk" type="button" class="btn btn-primary">确定</button>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>').modal({
            backdrop: 'static',
            show: true
        }).on('hidden.bs.modal', function (e) {
            // 删除对话框
            $dialog.remove();
        });

        // 确定按钮
        $dialog.find('#btnOk').click(function() {
            if(onOk) {
                onOk();
            }
        });
    };

    this.close = function() {
        $dialog.modal('hide');
    }
};

// 增删改查
MU.ui.DataCrud = function($container) {
    var $div = $('<div class="dataCrud"></div>').appendTo($container);
    var $queryForm = $('<div class="queryForm"></div>').appendTo($div);
    var $buttons = $('<div class="buttons"></div>').appendTo($div);
    var $dataTable = $('<table class="dataTable"></table>').appendTo($div);
    var self = this;
    var appendConditions = [];

    var dt = new MU.ui.DataTable($dataTable);
    var queryForm = new MU.ui.DataForm($queryForm);
    queryForm.colCount = 3;
    queryForm.formType = MU.C_FT_QUERY;

    // 查询
    var $btnQuery = $('<button type="button" class="btn btn-primary">查询</button>').appendTo($buttons);;
    $btnQuery.click(function() {
        self.query();
    });

    this.dataTable = function() {
        return dt;
    };

    this.queryForm = function() {
        return queryForm;
    };

    this.query = function(param) {
        param = param || {};
        var conditions = queryForm.getConditions().concat(appendConditions);
        dt.query($.extend(param, {conditions: JSON.stringify(conditions)}));
    };

    this.setAppendConditions = function(conditions) {
        if($.isArray(conditions)) {
            appendConditions = appendConditions.concat(conditions);
        } else {
            appendConditions.push(conditions);
        }
    };
};

MU.UString = {
    startsWith: function(str, prefix) {
        return str.substr(0, prefix.length) == prefix;
    }
};