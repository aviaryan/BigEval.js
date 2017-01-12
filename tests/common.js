
/**
 * Batch test BigEval over randomly generated expressions
 * Compared with eval()'s output
 * @param test
 * @param b - The BigEval object
 */
function autoTest(test, b){
	//var b = new obj();
	var l = 5000; // no of tests
	var m = 15; // max size of expression

	var sz, j, exp, r1, r2;
	var ops = "+-/*&^|%"; // 7 (mod can be problem, - divide)

	for (var i = 0; i<l; i++){
		sz = Math.floor((Math.random() * m + 3));
		if (sz % 2 === 0) {
			sz++;
		}
		exp = "";
		for (j = 0; j < sz; j++){ // build exp
			if (j%2 === 0) {
				exp += Math.floor(Math.random() * 20 - 9); // -9
			} else {
				exp += ops[Math.floor(Math.random() * 8)];
			}
		}
		exp = b.plusMinus(exp);

		r1 = b.exec(exp);
		r2 = eval(exp);
        
        if (r1 !== r2 && (!isNaN(r1) || !isNaN(r2))) { // precision
            console.log(i + " exp=  " + exp + " bigeval= " + r1 + " real= " + r2);
            test.equals(r1, r2);
            test.done();
            break;
        }
	}
	test.equals(1,1);
	test.done();
}


/**
 * Export
 */
exports.autoTest = autoTest;