/*
	BigEval.js
	by Avi Aryan (http://aviaryan.in)
	https://github.com/aviaryan/bigEval.js
*/

var BigEval = function(){
	this.err = 0;
	this.errMsg = "";
	this.errBR = "IMPROPER_BRACKETS";
	this.errMS = "MISSING_OPERATOR_AT_";
	this.errMN = "MISSING_OPERAND";
	this.errIC = "INVALID_CHAR_AT_";
	this.errFN = "INVALID_FUNCTION_";
	this.errVD = "UNDEFINED_VARIABLE_";
	this.errFL = "FUNCTION_LIMIT_EXCEEDED_BY_";

	// https://en.wikipedia.org/wiki/Order_of_operations#Programming_languages

	this.order = [
				['!'],
				['**'],
				['\\', '/', '*', '%'],
				['+', '-'],
				['<<', '>>'],
				['<', '<=', '>', '>='], 
				['==', '!='], 
				['&'], ['^'], ['|'], 
				['&&'], ['||']
                ];

	this.flatOps = [];
	for (var i = 0; i < this.order.length; i++) {
		this.flatOps = this.flatOps.concat(this.order[i]);
	}
	
	// CONSTANTS
	var a = this.CONSTANT = {};
	a.PI = Math.PI;
	a.PI_2 = a.PI / 2; // Math.PI_2;
	a.LOG2E = Math.LOG2E;
	a.DEG = a.PI / 180;
	a.E = Math.E;
	a.Infinity = Infinity;
	a.NaN = NaN;
	a.true = true;
	a.false = false;
};


BigEval.prototype.exec = function(s){
	this.err = 0;
	this.errMsg = "";

	// validate missing operator
	var misOperator = /[a-z0-9][\s\uFEFF\xA0]+[a-z0-9\.]/ig;
	if (misOperator.exec(s)){
		this.err = 1;
		return this.errMsg = this.errMS + misOperator.lastIndex;
	}

	// validate brackets
	this.validate(s);
	if (this.err)
		return this.errMsg;
		
	s = this.plusMinus( s.replace(/[\s\uFEFF\xA0]/g, '') );
	
	s = this.solve(s);
	
	return s;
};


