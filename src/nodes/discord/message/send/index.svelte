<script lang="ts" context="module">
    import type {
        BuilderTypedInputValue,
        MessageBuilderConfig,
        TypedInputValue
    } from '$shared/types';
    import { createRegister } from '$editor/lib/utils';
    import { Input, TypedInput, type TypeDefinition } from '@eslym/rs4r/components';
    import type { EditorNodeInstance } from 'node-red';

    export const register = createRegister(__NODE_NAME__, {
        category: 'discord message',
        paletteLabel: 'Send',
        defaults: {
            name: {
                value: ''
            },
            client: {
                value: '',
                type: 'discord.client',
                validate(this: EditorNodeInstance<DiscordMessageSendNodeDef>, value) {
                    if (this.useInput) return true;
                    return Boolean(value);
                }
            },
            useInput: {
                value: true
            },
            channel: {
                value: {
                    value: 'payload.channelId',
                    type: 'msg'
                },
                types: ['str', 'msg', 'flow', 'global', 'env'],
                validate: TypedInput.validator('channel')
            } as { value: TypedInputValue },
            reply: {
                value: {
                    type: 'undefined',
                    value: ''
                },
                types: ['undefined', 'msg'],
                validate: TypedInput.validator('reply')
            } as { value: TypedInputValue },
            message: {
                value: {
                    value: 'payload.content',
                    type: 'msg'
                },
                types: {
                    msg: true,
                    flow: true,
                    global: true,
                    env: true,
                    builder: {
                        label: 'builder',
                        hasValue: false
                    } satisfies TypeDefinition
                }
            } as { value: BuilderTypedInputValue<MessageBuilderConfig> }
        },
        inputs: 1,
        outputs: 2,
        outputLabels: ['Sent', 'Error']
    });
</script>

<script lang="ts">
    import MessageBuilder from '$editor/components/builder/MessageBuilder.svelte';
    import type { DiscordMessageSendNodeDef } from '.';
    import { writable } from 'svelte/store';
    import { setContext } from 'svelte';
    import { clientNodeContextKey } from '$editor/lib/constants';

    export let node: EditorNodeInstance<DiscordMessageSendNodeDef>;

    const clientNodeStore = writable(node.client);

    setContext(clientNodeContextKey, clientNodeStore);

    $: clientConfigClass = {
        'input-error': !node.useInput && !node.client
    };

    $: if (node.useInput) {
        node.client = '';
    }

    $: clientNodeStore.set(node.client);

    function messageTypeChanged(ev: CustomEvent<{ new: string }>) {
        if (ev.detail.new !== 'builder') {
            delete (node.message as any).config;
        }
    }
</script>

<div class="rs4r-container">
    <Input prop="name" label="Name" />
    <div class="form-row rs4r-client-use-input">
        <Input
            prop="client"
            label="Client"
            disabled={node.useInput}
            novalidate
            class={clientConfigClass}
        />
        <label
            ><input type="checkbox" bind:checked={node.useInput} /> Use same client as input</label
        >
    </div>
    <TypedInput prop="channel" label="Channel" />
    <TypedInput prop="reply" label="Reply To" />
    <TypedInput prop="message" label="Message" on:typechange={messageTypeChanged} />
    {#if node.message.type === 'builder'}
        <MessageBuilder bind:typedInput={node.message} />
    {/if}
</div>

<style lang="scss">
    .rs4r-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    .rs4r-client-use-input {
        :global(.form-row) {
            margin: 0;
        }

        label {
            display: block;
            width: auto;
            margin-left: 105px;

            input[type='checkbox'] {
                width: auto;
                margin: 0;
            }
        }
    }
</style>
