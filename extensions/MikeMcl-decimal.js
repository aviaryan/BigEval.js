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

_bigeval.prototype.number = function(str){
	return (str instanceof Decimal) ? str : new Decimal(str);
};

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

_bigeval.prototype.lessThan = function(a, b){
	return a.lessThan(b);
};

_bigeval.prototype.lessThanOrEqualsTo = function(a, b){
	return a.lessThanOrEqualTo(b);
};

_bigeval.prototype.greaterThan = function(a, b){
	return a.greaterThan(b);
};

_bigeval.prototype.greaterThanOrEqualsTo = function(a, b){
	return a.greaterThanOrEqualTo(b);
};

_bigeval.prototype.equalsTo = function(a, b){
	return a.equals(b);
};

_bigeval.prototype.notEqualsTo = function(a, b){
	return !a.equals(b);
};

_bigeval.prototype.isTruthy = function(a){
	return !a.equals(0);
};

_bigeval.prototype.logicalAnd = function(a, b){
	if (!a || ((a instanceof Decimal) && a.equals(0)))
		return a;

	return b;
};

_bigeval.prototype.logicalOr = function(a, b){
	if (!a || ((a instanceof Decimal) && a.equals(0)))
		return b;

	return a;
};

_bigeval.prototype.mod = function(a, b){
	return new _decimal(p(a)).modulo(p(b));
};

_bigeval.prototype.shiftLeft = function(a, b){
	return a << b;
};

_bigeval.prototype.shiftRight = function(a, b){
	return a >> b;
};

_bigeval.prototype.and = function(a, b){
	return a & b;
};

_bigeval.prototype.xor = function(a, b){
	return a ^ b;
};

_bigeval.prototype.or = function(a, b){
	return a | b;
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
