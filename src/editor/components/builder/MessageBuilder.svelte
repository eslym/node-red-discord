<script context="module" lang="ts">
    const valueKey = Symbol('value');
</script>

<script lang="ts">
    import type { BuilderTypedInputValue, MessageBuilderConfig } from '$shared/types';
    import { TypedInput } from '@eslym/rs4r/components';
    import Tabs from '../Tabs.svelte';
    import Textarea from '../Textarea.svelte';
    import EmbedBuilder, { defaultEmbed } from './EmbedBuilder.svelte';
    import SortableList from '../SortableList.svelte';
    import Fa from 'svelte-fa/src/fa';
    import { faPlus } from '@fortawesome/free-solid-svg-icons';

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

    function embedsTypeChanged(ev: CustomEvent<{ new: string; old: string }>) {
        if (ev.detail.new === 'builder') {
            typedInput.config!.embeds.config = (typedInput.config!.embeds as any)[valueKey] ?? [
                defaultEmbed()
            ];
        } else if (ev.detail.old === 'builder') {
            (typedInput.config!.embeds as any)[valueKey] = typedInput.config!.embeds.config;
            typedInput.config!.embeds.config = undefined;
        }
    }

    function addEmbed() {
        typedInput.config!.embeds.config!.push(defaultEmbed());
        typedInput.config!.embeds.config = typedInput.config!.embeds.config;
    }

    function removeEmbed(index: number) {
        typedInput.config!.embeds.config!.splice(index, 1);
        typedInput.config!.embeds.config = typedInput.config!.embeds.config;
    }
</script>

{#if typedInput.config}
    <div class="dc-message-builder">
        <Tabs tabs={['Content', 'Embeds', 'Components', 'Attachments']} bind:activeTab />
        <div
            class="dc-message-builder-tab-page dc-message-builder-content-tab"
            class:active={activeTab === 'Content'}
        >
            <Textarea bind:value={typedInput.value} />
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
                    on:typechange={embedsTypeChanged}
                />
            </div>
            {#if typedInput.config.embeds.config}
                <div>
                    <div style="text-align: right; margin-bottom: 4px">
                        <button class="red-ui-button red-ui-button-small" on:click={addEmbed}>
                            <Fa icon={faPlus} fw />
                            Add Embed
                        </button>
                    </div>
                    <SortableList bind:list={typedInput.config.embeds.config} let:index>
                        <div class="dc-list-item">
                            <EmbedBuilder
                                bind:data={typedInput.config.embeds.config[index]}
                                deletable
                                expandable
                                on:delete={() => removeEmbed(index)}
                            />
                        </div>
                    </SortableList>
                </div>
            {/if}
        </div>
        <div class="dc-message-builder-tab-page" class:active={activeTab === 'Components'}>
            <div class="rs4r-long-typed-input">
                <TypedInput
                    inline
                    bind:value={typedInput.config.components}
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
        <div class="dc-message-builder-tab-page" class:active={activeTab === 'Attachments'}>
            <div class="rs4r-long-typed-input">
                <TypedInput
                    inline
                    bind:value={typedInput.config.attachments}
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
        flex-direction: column;
        gap: 12px;
    }

    .dc-message-builder-tab-page.active {
        display: flex;
    }

    .dc-message-builder-content-tab > :global(div) {
        height: 100%;
    }

    .dc-list-item {
        padding: 0 8px;
    }

    .rs4r-long-typed-input {
        & > :global(.rs4r-typedinput) {
            width: 100%;
        }
    }
</style>
