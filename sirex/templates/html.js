/* generated */ function e(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function* r(data) {
    yield "<script type='module' src='resources/";
    yield e(data['packageName']);
    yield '/bundle.js?v=';
    yield e(data['bundleVersion']);
    yield "'></script>\n\n<script type='text/javascript'>\n    window.SIREX[";
    yield JSON.stringify(data['packageName']);
    yield '].register(';
    yield JSON.stringify(data['name']);
    yield ");\n</script>\n\n<script type='text/html' data-template-name='";
    yield e(data['name']);
    yield '\'>\n    <div id="';
    yield e(data['packageName']);
    yield '/';
    yield e(data['name']);
    yield '"></div>\n</script>\n\n';
    if (data['docContent']) {
        yield "\n<script type='";
        yield e(data['docType']);
        yield "' data-help-name='";
        yield e(data['name']);
        yield "'>\n";
        yield data['docContent'];
        yield '\n</script>\n\n';
    }
}
module.exports = (data) => [...r(data)].join('');
