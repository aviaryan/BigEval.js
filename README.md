# BigEval.js

[![Build Status](https://travis-ci.org/aviaryan/BigEval.js.svg?branch=master)](https://travis-ci.org/aviaryan/BigEval.js)
[![Codecov](https://img.shields.io/codecov/c/github/aviaryan/BigEval.js.svg?maxAge=2592000)](https://codecov.io/github/aviaryan/BigEval.js)
[![Code Climate](https://codeclimate.com/github/aviaryan/BigEval.js/badges/gpa.svg)](https://codeclimate.com/github/aviaryan/BigEval.js)
[![Issue Count](https://codeclimate.com/github/aviaryan/BigEval.js/badges/issue_count.svg)](https://codeclimate.com/github/aviaryan/BigEval.js)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/e9e94367b8eb4952a7e0dda5c0dfdf29)](https://www.codacy.com/app/aviaryan/BigEval-js)
[![npm](https://img.shields.io/npm/v/bigeval.svg)](https://www.npmjs.com/package/bigeval)
[![npm](https://img.shields.io/npm/dm/bigeval.svg)](https://www.npmjs.com/package/bigeval)
[![npm](https://img.shields.io/npm/l/bigeval.svg)]()

An alternative to JavaScript's eval() for solving mathematical expressions. It can be extended to use the *Big Number* libraries available to provide results with maximum precision.


### Installation

* Node
```
npm install bigeval
> var BigEval = require('bigeval')
```
* From browser
```html
<script src="BigEval.js"></script>
```


### Features

* Full BODMAS/PEMDAS support (just like `Eval`).
* Factorial, Power, Modulo, bitwise and logical operations supported. See [Operators section](#operators) for full list.
* Support for numbers in scientific notation
* Support for functions. (Math library functions, User functions)
* Support for CONSTANTS/variables in expressions.


### Using

After including *BigEval.js*, the first step is to create an instance of BigEval. Then we can use the `exec()` method to solve an expression. See [project page](http://aviaryan.in/BigEval.js/index.html) for a working example.
```javascript
var Obj = new BigEval();
var result = Obj.exec("5! + 1e3 * (PI + E)"); // 5979.874482048837
var result2 = Obj.exec("sin(45 * deg)**2 + cos(pi / 4)**2"); // 1
var result3 = Obj.exec("0 & -7 ^ -7 - 0%1 + 6%2"); //-7
var result4 = Obj.exec("sin( acos( ceil( tan(pi/6) ) ) )"); // sin(0) i.e. 0
var result5 = Obj.exec("((1 << 4) ^ (14 >> 1)) + pi"); // 26.141592653589793
```
The `exec` method returns the answer as **string**. If an error occurs, then `Obj.err` is set to true and the error message is returned by exec().


### Operators

The operators currently supported in order of precedence are -
```js
[
	['!'],  // Factorial
	['**'],  // power
	['/', '*', '%'],
	['+', '-'],
	['<<', '>>'],  // bit shifts
	['<', '<=', '>', '>='],
	['==', '=', '!='],   // equality comparisons
	['&'], ['^'], ['|'],   // bitwise operations
	['&&'], ['||']   // logical operations
]
```


### Functions

BigEval supports functions like sin(), cos() ... When a function is used in an expression, BigEval first looks into its methods to see if such a function exist, then it looks into the JavaScript's **Math** library and in the end it looks into window's global namespace for the function.
Please note that we use just `sin()` and not `Math.sin()` in expressions. Attaching a new function to BigEval is easy.
```javascript
var Obj = new BigEval();
Obj.prototype.avg = function(a, b){
    return this.div( this.add(a,b) , "2");
};
```


### Constants

Constants are nothing but properties of the BigEval object. To use a constant such as PI in an expression, we can simply write `PI`. Example - `sin( PI / 4 )`.
To add a new constant, we do `Obj.CONSTANT.NAME = VALUE`. The VALUE should be in **string format**.
```js
Obj.CONSTANT.INTOCM = '2.54'; // inch to cm
console.log(Obj.exec('12 * intocm')); // the case doesn't matter in expressions
```

A constant NAME should start with an alphabet and should only use `[a-zA-Z0-9_]` characters. Default constants include -
```ini
PI = 3.1415...
PI_2 = PI / 2
LOG2E = log(e) / log(2)
DEG = PI / 180
E = 2.718...
INFINITY = Infinity
NaN = NaN
```


### Extending with Big Number libraries

BigEval can be extended with any of the big number libraries for JavaScript. To extend BigEval, we only need to change its methods that are responsible for adding, subtracting and so. For an example see the extension [MikeMcl-decimal.js](extensions/MikeMcl-decimal.js) which is based on [MikeMcl's Decimal.js library](https://github.com/MikeMcl/decimal.js). The HTML page [extended.html](http://aviaryan.github.io/BigEval.js/extended.html) shows how to use this extension.

To use decimaljs extension with Node, download the [file](extensions/MikeMcl-decimal.js) and then
```js
var BigEval = require('./MikeMcl-decimal.js');
var b = new BigEval();
console.log(b.exec('-2 + 3'));
```


### Ports

* [Eval.net](https://github.com/danielgindi/Eval.net) by [danielgindi](https://github.com/danielgindi) - .NET (C#) port


### Contributors

* [danielgindi](https://github.com/danielgindi)
