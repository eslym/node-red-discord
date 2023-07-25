function standardPromiseCallback(res, rej) {
    return (err, val) => {
        if (err) {
            rej(err);
        } else {
            res(val);
        }
    };
}

function asyncContext(context) {
    let get = (key, store) =>
        new Promise((res, rej) => {
            context.get(key, store, standardPromiseCallback(res, rej));
        });
    let set = (key, value, store) =>
        new Promise((res, rej) => {
            context.set(key, value, store, standardPromiseCallback(res, rej));
        });
    return { get, set };
}

module.exports = { asyncContext };
