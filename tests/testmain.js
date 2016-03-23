var BigEval = require('../BigEval.js');

/**
 * Function to round (truncate) a string number to certain places
 */
function roundStr(s, places){
	var posDec = s.indexOf('.');
	if (posDec == -1)
		return s;
	else {
		var sRounded;
		if (places <= 0){
			sRounded = s.substr(0, posDec);
		} else {
			sRounded = s.substr(0, posDec+1+places);
		}
		return sRounded;
	}
}

/**
 * Basic tests - simple arithmetic
 */
exports.testBasics = {
	setUp: function(callback){
		this.b = new BigEval();
		callback();
	},

	test1: function(test){
		test.equals(this.b.exec("12+45*10"), '462');
		test.done();
	},

	test2: function(test){
		test.equals(this.b.exec("12/4 * 5 + 45*13 - 72 * 598"), '-42456');
		test.done();
	},

	testMulDiv: function(test){
		test.equals(roundStr(this.b.exec("345 / 23 * 124 / 41 * 12"), 0), '544');
		test.done();
	}
};

/**
 * test basic expressions
 * @param test
 */
exports.testBasic = function(test){
	var b = new BigEval();
	test.equals(b.exec("12+45*10"), ''+462);
	test.done();
};

/**
 * Batch test BigEval over randomly generated expressions
 * Compared with eval()'s output
 * @param test
 */
exports.testBatch = function(test){
	var b = new BigEval();
	var l = 5000; // no of tests
	var m = 15; // max size of expression

	var sz, j, exp, r1, r2;
	var ops = "+-/*&^|%"; // 7 (mod can be problem, - divide)

	for (var i = 0; i<l; i++){
		sz = Math.floor((Math.random() * m + 3));
		if (sz % 2 == 0)
			sz ++;
		exp = "";
		for (j = 0; j < sz; j++){ // build exp
			if (j%2==0)
				exp += Math.floor(Math.random() * 20 - 9); // -9
			else
				exp += ops[ Math.floor(Math.random() * 8) ];
		}
		exp = BigEval.prototype.plusMinus(exp);

		r1 = b.exec(exp);
		r2 = eval(exp);
		if (r1 != r2){
			if ( Math.abs(Number(r1)-r2) > 0.1 ){ // precision
				console.log(i + " error " + r1 + " " + r2);
				test.equals(0,1);
				test.done();
				break;
			}
		}
	}
	test.equals(1,1);
	test.done();
};