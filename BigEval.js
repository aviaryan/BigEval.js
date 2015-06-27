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

	this.order = "!^\\/*+-";
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
	var misOperator = /[a-z0-9]([ \t]+[a-z0-9\.]|[ \t]*\()/ig, p;
	if (misOperator.exec(s)){
		this.err = 1;
		return this.errMsg = this.errMS + misOperator.lastIndex;
	}

	// validate missing operand
	var misOperands = /[\+\-\\\/\*\^][ \t]*([\\\/\*\^\!\)]|$)/g;
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
	var ob = s.indexOf('('), cb;

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
		s = s.slice(0, ob) + this.solve( s.slice(ob+1, cb) ) + s.slice(cb+1);
		if (this.err)
			return this.errMsg;
		ob = s.indexOf('(');
	}

	// solve expression (no brackets exist)
	var p, bp, ap, seg, c, isAddOn=0;
	for (var i = 0; i < this.order.length; i++){

		c = this.order[i];
		if (c == '+'){ // resolve +- made due to bracket solving
			s = this.plusMinus(s);
			isAddOn = 1;
		}

		p = s.indexOf(c, 1);
		while (p > 0){ // the first is sign, no need to take that
			bp = s.slice(0,p).match(/[\-\+\*\\\/]*[a-z0-9\.]+$/i);
			ap = s.slice(p+1).match(/[\-\+]?[a-z0-9\.]+/i);

			if (!isAddOn) // no need for it when only +- signs exist
				bp[0] = bp[0].slice(1);

			if (c == '!'){

			} else {
				if (c == '/' || c == '\\')
					seg = this.div( bp[0] , ap[0] );
				else if (c == '*')
					seg = this.mul( bp[0] , ap[0] );
				else if (c == '+')
					seg = this.add( bp[0] , ap[0] );
				else if (c == '-')
					seg = this.add( bp[0] , '-' + ap[0] );
				else if (c == '^')
					seg = this.pow( bp[0] , ap[0] );

				seg = this.addPlusSign(seg + "");
				s = s.slice(0, p-bp[0].length) + seg + s.slice(p+ap[0].length+1);
			}
			p = s.indexOf(c, 1);
			alert(s);
		}
	}

	s = this.addPlusSign(s);
	return s;
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
	this.errMsg = msg;
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