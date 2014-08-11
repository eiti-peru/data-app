GChart = {
  loaded: false,

  // See _draw for args
  draw: function(){
    this.load(this._draw, arguments);
  },

  _draw: function(id, dataTable, chartType, opts){
    chartType || (chartType = 'ColumnChart');
    var el = document.getElementById(id);
    new google.visualization[chartType](el)
      .draw(dataTable, opts);
  },

  charts:{
    pie: function(id, dataTable, width, height){
      GChart.draw(id, dataTable, 'PieChart', {
        chartArea:{
          width: width,
          height: height
        }
      });
    }
  },

  load: function(callback, args){
    var _this = this;

    if(!this.loaded)
    google.load("visualization", "1", {packages:["corechart"],
      callback: function(){
        _this.loaded = true;
        callback.apply(_this, args);
      }
    });
    else
      callback.apply(_this, args);
  },

  // See _drawChart for args
  drawChart: function() {
    this.load(this._drawChart, arguments);
  },

  // Opts are:
  // chartType, a Google defined chart type, string, ex: LineChart, BarChart.
  // data, rows returned by a Google Datasource, example:
  //   rows = [ { c: [{v: 1}, {v: 2} ...] }, ... ]
  // This is more intuitive when fetching values: rows[m].c[n].v gets mth row
  // and nth column, and then gets the value of that cell.
  // elId, where to put the graphic, string
  // format, columns to apply format, integers array.
  _drawChart: function(opts) {
    var chartType = opts.chartType || 'BarChart';

    var data = google.visualization.arrayToDataTable(opts.data);
    var options = {
      height: 340,
      colors:['#7AA136', '#008cba', '#7a93b6'],
      tooltip: {textStyle: {color: '#232323', fontSize: 16}, showColorCode: true},
      chartArea: {top: 20, left:10, width: 400},
      lineWidth: 5,
      pointSize: 8,
      orientation: 'horizontal',
      legend: { position: 'bottom' }
    };
    var chart = new google.visualization[chartType](document.getElementById(opts.elId));

    this.format(data, opts.format);

    chart.draw(data, options);
  },

  // DataTables should be compatible
  chain: function(methods, callback, dataTable){
    var _this = this;
    var method = methods.shift();

    if(method)
      this.build(method).send(function(response){
        if(!dataTable){
          dataTable = response.getDataTable();
        }else
          GDataTable.sum(dataTable, response.getDataTable());
        _this.chain(methods, callback, dataTable);
      });
    else if(callback) callback(dataTable);
  },


  build: function(method){
    var t = function(){ throw method + " query is a function." };
    var query = GQuery.named[method] instanceof Function ? t() : GQuery.named[method]
    return new google.visualization.Query(GQuery.url(query));
  },

  send: function(method, callback){
    var _this = this;
    this.load(function(){
      _this.build(method).send(callback);
    });
  },

  // Named query returning a Google DataTable object
  dataTable: function(method, callback){
    this.send(method, function(response){
      callback(response.getDataTable());
    });
  },

  // Format numbers: 1000 -> 1,000
  format: function(data, columns){
    var formatter = new google.visualization.NumberFormat({groupingSymbol: ',', fractionDigits: 0});
    for (var i = 0, l = columns.length; i < l; i ++) {
      var j = columns[i];
      formatter.format(data, j);
    }
  }

};

GDataTable = {
  sum: function(dataTable1, dataTable2){
    for (var r = 0, l = dataTable2.getNumberOfRows(); r < l; r ++) {
      dataTable1.addRow(this.row(dataTable2, r));
    }
  },

  row: function(dataTable, index, value){
    var out = [];
    for (var c = 0, l = dataTable.getNumberOfColumns(); c < l; c ++) {
      if(value){
        out.push(dataTable.setValue(index, c, value));
      }
      else
        out.push(dataTable.getValue(index, c));
    }
    return out;
  },

  col: function(dataTable, index, values){
    var out = [];
    for (var r = 0, l = dataTable.getNumberOfRows(); r < l; r ++) {
      if(values){
        var value = values[r];
        out.push(dataTable.setValue(r, index, value));
      }
      else
        out.push(dataTable.getValue(r, index));
    }
    return out;
  },

  map: function(table, iterator){
    var rows = table.getNumberOfRows();
    for (var row = 0, l = rows; row < l; row ++) {
      var results = iterator(this.row(table, row));
      results = results instanceof Array ? results : [results] ;
      for (var col = 0, l1 = results.length; col < l1; col ++) {
        var result = results[col];
        table.setValue(row , col, result);
      }
    }
  },

  mapCol: function(table, iterator){
    var cols = table.getNumberOfColumns();
    for (var col = 0, l = cols; col < l; col ++) {
      var result = iterator(table.getColumnLabel(col));
      table.setColumnLabel(col, result);
    }
  }
}

