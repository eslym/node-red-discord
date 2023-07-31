const subscriber_queue = [];

export function accessor(object, property) {
    const subscribers = new Set();
    let ready = false;

    function set(value) {
        if (
            object[property] !== value ||
            typeof value === 'object' ||
            typeof value === 'function'
        ) {
            object[property] = value;
            if (ready) {
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }

    function update(fn) {
        set(fn(object[property]));
    }

    function subscribe(run, invalidate = () => {}) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            ready = true;
        }
        run(object[property]);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                ready = false;
            }
        };
    }
    return { set, update, subscribe };
}
