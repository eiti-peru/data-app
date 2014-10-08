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

    var q = "SELECT cartodb_id, the_geom, the_geom_webmercator, departamento, year, canon_minero_gobiernos_locales_del_departamento, canon_minero_gobiernos_regionales, canon_gasifero_universidades_nacionales, canon_gasifero_gobiernos_regionales, canon_gasifero_gobiernos_locales_del_departamento, canon_y_sobrecanon_petrolero_universidades_nacionales, canon_y_sobrecanon_petrolero_institutos, canon_y_sobrecanon_petrolero_gobiernos_regionales,regalias_mineras_universidades_naccionales, regalias_mineras_gobiernos_regionales, regalias_mineras_gobiernos_locales_del_departamenteo, derechos_de_vigencia, total::integer as total FROM eiti_peru where year = '" + column + "'";
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

      layer.set({sql: "SELECT cartodb_id, the_geom, the_geom_webmercator, departamento, year, canon_minero_gobiernos_locales_del_departamento, canon_minero_gobiernos_regionales, canon_gasifero_universidades_nacionales, canon_gasifero_gobiernos_regionales, canon_gasifero_gobiernos_locales_del_departamento, canon_y_sobrecanon_petrolero_universidades_nacionales, canon_y_sobrecanon_petrolero_institutos, canon_y_sobrecanon_petrolero_gobiernos_regionales,regalias_mineras_universidades_naccionales, regalias_mineras_gobiernos_regionales, regalias_mineras_gobiernos_locales_del_departamenteo, derechos_de_vigencia, derechos_de_vigencia::integer as total FROM eiti_peru where year = '" + $li.attr('data') + "'",
      interactivity: 'departamento, year, canon_minero_gobiernos_locales_del_departamento, canon_minero_gobiernos_regionales, canon_gasifero_universidades_nacionales, canon_gasifero_gobiernos_regionales, canon_gasifero_gobiernos_locales_del_departamento, canon_y_sobrecanon_petrolero_universidades_nacionales, canon_y_sobrecanon_petrolero_institutos, canon_y_sobrecanon_petrolero_gobiernos_regionales,regalias_mineras_universidades_naccionales, regalias_mineras_gobiernos_regionales, regalias_mineras_gobiernos_locales_del_departamenteo, derechos_de_vigencia, total'
    });
    });
  }

  var setCss = function($li, layer){
      var clickedColumn = $li.attr('data');
      cssFor(clickedColumn, function(css){
        layer.setCartoCSS(css);
      });
  };

  map = new L.Map('map').setView(new L.LatLng(-10, -75),6);
  var mapboxUrl = 'http://{s}.tiles.mapbox.com/v3/okf.map-najwtvl1/{z}/{x}/{y}.png',
  mapbox = new L.TileLayer(mapboxUrl, {"attribution": "\u00a9 <a href=\"http://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors"});
  map.addLayer(mapbox,true);

  var columns = [
    ['Title', 'canon_minero_gobiernos_locales_del_regionales'],
    ['']
  ];

  var showTooltip = function (data, point) {
    var $tooltip = $('#tooltip');

    // var total = parseInt(data.total.replace(/[^0-9]/g, ''));
    html = "<p>" + data.departamento + ": " + data.total;
    for(var i = 0; i < columns.length; i++) {
      if( data[columns[i][1]] > 0 ) {
        html += "<br>" + column[i][0] + ": " + data[columns[i][1]];
      }
    }
      // "<br>title: " + data.canon_minero_gobiernos_locales_del_departamento + "<br>" + data.canon_minero_gobiernos_regionales + "<br>" + data.canon_gasifero_universidades_nacionales + "<br>" + data.canon_gasifero_gobiernos_regionales + "<br>" + "<br>" + data.canon_y_sobrecanon_petrolero_universidades_nacionales + "<br></p>"
    html += "</p>"
    $tooltip.html(html);
    $tooltip.css({left: (point.x + 'px'), top: (point.y + 'px')})
    $tooltip.show();

      // $tooltip.hide();
  };
  var hideTooltip = function (data, point) {
    $('#tooltip').hide();
  };

  cartodb.createLayer(map, {
    user_name: 'crisscrossed',
    type: 'cartodb',
    sublayers: [{
      sql: "SELECT cartodb_id, the_geom, the_geom_webmercator, departamento, year, canon_minero_gobiernos_locales_del_departamento, canon_minero_gobiernos_regionales, canon_gasifero_universidades_nacionales, canon_gasifero_gobiernos_regionales, canon_gasifero_gobiernos_locales_del_departamento, canon_y_sobrecanon_petrolero_universidades_nacionales, canon_y_sobrecanon_petrolero_institutos, canon_y_sobrecanon_petrolero_gobiernos_regionales,regalias_mineras_universidades_naccionales, regalias_mineras_gobiernos_regionales, regalias_mineras_gobiernos_locales_del_departamenteo, derechos_de_vigencia, derechos_de_vigencia::integer as total FROM eiti_peru where year = '2012'",
      interactivity: 'departamento, year, canon_minero_gobiernos_locales_del_departamento, canon_minero_gobiernos_regionales, canon_gasifero_universidades_nacionales, canon_gasifero_gobiernos_regionales, canon_gasifero_gobiernos_locales_del_departamento, canon_y_sobrecanon_petrolero_universidades_nacionales, canon_y_sobrecanon_petrolero_institutos, canon_y_sobrecanon_petrolero_gobiernos_regionales,regalias_mineras_universidades_naccionales, regalias_mineras_gobiernos_regionales, regalias_mineras_gobiernos_locales_del_departamenteo, derechos_de_vigencia, total',
      cartocss: '#eiti_peru{polygon-fill: #FF6600;polygon-opacity: 0.7;line-color: #FFF;line-width: 1;line-opacity: 1;}'
    }]
  })
  .addTo(map)
  .done(function(layer) {
    var subLayer = layer.getSubLayer(0);
    subLayer.setInteraction(true);

    subLayer.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
      document.body.style.cursor = 'pointer';
      showTooltip(data, pos);
    });
    subLayer.on('featureOut', function () {
      document.body.style.cursor = 'default';
      hideTooltip();
    });
    yearHandler(subLayer);
    setCss($('li.selected'), subLayer);
  })
  .error(function(err) {
    console.log(err);
  });
});

