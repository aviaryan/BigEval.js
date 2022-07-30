var BigEval = require("../BigEval.js");
var cf = require("./common.js");

/**
 * Basic tests - simple arithmetic
 */
exports.testBasics = {
	setUp: function(callback){
		this.b = new BigEval();
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
		test.equals(Math.round(this.b.exec("345 / 23 * 124 / 41 * 12")), 544);
		test.done();
	},

	testFactorial: function(test){
		test.equals(this.b.exec("2*5!+3"), 243);
		test.done();
	},

	testEnclosedNegative: function(test){
		test.equals(Math.round(this.b.exec("(-5)+6")), 1);
		test.done();
	},

	testErrorData1: function(test){
		try {
			Math.round(this.b.execute("5 * FN(1"));
			throw new Error('Should have thrown an error');
		} catch (err) {
			test.equals(err.lineInfo.line, 1);
			test.equals(err.lineInfo.column, 7);
			test.equals(err.endLineInfo.column, 8);
		}
		test.done();
	},

	testErrorData2: function(test){
		try {
			Math.round(this.b.execute("5 * UNKNOWN(1)"));
			throw new Error('Should have thrown an error');
		} catch (err) {
			test.equals(err.lineInfo.line, 1);
			test.equals(err.lineInfo.column, 5);
			test.equals(err.endLineInfo.column, 12);
		}
		test.done();
	},

	testErrorData3: function(test){
		try {
			Math.round(this.b.execute("6-*4"));
			throw new Error('Should have thrown an error');
		} catch (err) {
			test.equals(err.lineInfo.line, 1);
			test.equals(err.lineInfo.column, 3);
		}
		test.done();
	},

	testExp: function(test){
		test.equals(this.b.exec("1e1 + 1e+2 + 1e-3"), 110.001);
		test.done();
	},

	testFuncRound: function(test){
		this.b.FUNCTION["FN"] = (arg) => arg * 2;
		test.equals(this.b.exec("fn(1.57)"), 1.57 * 2);
		test.done();
	},

	testFuncRoundUpper: function(test){
		this.b.FUNCTION["FN"] = (arg) => arg * 2;
		test.equals(this.b.exec("FN(1.57)"), 1.57 * 2);
		test.done();
	},

	testMathRound: function(test){
		test.equals(this.b.exec("round(1.57)"), Math.round(1.57));
		test.done();
	},

	testMathRoundUpper: function(test){
		test.equals(this.b.exec("ROUND(1.57)"), Math.round(1.57));
		test.done();
	},

	testConst: function(test){
		this.b.CONSTANT["ABC"] = 123;
		test.equals(this.b.exec("ABC * 2"), 123 * 2);
		test.done();
	},

	testConstLower: function(test){
		this.b.CONSTANT["ABC"] = 123;
		test.equals(this.b.exec("abc * 2"), 123 * 2);
		test.done();
	},

	testForceConst: function(test){
		test.ok(!isFinite(this.b.exec("INFINITY")));
		test.done();
	},

	testForceConstLower: function(test){
		test.ok(!isFinite(this.b.exec("infinity")));
		test.done();
	},

	testDefaultConst: function(test){
		test.equals(this.b.exec("PI"), Math.PI);
		test.done();
	},

	testDefaultConstLower: function(test){
		test.equals(this.b.exec("pi"), Math.PI);
		test.done();
	},

	testConstProvider: function(test){
		this.b.constProvider = function (name) {
			if (name === 'ABC')
				return 123;
		};

		test.equals(Math.round(this.b.exec("ABC * 2")), 246);
		test.done();
	}
};

/**
 * test basic expressions
 * @param test
 */
exports.testBasic = function(test){
	var b = new BigEval();
	test.equals(b.exec("12+45*10"), 462);
	test.done();
};

/**
 * Batch auto tests
 * @param test
 */
exports.testBatch = function(test){
	cf.autoTest(test, new BigEval());
};
