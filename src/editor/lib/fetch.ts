export function fetch(url: string | URL, options?: RequestInit | undefined): Promise<Response> {
    const creds = localStorage.getItem('auth-tokens');
    if (creds) {
        const token = JSON.parse(creds);
        if (token && token.access_token) {
            if (!options) {
                options = {};
            }
            if (!options.headers) {
                options.headers = {
                    Authorization: `${token.token_type} ${token.access_token}`
                };
            } else if (Array.isArray(options.headers)) {
                options.headers.push([
                    'Authorization',
                    `${token.token_type} ${token.access_token}`
                ]);
            } else if ('set' in options.headers && typeof options.headers.set === 'function') {
                options.headers.set('Authorization', `${token.token_type} ${token.access_token}`);
            } else {
                options.headers = {
                    ...options.headers,
                    Authorization: `${token.token_type} ${token.access_token}`
                };
            }
        }
    }
    return window.fetch(url, options);
}
