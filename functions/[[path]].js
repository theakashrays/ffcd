export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\//, '');

    // 1. If path is empty, it's the root. Let the static file handler take it.
    if (!path || path === 'index.html') {
        return next();
    }

    // 2. Normalize path (e.g., "1" or "1.html" both look for "file:1.html")
    let targetFile = path;
    if (!path.endsWith('.html') && !path.includes('.')) {
        targetFile = path + '.html';
    }

    // 3. Special case: _private pages
    const privateMatch = path.match(/^(.+)_private(\.html)?$/);
    if (privateMatch) {
        // Return the static private.html
        // In Cloudflare Pages, we can't easily "internally" redirect to another static file easily with next() 
        // but we can just fetch it if it's deployed.
        // Actually, most people just serve it as a static file.
        // Let's see if we should just let next() handle it if it exists as a static file.
    }

    // 4. Try to find the file in KV
    const content = await env.OGU_STORE.get(`file:${targetFile}`);
    if (content) {
        return new Response(content, {
            headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
    }

    // 5. If not in KV, it might be a static file (CSS, JS, images). Pass through.
    return next();
}
