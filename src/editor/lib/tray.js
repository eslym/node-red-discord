import { writable, get } from 'svelte/store';
import { getContext } from 'svelte';
import TrayRoot from './TrayRoot.svelte';
import { fetchWithCreds } from './fetch';
import SearchEmojiTray from '$editor/tray/SearchEmojiTray.svelte';
import { clientNodeContextKey } from './constants';
import { name as packageName } from '$package.json';

export function openTray(component, options) {
    const dataStore = writable(options.value);

    let instance;

    const opts = {
        title: options.title,
        focusElement: options.focusElement,
        width: options.width || 'inherit',
        maximized: options.maximized || false,
        buttons: (options.buttons || []).map((btn) => ({
            ...btn,
            click() {
                if (btn.click) btn.click.call(this, get(dataStore));
                RED.tray.close();
            }
        })),
        resize() {},
        open(tray) {
            const target = tray.find('.red-ui-tray-body')[0];
            instance = new TrayRoot({
                target,
                props: {
                    data: dataStore,
                    props: options.props || {},
                    component
                }
            });
        },
        close() {
            instance.$destroy();
        },
        show() {}
    };

    RED.tray.show(opts);
}

RED.editor.registerTypeEditor(packageName, {
    show(options) {
        RED.view.state(RED.state.EDITING);
        openTray(options.component, options);
    }
});

export function openTypeEditor(component, options) {
    RED.editor.showTypeEditor(packageName, {
        ...options,
        component
    });
}

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
