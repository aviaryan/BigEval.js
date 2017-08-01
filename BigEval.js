/*
	BigEval.js
	by Avi Aryan (http://aviaryan.in)
	https://github.com/aviaryan/bigEval.js
*/

var root = Function('return this')();

/**
 * @enum {string}
 * @readonly
*/
var TokenType = {
	STRING: '"',
	VAR: 'x',
	CALL: 'f',
	GROUP: '()',
	NUMBER: '#',
	OP: '*',
	LEFT_PAREN: '(',
	RIGHT_PAREN: ')',
	COMMA: ','
};

var hasOwnProperty = Object.hasOwnProperty;

var DEFAULT_VAR_NAME_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$';

var BigEval = function() {

	// https://en.wikipedia.org/wiki/Order_of_operations#Programming_languages

	this.order = [
				['!'],
				['**'],
				['\\', '/', '*', '%'],
				['+', '-'],
				['<<', '>>'],
				['<', '<=', '>', '>='],
				['==', '=', '!=', '<>'],
				['&'], ['^'], ['|'],
				['&&'], ['||']
				];

	this.prefixOps = ['!'];
	this.suffixOps = ['!'];

	// https://en.wikipedia.org/wiki/Operator_associativity
	this.rightAssociativeOps = {
		'**': true
	};

	this.varNameChars = Object.create ? Object.create(null) : {};

	var chars = DEFAULT_VAR_NAME_CHARS.split('');
	for (var i = 0; i < chars.length; i++) {
		this.varNameChars[chars[i]] = true;
	}

	this.flatOps = [];
	for (var i = 0; i < this.order.length; i++) {
		this.flatOps = this.flatOps.concat(this.order[i]);
	}

	this.CONSTANT = {};
	this.FUNCTION = {};
};

BigEval.prototype.DEFAULT_CONSTANTS = {
	'PI': Math.PI,
	'PI_2': Math.PI / 2, // Math.PI_2;
	'LOG2E': Math.LOG2E,
	'DEG': Math.PI / 180,
	'E': Math.E
};

BigEval.prototype.FORCE_CONSTANTS = {
	'INFINITY': Infinity,
	'NAN': NaN,
	'TRUE': true,
	'FALSE': false
};

BigEval.prototype.exec = function (expression) {

	try {
		return this.execute(expression);
	} catch (ignored) {
		return 'ERROR';
	}

};

BigEval.prototype.execute = function (expression) {

	var compiled;
	if (expression['__compiled_expression']) {
		compiled = expression;
	} else {
		compiled = this.compile(expression);
	}

	return this._evaluateToken(compiled);

};

BigEval.prototype._opAtPosition = function(s, p) {
	var op = '';

	for (var j = 0, jlen = this.flatOps.length; j < jlen; j++) {
		var item = this.flatOps[j];

		if (op === item || item.length <= op.length)
			continue;

		if (s.substr(p, item.length) === item) {
			op = item;
		}
	}

	return op;
};

BigEval.prototype._indexOfOpInTokens = function(tokens, op) {
	for (var i = 0; i < tokens.length; i++) {
		var token = tokens[i];
		if (token.type === TokenType.OP && token.value === op)
			return i;
	}
	return -1;
};

BigEval.prototype._lastIndexOfOpInTokens = function(tokens, op) {
	for (var i = tokens.length - 1; i >= 0; i--) {
		var token = tokens[i];
		if (token.type === TokenType.OP && token.value === op)
			return i;
	}
	return -1;
};

BigEval.prototype._lastIndexOfOpArray = function(tokens, cs) {
	var l = -1, p, m, item;

	for (var i = 0; i < cs.length; i++){
		item = cs[i];

		// Is this one a right-associative op?
		if (this.rightAssociativeOps.hasOwnProperty(item)) {
			p = this._indexOfOpInTokens(tokens, item);
		} else {
			p = this._lastIndexOfOpInTokens(tokens, item);
		}

		if (p == -1)
			continue;

		if (l == -1 || p > l) {
			l = p;
			m = item;
		}
	}

	return [l, m];
};

