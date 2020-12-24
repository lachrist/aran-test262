this["__aran__"] = ({
  __proto__: null,
  ["aran.globalObjectRecord"]: ((new Function("return this;"))()),
["aran.globalDeclarativeRecord"]: {__proto__:null},
["aran.advice"]: {__proto__:null},
["aran.deadzoneMarker"]: {__proto__:null},
["Object"]: Object,
["Reflect.defineProperty"]: Reflect["defineProperty"],
["eval"]: eval,
["Symbol.unscopables"]: Symbol["unscopables"],
["Symbol.iterator"]: Symbol["iterator"],
["Function.prototype.arguments@get"]: Reflect.getOwnPropertyDescriptor(Function["prototype"], "arguments").get,
["Function.prototype.arguments@set"]: Reflect.getOwnPropertyDescriptor(Function["prototype"], "arguments").set,
["Array.prototype.values"]: Array["prototype"]["values"],
["Object.prototype"]: Object["prototype"],
["Array.from"]: Array["from"],
["Object.create"]: Object["create"],
["Array.of"]: Array["of"],
["Array"]: Array,
["Proxy"]: Proxy,
["RegExp"]: RegExp,
["TypeError"]: TypeError,
["ReferenceError"]: ReferenceError,
["SyntaxError"]: SyntaxError,
["Reflect.get"]: Reflect["get"],
["Reflect.has"]: Reflect["has"],
["Reflect.construct"]: Reflect["construct"],
["Reflect.apply"]: Reflect["apply"],
["Reflect.getPrototypeOf"]: Reflect["getPrototypeOf"],
["Reflect.ownKeys"]: Reflect["ownKeys"],
["Reflect.isExtensible"]: Reflect["isExtensible"],
["Object.keys"]: Object["keys"],
["Array.prototype.concat"]: Array["prototype"]["concat"],
["Array.prototype.includes"]: Array["prototype"]["includes"],
["Array.prototype.slice"]: Array["prototype"]["slice"],
["Reflect.set"]: Reflect["set"],
["Reflect.deleteProperty"]: Reflect["deleteProperty"],
["Reflect.setPrototypeOf"]: Reflect["setPrototypeOf"],
["Reflect.getOwnPropertyDescriptor"]: Reflect["getOwnPropertyDescriptor"],
["Reflect.preventExtensions"]: Reflect["preventExtensions"],
["Object.assign"]: Object["assign"],
["Object.freeze"]: Object["freeze"],
["Object.defineProperty"]: Object["defineProperty"],
["Object.setPrototypeOf"]: Object["setPrototypeOf"],
["Object.preventExtensions"]: Object["preventExtensions"],
["Array.prototype.fill"]: Array["prototype"]["fill"],
["Array.prototype.push"]: Array["prototype"]["push"]});
__aran__["aran.advice"] = ({
  __proto__: null,
  eval: (value, perform, serial) => perform(
    (
      typeof code === "string" ?
      $262.__instrument__(code, "eval", serial, "direct-eval-call") :
      code))});


