export function fetchWithCreds(url, options) {
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
    return fetch(url, options);
}
