/*
	BigEval.js v0.1
	by Avi Aryan
*/


function BigEval(){
	this.err = 0;
	this.errMsg = "";
	this.errBR = "IMPROPER_BRACKETS";
	this.errMS = "MISSING_OPERATOR_AT_";
	this.errMN = "MISSING_OPERAND_AT_";
	this.errIC = "INVALID_CHAR_AT_";
	this.errFN = "INVALID_FUNCTION_";
	this.errVD = "UNDEFINED_VARIABLE_";

	this.order = "!^\\/*%+-";

	// CONSTANTS
	this.PI = Math.PI;
	this.PI_2 = this.PI / 2; // Math.PI_2;
	this.LOG2E = Math.LOG2E;
	this.DEG = this.PI / 180;
}


BigEval.prototype.exec = function(s){
	this.err = 0;
	this.errMsg = "";
	this.str = s;

	// validate brackets
	this.validate();
	if (this.err)
		return this.errMsg;

	// validate missing operator
	var misOperator = /[a-z0-9][ \t]+[a-z0-9\.]/ig, p;
	if (misOperator.exec(s)){
		this.err = 1;
		return this.errMsg = this.errMS + misOperator.lastIndex;
	}

	// validate missing operand
	var misOperands = /[\+\-\\\/\*\^\%][ \t]*([\\\/\*\^\!\%\)]|$)/g;
	if (misOperands.exec(s)){
		this.err = 1;
		return this.errMsg = this.errMN + misOperands.lastIndex;
	}

	s = this.plusMinus( s.replace(/[ \t]/g, '') );

	s = this.solve(s);
	if (s.charAt(0) == '+')
		s = s.slice(1);
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

	// if bracket present, work on them
	while (ob != -1){
		var obct = 1;
		for (var i = ob+1; i < s.length; i++){
			if (s[i] == '(')
				obct++;
			else if (s[i] == ')'){
				obct--;
				if (obct == 0){
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
	if (s.indexOf(',') != -1)
		return this.addPlusSign(s);

	// solve expression (no brackets exist)
	var p, bp, ap, seg, c, isAddOn=0, b, a;
	for (var i = 0; i < this.order.length; i++){

		c = this.order[i];
		if (c == '+'){ // resolve +- made due to bracket solving
			s = this.plusMinus(s);
			isAddOn = 1;
		}

		p = s.indexOf(c, 1);
		while (p > 0){ // the first is sign, no need to take that
			bp = s.slice(0,p).match(/[\-\+\*\\\/\%]*(e\-|e\+|[a-z0-9_\.])+$/i); // kepp e-,e+ before other regex to have it matched
			ap = s.slice(p+1).match(/[\-\+]?(e\-|e\+|[a-z0-9_\.])+/i);
			if (ap == null)
				ap = [""];
			
			if (!isAddOn) // no need for it when only +- signs exist
				bp[0] = bp[0].slice(1);
			if (isAddOn) // +- only ignore 1e-7
				if ( bp[0].charAt(bp[0].length - 1) == 'e' )
					if ( bp[0].charAt(bp[0].length - 2).match(/\d/) ){ // is number
						p = s.indexOf(c, p+1);
						continue;
					}

			// look for variables
			b = this.parseVar(bp[0]); a = this.parseVar(ap[0]);
			if (this.err)
				return this.errMsg;

			if (c == '!'){
				if ( bp[0].charAt(0) == '+' || bp[0].charAt(0) == '-' )
					bp[0] = bp[0].slice(1);
				b = this.parseVar(bp[0]);
				seg = this.fac( b ) + "";
				ap = [""]; // to avoid NULL
			} else {
				if (c == '/' || c == '\\')
					seg = this.div( b , a );
				else if (c == '*')
					seg = this.mul( b , a );
				else if (c == '+')
					seg = this.add( b , a );
				else if (c == '-')
					seg = this.add( b , '-' + a );
				else if (c == '^')
					seg = this.pow( b , a );
				else if (c == '%')
					seg = this.mod( b , a );

				seg = this.addPlusSign(seg + "");
			}
			s = s.slice(0, p-bp[0].length) + seg + s.slice(p+ap[0].length+1);
			p = s.indexOf(c, 1);
		}
	}

	s = this.addPlusSign(s);
	return this.parseVar(s);
};

BigEval.prototype.validate = function(){
	// checks expression for errors
	var stack = [], err = 0;

	for ( var i = 0; i < this.str.length; i++ ){
		if ( this.str[i] == '(' )
			stack.push(0);
		else if ( this.str[i] == ')' ){
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
	var arr = s.split(','), f, isMath = 0;
	if (this[fname])
		f = this[fname];
	else if (Math[fname]){
		f = Math[fname];
		isMath = 1;
	}
	else if (window[fname])
		f = window[fname];
	else if (global[fname])
		f = global[fname];
	else {
		this.makeError(this.errFN + fname);
		return 0;
	}

	for (var i = 0; i<arr.length; i++)
		arr[i] = (isMath) ? Number(this.solve(arr[i])) : this.solve(arr[i]);

	if (arr.length == 1)
		return f(arr[0]);
	else if (arr.length == 2)
		return f(arr[0], arr[1]);
};

BigEval.prototype.parseVar = function(s){
	var z;
	console.log(s);
	if (z = s.match(/^[\+\-]?[a-z][a-z0-9_]*$/i)){
		var zs="";
		if (z[0].charAt(0) == '-' || z[0].charAt(0) == '+'){
			zs = z[0].slice(0,1);
			z[0] = z[0].slice(1);
		}
		if (this[ z[0].toUpperCase() ])
			return zs + this[ z[0].toUpperCase() ];
		else
			return this.makeError(this.errVD + z[0]);
	}
	else
		return s;
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


/******************
*
* FUNCTIONS BENEATH
*
*******************/

BigEval.prototype.add = function(a, b){ 
	return Number(a)+Number(b); 
};

BigEval.prototype.mul = function(a, b){
	return Number(a)*Number(b);
};

BigEval.prototype.div = function(a, b){
	return Number(a)/Number(b);
};

BigEval.prototype.pow = function(a, b){
	return Math.pow(Number(a), Number(b));
};

BigEval.prototype.fac = function(n){
	var s = "1";
	n = Number(n);
	for (var i = 2; i <= n; i++)
		s = this.mul(s, i);
	return s;
};

BigEval.prototype.mod = function(a, b){
	return Number(a)%Number(b);
};