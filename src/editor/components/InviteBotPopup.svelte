<script>
    import { Popup } from 'svelte-integration-red/components';
    import PermissionsCalculator from './PermissionsCalculator.svelte';

    export let showPopup = false;
    export let applicationId = '';

    let permissions = 0;
    let commands = false;

    let popupId;

    function buildUrl(id, cmd, perms) {
        let url = new URL('https://discord.com/oauth2/authorize');
        url.searchParams.set('client_id', id);
        url.searchParams.set('scope', cmd ? 'bot applications.commands' : 'bot');
        url.searchParams.set('permissions', perms);
        return url.toString();
    }

    $: url = buildUrl(applicationId, commands, permissions);
</script>

<Popup bind:id={popupId} modal fixed bind:showPopup>
    <PermissionsCalculator bind:permissions />
    <p>
        <label>
            <input type="checkbox" bind:checked={commands} />
            Application Commands
        </label>
    </p>
    <p>
        Invite Link: <a href={url} target="_blank">{url.replace(/^https:\/\//, '')}</a>
    </p>
</Popup>

<style>
    p {
        margin-top: 12px;
    }
    label {
        font-size: 0.9em;
    }
</style>
