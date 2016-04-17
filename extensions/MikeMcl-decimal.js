/*
	BigEval extension for MikeMcl's decimal.js
	https://github.com/MikeMcl/decimal.js
*/

// function to remove prefixed + . see https://github.com/aviaryan/BigEval.js/issues/8
function p(s){
	return s[0] == '+' ? s.substr(1) : s;
}

var _decimal, _bigeval;

// import decimal module in case of node
if (typeof module !== 'undefined' && typeof exports !== 'undefined'){
	_decimal = require('decimal.js');
	_bigeval = require('bigeval');
} else {
	_decimal = Decimal;
	_bigeval = BigEval;
}

// override methods
_bigeval.prototype.add = function(a, b){
	return new _decimal(p(a)).plus(p(b));
};

_bigeval.prototype.sub = function(a, b){
	return new _decimal(p(a)).minus(p(b));
};

_bigeval.prototype.mul = function(a, b){
	return new _decimal(p(a)).times(p(b));
};

_bigeval.prototype.div = function(a, b){
	return new _decimal(p(a)).dividedBy(p(b));
};

_bigeval.prototype.pow = function(a, b){
	return new _decimal(p(a)).pow(p(b));
};

_bigeval.prototype.mod = function(a, b){
	return new _decimal(p(a)).modulo(p(b));
};

// Extra methods

_bigeval.prototype.sqrt = function(a){
	return new _decimal(p(a)).sqrt();
};

_bigeval.prototype.log = function(a){
	return new _decimal(p(a)).log();
};

_bigeval.prototype.ln = function(a){
	return new _decimal(p(a)).ln();
};

_bigeval.prototype.exp = function(a){
	return new _decimal(p(a)).exp();
};

/*
 * Export module
 */
if (typeof module !== 'undefined' && module.exports && typeof exports !== 'undefined'){
	module.exports = _bigeval;
}