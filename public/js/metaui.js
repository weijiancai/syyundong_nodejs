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
        //var dt = $container.dataTable();
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
            "ajax": {url: '', type: 'POST', data: {}},
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

        this.loadData = function(data) {
            $container.dataTable({data: data});
        };

        this.query = function(url, params) {
            option.ajax.url = url;
            option.ajax.data = params;
            $container.dataTable(option);
        }
    }
};