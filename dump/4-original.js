"use strict";
/*---
info: |
    Result of boolean conversion from number value is false if the argument
    is +0, -0, or NaN; otherwise, is true
esid: sec-toboolean
description: +0, -0 and NaN convert to Boolean by explicit transformation
---*/

const x = Array;
x;
// if (eval(`123;`) !== 123) {
//   throw `direct-eval-call`;
// }
// if (geval(`456;`) !== 456) {
//   throw `indirect-eval-call`;
// }
// if (Function(`return 789;`)() !== 789) {
//   throw `function-construction`;
// }
// print("wesh");

// print($262.evalScript("123;"));

// $262.yolo(1,2,3);
// if (Boolean(+0) !== false) {
//   $ERROR('#1: Boolean(+0) === false. Actual: ' + (Boolean(+0)));
// }
