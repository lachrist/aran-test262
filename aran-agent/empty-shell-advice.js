(
  (
    () => {
      const instrument = $262.__instrument__;
      const global_Function = Function;
      const global_String = String;
      const global_eval = eval;
      const global_Reflect_apply = Reflect.apply;
      const global_Reflect_construct = Reflect.construct;
      const global_Array_prototype_join = Array.prototype.join;
      const global_Array_prototype_map = Array.prototype.map;
      const global_Array_prototype_slice = Array.prototype.slice;
      const advice = {__proto__:null};
      __aran__["aran.advice"] = advice;
      advice.code = (code, serial) => (
        typeof code === "string" ?
        instrument(code, "eval", serial) :
        code);
      advice.apply = (value1, value2, values) => (
        value1 === global_Function ?
        advice.construct(value1, values) :
        (
          (
            value1 === global_eval &&
            values.length > 0 &&
            typeof values[0] === "string") ?
          global_eval(
            instrument(values[0], "script", null)) :
          global_Reflect_apply(value1, value2, values))),
      advice.construct = (value, values) => (
        value === global_Function ?
        global_eval(
          instrument(
            (
              values.length === 0 ?
              `(function anonymous(${"\n"}) {${"\n\n"}});` :
              (
                values.length === 1 ?
                `(function anonymous(${"\n"}) {${"\n"}${global_String(values[0])}${"\n"}});` :
                `(function anonymous(${global_Reflect_apply(
                  global_Array_prototype_join,
                  global_Reflect_apply(
                    global_Array_prototype_map,
                    global_Reflect_apply(
                      global_Array_prototype_slice,
                      values,
                      [0, values.length - 1]),
                    [global_String]),
                  [","])}${"\n"}) {${global_String(values[values.length - 1])}${"\n"}});`)),
            "script",
            null)) :
        global_Reflect_construct(value, values));
      return advice; })
  ());
