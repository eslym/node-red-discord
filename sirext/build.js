const fs = require('fs');
const path = require('path');
const unixPath = require('path/posix');
const rollup = require('rollup');
const svelte = require('rollup-plugin-svelte');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const j = JSON.stringify;

async function build() {
    if (!fs.existsSync('.build')) {
        fs.mkdirSync('.build');
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json'));
    const nodes = packageJson['node-red'].nodes;
    const keys = Object.keys(nodes);

    let entryJs = [];
    let mapping = [];

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const svelte = nodes[key].replace(/\.js$/, '.svelte');
        const relative = unixPath.relative('build', svelte);

        entryJs.push(
            `import { default as Component_${i}, register as Register_${i} } from ${j(relative)};`
        );
        mapping.push(`${j(key)}: { component: Component_${i}, register: Register_${i} },`);
    }

    entryJs.push('window.SIREX = window.SIREX || {};');
    entryJs.push(`if(!(${j(packageJson.name)} in window.SIREX)){`);
    entryJs.push(`    window.SIREX[${j(packageJson.name)}] = {`);
    entryJs.push(`        entries: {`);
    entryJs.push(...mapping.map((m) => `            ${m}`));
    entryJs.push(`        }`);
    entryJs.push(`    };`);
    entryJs.push(`};`);

    entryJs.push(`export default {};`);

    fs.writeFileSync('.build/entries.js', entryJs.join('\n'));

    const result = await rollup.rollup({
        input: '.build/entries.js',
        plugins: [
            svelte({
                extensions: ['.svelte'],
                emitCss: false
            }),
            nodeResolve({
                browser: true,
                dedupe: (importee) => importee === 'svelte' || importee.startsWith('svelte/'),
                preferBuiltins: false
            }),
            commonjs()
        ]
    });

    await result.write({
        dir: 'resources',
        sourcemap: true,
        format: 'esm'
    });
}

build();
