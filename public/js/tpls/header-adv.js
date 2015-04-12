(function(N, undefined){
  var PATH = '/header-adv.js';
  if(!N || !N._tpls) return false;
  N._tpls[PATH] = N._tpls[PATH] ||
{
  "main": function($DATA, guid){
    var css = '', dguid = N.dguid();
    var template = {
      init: function(){
        this.v8 = !!''.trim;
        this.result = this.v8 ? '' : [];
      },
      push: function(str){
        this.v8 ? (this.result += str) : this.result.push(str);
      },
      html: function(){
        return this.v8 ? this.result : this.result.join('');
      }
    };
    guid = guid || N.guid();
    template.init();

    template.push('<div id="'+ guid +'"></div>\n  \n');
    template.push('<script>');
    template.push('(function(window, document, undefined){\n');
    template.push('  var $ROOT = $("#'+ guid +'");\n');
    template.push('  var $TPLS = NodeTpl._tpls["'+ PATH +'"];\n');
    template.push('  var $DATA = NodeTpl._data["'+ dguid +'"];\n');
    template.push('$.ajax({\n');
    template.push('      url: iyuesai.contentServer(\'GetAdvertisement\') + "?position=banner",\n');
    template.push('      dataType: \'json\',\n');
    template.push('      type: \'GET\',\n');
    template.push('      success: function(d, textStatus, jqXHR) {\n');
    template.push('        if (d && d.code == 200) {\n');
    template.push('          $DATA.data = d.messages.data.advertisments[0];\n');
    template.push('          $ROOT.html($TPLS[\'content\']($DATA, "'+ guid +'"));\n');
    template.push('        }\n');
    template.push('      }\n');
    template.push('    });\n');
    template.push('  \n');
    template.push('})(window, document);\n');
    template.push('delete NodeTpl._data["'+ dguid +'"];\n');
    template.push('</script>\n');
    $DATA && (N._data[dguid] = $DATA);
    return template.html();
  },
  "content": function($DATA, guid){
    var css = '', dguid = N.dguid();
    var template = {
      init: function(){
        this.v8 = !!''.trim;
        this.result = this.v8 ? '' : [];
      },
      push: function(str){
        this.v8 ? (this.result += str) : this.result.push(str);
      },
      html: function(){
        return this.v8 ? this.result : this.result.join('');
      }
    };
    guid = guid || N.guid();
    template.init();
if($DATA.data){
    template.push('\n<a href="');
    template.push((($DATA.data.url) == null ? '' : ($DATA.data.url)));
    template.push('"><img src="');
    template.push(((iyuesai.imageServer($DATA.data.picUrl).replace('_0_0', '_1_x66')) == null ? '' : (iyuesai.imageServer($DATA.data.picUrl).replace('_0_0', '_1_x66'))));
    template.push('" /></a>\n');
}
    template.push('\n');
    $DATA && (N._data[dguid] = $DATA);
    return template.html();
  }
};
})(window.NodeTpl);