"use strict"; ((() =>
  { const INTRINSIC = __aran__; let input, $$this, $_ClosurePrototype_8_1, $_RightHandSide_8_1, CALLEE_0; input = {__proto__:null};
    (
      (
        (null, INTRINSIC["Reflect.has"]) (
        (INTRINSIC["aran.globalObjectRecord"]),
        "f")) ?
      (void 0) :
      (
        (null, INTRINSIC["Reflect.defineProperty"]) (
        (INTRINSIC["aran.globalObjectRecord"]),
        "f",
        ({__proto__:
          null,[
          "value"]:
          (void 0),[
          "writable"]:
          true,[
          "enumerable"]:
          true,[
          "configurable"]:
          true}))));
    ($$this =
      (INTRINSIC["aran.globalObjectRecord"]));
    (
      (
        ($_ClosurePrototype_8_1 =
          ({__proto__:
            (INTRINSIC["Object.prototype"])})),
        ($_RightHandSide_8_1 =
          (
            (null, INTRINSIC["Reflect.get"]) (
            (
              (null, INTRINSIC["Object.defineProperty"]) (
              $_ClosurePrototype_8_1,
              "constructor",
              ({__proto__:
                null,[
                "value"]:
                (
                  (null, INTRINSIC["Object.defineProperty"]) (
                  (
                    (null, INTRINSIC["Object.defineProperty"]) (
                    (
                      (null, INTRINSIC["Object.defineProperty"]) (
                      (
                        (null, INTRINSIC["Object.defineProperty"]) (
                        (
                          (null, INTRINSIC["Object.defineProperty"]) (
                          (CALLEE_0 = function (...ARGUMENTS)
                            { let input, $$f, $$arguments, $$this, $$0newtarget, $$x, $_ClosureArgumentMappedMarker_11_1, CALLEE_1, CALLEE_2, CALLEE_3; input = {__proto__:null, callee:CALLEE_0, arguments:ARGUMENTS, this:this, "new.target":new.target};
                              ($$f =
                                (void 0));
                              ($$arguments =
                                (void 0));
                              ($$0newtarget =
                                (
                                  (null, INTRINSIC["Reflect.get"]) (
                                  input,
                                  "new.target")));
                              ($$this =
                                (
                                  (
                                    (null, INTRINSIC["Reflect.get"]) (
                                    input,
                                    "new.target")) ?
                                  ({__proto__:
                                    (
                                      (null, INTRINSIC["Reflect.get"]) (
                                      (
                                        (null, INTRINSIC["Reflect.get"]) (
                                        input,
                                        "new.target")),
                                      "prototype"))}) :
                                  (
                                    (
                                      (
                                        (
                                          (null, INTRINSIC["Reflect.get"]) (
                                          input,
                                          "this")) ===
                                        null) ?
                                      true :
                                      (
                                        (
                                          (null, INTRINSIC["Reflect.get"]) (
                                          input,
                                          "this")) ===
                                        (void 0))) ?
                                    (INTRINSIC["aran.globalObjectRecord"]) :
                                    (
                                      (null, INTRINSIC["Object"]) (
                                      (
                                        (null, INTRINSIC["Reflect.get"]) (
                                        input,
                                        "this")))))));
                              ($$f =
                                (
                                  (null, INTRINSIC["Reflect.get"]) (
                                  input,
                                  "callee")));
                              ($$arguments =
                                (
                                  (null, INTRINSIC["Object.assign"]) (
                                  (
                                    (null, INTRINSIC["Object.defineProperty"]) (
                                    (
                                      (null, INTRINSIC["Object.defineProperty"]) (
                                      (
                                        (null, INTRINSIC["Object.defineProperty"]) (
                                        ({__proto__:
                                          (INTRINSIC["Object.prototype"])}),
                                        "length",
                                        ({__proto__:
                                          null,[
                                          "value"]:
                                          (
                                            (null, INTRINSIC["Reflect.get"]) (
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              input,
                                              "arguments")),
                                            "length")),[
                                          "writable"]:
                                          true,[
                                          "enumerable"]:
                                          false,[
                                          "configurable"]:
                                          true}))),
                                      "callee",
                                      ({__proto__:
                                        null,[
                                        "value"]:
                                        (
                                          (null, INTRINSIC["Reflect.get"]) (
                                          input,
                                          "callee")),[
                                        "writable"]:
                                        true,[
                                        "enumerable"]:
                                        false,[
                                        "configurable"]:
                                        true}))),
                                    (INTRINSIC["Symbol.iterator"]),
                                    ({__proto__:
                                      null,[
                                      "value"]:
                                      (INTRINSIC["Array.prototype.values"]),[
                                      "writable"]:
                                      true,[
                                      "enumerable"]:
                                      false,[
                                      "configurable"]:
                                      true}))),
                                  (
                                    (null, INTRINSIC["Reflect.get"]) (
                                    input,
                                    "arguments")))));
                              ($$x =
                                (
                                  (null, INTRINSIC["Reflect.get"]) (
                                  (
                                    (null, INTRINSIC["Reflect.get"]) (
                                    input,
                                    "arguments")),
                                  0)));
                              ($$arguments =
                                (
                                  ($_ClosureArgumentMappedMarker_11_1 =
                                    ({__proto__:
                                      null})),
                                  (new
                                    (INTRINSIC["Proxy"]) (
                                    (INTRINSIC["Reflect.apply"](
                                      (INTRINSIC["Array.prototype.fill"]),
                                      $$arguments, [
                                      $_ClosureArgumentMappedMarker_11_1,
                                      0,
                                      (
                                        (null, INTRINSIC["Reflect.get"]) (
                                        (
                                          (null, INTRINSIC["Reflect.get"]) (
                                          input,
                                          "arguments")),
                                        "length"))])),
                                    ({__proto__:
                                      null,[
                                      "defineProperty"]:
                                      (CALLEE_1 = (...ARGUMENTS) =>
                                        { let input, $_target_14_1, $_key_14_1, $_descriptor_14_1; input = {__proto__:null, callee:CALLEE_1, arguments:ARGUMENTS};
                                          ($_target_14_1 =
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              (
                                                (null, INTRINSIC["Reflect.get"]) (
                                                input,
                                                "arguments")),
                                              0)));
                                          ($_key_14_1 =
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              (
                                                (null, INTRINSIC["Reflect.get"]) (
                                                input,
                                                "arguments")),
                                              1)));
                                          ($_descriptor_14_1 =
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              (
                                                (null, INTRINSIC["Reflect.get"]) (
                                                input,
                                                "arguments")),
                                              2)));
                                          return (
                                            (
                                              (
                                                (
                                                  (
                                                    (null, INTRINSIC["Reflect.get"]) (
                                                    (
                                                      (null, INTRINSIC["Reflect.getOwnPropertyDescriptor"]) (
                                                      $_target_14_1,
                                                      $_key_14_1)),
                                                    "value")) ===
                                                  $_ClosureArgumentMappedMarker_11_1) ?
                                                (
                                                  (
                                                    (null, INTRINSIC["Reflect.getOwnPropertyDescriptor"]) (
                                                    $_descriptor_14_1,
                                                    "value")) ?
                                                  (
                                                    (
                                                      (null, INTRINSIC["Reflect.get"]) (
                                                      $_descriptor_14_1,
                                                      "writable")) ?
                                                    (
                                                      (null, INTRINSIC["Reflect.get"]) (
                                                      $_descriptor_14_1,
                                                      "configurable")) :
                                                    false) :
                                                  false) :
                                                false) ?
                                              (
                                                (
                                                  (
                                                    $_key_14_1 ===
                                                    "0") ?
                                                  ($$x =
                                                    (
                                                      (null, INTRINSIC["Reflect.get"]) (
                                                      $_descriptor_14_1,
                                                      "value"))) :
                                                  ((() => { throw (
                                                    "This should never happen, please contact the dev"); }) ())),
                                                true) :
                                              (
                                                (null, INTRINSIC["Reflect.defineProperty"]) (
                                                $_target_14_1,
                                                $_key_14_1,
                                                $_descriptor_14_1)))); }),[
                                      "getOwnPropertyDescriptor"]:
                                      (CALLEE_2 = (...ARGUMENTS) =>
                                        { let input, $_target_14_1, $_key_14_1, $_descriptor_14_1; input = {__proto__:null, callee:CALLEE_2, arguments:ARGUMENTS};
                                          ($_target_14_1 =
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              (
                                                (null, INTRINSIC["Reflect.get"]) (
                                                input,
                                                "arguments")),
                                              0)));
                                          ($_key_14_1 =
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              (
                                                (null, INTRINSIC["Reflect.get"]) (
                                                input,
                                                "arguments")),
                                              1)));
                                          ($_descriptor_14_1 =
                                            (
                                              (null, INTRINSIC["Reflect.getOwnPropertyDescriptor"]) (
                                              $_target_14_1,
                                              $_key_14_1)));
                                          (
                                            (
                                              (
                                                (null, INTRINSIC["Reflect.getOwnPropertyDescriptor"]) (
                                                $_descriptor_14_1,
                                                "value")) ?
                                              (
                                                (
                                                  (null, INTRINSIC["Reflect.get"]) (
                                                  $_descriptor_14_1,
                                                  "value")) ===
                                                $_ClosureArgumentMappedMarker_11_1) :
                                              false) ?
                                            (
                                              (null, INTRINSIC["Reflect.set"]) (
                                              $_descriptor_14_1,
                                              "value",
                                              (
                                                (
                                                  $_key_14_1 ===
                                                  "0") ?
                                                $$x :
                                                ((() => { throw (
                                                  "This should never happen, please contact the dev"); }) ())))) :
                                            (void 0));
                                          return (
                                            $_descriptor_14_1); }),[
                                      "get"]:
                                      (CALLEE_3 = (...ARGUMENTS) =>
                                        { let input, $_target_14_1, $_key_14_1, $_receiver_14_1, $_value_14_1; input = {__proto__:null, callee:CALLEE_3, arguments:ARGUMENTS};
                                          ($_target_14_1 =
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              (
                                                (null, INTRINSIC["Reflect.get"]) (
                                                input,
                                                "arguments")),
                                              0)));
                                          ($_key_14_1 =
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              (
                                                (null, INTRINSIC["Reflect.get"]) (
                                                input,
                                                "arguments")),
                                              1)));
                                          ($_receiver_14_1 =
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              (
                                                (null, INTRINSIC["Reflect.get"]) (
                                                input,
                                                "arguments")),
                                              2)));
                                          ($_value_14_1 =
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              $_target_14_1,
                                              $_key_14_1,
                                              $_receiver_14_1)));
                                          return (
                                            (
                                              (
                                                $_value_14_1 ===
                                                $_ClosureArgumentMappedMarker_11_1) ?
                                              (
                                                (
                                                  $_key_14_1 ===
                                                  "0") ?
                                                $$x :
                                                ((() => { throw (
                                                  "This should never happen, please contact the dev"); }) ())) :
                                              $_value_14_1)); })})))));
                              /* lone */
                                { let input, $_ExpressionMemberObject_12_1, $_ExpressionMemberObject_12_2; input = {__proto__:null};
                                  (
                                    ($_ExpressionMemberObject_12_1 =
                                      (
                                        (
                                          (null, INTRINSIC["Reflect.has"]) (
                                          (INTRINSIC["aran.globalDeclarativeRecord"]),
                                          "console")) ?
                                        (
                                          (
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              (INTRINSIC["aran.globalDeclarativeRecord"]),
                                              "console")) ===
                                            (INTRINSIC["aran.deadzoneMarker"])) ?
                                          ((() => { throw (
                                            (new
                                              (INTRINSIC["ReferenceError"]) (
                                              "Cannot read from non-initialized dynamic variable named console"))); }) ()) :
                                          (
                                            (null, INTRINSIC["Reflect.get"]) (
                                            (INTRINSIC["aran.globalDeclarativeRecord"]),
                                            "console"))) :
                                        (
                                          (
                                            (null, INTRINSIC["Reflect.has"]) (
                                            (INTRINSIC["aran.globalObjectRecord"]),
                                            "console")) ?
                                          (
                                            (null, INTRINSIC["Reflect.get"]) (
                                            (INTRINSIC["aran.globalObjectRecord"]),
                                            "console")) :
                                          ((() => { throw (
                                            (new
                                              (INTRINSIC["ReferenceError"]) (
                                              "Cannot read from missing variable console"))); }) ())))),
                                    (INTRINSIC["Reflect.apply"](
                                      (
                                        (null, INTRINSIC["Reflect.get"]) (
                                        (
                                          (
                                            (
                                              $_ExpressionMemberObject_12_1 ===
                                              null) ?
                                            true :
                                            (
                                              $_ExpressionMemberObject_12_1 ===
                                              (void 0))) ?
                                          $_ExpressionMemberObject_12_1 :
                                          (
                                            (null, INTRINSIC["Object"]) (
                                            $_ExpressionMemberObject_12_1))),
                                        "log")),
                                      $_ExpressionMemberObject_12_1, [
                                      $$arguments])));
                                  (
                                    ($_ExpressionMemberObject_12_2 =
                                      (
                                        (
                                          (null, INTRINSIC["Reflect.has"]) (
                                          (INTRINSIC["aran.globalDeclarativeRecord"]),
                                          "console")) ?
                                        (
                                          (
                                            (
                                              (null, INTRINSIC["Reflect.get"]) (
                                              (INTRINSIC["aran.globalDeclarativeRecord"]),
                                              "console")) ===
                                            (INTRINSIC["aran.deadzoneMarker"])) ?
                                          ((() => { throw (
                                            (new
                                              (INTRINSIC["ReferenceError"]) (
                                              "Cannot read from non-initialized dynamic variable named console"))); }) ()) :
                                          (
                                            (null, INTRINSIC["Reflect.get"]) (
                                            (INTRINSIC["aran.globalDeclarativeRecord"]),
                                            "console"))) :
                                        (
                                          (
                                            (null, INTRINSIC["Reflect.has"]) (
                                            (INTRINSIC["aran.globalObjectRecord"]),
                                            "console")) ?
                                          (
                                            (null, INTRINSIC["Reflect.get"]) (
                                            (INTRINSIC["aran.globalObjectRecord"]),
                                            "console")) :
                                          ((() => { throw (
                                            (new
                                              (INTRINSIC["ReferenceError"]) (
                                              "Cannot read from missing variable console"))); }) ())))),
                                    (INTRINSIC["Reflect.apply"](
                                      (
                                        (null, INTRINSIC["Reflect.get"]) (
                                        (
                                          (
                                            (
                                              $_ExpressionMemberObject_12_2 ===
                                              null) ?
                                            true :
                                            (
                                              $_ExpressionMemberObject_12_2 ===
                                              (void 0))) ?
                                          $_ExpressionMemberObject_12_2 :
                                          (
                                            (null, INTRINSIC["Object"]) (
                                            $_ExpressionMemberObject_12_2))),
                                        "log")),
                                      $_ExpressionMemberObject_12_2, [
                                      $$x]))); }
                              return (
                                (
                                  $$0newtarget ?
                                  $$this :
                                  (void 0))); }),
                          "length",
                          ({__proto__:
                            null,[
                            "value"]:
                            1,[
                            "writable"]:
                            false,[
                            "enumerable"]:
                            false,[
                            "configurable"]:
                            true}))),
                        "name",
                        ({__proto__:
                          null,[
                          "value"]:
                          "f",[
                          "writable"]:
                          false,[
                          "enumerable"]:
                          false,[
                          "configurable"]:
                          true}))),
                      "arguments",
                      ({__proto__:
                        null,[
                        "value"]:
                        null,[
                        "writable"]:
                        false,[
                        "enumerable"]:
                        false,[
                        "configurable"]:
                        false}))),
                    "caller",
                    ({__proto__:
                      null,[
                      "value"]:
                      null,[
                      "writable"]:
                      false,[
                      "enumerable"]:
                      false,[
                      "configurable"]:
                      false}))),
                  "prototype",
                  ({__proto__:
                    null,[
                    "value"]:
                    $_ClosurePrototype_8_1,[
                    "writable"]:
                    true,[
                    "enumerable"]:
                    false,[
                    "configurable"]:
                    false}))),[
                "writable"]:
                true,[
                "enumerable"]:
                false,[
                "configurable"]:
                true}))),
            "constructor")))),
      (
        (
          (null, INTRINSIC["Reflect.has"]) (
          (INTRINSIC["aran.globalDeclarativeRecord"]),
          "f")) ?
        (
          (
            (
              (null, INTRINSIC["Reflect.get"]) (
              (INTRINSIC["aran.globalDeclarativeRecord"]),
              "f")) ===
            (INTRINSIC["aran.deadzoneMarker"])) ?
          ((() => { throw (
            (new
              (INTRINSIC["ReferenceError"]) (
              "Cannot write to non-initialized dynamic variable named f"))); }) ()) :
          (
            (
              (null, INTRINSIC["Reflect.set"]) (
              (INTRINSIC["aran.globalDeclarativeRecord"]),
              "f",
              $_RightHandSide_8_1)) ?
            true :
            ((() => { throw (
              (new
                (INTRINSIC["TypeError"]) (
                "Cannot set object property"))); }) ()))) :
        (
          (
            (null, INTRINSIC["Reflect.has"]) (
            (INTRINSIC["aran.globalObjectRecord"]),
            "f")) ?
          (
            (null, INTRINSIC["Reflect.set"]) (
            (INTRINSIC["aran.globalObjectRecord"]),
            "f",
            $_RightHandSide_8_1)) :
          (
            (null, INTRINSIC["Reflect.defineProperty"]) (
            (INTRINSIC["aran.globalObjectRecord"]),
            "f",
            ({__proto__:
              null,[
              "value"]:
              $_RightHandSide_8_1,[
              "writable"]:
              true,[
              "enumerable"]:
              true,[
              "configurable"]:
              true}))))));
    return (
      (
        (
          (
            (null, INTRINSIC["Reflect.has"]) (
            (INTRINSIC["aran.globalDeclarativeRecord"]),
            "f")) ?
          (
            (
              (
                (null, INTRINSIC["Reflect.get"]) (
                (INTRINSIC["aran.globalDeclarativeRecord"]),
                "f")) ===
              (INTRINSIC["aran.deadzoneMarker"])) ?
            ((() => { throw (
              (new
                (INTRINSIC["ReferenceError"]) (
                "Cannot read from non-initialized dynamic variable named f"))); }) ()) :
            (
              (null, INTRINSIC["Reflect.get"]) (
              (INTRINSIC["aran.globalDeclarativeRecord"]),
              "f"))) :
          (
            (
              (null, INTRINSIC["Reflect.has"]) (
              (INTRINSIC["aran.globalObjectRecord"]),
              "f")) ?
            (
              (null, INTRINSIC["Reflect.get"]) (
              (INTRINSIC["aran.globalObjectRecord"]),
              "f")) :
            ((() => { throw (
              (new
                (INTRINSIC["ReferenceError"]) (
                "Cannot read from missing variable f"))); }) ()))) (
        1))); }) ());
