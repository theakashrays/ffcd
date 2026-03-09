export async function onRequestPost(context) {
    const { request, env } = context;
    const AUTH_TOKEN = env.AUTH_TOKEN || '@thzyvxkupka3453';

    if (request.headers.get('Authorization') !== AUTH_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const files = body.files || [];
        const saved = [];

        for (const entry of files) {
            // entry.path like "1.html" or "1_reputation.html"
            const slugMatch = entry.path.match(/^(.+?)(_reputation|_vouches)?\.html$/);
            if (!slugMatch) continue;

            const fullSlug = entry.path.replace('.html', ''); // e.g., "1", "1_reputation"

            // Store common files in KV
            await env.OGU_STORE.put(`file:${entry.path}`, entry.content);

            // If it's a main profile (not _reputation/_vouches), update metadata
            if (!entry.path.includes('_reputation') && !entry.path.includes('_vouches')) {
                const slug = slugMatch[1];
                const meta = {
                    slug: slug,
                    filename: entry.path,
                    size_kb: +(entry.content.length / 1024).toFixed(1),
                    modified: Date.now() / 1000,
                    has_reputation: files.some(f => f.path === `${slug}_reputation.html`),
                    has_vouches: files.some(f => f.path === `${slug}_vouches.html`)
                };

                // If the reputations/vouches aren't in this batch, check KV for them
                if (!meta.has_reputation) {
                    const rep = await env.OGU_STORE.get(`file:${slug}_reputation.html`);
                    if (rep) meta.has_reputation = true;
                }
                if (!meta.has_vouches) {
                    const vouch = await env.OGU_STORE.get(`file:${slug}_vouches.html`);
                    if (vouch) meta.has_vouches = true;
                }

                await env.OGU_STORE.put(`meta:${slug}`, JSON.stringify(meta));
            }

            saved.push(entry.path);
        }

        return new Response(JSON.stringify({ saved }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
