/* global Symbol, Type */

var supportsGetters = (function() {
  try {
    var a = {};
    Object.defineProperty(a, "t", {
      configurable: true,
      enumerable: false,
      get: function() {
        return true;
      },
      set: undefined
    });
    return !!a.t;
  } catch (e) {
    return false;
  }
})();
if (supportsGetters) {
  (function() {
    var getInferredName;
    try {
      // eslint-disable-next-line no-new-func
      getInferredName = Function("s", "var v = s.valueOf(); return { [v]() {} }[v].name;");
      // eslint-disable-next-line no-empty
    } catch (e) {}

    var inferred = function() {};
    var supportsInferredNames =
      getInferredName && inferred.name === "inferred" ? getInferredName : null;

    // The abstract operation thisSymbolValue(value) performs the following steps:
    function thisSymbolValue(value) {
      // 1. If Type(value) is Symbol, return value.
      if (Type(value) === "symbol") {
        return value;
      }
      // 2. If Type(value) is Object and value has a [[SymbolData]] internal slot, then
      // a. Let s be value.[[SymbolData]].
      // b. Assert: Type(s) is Symbol.
      // c. Return s.
      // 3. Throw a TypeError exception.
      throw TypeError(value + " is not a symbol");
    }

    // 19.4.3.2 get Symbol.prototype.description
    Object.defineProperty(Symbol.prototype, "description", {
      configurable: true,
      enumerable: false,
      get: function() {
        // 1. Let s be the this value.
        var s = this;
        // 2. Let sym be ? thisSymbolValue(s).
        var sym = thisSymbolValue(s);
        // 3. Return sym.[[Description]].
        if (supportsInferredNames) {
          var name = getInferredName(sym);
          if (name !== "") {
            return name.slice(1, -1); // name.slice('['.length, -']'.length);
          }
        }

        var string = sym.toString();

        if (emptySymbolLookup[string] !== undefined) {
          return emptySymbolLookup[string];
        }

        if (string.indexOf("__\x01symbol:") === 0) {
          var randomStartIndex = string.lastIndexOf("0.");
          string = string.slice(10, randomStartIndex);
        } else {
          string = string.slice(7, string.length - 1);
        }
        if (string === "") {
          return undefined
        }
        return string
      }
    });


    var emptySymbolLookup = {};
    var OrigSymbol = Symbol
    var NewSymbol = function Symbol() {
      var description = arguments[0];
      var sym = OrigSymbol(description);
      if (description !== undefined && (description === null || isNaN(description) || String(description) === "")) {
        emptySymbolLookup[sym.toString()] = String(description)
      }
      return sym
    }
    NewSymbol.prototype = Symbol.prototype
    Symbol = NewSymbol // eslint-disable-line no-native-reassign, no-global-assign
  })();
}
