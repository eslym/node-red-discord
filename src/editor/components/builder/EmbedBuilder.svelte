<script lang="ts" context="module">
    const colapsedKey = Symbol('colapsed');

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
    import { tooltip } from '@eslym/rs4r/components';
    import { faExternalLink, faTrash } from '@fortawesome/free-solid-svg-icons';
    import { createEventDispatcher } from 'svelte';
    import Fa from 'svelte-fa/src/fa';

    const dispatch = createEventDispatcher();

    export let data: EmbedBuilderConfig & { [colapsedKey]?: boolean };

    export let deletable = false;
    export let expandable = true;
</script>

<div class="dc-embed-builder">
    <div class="dc-row">
        <label class="dc-input">
            <span>Title</span>
            <input type="text" bind:value={data.title} />
        </label>
        {#if expandable}
            <button class="red-ui-button" use:tooltip={'Open in editor'}>
                <Fa fw icon={faExternalLink} />
            </button>
        {/if}
        {#if deletable}
            <button class="red-ui-button" use:tooltip={'Delete'} on:click={() => dispatch('delete')}>
                <Fa fw icon={faTrash} />
            </button>
        {/if}
    </div>
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

            & > *:first-child {
                flex-grow: 1;
            }
        }
    }

    .dc-input {
        display: flex;
        flex-direction: row;
        gap: 5px;
        align-items: center;
        margin: 0;

        & > span {
            display: block;
            width: 100px;
        }

        & > input {
            flex-grow: 1;
        }
    }
</style>
