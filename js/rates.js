rates = function(from, to, year){
  for (var i = 0, l = rates.cache().length; i < l; i ++) {
    var rate = rates.cache()[i];
    if(rate.c[0].v == from && rate.c[1].v == to && rate.c[2].v == year)
      return rate.c[3].v;
  }
};

rates.cache = function(){
  return rates._cache || (rates._cache =
    JSON.parse(sessionStorage[rates.sessionKey]));
}

rates.year = function(year){ return rates('PEN','USD', year); };

rates.sessionKey = "Rates " + new Date().toDateString();

rates.sol = "S/. "
