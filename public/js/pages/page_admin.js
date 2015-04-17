$(function() {
    // 导航菜单
    /*$('ul.page-sidebar-menu').find('li').click(function() {
        var $this = $(this);
        var $ul = $this.parent();
        var current = $ul.data('current');
        $('#' + current).removeClass('active').find('a span.selected').remove();
        $this.addClass('active').find('a').append('<span class="selected"></span>');
        $ul.data('current', $this.attr('id'));
    });*/
    var switchTab = new MU.ui.SwitchTab($('ul.page-sidebar-menu'));
    switchTab.onSelect(function($now, $old){
        $now.append('<span class="selected"></span>');
        $old.parent().removeClass('active').find('a span.selected').remove();
        $now.parent().addClass('active');
        // 设置标题
        $('#pageTile').text($now.text());
    });

    // 运动项目
    var sportTable = new MU.ui.DataTable($('#sportTable'));
    sportTable.setColumns([
        {data: 'id', title: 'ID'},
        {data: 'name', title: '名称'},
        {data: 'sport_show', title: '是否展示'},
        {data: 'input_date', title: '录入时间'},
        {data: 'input_user', title: '录入人'}
    ]);
    sportTable.showPaginate(false);
    sportTable.setUrl('/admin/getGames');

    // 分类
    var $sportCategoryUl = $('#sportCategoryUl');
    var firstSportCategory = $sportCategoryUl.find('li').click(function() {
        $sportCategoryUl.find('li').removeClass('active').find('span.after').remove();
        $(this).addClass('active').append('<span class="after"></span>');
        sportTable.query({pid: $(this).find('a').data('value')});
    }).eq(0).find('a').data('value');
    sportTable.query({pid: firstSportCategory});

    var form = new MU.ui.DataForm();
    form.includeFields = ['name'];
    form.colCount = 5;
    form.fieldList = [
        {name: 'name', displayName: '赛事分类：', required: true}
    ];
    $('#TestForm').append(form.gen());
    $('#btnTestSubmit').click(function() {
        form.submit();
    });

    // 新增分类
    $('#btnAddSportCategory').click(function() {
        var dialog = new MU.ui.Dialog();
        dialog.open('新增赛事分类', form.gen());
    });
});