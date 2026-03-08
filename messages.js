document.addEventListener('DOMContentLoaded', () => {
    const conversationsList = document.getElementById('conversationsList');
    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    let messages = [];
    let currentConversation = null;

    // Fetch messages from the server
    async function loadMessages() {
        try {
            const res = await fetch('/api/messages');
            if (!res.ok) {
                throw new Error('Failed to fetch messages');
            }
            messages = await res.json();
            renderConversations();
        } catch (error) {
            console.error(error);
            conversationsList.innerHTML = '<div style="padding: 15px; color: var(--text-muted);">Could not load conversations.</div>';
        }
    }

    // Render the list of conversations
    function renderConversations() {
        conversationsList.innerHTML = '';
        const conversations = getConversations();
        conversations.forEach(convo => {
            const convoElement = document.createElement('div');
            convoElement.className = 'conversation';
            convoElement.innerText = convo.participant;
            convoElement.onclick = () => {
                currentConversation = convo.participant;
                renderMessages();
            };
            conversationsList.appendChild(convoElement);
        });
    }

    // Get a list of unique conversations
    function getConversations() {
        const participants = [...new Set(messages.map(m => m.sender === 'me' ? m.receiver : m.sender))];
        return participants.map(p => ({
            participant: p,
            lastMessage: messages.filter(m => m.sender === p || m.receiver === p).pop()
        })).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
    }

    // Render messages for the selected conversation
    function renderMessages() {
        messagesContainer.innerHTML = '';
        if (!currentConversation) return;

        const conversationMessages = messages.filter(m => m.sender === currentConversation || m.receiver === currentConversation);
        conversationMessages.forEach(msg => {
            const msgElement = document.createElement('div');
            msgElement.style.marginBottom = '10px';
            msgElement.innerHTML = `
                <div style="font-weight: bold;">${msg.sender === 'me' ? 'You' : msg.sender}</div>
                <div>${msg.text}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${new Date(msg.timestamp).toLocaleString()}</div>
            `;
            messagesContainer.appendChild(msgElement);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Send a message
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !currentConversation) return;

        const newMessage = {
            sender: 'me',
            receiver: currentConversation,
            text: text,
            timestamp: new Date().toISOString()
        };

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage),
            });
            if (!res.ok) {
                throw new Error('Failed to send message');
            }
            messages.push(newMessage);
            messageInput.value = '';
            renderMessages();
        } catch (error) {
            console.error(error);
            alert('Error sending message.');
        }
    }

    messageInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    loadMessages();
});
