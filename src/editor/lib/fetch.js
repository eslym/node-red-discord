/**
 * @param {string|URL} url
 * @param {RequestInit|undefined} options
 * @returns {Promise<Response>}
 */
export function fetch(url, options) {
    const creds = localStorage.getItem('auth-tokens');
    if (creds) {
        const token = JSON.parse(creds);
        if (token && token.access_token) {
            if (!options) {
                options = {};
            }
            if (!options.headers) {
                options.headers = {};
            }
            options.headers.Authorization = `${token.token_type} ${token.access_token}`;
        }
    }
    return window.fetch(url, options);
}
