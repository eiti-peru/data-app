// There are two APIs wrapped here, Google Query Language API
// and Google Spreadsheet API.

// Helper
var jsonp = function(url, success, data){
  return $.ajax({
    dataType: 'jsonp',
    data: data || {alt: 'json-in-script'},
    url: url,
    success: success
  });
}

// Google Query Language API wrapper
var GQuery = {
  // org one
  // "key": "0Aps3-myRJKJJdGtrZnN1TDRCckJjblZwaG9FVHQxc2c",
  // gmail one
  key: "0AtMts_R3W2qxdG40SUxNcHRmYW01WWxkcnl3WVRVc1E",

  // Check https://developers.google.com/chart/interactive/docs/dev/implementing_data_source
  url: function(query, worksheetNumber){
    return "http://spreadsheets.google.com/a/google.com/tq?key=" +
      this.key + "&tq=" + encodeURI(query) + "&tqx=reqId:" + this.queue.length +
        ";responseHandler:GQuery.callback";
  },

  // Makes a query, receives a callback with response from Google as argument
  do: function(query, callback){
    jsonp(this.url(query));
    this.queue.push(callback);
  },

  // Storage for callbacks triggered after calling API
  queue: [],

  // Calls function from queue
  callback: function(responseFromGoogle){
    this.queue[responseFromGoogle.reqId](responseFromGoogle);
  },

  // TODO move
  namedHelpers: {
    contain: function(columnId, set){
      var out = set.join("' or " + columnId + " = '");
      if(out[0]){
        out = "where " + columnId + " = '" + out;
        out += "' ";
      }
      return out;
    }
  },

  models:{
    companies: function(callback){
      GQuery.model('companies', ['name', 'type', 'aggregation'], callback);
    },
    transactions: function(callback){
      // null to get all years, companies could be refactored to allow just function
      GQuery.transactions(null, function(response){
        var rows = response.table.rows;

        var _transactions = GQuery.toObjects(rows,
          // Add more fields matching companies query
          ['company_name', 'production']
        );

        callback(_transactions);
      })
    },
  },

  dataTables: {
    // Transactions joined with company
    transactions: function(callback){
      GQuery.transactions1(function(response){
        var transactions = new google.visualization.DataTable(response.table);
        var aggregationIndex = transactions.addColumn('string');

        GQuery.companies(function(response){
          var companies = response.table.rows;

          for (var r = 0, l = transactions.getNumberOfRows(); r < l; r ++) {
            var company = _.find(companies, function(row){
              return row.c[0].v == transactions.getValue(r, 0);
            });

            if(company)
              transactions.setValue(r, aggregationIndex, company.c[2].v);
          }

          callback(transactions);
        });
      });
    }
  },

  model: function(name, keys, callback){
    GQuery[name](function(response){
      var rows = response.table.rows;
      callback(GQuery.toObjects(rows, keys));
    })
  },

  toObjects: function(rows, keys){
    return _.map(rows, function(r){
      var out = {};
      for (var i = 0, l = keys.length; i < l; i ++) {
        var field  = keys[i];
        out[field] = r.c[i].v;
      }
      return out;
    })
  },

  sum: function(rows, columnIndex){
    var out = 0;
    for(var i = 0; i < rows.length; i++){
      var row = rows[i];
      out += parseInt(row.c[columnIndex].v);
    }
    return out;
  },

  // GQuery.filter(rows, 0, 2012)
  filter: function(rows, columnIndex, value){
    var out = [];
    for(var i = 0; i < rows.length; i++){
      var row = rows[i];
      if(row.c[columnIndex].v == value) out.push(row);
    }
    return out;
  },

  addColumn: function(rows, iterator){
    for (var r = 0, l = rows.length; r < l; r ++) {
      var row = rows[r];
      row.c.push({ v: iterator(row) });
    }
  }

};

// Google Spreadsheet API wrapper
var GSpreadsheet = {

  // org one
  // "key": "0Aps3-myRJKJJdGtrZnN1TDRCckJjblZwaG9FVHQxc2c",
  // gmail one
  key: "0AtMts_R3W2qxdG40SUxNcHRmYW01WWxkcnl3WVRVc1E",

  // To put in a link to download CSV
  csvUrl: function(sheetName){
    return "https://docs.google.com/spreadsheet/ccc?key=" + GSpreadsheet.key +
        "&output=csv" + this.gidSlug(sheetName);
  },

  // Hard coded because Google Spreadsheet API has no way to get gid.
  gidMap: {
    empresas:     0,
    transactions: 14,
    production:   6,
    canon:        7,
    rates:        12
  },

  gidSlug: function(sheetName){
    var gid = (this.gidMap[sheetName] || '').toString();
    return gid ? "&gid=" + gid : "";
  },

  // Feeds: worksheets, cells, list
  // SheetId: get one by calling sheetByTitle
  // Visibility: public, private
  // Projections: full, basic, values
  url: function(feed, sheetId, visibility, projection){
    visibility || (visibility = 'public');
    projection || (projection = 'basic');
    var sheetSlug = sheetId ? "/" + sheetId + "/" : "/";

    return "http://spreadsheets.google.com/feeds/" + feed + "/" + this.key +
      sheetSlug + visibility + "/" + projection;
  },

  // Helper to get response with gsx$ prefixed fields
  sheetUrl: function(sheetId){
    return this.url('list', sheetId, 'public', 'values');
  },

  // Calls callback passing spreadsheet id: od6, od7, ...
  sheetByTitle: function(title, callback){
    jsonp(GSpreadsheet.url('worksheets'), function(response){
      for(var i = 0; i < response.feed.entry.length; i++){
        var sheet = response.feed.entry[i];
        var _title = sheet.title.$t;
        if(_title == title) callback(sheet.id.$t.split('/').pop());
      }
    });
  },

  sheet: function(title, callback){
    this.sheetByTitle(title, function(id){
      jsonp(GSpreadsheet.sheetUrl(id), function(response){
        callback(response);
      });
    })
  },

  // If column header in spreadsheet is 'Company Type',
  // colName would value 'companytype'.
  colFromEntries: function(entries, colName){
    var out = [];
    for(var i = 0; i < entries.length; i++){
      var entry = entries[i];
      var val = entry["gsx$" + colName].$t;
      out.push(val);
    }
    return out;
  },

  col: function(sheetTitle, colName, callback){
    this.sheetByTitle(sheetTitle, function(sheetId){
      jsonp(GSpreadsheet.sheetUrl(sheetId), function(response){
        var entries = response.feed.entry;
        callback(GSpreadsheet.colFromEntries(entries, colName));
      });
    });
  }
};


