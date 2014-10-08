var extendCore = function(){
  Array.prototype.singlePop = Array.prototype.pop;

  Array.prototype.pop = function(times){
    if(!times) return this.singlePop();

    var out = [];
    for(var i = 0; i < times; i++){
      out.push(this.singlePop());
    }
    return out.reverse().present();
  }

  Array.prototype.present = function(){
    var out = [];
    for (var i = 0, l = this.length; i < l; i ++) {
      var v = this[i];
      if(v) out.push(v);
    }
    return out;
  }

  // Defaults
  Number.prototype.separators = {
    float: ',',
    integer: ','
  };

  Number.prototype.format = function(){
    var integer = this.toString().split('.')[0];
    var sign    = integer[0] == '-' ? '-' : '';
    var decimal = this.toString().split('.')[1];

    var integerArray = integer.match(/(\d)/g);
    var integerTriplets = [];
    while(integerArray[0]){
      integerTriplets.push(integerArray.pop(3).join(''));
    }
    integerTriplets.reverse();

    var decimalSlug = decimal ? this.separators.float + decimal : ""

    return sign + integerTriplets.join(this.separators.integer) + decimalSlug;
  }

  Number.prototype.round = function(figures){
    return Math.round(this * Math.pow(10, figures)) /
      Math.pow(10, figures);
  }

  Number.prototype.toSol = function(year){ return this * rates.year(year); }
  Number.prototype.toUsd = function(year){ return this / rates.year(year); }

};

if(!location.pathname.match(/distrbucion/)) extendCore();
