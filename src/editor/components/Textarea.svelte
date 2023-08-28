<script context="module" lang="ts">
    import { tooltip } from '@eslym/rs4r/components';
    let id = 0;
</script>

<script lang="ts">
    import Fa from 'svelte-fa/src/fa';
    import { faFaceSmile, faCalendarDays } from '@fortawesome/free-regular-svg-icons';
    import {
        faExternalLink,
        faAt,
        faUserGroup,
        faHashtag
    } from '@fortawesome/free-solid-svg-icons';

    export let value: string;
    export let placeholder: string = '';

    export let expandTitle: string = 'Markdown Editor';

    let textareaId = `dc-textarea-${++id}`;

    let textarea: HTMLTextAreaElement;

    function expand() {
        RED.editor.editMarkdown({
            value,
            title: expandTitle,
            stateId: textareaId,
            complete(val) {
                value = val;
            }
        });
    }
</script>

<div class="rs4r-textarea">
    <div class="rs4r-control-buttons">
        <div class="button-group">
            <button type="button" class="red-ui-button" use:tooltip={'Insert Emoji'}>
                <Fa icon={faFaceSmile} fw />
            </button>
            <button type="button" class="red-ui-button" use:tooltip={'Insert Timestamp'}>
                <Fa icon={faCalendarDays} fw />
            </button>
        </div>
        <div class="button-group">
            <button type="button" class="red-ui-button" use:tooltip={'Mention User'}>
                <Fa icon={faAt} fw />
            </button>
            <button type="button" class="red-ui-button" use:tooltip={'Mention Role'}>
                <Fa icon={faUserGroup} fw />
            </button>
            <button type="button" class="red-ui-button" use:tooltip={'Mention Channel'}>
                <Fa icon={faHashtag} fw />
            </button>
        </div>
        <div class="button-group rs4r-right">
            <button
                type="button"
                class="red-ui-button"
                use:tooltip={'Markdown Editor'}
                on:click={expand}
            >
                <Fa icon={faExternalLink} fw />
            </button>
        </div>
    </div>
    <textarea bind:this={textarea} id={textareaId} bind:value {placeholder} />
</div>

<style lang="scss">
    .rs4r-textarea {
        display: flex;
        flex-direction: column;
        gap: 5px;

        textarea {
            flex-grow: 1;
            width: 100%;
            resize: none;
            min-height: 100px;
        }
    }
    .rs4r-control-buttons {
        display: flex;
        gap: 10px;

        .button-group {
            display: flex;
            margin: 0;
        }

        .rs4r-right {
            margin-left: auto;
        }
    }
</style>
