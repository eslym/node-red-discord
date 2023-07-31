<script context="module">
    const perms = {
        'General Permissions': {
            'View Channels': 10,
            'Manage Channels': 4,
            'Manage Roles': 28,
            'Manage Emojis and Stickers': 30,
            'View Audit Log': 7,
            'View Server Insights': 19,
            'Manage Webhooks': 29,
            'Manage Server': 5,
            'Create Invite': 0,
            'Change Nickname': 26,
            'Manage Nicknames': 27,
            'Kick Members': 1,
            'Ban Members': 2,
            Administrator: 3
        },
        'Text Permissions': {
            'Send Messages': 11,
            'Send Messages in Threads': 38,
            'Create Public Threads': 35,
            'Create Private Threads': 36,
            'Embed Links': 14,
            'Attach Files': 15,
            'Add Reactions': 6,
            'Use External Emojis': 18,
            'Use External Stickers': 37,
            'Mention @everyone, @here, and All Roles': 17,
            'Manage Messages': 13,
            'Manage Threads': 34,
            'Read Message History': 16,
            'Send TTS Messages': 12,
            'Use Application Commands': 31
        },
        'Voice Permissions': {
            Connect: 20,
            Speak: 21,
            Video: 9,
            'Start Activities': 39,
            'Use Voice Activity': 25,
            'Priority Speaker': 8,
            'Mute Members': 22,
            'Deafen Members': 23,
            'Move Members': 24,
            'Request to Speak': 32
        }
    };

    function toggle(bits, bit) {
        if (checked(bits, bit)) {
            return bits - Math.pow(2, bit);
        } else {
            return bits + Math.pow(2, bit);
        }
    }

    function checked(bits, bit) {
        return (bits / Math.pow(2, bit)) & 1;
    }
</script>

<script>
    export let permissions;
</script>

<div class="container">
    {#each Object.keys(perms) as category}
        <div class="category">
            <strong>{category}</strong>
            {#each Object.keys(perms[category]) as perm}
                <label>
                    <input
                        type="checkbox"
                        checked={checked(permissions, perms[category][perm])}
                        on:change={() => (permissions = toggle(permissions, perms[category][perm]))}
                    />
                    {perm}
                </label>
            {/each}
        </div>
    {/each}
</div>

<style>
    label {
        font-size: 0.75em;
    }
    .container {
        display: flex;
        flex-direction: row;
        gap: 5px;
    }
    .category {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
</style>
