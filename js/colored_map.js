$(function (){
  // from higher to lower intensity
  var colors = [
    '#B10026', '#E31A1C', '#FC4E2A', '#FD8D3C', '#FEB24C', '#FED976',
    '#FFFFB2'
  ]

  var fillCss = function(condition, color, table){
    table || (table = 'eiti_peru')
    return "#" + table + " [ " + condition + "] {"+
      "polygon-fill: " + color + ";" +
      "polygon-opacity: 0.7;" +
      "line-color: #FFF;" +
      "line-width: 1;" +
      "line-opacity: 1;" +
      "}";
  }

  var cssFor = function(column, callback, account){
    account || (account = 'crisscrossed');
    var cacheKey = 'cssFor' + column + new Date().toDateString();
    cacheKey = cacheKey.replace(/\s/g, '_');

    var q = "SELECT cartodb_id, the_geom,the_geom_webmercator, departamento, year, canon_minero_gobiernos_locales_del_departamento::integer as canon_minero_locales, to_char(canon_minero_gobiernos_regionales::integer,'999G999G999G990') as canon_minero_regional, to_char(canon_gasifero_universidades_nacionales::integer,'999G999G999G990') as canon_minero_uni, to_char(canon_gasifero_gobiernos_regionales::integer,'999G999G999G990') as canon_gasifero_regional, to_char(canon_gasifero_gobiernos_locales_del_departamento::integer,'999G999G999G990') as canon_gasiferas_locales, to_char(canon_y_sobrecanon_petrolero_universidades_nacionales::integer,'999G999G999G990') as canon_petrolero_uni, to_char(canon_y_sobrecanon_petrolero_institutos::integer,'999G999G999G990') as canon_petrolero_inst, to_char(canon_y_sobrecanon_petrolero_gobiernos_locales_del_departamento::integer,'999G999G999G990') as canon_petrolero_departamento, to_char(canon_y_sobrecanon_petrolero_gobiernos_regionales::integer,'999G999G999G990') as canon_petrolero_regional, to_char(regalias_mineras_universidades_naccionales::integer,'999G999G999G990') as canon_mineras_uni, to_char(regalias_mineras_gobiernos_regionales::integer,'999G999G999G990') as canon_mineras_regional, to_char(regalias_mineras_gobiernos_locales_del_departamenteo::integer,'999G999G999G990') as canon_mineras_locales, to_char(derechos_de_vigencia::integer,'999G999G999G990') as derechos, derechos_de_vigencia::integer as total FROM eiti_peru where year = '" + column + "'";
    value = 'total'
    if(cache = JSON.parse(sessionStorage[cacheKey] || null))
      callback(cssFromRows(cache, value));
    else{
      $.get('http://' + account + '.cartodb.com/api/v2/sql?q=' + q ).done(function(response){
        sessionStorage[cacheKey] = JSON.stringify(response.rows);
        callback(cssFromRows(response.rows, value));
      });
    }
  };

  var cssFromRows = function(rows, column){

    var min   = _(rows).min(function(row){ return parseInt(row[column]) });
    min = parseInt(min[column]);

    var max   = _(rows).max(function(row){ return parseInt(row[column]) });
    max = parseInt(max[column]);
    var step  = (max - min) / colors.length;
    var css = _(colors).map(function(color, index){
      var limit  = (max + 1) - step * index;
      var subCss = fillCss(column + ' <= ' + limit, color);
      return subCss;
    }).join('');

    return css;
  };

  var yearHandler = function(layer) {
    var $options = $('#layer_selector li');

    $options.click(function(e) {
      var $li = $(e.target);



      // deselect all and select the clicked one
      $options.removeClass('selected');
      $li.addClass('selected');

      setCss($li, layer);
    });
  }

  var setCss = function($li, layer){
      var clickedColumn = $li.attr('data');
      cssFor(clickedColumn, function(css){
        layer.setCartoCSS(css);
      });
  };

  var visByYear = {
    '2008': 'http://...'
  }

  var visUrl = 'http://crisscrossed.cartodb.com/api/v2/viz/' +
    '4410e364-2175-11e4-8aab-0edbca4b5057/viz.json';
  //var visUrl = visByYear['2012'];
  cartodb.createVis('map', visUrl, {
    tiles_loader: true,
    center_lat: -10,
    center_lon: -75,
    zoom: 5
  })
  .done(function(vis, layers) {
    // layer 0 is the base layer, layer 1 is cartodb layer
    var subLayer = layers[1].getSubLayer(0);
    yearHandler(subLayer);
    setCss($('li.selected'), subLayer);
  })
  .error(function(err) {
    console.log(err);
  });
});

