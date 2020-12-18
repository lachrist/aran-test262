/*---
info: |
    Result of boolean conversion from number value is false if the argument
    is +0, -0, or NaN; otherwise, is true
esid: sec-toboolean
description: +0, -0 and NaN convert to Boolean by explicit transformation
---*/

if (Boolean(+0) !== false) {
  $ERROR('#1: Boolean(+0) === false. Actual: ' + (Boolean(+0)));
}
