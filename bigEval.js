/*
	bigEval.js v0.1
	by Avi Aryan
*/

var bigEval_add = function(a, b){ 
	return Number(a)+Number(b); 
};

var bigEval_mult = function(a, b){
	return Number(a)*Number(b);
};

var bigEval_div = function(a, b){
	return Number(a)/Number(b);
};

// so on

function bigEval(){
	this.err = 0;
	this.errMsg = "";
	this.errBR = "IMPROPER_BRACKETS";
	this.errMS = "MISSING_OPERATOR_AT_";
	this.errMN = "MISSING_OPERAND_AT_";
	this.errIC = "INVALID_CHAR_AT_";

	this.fChrRegex = /[a-z0-9\.\+\-\(]/i;
}

bigEval.prototype.exec = function(s){
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
	var misOperands = /[\+\-\\\/\*\^][ \t]*([\+\-\\\/\*\^\!\)]|$)/g;
	if (misOperands.exec(s)){
		this.err = 1;
		return this.errMsg = this.errMN + misOperands.lastIndex;
	}

	s = s.replace(/[ \t]/g, '');

	return this.solve(s);
};

bigEval.prototype.solve = function(s){

	// validate first char
	var fc = s.charAt(0);
	if (!fc.match(this.fChrRegex)){
		this.err = 1;
		return this.errMsg = this.errIC;
	}

	var ans = 0, pop;

	if (fc == '+' || fc == '-'){
		s = s.slice(1);
	}

	return ans;
};

bigEval.prototype.validate = function(){
	// checks expression for errors
	var stack = [], err = 0;

	for ( var i = 0; i < this.str.length; i++ ){
		if ( this.str[i] == '(' )
			stack.push(0);
		else if ( this.str[i] == ')' ){
			if (stack.length > 0)
				stack.pop();
			else {
				this.makeError(this.errBS);
				break;
			}
		}
	}

	if (this.err == 0)
		if (stack.length != 0)
			this.makeError(this.errBS);
};

bigEval.prototype.makeError = function(msg){
	this.err = 1;
	this.errMsg += msg + " ";
};