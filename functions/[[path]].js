export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\//, '');

    // 1. If path is empty or root index, let static handler take it
    if (!path || path === 'index.html') {
        return next();
    }

    // 2. Handle directory paths like /adminpanelacess
    // We want to serve static index.html if it's a folder
    if (!path.includes('.') && !path.endsWith('/')) {
        const potentialStatic = await next();
        if (potentialStatic.status !== 404) return potentialStatic;
    }

    // 3. Normalize path for KV lookup (e.g., "1" or "1.html" both look for "file:1.html")
    let targetFile = path;
    if (!path.endsWith('.html') && !path.includes('.')) {
        targetFile = path + '.html';
    }

    // 4. Try to find the file in KV
    const content = await env.OGU_STORE.get(`file:${targetFile}`);
    if (content) {
        return new Response(content, {
            headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
    }

    // 5. Final fallback to static files
    return next();
}
