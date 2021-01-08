((instrinsics) => {
  const global_Function = this.Function;
  const global_Function_prototype = this.Function.prototype;
  const global_String = this.String;
  const global_eval = this.eval;
  const global_Reflect_setPrototypeOf = this.Reflect.setPrototypeOf;
  const global_Reflect_defineProperty = this.Reflect.defineProperty;
  const global_Reflect_apply = this.Reflect.apply;
  const global_Reflect_construct = this.Reflect.construct;
  const global_Array_prototype_join = this.Array.prototype.join;
  const global_Array_prototype_map = this.Array.prototype.map;
  const global_Array_prototype_slice = this.Array.prototype.slice;
  this.eval = (value) => (
    typeof value === "string" ?
    global_eval(
      $262.instrument(value, null, "indirect-eval-call")) :
    value);
  instrinsics.eval = this.eval;
  global_Reflect_defineProperty(
    this.eval,
    "name",
    {
      __proto__: null,
      value: "eval"});
  const new_global_Function = function Function (...values) {
    const closure = global_eval(
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
        null,
        "function-call"));
    // https://www.ecma-international.org/ecma-262/11.0/index.html#sec-createdynamicfunction
    // https://www.ecma-international.org/ecma-262/11.0/index.html#sec-getprototypefromconstructor
    global_Reflect_setPrototypeOf(
      closure,
      (
        (
          new.target !== void 0 &&
          (
            (
              typeof new.target.prototype === "object" &&
              typeof new.target.prototype !== "null") ||
            typeof new.target.prototype === "function")) ?
        new.target.prototype :
         // this does not work of if new.target comes from a different realm
         // than the realm where this setup was evaluated :(
        global_Function_prototype));
    return closure; };
  this.Function = new_global_Function;
  instrinsics.Function = this.Function;
  global_Reflect_defineProperty(
    new_global_Function,
    "length",
    {
      __proto__: null,
      value: 1});
  global_Reflect_defineProperty(
    new_global_Function,
    "prototype",
    {
      __proto__: null,
      value: global_Function_prototype,
      writable: false});
  global_Reflect_defineProperty(
    global_Function_prototype,
    "constructor",
    {
      __proto__: null,
      value: new_global_Function,
      writable: true,
      enumerable: false,
      configurable: true});
  global_Reflect_setPrototypeOf(
    (async function foo() {}).constructor,
    new_global_Function);
  global_Reflect_setPrototypeOf(
    (async function * foo() {}).constructor,
    new_global_Function);
  global_Reflect_setPrototypeOf(
    (function * foo() {}).constructor,
    new_global_Function);
  return {
    __proto__: null,
    eval: (value, perform, serial) => perform(
      (
        typeof value === "string" ?
        $262.instrument(value, serial, "direct-eval-call") :
        value)) }; })
