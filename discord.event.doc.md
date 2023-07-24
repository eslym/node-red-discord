The node which listens to discord events.

### Inputs

: Client (Discord Client) : The discord client
: Event (string) : The event name

### Outputs

: topic (string) : The event name
: payload (any | any[]) : The arguments received from the event

### Notes

The payload will be converted to json object, it does not keep the original type. If the event only receives one argument, the payload will be a json object. If the event receives more than one argument, the payload will be a json array.

Please refer to [discord.js Client Events](https://old.discordjs.dev/#/docs/discord.js/main/class/Client?scrollTo=e-applicationCommandPermissionsUpdate) for event references.
