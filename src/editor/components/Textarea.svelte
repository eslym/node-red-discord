<script context="module" lang="ts">
    let id = 0;
</script>

<script lang="ts">
    export let value: string;
    export let label: string;
    export let placeholder: string = '';

    let textareaId = `dc-textarea-${++id}`;

    let textarea: HTMLTextAreaElement;
</script>

<div class="form-row rs4r-textarea">
    <label for={textareaId}>{label}</label>
    <div>
        <textarea bind:this={textarea} id={textareaId} bind:value {placeholder} />
        <div />
    </div>
</div>

<style lang="scss">
    .form-row.rs4r-textarea {
        display: flex;
        flex-direction: row;
        align-items: start;

        & > label {
            display: block;
            width: 100px;
            height: 34px;
        }

        & > div {
            flex-grow: 1;
        }

        textarea {
            width: 100%;
            height: 100%;
            resize: vertical;
            min-width: 100px;
        }
    }
</style>
