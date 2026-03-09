export async function onRequestGet(context) {
    const { env, request } = context;
    const AUTH_TOKEN = env.AUTH_TOKEN || '@thzyvxkupka3453';

    if (request.headers.get('Authorization') !== AUTH_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const list = await env.OGU_STORE.list({ prefix: 'meta:' });
        const profiles = [];

        for (const key of list.keys) {
            const metaStr = await env.OGU_STORE.get(key.name);
            if (metaStr) {
                profiles.push(JSON.parse(metaStr));
            }
        }

        // Sort by modified desc
        profiles.sort((a, b) => b.modified - a.modified);

        return new Response(JSON.stringify({ profiles }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
