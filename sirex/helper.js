export function registerHelper(pack, entries, name) {
    const { component, register } = entries[name];

    const render = function (node, options) {
        try {
            if (typeof node !== 'object') {
                return;
            }
            let minWidth = '400px';
            if (options) {
                if (options.minWidth) minWidth = options.minWidth;
            }
            if (!node.__clone) {
                node.__clone = window.$.extend(true, {}, node);
            }
            let target = document.getElementById(`${pack.name}/${name}`);
            new component({
                target: target,
                props: { node: node.__clone }
            });
            target.style.width = minWidth;
            const nodeIsSidebarTab = !!node.onchange;
            if (!nodeIsSidebarTab) {
                const orgResize = node._def.oneditresize;
                node._def.oneditresize = function (size) {
                    target.style.width = 'auto';
                    if (orgResize) orgResize(size);
                    node._def.oneditresize = orgResize;
                };
            }
        } catch (e) {
            console.log(e);
        }
    };

    const update = function (node) {
        if (node.__clone) {
            const clone = node.__clone;
            delete node.__clone;
            clone._version = pack.version;
            const defaultKeys = Object.keys(node._def.defaults);
            for (const key of Object.keys(clone)) {
                if (defaultKeys.indexOf(key) === -1) {
                    delete clone[key];
                }
            }
            // update config node sidebar
            let updateConfigSidebar = false;
            for (const key of defaultKeys) {
                // is config node and has been changed?
                if (node._def.defaults[key].type && node[key] !== clone[key]) {
                    updateConfigSidebar = true;
                    // config has changed, add to or remove from config node and refresh sidebar
                    // The official RED.nodes.updateConfigNodeUsers(configNode) seems to have no effect.
                    const oldConfig = RED.nodes.node(node[key]);
                    const newConfig = RED.nodes.node(clone[key]);
                    // Remove from old config node
                    if (oldConfig) {
                        oldConfig.users = oldConfig.users.filter(
                            (userNode) => userNode.id !== node.id
                        );
                    }
                    // add to new config node
                    if (
                        newConfig &&
                        !newConfig.users?.find((userNode) => userNode.id === node.id)
                    ) {
                        newConfig.users.push(RED.nodes.node(node.id));
                    }
                }
            }
            if (updateConfigSidebar) {
                RED.sidebar.config.refresh();
            }
            Object.assign(node, clone);
        }
    };

    const revert = function (node) {
        if (node.__clone) {
            delete node.__clone;
        }
    };

    const addVersion = function (node) {
        node._version = pack.version;
    };

    register(render, update, revert, addVersion);
}
