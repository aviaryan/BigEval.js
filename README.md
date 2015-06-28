# BigEval.js

An alternative to JavaScript's eval() for solving mathematical expressions. It can be extended to use the *Big Number* libraries available to provide results with maximum precision.


## Features

* Error checking before expression is executed.
* Full BODMAS support.
* Factorial (!), Power (**), Modulo (%) supported.
* Support for numbers in scientific notation
* Support for functions. (Big Number library functions, Math library functions, global functions)
* Support for CONSTANTS. Default constants include PI, E, PI_2 and more.


### Using

After including *BigEval.js*, the first step is to get a handle to the BigEval object. Then you can use the `exec()` method to solve a expression.
```javascript
var Obj = new BigEval();
var result = Obj.exec("5! + 6.6e3 * (321-147)");
var result2 = Obj.exec("sin(45 * deg)**2 + cos(45 * deg)**2");
```


### Functions

**BigEval** supports functions like sin(), cos() ... When you use a function in your expression, **BigEval** first looks into its methods to see if such a function exist, then it looks into the JavaScript `Math()` library and in the end it looks into window's global namespace for the function.
It must be noted that you need to use just `sin()` and not `Math.sin()` . 


### Constants

If you want to use a constant such as PI in your expression, you can simply write **PI**. Example - `sin( PI / 4 )`.
If you want to add a new constant, then you do `Obj.NAME = VALUE`