# BigEval.js

An alternative to JavaScript's eval() for solving mathematical expressions. It can be extended to use the *Big Number* libraries available to provide results with maximum precision.


## Features

* Full BODMAS/PEMDAS support.
* Factorial (!), Power (**), Modulo (%) supported.
* Support for numbers in scientific notation
* Support for functions. (Big Number library functions, Math library functions, global functions)
* Support for CONSTANTS. Default constants include PI, E, PI_2 and more.


### Using

After including *BigEval.js*, the first step is to get a handle to the BigEval object. Then we can use the `exec()` method to solve a expression.
```javascript
var Obj = new BigEval();
var result = Obj.exec("5! + 6.6e3 * ((321-147) % 26)"); // 118920
var result2 = Obj.exec("sin(45 * deg)**2 + cos(45 * deg)**2"); // 1
var result3 = Obj.exec("-3 * -5 + 27 / -3"); //6
```


### Operators

The operators currently supported in order of precedence are - 
```
Factorial = !
Power = **
Division = \ or /
Multiplication = *
Modulo = %
Addition = +
Subtraction = -
```


### Functions

BigEval supports functions like sin(), cos() ... When a function is used in an expression, BigEval first looks into its methods to see if such a function exist, then it looks into the JavaScript `Math()` library and in the end it looks into window's global namespace for the function.
Please note that we use just `sin()` and not `Math.sin()` in expressions. Attaching a new function to BigEval is easy.
```javascript
BigEval.prototype.avg = function(a, b){
    return this.div( this.add(a,b) , "2");
};
```


### Constants

Constants are nothing but properties of the BigEval object. To use a constant such as PI in an expression, we can simply write `PI`. Example - `sin( PI / 4 )`.
To add a new constant, we do `Obj.CONSTANT.NAME = VALUE`. The VALUE should be in **string format**. Default constants include - 
```ini
PI = 3.1415...
PI_2 = PI / 2
LOG2E = log(e) / log(2)
DEG = PI / 180
E = 2.718...
```


### Extending with Big Number libraries

BigEval can be extended with any of the big number libraries for JavaScript. To extend BigEval, we only need to change its methods that are responsible for adding, subtracting and so. For an example see the extension [MikeMcl-decimal.js](extensions/MikeMcl-decimal.js) which is based on [MikeMcl's Decimal.js library](https://github.com/MikeMcl/decimal.js). The HTML page [extended.html](http://aviaryan.github.io/BigEval.js/extended.html) shows how to use this extension.