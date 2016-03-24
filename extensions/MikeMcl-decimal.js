/*
	BigEval extension for MikeMcl's decimal.js
	https://github.com/MikeMcl/decimal.js
*/

// function to remove prefixed + . see https://github.com/aviaryan/BigEval.js/issues/8
function p(s){
	return s[0] == '+' ? s.substr(1) : s;
}

// import decimal module in case of node
if (typeof module !== 'undefined' && typeof exports !== 'undefined'){
	var Decimal = require('decimal.js');
	var BigEval = require('bigeval');
	//var BigEval = require('../BigEval.js');
}

// override methods
BigEval.prototype.add = function(a, b){
	return new Decimal(p(a)).plus(p(b));
};

BigEval.prototype.sub = function(a, b){
	return new Decimal(p(a)).minus(p(b));
};

BigEval.prototype.mul = function(a, b){
	return new Decimal(p(a)).times(p(b));
};

BigEval.prototype.div = function(a, b){
	return new Decimal(p(a)).dividedBy(p(b));
};

BigEval.prototype.pow = function(a, b){
	return new Decimal(p(a)).pow(p(b));
};

BigEval.prototype.mod = function(a, b){
	return new Decimal(p(a)).modulo(p(b));
};

// Extra methods

BigEval.prototype.sqrt = function(a){
	return new Decimal(p(a)).sqrt();
};

BigEval.prototype.log = function(a){
	return new Decimal(p(a)).log();
};

BigEval.prototype.ln = function(a){
	return new Decimal(p(a)).ln();
};

BigEval.prototype.exp = function(a){
	return new Decimal(p(a)).exp();
};

/*
 * Export module
 */
if (typeof module !== 'undefined' && module.exports && typeof exports !== 'undefined'){
	module.exports = BigEval;
}