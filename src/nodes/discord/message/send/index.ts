import type { TypedInputValue } from '$shared/types';
import type { Node, NodeAPI, NodeDef } from 'node-red';

export interface DiscordMessageSendNodeDef extends NodeDef {
    client: string;
    useInput: boolean;
    channel: TypedInputValue;
    reply: TypedInputValue;
    message: TypedInputValue;
}

export interface DiscordMessageSendNode extends Node<DiscordMessageSendNodeDef> {}

export default function (RED: NodeAPI) {
    function DiscordMessageSendNode(
        this: DiscordMessageSendNode,
        config: DiscordMessageSendNodeDef
    ) {
        RED.nodes.createNode(this, config);
    }

    RED.nodes.registerType(__NODE_NAME__, DiscordMessageSendNode);
}
