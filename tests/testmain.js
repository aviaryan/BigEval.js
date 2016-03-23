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

exports.testBasic = function(test){
	var b = new BigEval();
	test.equals(b.exec("12+45*10"), ''+462);
	test.done();
};