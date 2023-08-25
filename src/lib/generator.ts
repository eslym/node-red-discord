class S<T> implements Stream<T> {
    #value: Iterable<T>;
    constructor(value: Iterable<T>) {
        this.#value = value instanceof S ? value.#value : value;
    }

    filter(predicate: (val: T) => boolean): S<T> {
        return new S(filter(this.#value, predicate));
    }

    map<R>(mapper: (val: T) => R): S<R> {
        return new S(map(this.#value, mapper));
    }

    skip(count: number): S<T> {
        return new S(skip(this.#value, count));
    }

    take(count: number): S<T> {
        return new S(take(this.#value, count));
    }

    any(predicate: (val: T) => boolean): boolean {
        for (const val of this.#value) {
            if (predicate(val)) {
                return true;
            }
        }
        return false;
    }

    all(predicate: (val: T) => boolean): boolean {
        for (const val of this.#value) {
            if (!predicate(val)) {
                return false;
            }
        }
        return true;
    }

    [Symbol.iterator]() {
        return this.#value[Symbol.iterator]();
    }
}

export interface Stream<T> extends Iterable<T> {
    filter(predicate: (val: T) => boolean): S<T>;
    map<R>(mapper: (val: T) => R): S<R>;
    skip(count: number): S<T>;
    take(count: number): S<T>;
    any(predicate: (val: T) => boolean): boolean;
    all(predicate: (val: T) => boolean): boolean;
}

function* filter<T>(values: Iterable<T>, predicate: (val: T) => boolean) {
    for (const val of values) {
        if (predicate(val)) {
            yield val;
        }
    }
}

function* map<T, R>(values: Iterable<T>, mapper: (val: T) => R) {
    for (const val of values) {
        yield mapper(val);
    }
}

function* skip<T>(values: Iterable<T>, count: number) {
    let i = 0;
    for (const val of values) {
        if (i >= count) {
            yield val;
        }
        i++;
    }
}

function* take<T>(values: Iterable<T>, count: number) {
    let i = 0;
    for (const val of values) {
        if (i >= count) {
            return;
        }
        yield val;
        i++;
    }
}

export function stream<T>(values: Iterable<T>) {
    return new S(values);
}
