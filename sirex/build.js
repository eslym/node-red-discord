const fs = require('fs');
const path = require('path');
const unixPath = require('path/posix');
const rollup = require('rollup');
const svelte = require('rollup-plugin-svelte');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const css = require('rollup-plugin-import-css');
const { builtinModules } = require('node:module');
const replace = require('@rollup/plugin-replace');

const entryTemplate = require('./templates/entries.js');
const nodeTemplate = require('./templates/html.js');

const resourcesDir = path.resolve('resources');
const tempDir = path.resolve('.build');
const distDir = path.resolve('dist');

async function build() {
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir);

    console.time('prepare for build');

    const packageJson = JSON.parse(fs.readFileSync('package.json'));
    const nodes = packageJson['node-red'].nodes;
    const imports = Object.entries(nodes).map(([name, file]) => ({
        name,
        path: unixPath.relative(
            `${tempDir}/`,
            file.replace(/^dist\//, 'editor/').replace(/\.js$/, '.svelte')
        )
    }));

    fs.writeFileSync(
        path.join(tempDir, 'bundle.js'),
        entryTemplate({ packageName: packageJson.name, version: packageJson.version, imports })
    );
    fs.copyFileSync(path.join(__dirname, 'helper.js'), path.join(tempDir, 'helper.js'));

    console.timeEnd('prepare for build');

    console.time('build editor bundle');

    const result = await rollup.rollup({
        input: path.join(tempDir, 'bundle.js'),
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
            replace({
                values: {
                    __NODE_NAME__: (name) => JSON.stringify(path.basename(name, '.svelte'))
                },
                preventAssignment: true
            }),
            css({
                output: 'bundle.css'
            })
        ]
    });

    if (fs.existsSync(resourcesDir)) {
        fs.rmSync(resourcesDir, { recursive: true, force: true });
    }

    await result.write({
        dir: resourcesDir,
        sourcemap: true,
        format: 'esm'
    });

    console.timeEnd('build editor bundle');

    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir);

    const entries = Object.entries(nodes).map(([name, file]) => [
        file.replace(/^dist\//, '').replace(/\.js$/i, ''),
        file.replace(/^dist\//, 'src/')
    ]);

    fs.mkdirSync(path.join(distDir, 'icons'));
    fs.copyFileSync(path.join('icons/discord.png'), path.join(distDir, 'icons/discord.png'));

    console.time('build backend bundle');
    await (
        await rollup.rollup({
            input: Object.fromEntries(entries),
            plugins: [
                commonjs(),
                nodeResolve({
                    preferBuiltins: true
                }),
                replace({
                    values: {
                        __NODE_NAME__: (name) => JSON.stringify(path.basename(name, '.js'))
                    },
                    preventAssignment: true
                })
            ],
            external: [...Object.keys(packageJson.dependencies), /^node:/, ...builtinModules]
        })
    ).write({
        dir: distDir,
        sourcemap: true,
        format: 'commonjs',
        chunkFileNames: 'lib/[name].js'
    });
    console.timeEnd('build backend bundle');

    for (const [name, file] of Object.entries(nodes)) {
        let outFile = file.replace(/\.js$/, '.html');
        console.time(`build ${outFile}`);
        let opts = {
            packageName: packageJson.name,
            version: packageJson.version,
            name,
            file
        };
        let htmlDoc = file.replace(/^dist\//, 'editor/doc/').replace(/\.js$/, '.html');
        let mdDoc = file.replace(/^dist\//, 'editor/doc/').replace(/\.js$/, '.md');
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
