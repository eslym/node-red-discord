import { type Writable, readable, type Readable, get, derived, writable } from 'svelte/store';

type Notifier<T> = (val: T) => void;
type ConstructorValue<T> = T extends new (...args: any[]) => infer U ? U : never;

const noop: Notifier<any> = () => {};

const pass: <T>(v: T) => T = (v) => v;

const notifiers = new WeakMap<object, Notifier<any>>();

function createStoreAwaredClass<C extends new (...args: any[]) => any>(
    parent: C,
    functions: readonly (keyof ConstructorValue<C>)[]
): C {
    // pass the anonymous class through a function to keep the class name empty at the beginning
    const theClass = pass(class extends parent {});
    functions.forEach((fn) => {
        if (typeof parent.prototype[fn] !== 'function') return;
        theClass.prototype[fn] = function (...args: any[]) {
            const res = parent.prototype[fn].apply(this, args);
            if (notifiers.has(this)) notifiers.get(this)!(this);
            return res;
        };
    });
    Object.defineProperty(theClass, 'name', {
        value: `StoreAwared${parent.name}`,
        writable: false
    });
    return theClass as any;
}

const StoreAwaredMap = createStoreAwaredClass(Map, ['set', 'delete', 'clear'] as const);

/**
 * Creates a store that contains a Map which is aware of changes to its content.
 * Including calls to `set`, `delete` and `clear`.
 */
export function map<K, V>(iterable?: Iterable<[K, V]> | null): Readable<Map<K, V>> {
    const map = new StoreAwaredMap(iterable);
    return readable(map, (set) => {
        notifiers.set(map, set);
        return () => notifiers.delete(map);
    });
}

const StoreAwaredSet = createStoreAwaredClass(Set, ['add', 'delete', 'clear'] as const);

/**
 * Creates a store that contains a Set which is aware of changes to its content.
 * Including calls to `add`, `delete` and `clear`.
 */
export function set<T>(iterable?: Iterable<T> | null): Readable<Set<T>> {
    const set = new StoreAwaredSet<T>(iterable);
    return readable(set, (set) => {
        notifiers.set(set, set);
        return () => notifiers.delete(set);
    });
}

const StoreAwaredArray = createStoreAwaredClass<typeof Array<any>>(Array, [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'reverse',
    'sort',
    'copyWithin',
    'fill'
] as const);
type array = {
    <T>(length?: number): Writable<T[]>;
    <T>(...args: T[]): Writable<T[]>;
    (length?: number): Writable<any[]>;

    /**
     * Similar to `Array.from` but returns a store.
     * @see Array.from
     */
    from<T>(iterable: ArrayLike<T> | Iterable<T>): Writable<T[]>;

    /**
     * Similar to `Array.from` but returns a store.
     * @see Array.from
     */
    from<T, U>(iterable: ArrayLike<T> | Iterable<T>, mapfn: (v: T, k: number) => U): Writable<U[]>;

    /**
     * Similar to `Array.of` but returns a store.
     * @see Array.of
     */
    of<T>(...items: T[]): Writable<T[]>;
};

/**
 * Creates a store that contains an Array which is aware of changes to its content.
 * Including calls to `push`, `pop`, `shift`, `unshift`, `splice`, `reverse`, `sort`, `copyWithin` and `fill`.
 *
 * @example
 * <script>
 *     const arr = array.of(1, 2, 3);
 *     $: console.log($arr);
 * </script>
 *
 * <!-- this push will trigger the console.log -->
 * <button on:click={()=>$arr.push($arr.length)}>Push</button>
 */
export const array: array = function (...args: any[]): Writable<any[]> {
    let arr = new StoreAwaredArray(...args);
    const base = readable(arr, (set) => {
        notifiers.set(arr, set);
        return () => notifiers.delete(arr);
    });
    const set = (val: any[]) => {
        if (val === arr) {
            notifiers.get(arr)?.(arr);
            return;
        }
        const notify = notifiers.get(arr);
        notifiers.delete(arr);
        arr = new StoreAwaredArray();
        arr.push(...val);
        if (notify) {
            notifiers.set(arr, notify);
            notify(arr);
        }
    };
    const update = (fn: (val: any[]) => any[]) => set(fn(arr));
    return {
        subscribe: base.subscribe,
        set,
        update
    };
};

