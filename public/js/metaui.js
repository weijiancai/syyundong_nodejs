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
                onSelectCallback($this, $current);
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
        var dt, self = this;
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
            "retrieve": true,
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
        };

        this.initDataTable = function() {
            if (!dt) {
                dt = $container.DataTable(option);
            }
        };

        this.loadData = function(data) {
            this.initDataTable();
            dt.clear();
            dt.rows.add(data.data ? data.data : data).draw();
        };

        this.query = function(params) {
            this.initDataTable();
            $.post(option.url, params, function(data) {
                self.loadData(data);
            });
        };

        this.genForm = function(colCount, columnNames) {
            var $table = $('<table></table>');
            var $tr = $('<tr></tr>').appendTo($table);
            var count = 0;
            for(var i = 1; i < option.columns.length; i++) {
                var column = option.columns[i];
                if(columnNames && columnNames.length > 0 && $.inArray(column.data, columnNames) < 0) {
                    continue;
                }

                if(count == colCount) {
                    $tr = $('<tr></tr>').appendTo($table);
                    count = 0;
                }

                var $td = $('<td></td>').appendTo($tr);
                var $label = $('<label></label>').text(column.title).appendTo($td);
                $('<input type="text">').appendTo($td);

                count++;
            }

            return $table;
        }
    }
};