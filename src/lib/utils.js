import * as $lib from 'discord.js';
import * as Flatted from 'flatted';

/**
 * @param {$lib.Client} client
 * @param {Record<string, any>} props
 */
export function craftDiscordContext(client, props = {}) {
    return Object.freeze({
        $lib: $lib,
        client: client,
        ...props
    });
}

/** @type {$lib.Client} */
export function craftReadyPayload(client) {
    return {
        readyAt: client.readyAt,
        application: Flatted.parse(Flatted.stringify(client.application)),
        user: Flatted.parse(Flatted.stringify(client.user))
    };
}
