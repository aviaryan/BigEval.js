/*
	BigEval extension for MikeMcl's decimal.js
	https://github.com/MikeMcl/decimal.js
*/

// import decimal module in case of node
if (typeof module !== 'undefined' && typeof exports !== 'undefined'){
	var Decimal = require('decimal.js');
	var BigEval = require('../BigEval.js');
}

// override methods
BigEval.prototype.add = function(a, b){
	return new Decimal(a).plus(b);
};

BigEval.prototype.sub = function(a, b){
	return new Decimal(a).minus(b);
};

BigEval.prototype.mul = function(a, b){
	return new Decimal(a).times(b);
};

BigEval.prototype.div = function(a, b){
	return new Decimal(a).dividedBy(b);
};

BigEval.prototype.pow = function(a, b){
	return new Decimal(a).pow(b);
};

BigEval.prototype.mod = function(a, b){
	return new Decimal(a).modulo(b);
};

// Extra methods

BigEval.prototype.sqrt = function(a){
	return new Decimal(a).sqrt();
};

BigEval.prototype.log = function(a){
	return new Decimal(a).log();
};

BigEval.prototype.ln = function(a){
	return new Decimal(a).ln();
};

BigEval.prototype.exp = function(a){
	return new Decimal(a).exp();
};

/*
 * Export module
 */
if (typeof module !== 'undefined' && module.exports && typeof exports !== 'undefined'){
	module.exports = BigEval;
}