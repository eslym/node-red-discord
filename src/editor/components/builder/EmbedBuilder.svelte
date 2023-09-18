<script lang="ts" context="module">
    const keyExpanded = Symbol('expanded');

    export function defaultEmbed(): EmbedBuilderConfig {
        return {
            title: '',
            description: '',
            url: '',
            fields: {
                type: 'undefined',
                value: ''
            },
            author: {
                type: 'undefined',
                value: ''
            },
            color: {
                type: 'undefined',
                value: ''
            },
            timestamp: {
                type: 'undefined',
                value: ''
            },
            footer: {
                type: 'undefined',
                value: ''
            },
            image: {
                type: 'undefined',
                value: ''
            },
            thumbnail: {
                type: 'undefined',
                value: ''
            }
        };
    }
</script>

<script lang="ts">
    import type { EmbedBuilderConfig } from '$shared/types';
    import { TypedInput, tooltip } from '@eslym/rs4r/components';
    import { faAngleDown, faExternalLink, faTrash } from '@fortawesome/free-solid-svg-icons';
    import { createEventDispatcher } from 'svelte';
    import Fa from 'svelte-fa/src/fa';
    import Textarea from '../Textarea.svelte';

    const dispatch = createEventDispatcher();

    export let data: EmbedBuilderConfig & { [keyExpanded]?: boolean };

    export let deletable = false;
    export let expandable = true;

    export let expand:
        | ((embed: EmbedBuilderConfig, update: (embed: EmbedBuilderConfig) => void) => void)
        | undefined = undefined;
</script>

<div class="dc-embed-builder">
    <div class="dc-row">
        <label class="dc-input">
            <span>Title</span>
            <input type="text" bind:value={data.title} />
        </label>
        {#if expandable}
            <button
                class="red-ui-button"
                use:tooltip={'Open in editor'}
                on:click={() => expand?.(data, (embed) => (data = embed))}
            >
                <Fa fw icon={faExternalLink} />
            </button>
        {/if}
        {#if deletable}
            <button
                class="red-ui-button"
                use:tooltip={'Delete'}
                on:click={() => dispatch('delete')}
            >
                <Fa fw icon={faTrash} />
            </button>
        {/if}
    </div>
    {#if !expandable || data[keyExpanded]}
        <div class="dc-expand-content">
            <div class="dc-row">
                <label class="dc-input">
                    <span>URL</span>
                    <input type="text" bind:value={data.url} />
                </label>
            </div>
            <div>
                <label for={null}>Description</label>
                <Textarea bind:value={data.description} resizable />
            </div>
            <div class="dc-row">
                <label for={undefined}>Color</label>
                <TypedInput inline bind:value={data.color} types={['undefined', 'str']} />
            </div>
            <div class="dc-row">
                <label for={undefined}>Author</label>
                <TypedInput inline bind:value={data.author} types={['undefined', 'str']} />
            </div>
            <div class="dc-row">
                <label for={undefined}>Image</label>
                <TypedInput inline bind:value={data.image} types={['undefined', 'str']} />
            </div>
            <div class="dc-row">
                <label for={undefined}>Thumbnail</label>
                <TypedInput inline bind:value={data.thumbnail} types={['undefined', 'str']} />
            </div>
            <div class="dc-row">
                <label for={undefined}>Timestamp</label>
                <TypedInput
                    inline
                    bind:value={data.timestamp}
                    types={['undefined', 'str', 'date']}
                />
            </div>
            <div class="dc-row">
                <label for={undefined}>Footer</label>
                <TypedInput inline bind:value={data.footer} types={['undefined', 'str']} />
            </div>
        </div>
    {/if}
    {#if expandable}
        <button
            class="red-ui-button red-ui-button-small dc-more"
            use:tooltip={data[keyExpanded] ? 'Hide' : 'Show more'}
            on:click={() => (data[keyExpanded] = !data[keyExpanded])}
        >
            <span class:dc-rotate={data[keyExpanded]}>
                <Fa fw icon={faAngleDown} />
            </span>
        </button>
    {/if}
</div>

<style lang="scss">
    .dc-embed-builder {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .dc-row {
            display: flex;
            flex-direction: row;
            gap: 5px;
            align-items: center;
        }
    }

    .dc-expand-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    label {
        width: 100px;
    }

    :global(.rs4r-typedinput) {
        flex-grow: 1;
        width: 0;
    }

    .dc-input {
        display: flex;
        flex-direction: row;
        gap: 5px;
        align-items: center;
        margin: 0;
        flex-grow: 1;

        & > span {
            display: block;
            width: 100px;
        }

        & > :not(:first-child) {
            flex-grow: 1;
            width: 0;
        }
    }

    .dc-more {
        width: 100%;
        margin-top: -4px;

        & > span {
            display: block;

            &.dc-rotate {
                transform: rotate(180deg);
            }
        }
    }
</style>
