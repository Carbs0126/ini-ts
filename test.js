var MyClass = /** @class */ (function () {
    function MyClass() {
    }
    MyClass.prototype.someMethod = function () { };
    return MyClass;
}());
var x = new MyClass();
// Cannot assign 'typeof MyClass' to MyClass? Huh?
//   x = MyClass;
console.log(typeof MyClass);
