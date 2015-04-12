/**
 * Created by wei_jc on 2015/3/15.
 */
$.validator.setDefaults({
    errorClass: 'text-error',
    invalidHandler: function (event, validator) { //display error alert on form submit
        for(var i = 0; i < validator.errorList.length; i++) {
            console.log(validator.errorList[i].message);
            $(validator.errorList[i].element).tooltip('destroy');
            $(validator.errorList[i].element).tooltip({
                html: true,
                placement: 'top',
                title: validator.errorList[i].message,
                trigger: 'focus '
            }).data('data-original-title', validator.errorList[i].message);
        }
    },
    /*highlight: function (element) { // hightlight error inputs
        $(element).addClass('text-error'); // set error class to the control group
    },
    unhighlight: function (element) { // revert the change dony by hightlight
        $(element).removeClass('text-error').tooltip('destroy');
    },*/
    success: function (label, element) {
        $(element).tooltip('destroy');
    },
    errorPlacement: function (error, element) {
        //error.addClass('help-small no-left-padding').insertAfter(element.closest('.input-icon'));
    }
});

(function ($) {
    $.fn.serializeJson = function () {
        var serializeObj = {};
        var array = this.serializeArray();
        var str = this.serialize();
        $(array).each(function () {
            if (serializeObj[this.name]) {
                if ($.isArray(serializeObj[this.name])) {
                    serializeObj[this.name].push(this.value);
                } else {
                    serializeObj[this.name] = [serializeObj[this.name], this.value];
                }
            } else {
                serializeObj[this.name] = this.value;
            }
        });
        return serializeObj;
    };
})(jQuery);