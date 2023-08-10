import { getContext } from 'svelte';
import { get } from 'svelte/store';
import { fetchWithCreds } from './fetch';
import SearchEmojiTray from '$editor/tray/SearchEmojiTray.svelte';
import { clientNodeContextKey } from './constants';
import { openTypeEditor } from '@eslym/rs4r/tray';

export function emojiTray() {
    const store = getContext(clientNodeContextKey);
    return async () => {
        const clientNode = get(store);
        if (!(await checkAvailable(clientNode))) {
            const available = await fetchAvailable();
            return new Promise((res) => {
                openTypeEditor(SearchEmojiTray, {
                    title: 'Search Emoji',
                    buttons: [
                        {
                            id: 'node-cancel',
                            text: RED._('common.label.cancel'),
                            click: function () {
                                RED.tray.close();
                                res();
                            }
                        }
                    ],
                    props: {
                        availableNodes: available,
                        clientNode,
                        resolve: res
                    }
                });
            });
        }
        return new Promise((res) => {
            openTypeEditor(SearchEmojiTray, {
                title: 'Search Emoji',
                buttons: [
                    {
                        id: 'node-cancel',
                        text: RED._('common.label.cancel'),
                        click: function () {
                            RED.tray.close();
                            res();
                        }
                    }
                ],
                props: {
                    clientNode,
                    resolve: res
                }
            });
        });
    };
}

async function checkAvailable(node) {
    if (!node) {
        return false;
    }
    let res = await fetchWithCreds(`/discord/${node}`);
    return res.ok;
}

async function fetchAvailable() {
    let res = await fetchWithCreds(`/discord/nodes`);
    if (!res.ok) return [];
    let nodes = await res.json();
    return nodes;
}
