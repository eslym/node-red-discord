const fs = require('fs');
const path = require('path');
const unixPath = require('path/posix');
const rollup = require('rollup');
const svelte = require('rollup-plugin-svelte');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const css = require('rollup-plugin-import-css');

const entryTemplate = require('./templates/entries.js');
const nodeTemplate = require('./templates/html.js');

async function build() {
    if (fs.existsSync('.build')) {
        fs.rmSync('.build', { recursive: true, force: true });
    }
    fs.mkdirSync('.build');

    console.time('prepare for build');

    const packageJson = JSON.parse(fs.readFileSync('package.json'));
    const nodes = packageJson['node-red'].nodes;
    const imports = Object.entries(nodes).map(([name, file]) => ({
        name,
        path: unixPath.relative('.build/', file.replace(/\.js$/, '.svelte'))
    }));

    fs.writeFileSync(
        '.build/bundle.js',
        entryTemplate({ packageName: packageJson.name, version: packageJson.version, imports })
    );
    fs.copyFileSync(path.join(__dirname, 'helper.js'), '.build/helper.js');

    console.timeEnd('prepare for build');

    console.time('build shared bundle');

    const result = await rollup.rollup({
        input: '.build/bundle.js',
        plugins: [
            svelte({
                extensions: ['.svelte'],
                emitCss: true
            }),
            nodeResolve({
                browser: true,
                dedupe: (importee) => importee === 'svelte' || importee.startsWith('svelte/'),
                preferBuiltins: false
            }),
            commonjs(),
            css({
                output: 'bundle.css'
            })
        ]
    });

    if (fs.existsSync('resources')) {
        fs.rmSync('resources', { recursive: true, force: true });
    }

    await result.write({
        dir: 'resources',
        sourcemap: true,
        format: 'esm'
    });

    console.timeEnd('build shared bundle');

    for (const [name, file] of Object.entries(nodes)) {
        let outFile = file.replace(/\.js$/, '.html');
        console.time(`build ${outFile}`);
        let opts = {
            packageName: packageJson.name,
            version: packageJson.version,
            name,
            file
        };
        let htmlDoc = file.replace(/\.js$/, '.doc.html');
        let mdDoc = file.replace(/\.js$/, '.doc.md');
        if (fs.existsSync(htmlDoc)) {
            opts.docContent = fs.readFileSync(htmlDoc, 'utf8');
            opts.docType = 'text/html';
        } else if (fs.existsSync(mdDoc)) {
            opts.docContent = fs.readFileSync(mdDoc, 'utf8');
            opts.docType = 'text/markdown';
        }
        fs.writeFileSync(outFile, nodeTemplate(opts));
        console.timeEnd(`build ${outFile}`);
    }
}

build();
