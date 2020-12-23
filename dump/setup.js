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
__aran__["aran.advice"] = (
  (
    () => {
      const instrument = $262.__instrument__;
      const evalScript = $262.evalScript;
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
      evalScript("const eval = this.eval");
      $262.evalScript = (code) => evalScript(instrument(code, "script", null, "eval-script"));
      this.eval = (value) => (
        typeof value === "string" ?
        global_eval(
          instrument(value, "eval", null, "indirect-eval-call")) :
        code);
      global_Reflect_defineProperty(
        this.eval,
        "name",
        {
          __proto__: null,
          value: "eval"});
      this.Function = function Function (...values) { return global_eval(
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
            instrument(value, "eval", serial, "direct-eval-call") :
            value)) }; })
  ());
