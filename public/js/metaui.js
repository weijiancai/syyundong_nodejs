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
        var option = {
            "searching": false,
            "lengthChange": false,
            "processing": true,
            "serverSide": false, // 服务器端排序
            "paginate": false, // 分页
            "info": false,
            //"paginationType": "bootstrap",
            //"scrollX": true,
            "columns": [],
            //"ajax": {url: '', type: 'POST', data: {}},
            //"retrieve": true,
            "destroy": true,
            "initComplete": function(setting) {
                $container.find('th').eq(0).removeClass('sorting_asc').css({paddingLeft: '10px', paddingRight: '10px'});
                $container.find("select, input, a.button, button").uniform();

                $container.find('.group-checkable').change(function () {
                    var checked = $(this).is(":checked");
                    $container.find('.checkboxes').each(function () {
                        console.log(this);
                        if (checked) {
                            $(this).attr("checked", true);
                        } else {
                            $(this).attr("checked", false);
                        }
                        $.uniform.update($(this));
                    });
                });
                // 回调初始化完成
                if(initComplete) {
                    initComplete();
                }
            }
        };

        this.showPaginate = function(isShow) {
            option.paginate = isShow;
        };

        this.showInfo = function(isShow) {
            option.info = isShow;
        };

        this.showSearching = function(isShow) {
            option.searching = isShow;
        };

        this.setUrl = function(url) {
            option.url = url;
        };

        this.setHeight = function(height) {
            option.scrollY = height;
        };

        this.setColumns = function(columns) {
            columns.unshift({
                "render": function ( data, type, row ) {
                    return '<input type="checkbox" class="checkboxes"/>';
                },
                "targets": 0,
                title: '<input type="checkbox" class="group-checkable" data-set=".checkboxes" />',
                orderable: false,
                width: 1,
                className: 'sorting_disabled',
                type: 'checkbox',
                orderSequence: []
            });
            option.columns = columns;
            if(columns.length > 0) {
                option.scrollX = true;
            }
        };

        this.initDataTable = function() {
            dt = $container.DataTable(option);
            /*if (!dt) {
                dt = $container.DataTable(option);
            }*/
        };

        this.loadData = function(data) {
            this.initDataTable();
            dt.clear();
            dt.rows.add(data.data ? data.data : data).draw();
            // 加载数据完成后回调
            if(loadDataEnd) {
                loadDataEnd(data);
            }
        };

        this.query = function(params) {
            this.initDataTable();
            $.post(option.url, params, function(data) {
                self.loadData(data);
            });
        };

        this.getOption = function() {
            return option;
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
MU.C_DT_STRING = 0;
MU.C_DT_INTEGER = 1;
MU.C_DT_DOUBLE = 2;
MU.C_DT_NUMBER = 3;
MU.C_DT_DATE = 4;
MU.C_DT_EMAIL = 5;
MU.C_DT_IP = 6;
MU.C_DT_URL = 7;
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


MU.ui.DataForm = function() {
    this.id = null;
    this.name = null;
    this.formType = MU.C_FT_EDIT;
    this.colCount = 3;
    this.colWidth = 185;
    this.labelGap = 5;
    this.fieldGap = 5;
    this.hgap = null;
    this.vgap = null;
    this.fieldList = [];
    this.fieldset = null;
    this.actionBar = null;
    this.width = null;
    this.height = null;
    this.includeFields = [];

    var self = this;
    var $form;

    this.submit = function() {
        $form.submit();
    };

    this.genByDataTable = function(dt) {
        var columns = dt.getOption().columns;
        var fieldList = this.fieldList;
        for(var i = 1; i < columns.length; i++) {
            var column = columns[i];
            fieldList.push({name: column.data, displayName: column.title});
        }

        return this.gen();
    };

    this.gen = function() {
        var formGrid = new MU.ui.GuidePane(this.hgap, this.vgap);

        var idxRow = 0; // 行号
        var idxCol = 0; // 列号
        var fieldList = this.fieldList;
        var field, rules = {};
        for(var i = 0; i < fieldList.length; i++) {
            field = fieldList[i];
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
            if(MU.C_DT_DATE == field.dataType) {
                rules[field.name] = 'date';
            } else if(MU.C_DT_DOUBLE == field.dataType) {
                rules[field.name] = 'number';
            } else if(MU.C_DT_INTEGER == field.dataType) {
                rules[field.name] = 'number';
            } else if(MU.C_DT_NUMBER == field.dataType) {
                rules[field.name] = 'number';
            } else if(MU.C_DT_URL == field.dataType) {
                rules[field.name] = 'url';
            } else if(MU.C_DT_IP == field.dataType) {
                rules[field.name] = 'ip';
            } else if(MU.C_DT_EMAIL == field.dataType) {
                rules[field.name] = 'email';
            }
        }

        $form = $('<form></form>').append(formGrid.gen());
        $form.validate({rules: rules});
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
                if(MU.C_DT_DATE == field.dataType) {
                    return getFormInputTd(field, 'date');
                } else if(MU.C_DT_DOUBLE == field.dataType) {
                    return getFormInputTd(field, "double");
                } else if(MU.C_DT_INTEGER == field.dataType) {
                    return getFormInputTd(field, "int");
                } else if(MU.C_DT_NUMBER == field.dataType) {
                    return getFormInputTd(field, "number");
                } else if(MU.C_DT_URL == field.dataType) {
                    return getFormInputTd(field, "url");
                } else if(MU.C_DT_IP == field.dataType) {
                    return getFormInputTd(field, "ip");
                } else if(MU.C_DT_EMAIL == field.dataType) {
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
                    $input.addClass('dateField');
                    if(self.formType == MU.C_FT_QUERY) {
                        var $div = $('<div></div>');
                        $('<input type="text">').attr('id', field.name).attr('name', 'D_start' + inputName).attr('queryMode', MU.C_QM_GREATER_EQUAL).appendTo($div);
                        $div.append('&nbsp;至&nbsp;');
                        $('<input type="text">').attr('id', field.name).attr('name', 'D_end' + inputName).attr('queryMode', MU.C_QM_LESS_THAN).appendTo($div);
                        return $div;
                    }
                }

                $input.attr('type', type);
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
                    if('date' == type && self.formType == MU.MU.C_FT_QUERY) {
                        width = (field.width/2 - 10) + "px";
                    } else {
                        width = field.width + "px";
                    }
                }
                $input.css('width', width);
            }
            if(field.height) {
                $input.css('height', field.height + "px")
            }

            if(self.formType == MU.C_FT_QUERY) {
                return $('<div></div>').append($input).append(getQueryModeLink(field.queryMode));
            }

            return $input;
        }

        /**
         * 获得查询模式超链接
         *
         * @param queryMode
         */
        function getQueryModeLink(queryMode) {
            switch (queryMode) {
                case 0:
                    return '<a href="#" class="queryMode equal">=</a>';
                case 1:
                    return '<a href="#" class="queryMode equal">&lt;&gt;</a>';
                case 2:
                    return '<a href="#" class="queryMode equal">&lt;</a>';
                case 3:
                    return '<a href="#" class="queryMode equal">&lt;=</a>';
                case 4:
                    return '<a href="#" class="queryMode equal">&gt;</a>';
                case 5:
                    return '<a href="#" class="queryMode equal">&gt;=</a>';
                case 6:
                    return '<a href="#" class="queryMode equal">=</a>';
                case 7:
                    return '<a href="#" class="queryMode equal">%%</a>';
                case 8:
                    return '<a href="#" class="queryMode equal">*%</a>';
                case 9:
                    return '<a href="#" class="queryMode equal">%*</a>';
                default:
                    return '<a href="#" class="queryMode equal">=</a>';
            }
        }
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