(
  (
    () => {
      const global_Function = this.Function;
      const global_Function_prototype = this.Function.prototype;
      const global_String = this.String;
      const global_eval = this.eval;
      const global_Reflect_defineProperty = this.Reflect.defineProperty;
      const global_Reflect_apply = this.Reflect.apply;
      const global_Reflect_construct = this.Reflect.construct;
      const global_Array_prototype_join = this.Array.prototype.join;
      const global_Array_prototype_map = this.Array.prototype.map;
      const global_Array_prototype_slice = this.Array.prototype.slice;
      this.eval = (value) => (
        typeof value === "string" ?
        global_eval(
          $262.instrument(value, "eval", null, "indirect-eval-call")) :
        code);
      global_Reflect_defineProperty(
        this.eval,
        "name",
        {
          __proto__: null,
          value: "eval"});
      this.Function = function Function (...values) { return global_eval(
        $262.instrument(
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
          null,
          "dynamic-function")); };
      global_Reflect_defineProperty(
        this.Function,
        "length",
        {
          __proto__: null,
          value: 1});
      global_Reflect_defineProperty(
        this.Function,
        "prototype",
        {
          __proto__: null,
          value: global_Function_prototype,
          writable: false});
      return {
        __proto__: null,
        eval: (value, perform, serial) => perform(
          (
            typeof value === "string" ?
            $262.instrument(value, "eval", serial, "direct-eval-call") :
            value)) }; })
  ());
