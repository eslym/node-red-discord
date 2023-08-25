import { type ClientEvents, Events, Client } from 'discord.js';
import * as Flatted from 'flatted';
import { mapInteraction } from './interaction';

export function craftReadyPayload(client: Client) {
    return {
        readyAt: client.readyAt,
        application: Flatted.parse(Flatted.stringify(client.application)),
        user: Flatted.parse(Flatted.stringify(client.user))
    };
}

export function craftEventPayload<K extends keyof ClientEvents>(event: K, args: ClientEvents[K]) {
    switch (event) {
        case Events.ClientReady:
            return craftReadyPayload(args[0] as any);
        case Events.InteractionCreate:
            return mapInteraction(args[0] as any);
        default:
            if (args.length === 0) return undefined;
            if (args.length === 1) return Flatted.parse(Flatted.stringify(args[0]));
            return Flatted.parse(Flatted.stringify(args));
    }
}
