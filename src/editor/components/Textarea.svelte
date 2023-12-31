<script lang="ts">
    import { openTray, tooltip } from '@eslym/rs4r/components';
    import Fa from 'svelte-fa/src/fa';
    import { faFaceSmile, faCalendarDays } from '@fortawesome/free-regular-svg-icons';
    import { faAt, faUserGroup, faHashtag } from '@fortawesome/free-solid-svg-icons';
    import { getAllContexts } from 'svelte';
    import SearchEmojiTray from '$editor/tray/SearchEmojiTray.svelte';
    import { formatEmoji } from '$shared/emoji';
    import CodeMirror from './CodeMirror.svelte';
    import type { EditorView } from 'codemirror';

    const context = getAllContexts();

    export let value: string;

    export let resizable = false;

    let editor: EditorView;

    function insetEmoji() {
        const insert = (value: string) => {
            editor.focus();
            const tx = editor.state.update(editor.state.replaceSelection(value));
            editor.update([tx]);
        };
        openTray(SearchEmojiTray, {
            context,
            props: {
                onSelect(emoji) {
                    if ('id' in emoji) {
                        insert(formatEmoji(emoji));
                    } else {
                        insert(emoji.unicode);
                    }
                }
            },
            title: 'Insert Emoji',
            buttons: [
                {
                    text: RED._('common.label.back'),
                    click() {
                        RED.tray.close();
                    }
                }
            ]
        });
    }
</script>

<div class="rs4r-textarea" class:resizable>
    <div class="rs4r-control-buttons">
        <div class="button-group">
            <button
                type="button"
                class="red-ui-button red-ui-button-small"
                use:tooltip={'Insert Emoji'}
                on:click={insetEmoji}
            >
                <Fa icon={faFaceSmile} fw />
            </button>
            <button
                type="button"
                class="red-ui-button red-ui-button-small"
                use:tooltip={'Insert Timestamp'}
            >
                <Fa icon={faCalendarDays} fw />
            </button>
        </div>
        <div class="button-group">
            <button
                type="button"
                class="red-ui-button red-ui-button-small"
                use:tooltip={'Mention User'}
            >
                <Fa icon={faAt} fw />
            </button>
            <button
                type="button"
                class="red-ui-button red-ui-button-small"
                use:tooltip={'Mention Role'}
            >
                <Fa icon={faUserGroup} fw />
            </button>
            <button
                type="button"
                class="red-ui-button red-ui-button-small"
                use:tooltip={'Mention Channel'}
            >
                <Fa icon={faHashtag} fw />
            </button>
        </div>
        <div class="button-group rs4r-right" />
    </div>
    <div class="textarea">
        <CodeMirror bind:value bind:editor />
    </div>
</div>

<style lang="scss">
    .rs4r-textarea {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-height: 200px;

        .textarea {
            flex-grow: 1;
            width: 100%;
            resize: none;
            display: flex;
            flex-direction: column;

            & > :global(*) {
                flex-grow: 1;
            }
        }

        &.resizable {
            resize: vertical;
            overflow: auto;
            padding-bottom: 8px;
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
