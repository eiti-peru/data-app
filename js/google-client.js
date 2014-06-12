// Queries processed in client, using underscore.js
// data parameter is a response from a Google data source.
Client = {

  index: function(data, fieldLabel) {
    for (var i = 0, l = data.table.cols.length; i < l; i ++) {
      var col = data.table.cols[i];
      if(col.label == fieldLabel) return i;
    }
  },

  val: function(data, row, fieldLabel){
    return row.c[this.index(data, fieldLabel)].v;
  },

  groupBy: function(data, fieldLabel){
    var _this = this;
    return _.groupBy(data.table.rows, function(row){
      return _this.val(data, row, fieldLabel);
    });
  },

  sum: function(rows, groupIndex, sumIndex){
    var out = {};
    for (var i = 0, l = rows.length; i < l; i ++) {
      var row = rows[i];
      out[row.c[groupIndex].v] = out[row.c[groupIndex].v] || row;
      out[row.c[groupIndex].v].c[sumIndex].v += row.c[sumIndex].v;
    }
    return out;
  },

  sumSoles: function(rows, colNumber, currencyCol, year){
    return _.inject(rows,function(mem, row){
      var isUsd = row.c[currencyCol].v == 'USD';
      return mem + (isUsd ? row.c[colNumber].v.toSol(year) : row.c[colNumber].v);
    }, 0);
  }

}

