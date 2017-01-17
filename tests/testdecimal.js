var DecimalBigEval = require("../extensions/MikeMcl-decimal.js");
var cf = require("./common.js");

/**
 * Basic tests - simple arithmetic
 */
exports.testBasics = {
	setUp: function(callback){
		this.b = new DecimalBigEval();
		callback();
	},

	test1: function(test){
		test.equals(this.b.exec("12+45*10"), 462);
		test.done();
	},

	test2: function(test){
		test.equals(this.b.exec("12/4 * 5 + 45*13 - 72 * 598"), -42456);
		test.done();
	},

	testMulDiv: function(test){
		test.equals(cf.roundStr(this.b.exec("345 / 23 * 124 / 41 * 12"), 0), 544);
		test.done();
	}
};

/**
 * Batch auto tests
 * @param test
 */
exports.testBatch = function(test){
	cf.autoTest(test, new DecimalBigEval());
};
