function create<T>(ctor: { new (): T }) {
    return new ctor();
}

class MyClass {}

var c = create(MyClass); // c: MyClass

function isReallyInstanceOf<T>(ctor: { new (...args: any[]): T }, obj: T) {
    return obj instanceof ctor;
}
