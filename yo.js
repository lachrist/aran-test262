// Copyright (C) 2016 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
esid: sec-integer-indexed-exotic-objects-getownproperty-p
description: >
  Returns a descriptor object from an index property
info: |
  9.4.5.1 [[GetOwnProperty]] ( P )

  ...
  3. If Type(P) is String, then
    a. Let numericIndex be ! CanonicalNumericIndexString(P).
    b. If numericIndex is not undefined, then
      ...
      iii. Return a PropertyDescriptor{[[Value]]: value, [[Writable]]: true,
      [[Enumerable]]: true, [[Configurable]]: true}.
  ...
includes: [testBigIntTypedArray.js]
features: [align-detached-buffer-semantics-with-web-reality, BigInt, TypedArray]
---*/
{
  
  const sample = new BigInt64Array([42n, 43n]);
  const descriptor0 = Object.getOwnPropertyDescriptor(sample, "0");
  const descriptor1 = Object.getOwnPropertyDescriptor(sample, "1");

  print(descriptor0.value, 42n);
  print(descriptor0.configurable, true);
  print(descriptor0.enumerable, true);
  print(descriptor0.writable, true);

  print(descriptor1.value, 42n);
  print(descriptor1.configurable, true);
  print(descriptor1.enumerable, true);
  print(descriptor1.writable, true);
}
