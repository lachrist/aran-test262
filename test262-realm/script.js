print("foo");
print("Test262:AsyncTestComplete");
print("Test262:AsyncTestFailure: yo");
const x = "foo";
$262.evalScript(`print(x);`, "evalScript()");
this.y = "bar";
this.eval($262.instrument(`print("global-eval >> " + x + y);`, null, "global.eval()"));
{
  const y = "qux";
  eval($262.instrument(`print("local-eval >> " + x + y);`, 123, "eval()"));
}
const realm = $262.createRealm();
realm.evalScript(`print("yolo")`, "realm.evalScript()");
import("./module.mjs");
"foobar";