array.from = (iterable: Iterable<any>, mapfn?: (arg: any, index: any) => any, thisArg?: any) => {
    const store = array();
    const arr = get(store);
    arr.push(...Array.from(iterable, mapfn as any, thisArg));
    return store;
};

array.of = (...items: any[]) => {
    const store = array<any>();
    const arr = get(store);
    arr.push(...items);
    return store;
};

export function json<T>(store: Writable<string>): Writable<T>;
export function json<T>(store: Writable<string | null>, fallback: T): Writable<T>;

/**
 * Creates a store that contains the parsed JSON of the given store.
 */
export function json<T>(store: Writable<string | null | undefined>, fallback?: T): Writable<T> {
    const base = derived(store, (val) => {
        if (val === null || val === undefined) return fallback;
        return JSON.parse(val);
    });
    const set = (val: T) => store.set(JSON.stringify(val));
    const update = (fn: (val: T) => T) => set(fn(get(base)));
    return {
        subscribe: base.subscribe,
        set,
        update
    };
}

/**
 * define the local storage store, this is done in a function to prevent the `localStorage` from being used in SSR.
 */
function defineLocal(): (key: string) => Writable<string | null> {
    if (typeof window === 'undefined')
        return function local() {
            return writable(null);
        };

    const localStorageStores = new Map<
        string,
        [Writable<string | null>, Notifier<string | null>]
    >();

    const parent = Object.getPrototypeOf(localStorage) as Storage;
    const newProto = Object.create(parent) as Storage;

    Object.setPrototypeOf(localStorage, newProto);

    newProto.setItem = function (this: Storage, key: string, value: string) {
        parent.setItem.call(this, key, value);
        if (this === localStorage && localStorageStores.has(key))
            localStorageStores.get(key)![1](value);
    };

    newProto.removeItem = function (this: Storage, key: string) {
        parent.removeItem.call(this, key);
        if (this === localStorage && localStorageStores.has(key))
            localStorageStores.get(key)![1](null);
    };

    newProto.clear = function (this: Storage) {
        parent.clear.call(this);
        if (this === localStorage)
            for (const [_, notify] of localStorageStores.values()) notify(null);
    };

    window.addEventListener('storage', (e) => {
        if (e.storageArea && e.storageArea !== localStorage) return;
        if (e.key) {
            if (localStorageStores.has(e.key)) localStorageStores.get(e.key!)![1](e.newValue);
        } else for (const [_, notify] of localStorageStores.values()) notify(null);
    });

    return function local(key: string): Writable<string | null> {
        if (localStorageStores.has(key)) return localStorageStores.get(key)![0];
        let ctx: [Writable<string | null>, Notifier<string | null>] = [null as any, noop];
        const base = readable<string | null>(null, (set) => {
            ctx[1] = set;
            set(localStorage.getItem(key));
            return () => (ctx[1] = noop);
        });
        const set = (val: string | null) => {
            if (val === null) parent.removeItem.call(localStorage, key);
            else parent.setItem.call(localStorage, key, val);
            ctx[1](val);
        };
        const update = (fn: (val: string | null) => string | null) =>
            set(fn(localStorage.getItem(key)));
        ctx[0] = {
            subscribe: base.subscribe,
            set,
            update
        };
        localStorageStores.set(key, ctx);
        return ctx[0];
    };
}

/**
 * Create a store that contains the value of the local storage and is aware of changes to its content.
 * Including calls to `localStorage.setItem`, `localStorage.removeItem` and `localStorage.clear`.
 *
 * It is fine to be called in SSR, it will return a store that contains `null`.
 */
export const local = defineLocal();
