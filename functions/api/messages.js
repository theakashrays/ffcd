export async function onRequestGet(context) {
    const { env } = context;
    let messages = await env.OGU_STORE.get('messages');
    if (!messages) messages = '[]';
    return new Response(messages, {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const newMsg = await request.json();
        let messagesStr = await env.OGU_STORE.get('messages');
        let messages = messagesStr ? JSON.parse(messagesStr) : [];

        messages.push(newMsg);
        await env.OGU_STORE.put('messages', JSON.stringify(messages));

        // Note: Email sending is bypassed in Workers unless using a 3rd party API.
        // If the user provides a service like Resend, we could add it here.

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
