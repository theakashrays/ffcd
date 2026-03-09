export async function onRequestPost(context) {
    const { request, env } = context;
    const AUTH_TOKEN = env.AUTH_TOKEN || '@thzyvxkupka3453';

    if (request.headers.get('Authorization') !== AUTH_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { slug } = await request.json();
        if (!slug) return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });

        const keysToDelete = [
            `meta:${slug}`,
            `file:${slug}.html`,
            `file:${slug}_reputation.html`,
            `file:${slug}_vouches.html`
        ];

        const deleted = [];
        for (const key of keysToDelete) {
            const val = await env.OGU_STORE.get(key);
            if (val) {
                await env.OGU_STORE.delete(key);
                deleted.push(key.replace('file:', ''));
            }
        }

        return new Response(JSON.stringify({ deleted }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
