<script>
    import PermissionsCalculator from '../components/PermissionsCalculator.svelte';

    export let applicationId;

    export let permissions = 0;
    export let commands = false;

    function buildUrl(id, cmd, perms) {
        let url = new URL('https://discord.com/oauth2/authorize');
        url.searchParams.set('client_id', id);
        url.searchParams.set('scope', cmd ? 'bot applications.commands' : 'bot');
        url.searchParams.set('permissions', perms);
        return url.toString();
    }

    function selectAll(ev) {
        ev.target.select();
    }

    $: url = buildUrl(applicationId, commands, permissions);
</script>

<PermissionsCalculator bind:permissions />
<p>
    <label>
        <strong>Extra Scope:</strong>
        <input type="checkbox" bind:checked={commands} />
        Application Commands
    </label>
</p>
<p>
    <label class="url">
        <span>Invite Link:</span>
        <input
            type="url"
            value={url}
            on:focus|preventDefault={selectAll}
            on:mousedown|preventDefault={selectAll}
            on:keydown={(ev) => {
                if (ev.key === 'Enter' || ev.key === 'Tab') {
                    return;
                }
                ev.preventDefault();
                ev.target.select();
            }}
        />
    </label>
</p>

<style>
    p {
        margin: 1.5em 0;
    }

    .url {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1em;
    }
    .url input {
        flex-grow: 1;
    }
    input,
    input[type='checkbox'] {
        margin: 0;
    }
</style>
