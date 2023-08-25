import * as $lib from 'discord.js';
import * as Flatted from 'flatted';
import type { Node, NodeStatus } from 'node-red';

export type DiscordContext<T extends Record<string, any>> = T & {
    $lib: typeof $lib;
    client: $lib.Client;
};

export type DiscordEventContext<T extends keyof $lib.ClientEvents = keyof $lib.ClientEvents> =
    DiscordContext<{
        event: T;
        args: $lib.ClientEvents[T];
    }>;

export type DiscordContextFunc<T extends DiscordContext<any>> = (
    prop: keyof T
) => T[keyof T] | (() => T[keyof T]);

export function craftDiscordContext<T extends Record<string, any> = any>(
    client: $lib.Client,
    props: T
): DiscordContextFunc<DiscordContext<T>> {
    const ctx = Object.freeze({
        ...props,
        $lib: $lib,
        client: client
    });
    return ((prop?: string) => {
        if (prop !== undefined) {
            return ctx[prop];
        }
        return ctx;
    }) as any;
}

export function defineReadonlyProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
    Object.defineProperty(obj, key, {
        value,
        writable: false
    });
}

const statusState = new WeakMap<
    Node,
    {
        original?: NodeStatus;
        timeout?: NodeJS.Timeout;
    }
>();

export interface HasTimeoutStatus {
    timeoutStatus(status: NodeStatus, ms: number): void;
}

export function hasTimeoutStatus(node: Node & HasTimeoutStatus) {
    if (statusState.has(node)) return;
    const originalStatus = node.status;
    node.status = function (this: Node & HasTimeoutStatus, status: NodeStatus) {
        if (!statusState.has(this)) {
            statusState.set(this, {});
        }
        const state = statusState.get(this)!;
        if (state.timeout) {
            clearTimeout(state.timeout);
        }
        state.original = status;
        originalStatus.call(this, status);
    };
    node.timeoutStatus = function (this: Node & HasTimeoutStatus, status: NodeStatus, ms: number) {
        if (!statusState.has(this)) {
            statusState.set(this, {});
        }
        const state = statusState.get(this)!;
        if (state.timeout) {
            clearTimeout(state.timeout);
        }
        state.timeout = setTimeout(() => {
            originalStatus.call(this, state.original ?? { fill: 'grey', shape: 'ring', text: '' });
        }, ms);
        originalStatus.call(this, status);
    };
    statusState.set(node, {});
}

export function flatted(value: any): any {
    return Flatted.parse(Flatted.stringify(value));
}
