import { Client, ClientEvents, Interaction } from 'discord.js';
import { EventEmitter } from 'events';
import { EditorRED } from 'node-red';

declare global {
    const RED: EditorRED;
}

export interface DiscordClientNode extends EventEmitter {
    getDiscordClient(): Client;
    onDiscord<K extends keyof ClientEvents>(event: K, listener: ClientEvents[K]): void;
    offDiscord(event: string, callback: (msg: any) => void): void;
}