BigEval.prototype._parseString = function (data, startAt, strict, unquote) {

	var i = startAt || 0, len = data.length;

	var out = '';
	var c, uffff, j, hex, hexSize;

	var quote = null;
	if (unquote) {
		quote = data[i++];
		if (quote !== '\'' && quote !== '"') {
			throw new Error("Not a string");
		}
	}

	for (; i < len; i++) {
		c = data[i];

		if (c === '\\') {
			c = data[i + 1];
			if (!c) {
				throw new Error("Invalid string. An escape character with no escapee encountered at index " + i);
			}

			// Take a step forward here
			i++;

			// Test escapee

			if (c === '\\' ||
				c === '\'' ||
				c === '"') {
				out += c;
			} else if (c === 'b') {
				out += '\b';
			} else if (c === 'f') {
				out += '\f';
			} else if (c === 'n') {
				out += '\n';
			} else if (c === 'r') {
				out += '\r';
			} else if (c === 't') {
				out += '\t';
			} else if (c === 'u' || c === 'x') {
				uffff = 0;
				hexSize = c === 'u' ? 4 : 2;

				for (j = 0; j < hexSize; j += 1) {
					c = data[++i];

					if (c >= '0' && c <= '9') {
						hex = c - '0';
					} else if (c >= 'a' && c <= 'f') {
						hex = c - 'a' + 10;
					} else if (c >= 'A' && c <= 'F') {
						hex = c - 'A' + 10;
					} else {
						if (strict) {
							throw new Error("Unexpected escape sequence at index " + (i - j - 2));
						} else {
							i--;
							break;
						}
					}

					uffff = uffff * 16 + hex;
				}

				out += String.fromCharCode(uffff);
			} else {
				if (strict) {
					throw new Error("Unexpected escape sequence at index " + (i - 1));
				} else {
					out += c;
				}
			}
		} else if (c === quote) {
			return [out, i + 1];
		} else {
			out += c;
		}
	}

	if (unquote) {
		throw new Error("String must be quoted with matching single-quote (\') or double-quote(\") characters.");
	}

	return out;
};

BigEval.prototype._parseNumber = function (data, startAt) {

	var i = startAt || 0, len = data.length;

	var c;
	var exp = 0;
	var dec = false;

	if (i >= len) {
		throw new Error('Can\'t parse token at ' + i);
	}

	for (; i < len; i++) {
		c = data[i];

		if (c >= '0' && c <= '9') {
			if (exp === 1) break;
			if (exp > 1) exp++;
		} else if (c === '.') {
			if (dec || exp > 0) break;
			dec = true;
		} else if (c === 'e') {
			if (exp > 0) break;
			exp = 1;
		} else if (exp === 1 && (c === '-' || c === '+')) {
			exp = 2;
		} else {
			break;
		}
	}

	if (i === startAt || exp === 1 || exp === 2) {
		throw new Error('Unexpected character at index ' + i);
	}

	return [data.substr(startAt, i - startAt), i];
};

BigEval.prototype._tokenizeExpression = function (expression) {
	var tokens = [];

	var parsed;

	for (var i = 0, len = expression.length; i < len; i++) {
		var c = expression[i];

		var isDigit = c >= '0' && c <= '9';

		if (isDigit || c === '.') {
			// Starting a number
			parsed = this._parseNumber(expression, i);
			tokens.push({
				type: TokenType.NUMBER,
				pos: i,
				value: parsed[0]
			});
			i = parsed[1] - 1;
			continue;
		}

		var isVarChars = this.varNameChars[c];

		if (isVarChars) {
			// Starting a variable name - can start only with A-Z_

			var token = '';

			while (i < len) {
				c = expression[i];
				isVarChars = this.varNameChars[c];
				if (!isVarChars) break;

				token += c;
				i++;
			}

			tokens.push({
				type: TokenType.VAR,
				pos: i - token.length,
				value: token
			});

			i--; // Step back to continue loop from correct place

			continue;
		}

		if (c === '\'' || c === '"') {
			parsed = this._parseString(expression, i, false, true);
			tokens.push({
				type: TokenType.STRING,
				pos: i,
				value: parsed[0]
			});
			i = parsed[1] - 1;
			continue;
		}

		if (c === '(') {
			tokens.push({
				type: TokenType.LEFT_PAREN,
				pos: i
			});
			continue;
		}

		if (c === ')') {
			tokens.push({
				type: TokenType.RIGHT_PAREN,
				pos: i
			});
			continue;
		}

		if (c === ',') {
			tokens.push({
				type: TokenType.COMMA,
				pos: i
			});
			continue;
		}

		if (c === ' ' || c === '\t' || c === '\f' || c === '\r' || c === '\n') {
			// Whitespace, skip
			continue;
		}

		var op = this._opAtPosition(expression, i);
		if (op) {
			tokens.push({
				type: TokenType.OP,
				pos: i,
				value: op
			});
			i += op.length - 1;
			continue;
		}

		throw new Error('Unexpected token at index ' + i);
	}

	return tokens;
};

