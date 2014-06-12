
// Named Queries, use: GQuery.sumByType(callback) and so on.
// TODO rename queries
GQuery.named = {

  // Generic transactions to be processed by client
  transactions: "select A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,X,Y,Z,AA,AB" + "&sheet=transactions",

  // ingresos level 1

  sumByYears: function(years){
    return "select C, D, sum(F) " + GQuery.namedHelpers.contain('D', years) +
      "group by C, D" + "&sheet=transactions_test";
  },

  sumByType: function(year){
    // receiving not empty string or number
    if((typeof year == 'string' && year[0]) || typeof year == 'number'){
      //          type   prod     gov     com     count   currency   name
      return "select C, sum(F), sum(Z), sum(Y), count(A),        AB,     B " +
        "where D = '" + year.toString() + "' group by C, AB, B" + "&sheet=transactions";
      // receiving callback or other cases
    } else {
      return "select C, sum(F), sum(Z), sum(Y), count(A),        AB,     B " +
        " group by C, AB, B" + "&sheet=transactions";
    }
  },

  //                             year  prod                type
  productionByYearBySector: "select D, sum(E) group by D pivot C" +
    "&sheet=transactions",

  // ingresos level 2
  // authorities for a given type and year
  authorities: function(type, year){
    //          auth   prod     gov     com  payment_type
    return "select sum(F), sum(G), sum(H),    E, L " +
      "where C = '" + type + "' and D = '" + year + "' " +
      "group by E, L" + "&sheet=transactions_transposed";
  },

  // summary of companies production for a set of years and a given
  // type
  companies1: function(years, type){
    return "select D, sum(E), sum(P) " + GQuery.namedHelpers.contain('D', years) +
      "and C = '" + type + "' group by D" + "&sheet=transactions";
  },

  // empresas level 1

  // Reported by companies grouped by sector
  transactions1: function(year){
    if(!year)
      return "select B, sum(F), sum(Z), sum(Y), sum(AA), count(A) group by B" +
      "&sheet=transactions";
    //          name   prod     gov     com    diff       txs
    return "select B, sum(F), sum(Z), sum(Y), sum(AA), count(A) " +
      "where D = '" + year + "' group by B" + "&sheet=transactions";
  },

  // Front Page

  //         std no    comps                               types
  first:  "select H, count(A) where H = 'yes' group by H pivot C" + "&sheet=empresas",
  second: "select I, count(A) where I = 'yes' group by I pivot C" + "&sheet=empresas",
  third:  "select J, count(A) where J = 'yes' group by J pivot C" + "&sheet=empresas",

  //            year  currency   auth    comp
  colDiff: "select D, AB, sum(Y), sum(Z) where AB !='' group by D, AB " +
    "label sum(Y) 'Según Gobierno', sum(Z) 'Según Empresas'" +
    "&sheet=transactions",

  //              name  type  aggr
  companies: "select B, C, D" + "&sheet=empresas",

  //                 year   comp    auth         year
  authoritySum: "select D, sum(H), sum(I) group by D" + "&sheet=transactions",

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