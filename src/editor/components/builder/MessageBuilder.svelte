<script context="module" lang="ts">
    const valueKey = Symbol('value');
</script>

<script lang="ts">
    import type { BuilderTypedInputValue, MessageBuilderConfig } from '$shared/types';
    import { TypedInput } from '@eslym/rs4r/components';
    import Tabs from '../Tabs.svelte';
    import Textarea from '../Textarea.svelte';

    export let typedInput: BuilderTypedInputValue<MessageBuilderConfig> & {
        [valueKey]?: MessageBuilderConfig;
    };

    let activeTab = 'Content';

    $: if (!typedInput[valueKey]) {
        typedInput[valueKey] = typedInput.config ?? {
            embeds: { type: 'undefined', value: '' },
            components: { type: 'undefined', value: '' },
            attachments: { type: 'undefined', value: '' }
        };
        typedInput.config = typedInput[valueKey];
    } else if (!typedInput.config) typedInput.config = typedInput[valueKey];
</script>

{#if typedInput.config}
    <div class="dc-message-builder">
        <Tabs tabs={['Content', 'Embeds', 'Components', 'Attachments']} bind:activeTab />
        <div
            class="dc-message-builder-tab-page dc-message-builder-content-tab"
            class:active={activeTab === 'Content'}
        >
            <Textarea
                bind:value={typedInput.value}
                expandTitle="Message Content"
                placeholder="Message content"
            />
        </div>
        <div class="dc-message-builder-tab-page" class:active={activeTab === 'Embeds'}>
            <div class="rs4r-long-typed-input">
                <TypedInput
                    inline
                    bind:value={typedInput.config.embeds}
                    types={{
                        undefined: true,
                        builder: {
                            label: 'builder',
                            hasValue: false
                        },
                        msg: true
                    }}
                />
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .dc-message-builder {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    .dc-message-builder-tab-page {
        display: none;
        flex-grow: 1;
    }

    .dc-message-builder-tab-page.active {
        display: block;
    }

    .dc-message-builder-content-tab > :global(div) {
        height: 100%;
    }
    .rs4r-long-typed-input {
        & > :global(.rs4r-typedinput) {
            width: 100%;
        }
    }
</style>