BigEval.prototype._groupTokens = function (tokens, startAt) {
	var isFunc = startAt > 0 && tokens[startAt - 1].type === TokenType.VAR;

	var rootToken = tokens[isFunc ? startAt - 1: startAt];

	var token, groups, sub;

	if (isFunc) {
		rootToken.type = TokenType.CALL;
		groups = rootToken.args = [];
		sub = [];
	} else {
		rootToken.type = TokenType.GROUP;
		sub = rootToken.tokens = [];
	}

	for (var i = startAt + 1, len = tokens.length; i < len; i++) {
		token = tokens[i];

		if (isFunc && token.type === TokenType.COMMA) {
			sub = [];
			groups.push(sub);
			continue;
		}

		if (token.type === TokenType.RIGHT_PAREN) {
			if (isFunc) {
				tokens.splice(startAt, i - startAt + 1);
			} else {
				tokens.splice(startAt + 1, i - startAt);
			}
			return rootToken;
		}

		if (token.type === TokenType.LEFT_PAREN) {
			this._groupTokens(tokens, i);
			i--;
			len = tokens.length;
			continue;
		}

		if (isFunc && groups.length === 0) {
			groups.push(sub);
		}

		sub.push(token);
	}

	throw new Error("Unmatched parenthesis for parenthesis at index " + tokens[startAt].pos);
};

BigEval.prototype._buildTree = function (tokens) {

	var order = this.order, orderCount = order.length;
	var cs, found, pos, op;
	var left, right;

	for (var i = orderCount - 1; i >= 0; i--) {
		cs = order[i];
		found = this._lastIndexOfOpArray(tokens, cs);
		pos = found[0];
		op = found[1];

		if (pos !== -1) {
			var token = tokens[pos];

			if (this.prefixOps.indexOf(op) !== -1 || this.suffixOps.indexOf(op) !== -1) {
				left = null;
				right = null;
				if (this.prefixOps.indexOf(op) !== -1 && pos === 0) {
					right = tokens.slice(pos + 1);
				}
				else if (this.suffixOps.indexOf(op) !== -1 && pos > 0) {
					left = tokens.slice(0, pos);
				}

				if (left === null && right === null) {
					throw new Error('Operator ' + token.value + ' is unexpected at index ' + token.pos);
				}
			} else {
				left = tokens.slice(0, pos);
				right = tokens.slice(pos + 1);

				if (left.length === 0 && (op === '-' || op === '+')) {
					left = null;
				}
			}

			if ((left && left.length === 0) ||
				(right && right.length === 0)) {
				throw new Error('Invalid expression, missing operand');
			}

			if (!left && op === '-') {
				left = [{ type: TokenType.NUMBER, value: 0 }];
			}
			else if (!left && op === '+') {
				return this._buildTree(right);
			}

			if (left)
				token.left = this._buildTree(left);

			if (right)
				token.right = this._buildTree(right);

			return token;
		}
	}

	if (tokens.length > 1) {
		throw new Error('Invalid expression, missing operand or operator at ' + tokens[1].pos);
	}

	if (tokens.length === 0) {
		throw new Error('Invalid expression, missing operand or operator.');
	}

	var singleToken = tokens[0];

	if (singleToken.type === TokenType.GROUP) {
		singleToken = this._buildTree(singleToken.tokens);
	}
	else if (singleToken.type === TokenType.CALL) {
		for (var a = 0, arglen = singleToken.args.length; a < arglen; a++) {
			if (singleToken.args[a].length === 0)
				singleToken.args[a] = null;
			else
				singleToken.args[a] = this._buildTree(singleToken.args[a]);
		}
	} else if (singleToken.type === TokenType.COMMA) {
		throw new Error('Unexpected character at index ' + singleToken.pos);
	}

	return singleToken;
};

