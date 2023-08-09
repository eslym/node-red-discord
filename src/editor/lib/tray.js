import { writable, get } from 'svelte/store';
import TrayRoot from './TrayRoot.svelte';

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
