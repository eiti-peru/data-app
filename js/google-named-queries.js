
// Named Queries, use: GQuery.sumByType(callback) and so on.
// TODO rename queries
GQuery.named = {

  // Generic transactions to be processed by client
  transactions: function(year){
    return "select A,B,C,D,E,F,G,H,I,J,K,L,M where D = '" + year + "'&sheet=transactions_transposed";
  },

  // ingresos level 1

  sumByYears: function(years){
    return "select C, D, sum(G) " + GQuery.namedHelpers.contain('D', years) +
      "group by C, D" + "&sheet=transactions_transposed";
  },

  sumByType: function(year){
    // receiving not empty string or number
    if((typeof year == 'string' && year[0]) || typeof year == 'number'){
      //          type   prod     gov     com     count   currency   name
      return "select C, sum(G), sum(H), sum(E)" +
        "where D = '" + year.toString() + "' and E != 0 group by C order by C desc" + "&sheet=transactions_transposed";
      // receiving callback or other cases
    } else {
      return "select C, sum(G), sum(H), count(B)       " +
        " where E != 0 group by C" + "&sheet=transactions_transposed";
    }
  },

  //                             year  prod                type
  productionByYearBySector: "select D, sum(G) group by D pivot C" +
    "&sheet=transactions_transposed",

  // ingresos level 2
  // authorities for a given type and year
  authorities: function(type, year){
    return "select sum(G), sum(H), sum(I),    F, M " +
      "where C = '" + type + "' and E != 0 and D = '" + year + "' " +
      "group by F, M order by sum(G) desc" + "&sheet=transactions_transposed";
  },

  // Front Page
  //         std no    comps                               types
  first:  "select H, count(A) where H = 'yes' group by H pivot C" + "&sheet=empresas",
  second: "select I, count(A) where I = 'yes' group by I pivot C" + "&sheet=empresas",
  third:  "select J, count(A) where J = 'yes' group by J pivot C" + "&sheet=empresas",

  //            year  currency   auth    comp
  colDiff: "select D, M, sum(G), sum(H) group by D, M " +
    "label sum(G) 'Según Gobierno', sum(H) 'Según Empresas'" +
    "&sheet=transactions_transposed",

  //              name  type  aggr
  companies: "select B, C, D" + "&sheet=empresas",

  // Pie chart
  companiesByAggregation:
    "select E, count(A) where E = 'Agregado' or E = 'Desagregado' group by E" +
    "&sheet=empresas",

  // Distribution page
  distribution: function(year){
    return "select A, B, C, D where B = " + year + "&sheet=canon";
  },

  // Rates
  rates: 'select A, B, C, D' + '&sheet=rates'

};

// Convert named queries to methods
for(var _key in GQuery.named){
  (function(key){
    if(GQuery.named.hasOwnProperty(key)){
      var value = GQuery.named[key];
      if(typeof value == 'function')
        GQuery[key] = function(){
          var args = Array.prototype.slice.call(arguments);
          var callback = args.pop();
          return this.do(value.apply(this, args), callback);
        };
      else
        GQuery[key] = function(callback){
          return this.do(value, callback);
        };
    }
  })(_key);
}

// Save rates in session
if(!sessionStorage[rates.sessionKey])
GQuery.rates(function(response){
  var _rates = JSON.stringify(response.table.rows);
  sessionStorage[rates.sessionKey] = _rates;
});