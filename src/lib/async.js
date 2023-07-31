function standardPromiseCallback(res, rej) {
    return (err, val) => {
        if (err) {
            rej(err);
        } else {
            res(val);
        }
    };
}

export function asyncContext(context) {
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

/**
 * @param {import('node-red').NodeAPI} RED
 * @param {import('node-red').Node} node
 * @param {import('node-red').NodeMessage} msg
 * @param {string} type
 * @param {string} dest
 * @param {any} val
 */
export async function setValue(RED, node, msg, type, dest, val) {
    switch (type) {
        case 'msg':
            let paths = RED.util.normalisePropertyExpression(dest).join('.');
            RED.util.setMessageProperty(msg, paths, val, true);
            return;
        case 'flow':
        case 'global':
            let context = asyncContext(node.context()[type]);
            let key = RED.util.parseContextStore(dest);
            await context.set(key.key, val, key.store);
            return;
        default:
            throw new Error('Invalid Destination');
    }
}