BigEval.prototype.solve = function(s){

	// validate first char
	var fc = s.charAt(0);
	if (!fc.match(/[a-z0-9\.\+\-\(]/i)){
		this.err = 1;
		return this.errMsg = this.errIC;
	}

	s = this.addPlusSign(s);
	var ob = s.indexOf('('), cb, fname, freturn;
	var i;

	// if bracket present, work on them
	while (ob !== -1){
		var obct = 1;
		for (i = ob+1; i < s.length; i++){
			if (s[i] == '(')
				obct++;
			else if (s[i] === ')'){
				obct--;
				if (obct === 0){
					cb = i;
					break;
				}
			}
		}
		// Function found
		if (s.charAt(ob-1).match(/[a-z0-9_]/i)){
			fname = s.slice(0, ob).match(/[a-z0-9_]+$/i);
			freturn = this.solve( s.slice(ob+1, cb) );
			freturn = this.solveFunc( freturn , fname[0] ) + '';
			s = s.slice(0, ob-fname[0].length) + freturn + s.slice(cb+1);
		} else {
			s = s.slice(0, ob) + this.solve( s.slice(ob+1, cb) ) + s.slice(cb+1);
		}

		if (this.err)
			return this.errMsg;
		ob = s.indexOf('(');
	}

	// check for comma - then function throw it back
	if (s.indexOf(',') !== -1)
		return this.addPlusSign(s);
	
	// solve expression (no brackets exist)
	var p, bp, ap, seg, cs, isAddOn=0, b, a, op;
	for (i = 0; i < this.order.length; i++){

		cs = this.order[i];
		if (cs[0] === '+'){ // resolve +- made due to bracket solving
			s = this.plusMinus(s);
			isAddOn = 1;
		}

		p = this.leastIndexOf(s, cs, 1);
		op = p[1];
		p = p[0];
		
		while (p > 0){ // the first is sign, no need to take that
			bp = s.slice(0,p).match(/[\-\+]*(\de\-|\de\+|[a-z0-9_\.])+$/i); // keep e-,e+ before other regex to have it matched
			// & ^ | are after + in priority so they dont need be above
			ap = s.slice(p+op.length).match(/[\-\+]*(\de\-|\de\+|[a-z0-9_\.])+/i);
			if (ap == null)
				ap = [""];

			if (bp == null){ // 12 & -20 - here -20 is sign.. bp of it is null . ignore it
				p = this.leastIndexOf(s, cs, p+op.length);
				op = p[1];
				p = p[0];
				continue;
			}
			if (!isAddOn) // slice the extra +- sign that is not for number
				if (bp[0].match(/[\-\+]/))
					bp[0] = bp[0].slice(1);

			if (isAddOn) // +- only ignore 1e-7
				if ( bp[0].charAt(bp[0].length - 1) == 'e' )
					if ( bp[0].charAt(bp[0].length - 2).match(/\d/) ){ // is number
						p = this.leastIndexOf(s, cs, p+op.length);
						op = p[1];
						p = p[0];
						continue;
					}
		
			b = this.plusMinus(bp[0]);
			a = this.plusMinus(ap[0]);
			
			if (b === '' || a === '') {
				return this.makeError(this.errMN);
			}
			
			b = this.parseVar(b);
			a = this.parseVar(a);
			
			if (this.err)
				return this.errMsg;

			if (op == '!'){
				if ( bp[0].charAt(0) == '+' || bp[0].charAt(0) == '-' )
					bp[0] = bp[0].slice(1);
				b = this.parseVar(bp[0]);
				seg = this.fac( b ) + "";
				ap = [""]; // to avoid latter segment from being affected (unary operator)
			} else {
				if (op === '/' || op === '\\')
					seg = this.div( b , a );
				else if (op === '*')
					seg = this.mul( b , a );
				else if (op === '+')
					seg = this.add( b , a );
				else if (op === '-')
					seg = this.sub( b , a );
				else if (op === '<<')
					seg = this.shiftLeft( b , a );
				else if (op === '>>')
					seg = this.shiftRight( b , a );
				else if (op === '<')
					seg = this.lessThan( b , a );
				else if (op === '<=')
					seg = this.lessThanOrEqualsTo( b , a );
				else if (op === '>')
					seg = this.greaterThan( b , a );
				else if (op === '>=')
					seg = this.greaterThanOrEqualsTo( b , a );
				else if (op === '==')
					seg = this.equalsTo( b , a );
				else if (op === '!=')
					seg = this.notEqualsTo( b , a );
				else if (op === '**')
					seg = this.pow( b , a );
				else if (op === '%')
					seg = this.mod( b , a );
				else if (op === '&')
					seg = this.and( b , a );
				else if (op === '^')
					seg = this.xor( b , a );
				else if (op === '|')
					seg = this.or(	b , a );
				else if (op === '&&')
					seg = this.logicalAnd(	b , a );
				else if (op === '||')
					seg = this.logicalOr(	b , a );

				seg = this.addPlusSign(seg + "");
			}
			s = s.slice(0, p-bp[0].length) + seg + s.slice(p+ap[0].length+op.length);
			p = this.leastIndexOf(s, cs, 1);
			op = p[1];
			p = p[0];
		}
	}

	s = this.addPlusSign(s);
	return s === '' ? NaN : this.parseVar(s);
};

BigEval.prototype.validate = function(s){
	// checks expression for errors
	var stack = [];

	for ( var i = 0; i < s.length; i++ ){
		if ( s[i] == '(' )
			stack.push(0);
		else if ( s[i] == ')' ){
			if (stack.length > 0)
				stack.pop();
			else {
				this.makeError(this.errBR);
				break;
			}
		}
	}

	if (this.err == 0)
		if (stack.length != 0)
			this.makeError(this.errBR);
};

BigEval.prototype.solveFunc = function(s, fname){
	var arr = s.split(','), f, isMath = 0, isBigEval = 0;
	if ( typeof(this[fname]) == "function" ){
		isBigEval = 1;
	}
	else if ( typeof(Math[fname]) == "function" ){
		f = Math[fname];
		isMath = 1;
	}
	else if ( typeof(window[fname]) == "function" )
		f = window[fname];
	else {
		this.makeError(this.errFN + fname);
		return 0;
	}

	for (var i = 0; i<arr.length; i++)
		arr[i] = (isMath) ? Number(this.solve(arr[i])) : this.solve(arr[i]);

	if (arr.length == 1)
		return isBigEval ? this[fname].call(this, arr[0]) : f(arr[0]);
	else if (arr.length == 2)
		return isBigEval ? this[fname].call(this, arr[0], arr[1]) : f(arr[0], arr[1]);
	else if (arr.length == 3)
		return isBigEval ? this[fname].call(this, arr[0], arr[1], arr[2]) : f(arr[0], arr[1], arr[2]);
	else if (arr.length == 4)
		return isBigEval ? this[fname].call(this, arr[0], arr[1], arr[2], arr[3]) : f(arr[0], arr[1], arr[2], arr[3]);
	else
		return this.makeError(this.errFL + fname);
};

BigEval.prototype.parseVar = function(s){
	var z;
		
	if (z = s.match(/^[\+\-]?[a-z][a-z0-9_]*$/i)) {
        var sign = false;
		if (z[0][0] == '-' || z[0][0] == '+'){
            sign = z[0][0] === '-';
			z[0] = z[0].slice(1);
		}
		
		var c;
		
		if (typeof this.CONSTANT[z[0].toUpperCase()] !== 'undefined')
			c = this.CONSTANT[z[0].toUpperCase()];
		else if (typeof this.CONSTANT[z[0]] !== 'undefined')
			c = this.CONSTANT[z[0]];
		else
			return this.makeError(this.errVD + z[0]);
		
		if (typeof c === 'boolean')
			return c;
		
        // Safeguard to always work with numbers
		if (typeof c !== 'number')
			c = Number(c);
		
		return sign ? -c : c;
	}
	else
		return Number(s);
};

BigEval.prototype.leastIndexOf = function(s, cs, sp){
	var l = -1, p, m, item, j, jlen = this.flatOps.length, jop;

	for (var i = 0; i < cs.length; i++){
		item = cs[i];
		p = s.indexOf(item, sp);

		if (p == -1)
			continue;

		// Avoid taking partial op when longer ops are available
		for (j = 0; j < jlen; j++) {
			jop = this.flatOps[j];
			if (jop === item || jop.length <= item.length) continue;
			if (s.substr(p, jop.length) === jop) {
				p = -1;
				break;
			}
		}

		if (l == -1 || p < l) {
			l = p;
			m = item;
		}
	}
	return [l, m];
};

BigEval.prototype.plusMinus = function(s){
	return s.replace(/\+\+/g, '+').replace(/\+\-/g, '-').replace(/\-\+/g, '-').replace(/\-\-/g, '+');
};

BigEval.prototype.addPlusSign = function(s){
	if (s.charAt(0) != '-' && s.charAt(0) != '+')
		s = '+' + s;
	return s;
};

BigEval.prototype.makeError = function(msg){
	this.err = 1;
	return this.errMsg = msg;
};

/**
 * Extension functions
 */

BigEval.prototype.add = function(a, b){ 
	return a + b; 
};

BigEval.prototype.sub = function(a, b){
	return a - b;
};

BigEval.prototype.mul = function(a, b){
	return a * b;
};

BigEval.prototype.div = function(a, b){
	return a / b;
};

BigEval.prototype.pow = function(a, b){
	return Math.pow(a, b);
};

BigEval.prototype.lessThan = function(a, b){
	return a < b;
};

BigEval.prototype.lessThanOrEqualsTo = function(a, b){
	return a <= b;
};

BigEval.prototype.greaterThan = function(a, b){
	return a > b;
};

BigEval.prototype.greaterThanOrEqualsTo = function(a, b){
	return a >= b;
};

BigEval.prototype.equalsTo = function(a, b){
	return a == b;
};

BigEval.prototype.notEqualsTo = function(a, b){
	return a != b;
};

BigEval.prototype.logicalAnd = function(a, b){
	return a && b;
};

BigEval.prototype.logicalOr = function(a, b){
	return a || b;
};

BigEval.prototype.fac = function(n){
	var s = 1;
	for (var i = 2; i <= n; i++)
		s = this.mul(s, i);
	return s;
};

BigEval.prototype.mod = function(a, b){
	return a % b;
};

BigEval.prototype.shiftLeft = function(a, b){
	return a << b;
};

BigEval.prototype.shiftRight = function(a, b){
	return a >> b;
};

BigEval.prototype.and = function(a, b){
	return a & b;
};

BigEval.prototype.xor = function(a, b){
	return a ^ b;
};

BigEval.prototype.or = function(a, b){
	return a | b;
};


/**
 * Node compatibility
 */
if (typeof module !== 'undefined' && module.exports && typeof exports !== 'undefined'){
	module.exports = BigEval;
}
