export function mergeClass(...args) {
    return args
        .map((arg) => {
            if (typeof arg === 'string') return arg;
            if (typeof arg === 'object')
                return Object.keys(arg)
                    .filter((key) => arg[key])
                    .join(' ');
            return undefined;
        })
        .filter(Boolean)
        .join(' ');
}
