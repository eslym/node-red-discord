<script context="module">
    export function newRecord() {
        return {
            name: '',
            type: 1,
            description: '',
            dm_permission: false,
            default_member_permissions: undefined,
            nsfw: false,
            options: []
        };
    }

    const commandTypes = [
        { id: 1, name: 'Slash Command' },
        { id: 2, name: 'User Conext Menu' },
        { id: 3, name: 'Message Conext Menu' }
    ];
</script>

<script>
    import { Input, Select } from 'svelte-integration-red/components';
    import EditList from '../EditList.svelte';

    export let command;
    export let global = false;
</script>

<Input label="Name" bind:value={command.name} />
<Select label="Type">
    {#each commandTypes as type}
        <option value={type.id}>{type.name}</option>
    {/each}
</Select>
<Input label="Description" bind:value={command.description} />
<Input label="Age restricted" bind:value={command.nsfw} type="checkbox" />
{#if global}
    <Input label="Allow in DM" bind:value={command.dm_permission} type="checkbox" />
{/if}
<EditList />