BigEval.prototype.compile = function (expression) {

	var tokens = this._tokenizeExpression(expression);
	var token, prevToken, i, len;

	// Compact +-
	for (i = 1, len = tokens.length; i < len; i++) {
		token = tokens[i];
		prevToken = tokens[i - 1];

		if (token.type === TokenType.OP &&
			(token.value === '-' || token.value === '+') &&
			prevToken.type === TokenType.OP &&
			(prevToken.value === '-' || prevToken.value === '+')) {

			if (prevToken.value !== '+') {
				if (token.value === '-') {
					token.value = '+';
				} else {
					token.value = '-';
				}
			}

			tokens.splice(i - 1, 1);
			i--;
			len = tokens.length
			continue;
		}

		if (token.type === TokenType.NUMBER &&
			prevToken.type === TokenType.OP &&
			(prevToken.value === '-' || prevToken.value === '+') &&
			((i > 1 && tokens[i - 2].type === TokenType.OP) || i === 1)
			) {

			if (prevToken.value === '-') {
				token.value = prevToken.value + token.value;
			}
			tokens.splice(i - 1, 1);
			i--;
			len = tokens.length
			continue;
		}
	}

	// Take care of groups (including function calls)
	for (i = 0, len = tokens.length; i < len; i++) {
		token = tokens[i];

		if (token.type === TokenType.LEFT_PAREN) {
			this._groupTokens(tokens, i);
			len = tokens.length;
			i--;
		}
	}

	// Build the tree
	var tree = this._buildTree(tokens);

	tree['__compiled_expression'] = true;

	return tree;
};

BigEval.prototype._evaluateToken = function (token) {
	var value = token.value;

	switch (token.type) {

		case TokenType.STRING:
			return value;

		case TokenType.NUMBER:
			return this.number(value);

		case TokenType.VAR:
			if (typeof this.FORCE_CONSTANTS[value.toUpperCase()] !== 'undefined')
				return this.FORCE_CONSTANTS[value.toUpperCase()];

			if (typeof this.CONSTANT[value] !== 'undefined')
				return this.CONSTANT[value];

			if (typeof this.DEFAULT_CONSTANTS[value.toUpperCase()] !== 'undefined')
				return this.DEFAULT_CONSTANTS[value.toUpperCase()];

			return undefined;

		case TokenType.CALL:
			return this._evaluateFunction(token);

		case TokenType.OP:
			var res;
			switch (token.value) {

				case '!': // Factorial or Not
					if (token.left) { // Factorial (i.e. 5!)
						return this.fac(this._evaluateToken(token.left));
					} else { // Not (i.e. !5)
						return this.logicalNot(this._evaluateToken(token.right));
					}

				case '/': // Divide
				case '\\':
					return this.div(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '*': // Multiply
					return this.mul(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '+': // Add
					return this.add(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '-': // Subtract
					return this.sub(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '<<': // Shift left
					return this.shiftLeft(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '>>': // Shift right
					return this.shiftRight(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '<': // Less than
					return this.lessThan(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '<=': // Less than or equals to
					return this.lessThanOrEqualsTo(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '>': // Greater than
					return this.greaterThan(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '>=': // Greater than or equals to
					return this.greaterThanOrEqualsTo(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '==': // Equals to
				case '=':
					return this.equalsTo(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '!=': // Not equals to
				case '<>':
					return this.notEqualsTo(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '**': // Power
					return this.pow(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '%': // Mod
					return this.mod(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '&': // Bitwise AND
					return this.and(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '^': // Bitwise XOR
					return this.xor(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '|': // Bitwise OR
					return this.or(this._evaluateToken(token.left), this._evaluateToken(token.right));

				case '&&': // Logical AND
					res = this._evaluateToken(token.left);
					if (this.isTruthy(res))
						return this._evaluateToken(token.right);
					return res;

				case '||': // Logical OR
					res = this._evaluateToken(token.left);
					if (!this.isTruthy(res))
						return this._evaluateToken(token.right);
					return res;
			}
	}

	throw new Error('An unexpected error occurred while evaluating expression');
};

BigEval.prototype._evaluateFunction = function (token) {

	var fname = token.value

	var args = [];
	for (var i = 0; i < token.args.length; i++) {
		if (token.args[i] === null) {
			args.push(undefined);
		} else {
			args.push(this._evaluateToken(token.args[i]));
		}
	}

	if (typeof(this.FUNCTION[fname]) === 'function') {
		return this.FUNCTION[fname].apply(this.FUNCTION[fname], args);
	}
	else if (typeof(this[fname]) === 'function') {
		return this[fname].apply(this, args);
	}
	else if (typeof(Math[fname]) == 'function') {
		return Math[fname].apply(Math, args);
	}
	else if (typeof(root[fname]) == 'function') {
		return root[fname].apply(root, args);
	}

	throw new Error('Function named "' + fname + '" was not found');
};

/**
 * Extension functions
 */

BigEval.prototype.number = function(str){
	return Number(str);
};

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

BigEval.prototype.isTruthy = function(a){
	return !!a;
};

BigEval.prototype.logicalNot = function(n){
	return !this.isTruthy(n);
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
