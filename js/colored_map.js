$(function (){

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  var yearHandler = function(layer) {
    var $options = $('#layer_selector li');

    $options.click(function(e) {
      var $li = $(e.target);

      // deselect all and select the clicked one
      $options.removeClass('selected');
      $li.addClass('selected');

      //setCss($li, layer);

      layer.set({sql: "SELECT cartodb_id, the_geom, the_geom_webmercator, departamento, year, canon_minero_gobiernos_regionales, canon_minero_gobiernos_locales_del_departamento, regalias_mineras_gobiernos_regionales, regalias_mineras_gobiernos_locales_del_departamenteo, regalias_mineras_universidades_naccionales, canon_y_sobrecanon_petrolero_gobiernos_regionales, canon_y_sobrecanon_petrolero_universidades_nacionales, canon_y_sobrecanon_petrolero_institutos, canon_gasifero_gobiernos_regionales, canon_gasifero_gobiernos_locales_del_departamento, canon_gasifero_universidades_nacionales, derechos_de_vigencia, total::bigint as total FROM eiti_peru where year = '" + $li.attr('data') + "'",
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

  map = new L.Map('map').setView(new L.LatLng(-10, -75),5);
  var mapboxUrl = 'http://{s}.tiles.mapbox.com/v3/okf.map-najwtvl1/{z}/{x}/{y}.png',
  mapbox = new L.TileLayer(mapboxUrl, {"attribution": "\u00a9 <a href=\"http://www.openstreetmap.org/\" target=\"_blank\">OpenStreetMap</a> contributors"});
  map.addLayer(mapbox, true);

  var columns = [
    ['CANON MINERO recibido Gobierno Regional','canon_minero_gobiernos_regionales'],
    ['CANON MINERO recibido Gobiernos Locales','canon_minero_gobiernos_locales_del_departamento'],
    ['REGALIA MINERA recibido Gobierno Regional','regalias_mineras_gobiernos_regionales'],
    ['REGALIA MINERA recibido Gobiernos Locales','regalias_mineras_gobiernos_locales_del_departamenteo'],
    ['REGALIA MINERA recibido Universidades Nacionales','regalias_mineras_universidades_naccionales'],
    ['CANON Y SOBRECANON PETROLERO recibido Gobierno Regional','canon_y_sobrecanon_petrolero_gobiernos_regionales'],
    ['CANON Y SOBRECANON PETROLERO recibido Gobiernos Locales','canon_y_sobrecanon_petrolero_gobiernos_locales_del_departamento'],
    ['CANON Y SOBRECANON PETROLERO recibido Universidades','canon_y_sobrecanon_petrolero_universidades_nacionales'],
    ['CANON Y SOBRECANON PETROLERO recibido Institutos','canon_y_sobrecanon_petrolero_institutos'],
    ['CANON GASIFERO recibido Gobierno Regional','canon_gasifero_gobiernos_regionales'],
    ['CANON GASIFERO recibido Gobiernos Locales','canon_gasifero_gobiernos_locales_del_departamento'],
    ['CANON GASIFERO recibido Universidades','canon_gasifero_universidades_nacionales'],
    ['DERECHO DE VIGENCIA recibido distritos en área de influencia','derechos_de_vigencia']
  ];

  var showTooltip = function (data, point) {
    var $tooltip = $('#tooltip');

    html = "<p><h2>" + data.departamento + "</h2> (" + data.year + ")";
    for(var i = 0; i < columns.length; i++) {
      if( data[columns[i][1]] > 0 ) {
        html += "<br>" + columns[i][0] + ": " + numberWithCommas(data[columns[i][1]]);
      }
    }
    html += "</p>"
    $tooltip.html(html);
    $tooltip.css({left: (point.x + 'px'), top: (point.y + 'px')})
    $tooltip.show();

  };
  var hideTooltip = function (data, point) {
    $('#tooltip').hide();
  };

  cartodb.createLayer(map, {
    user_name: 'crisscrossed',
    type: 'cartodb',
    sublayers: [{
      sql: "SELECT cartodb_id, the_geom, the_geom_webmercator, departamento, year, canon_minero_gobiernos_regionales, canon_minero_gobiernos_locales_del_departamento, regalias_mineras_gobiernos_regionales, regalias_mineras_gobiernos_locales_del_departamenteo, regalias_mineras_universidades_naccionales, canon_y_sobrecanon_petrolero_gobiernos_regionales, canon_y_sobrecanon_petrolero_universidades_nacionales, canon_y_sobrecanon_petrolero_institutos, canon_gasifero_gobiernos_regionales, canon_gasifero_gobiernos_locales_del_departamento, canon_gasifero_universidades_nacionales, derechos_de_vigencia, total::bigint as total FROM eiti_peru where year = '2012'",
      interactivity: 'departamento, year, canon_minero_gobiernos_regionales, canon_minero_gobiernos_locales_del_departamento, regalias_mineras_gobiernos_regionales, regalias_mineras_gobiernos_locales_del_departamenteo, regalias_mineras_universidades_naccionales, canon_y_sobrecanon_petrolero_gobiernos_regionales, canon_y_sobrecanon_petrolero_universidades_nacionales, canon_y_sobrecanon_petrolero_institutos, canon_gasifero_gobiernos_regionales, canon_gasifero_gobiernos_locales_del_departamento, canon_gasifero_universidades_nacionales, derechos_de_vigencia',
      cartocss: '#eiti_peru{polygon-fill: #FFFFB2;polygon-opacity: 0.8;line-color: #FFF;line-width: 1;line-opacity: 1;}#eiti_peru [ total <= 3000000000] {polygon-fill: #B10026;}#eiti_peru [ total <= 1000000000] {polygon-fill: #E31A1C;}#eiti_peru [ total <= 700000000] {polygon-fill: #FC4E2A;}#eiti_peru [ total <= 500000000] {polygon-fill: #FD8D3C;}#eiti_peru [ total <= 300000000] {polygon-fill: #FEB24C;}#eiti_peru [ total <= 10000000] {polygon-fill: #FED976;}#eiti_peru [ total <= 5000000] {polygon-fill: #FFFFB2;}#eiti_peru [ total < 1] {polygon-fill: #999999;}'
    }]
  }).addTo(map)
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
  })
  .error(function(err) {
    console.log(err);
  });
});

