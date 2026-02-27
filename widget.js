/**
 * Generic Chatbot Widget
 * Embed this file anywhere using <script src="widget.js"></script>
 */

(function () {
    // Inject the CSS styling directly from the JS so it's a single drop-in file
    const style = document.createElement('style');
    style.innerHTML = `
        #sql-chatbot-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-height: 500px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 10000;
            border: 1px solid #ddd;
            transition: all 0.3s ease;
        }
        #sql-chatbot-widget.collapsed {
            width: 60px;
            height: 60px;
            border-radius: 30px;
            cursor: pointer;
        }
        #sql-chatbot-header {
            background: #2563eb;
            color: white;
            padding: 15px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #sql-chatbot-toggle {
            cursor: pointer;
            font-size: 1.2rem;
            user-select: none;
        }
        #sql-chatbot-messages {
            flex-grow: 1;
            padding: 15px;
            overflow-y: auto;
            min-height: 300px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #f9fafb;
        }
        .sql-chatbot-msg {
            padding: 10px 14px;
            border-radius: 18px;
            max-width: 80%;
            font-size: 0.9rem;
            line-height: 1.4;
            word-wrap: break-word;
        }
        .sql-chatbot-msg.user {
            background: #2563eb;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }
        .sql-chatbot-msg.bot {
            background: #e5e7eb;
            color: #1f2937;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }
        .sql-chatbot-msg.error {
            background: #fee2e2;
            color: #b91c1c;
            align-self: center;
        }
        #sql-chatbot-input-area {
            display: flex;
            padding: 10px;
            border-top: 1px solid #e5e7eb;
            background: white;
        }
        #sql-chatbot-input {
            flex-grow: 1;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 20px;
            outline: none;
            font-size: 0.9rem;
        }
        #sql-chatbot-input:focus {
            border-color: #2563eb;
        }
        #sql-chatbot-send {
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 0 15px;
            margin-left: 8px;
            cursor: pointer;
            font-weight: bold;
        }
        #sql-chatbot-send:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        .typing-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #6b7280;
            border-radius: 50%;
            margin: 0 2px;
            animation: typing 1.4s infinite ease-in-out both;
        }
        .typing-indicator:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        /* Icon state for collapsed view */
        #sql-chatbot-icon {
            display: none;
            width: 100%;
            height: 100%;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            color: white;
            background: #2563eb;
            border-radius: 50%;
        }
        #sql-chatbot-widget.collapsed #sql-chatbot-icon {
            display: flex;
        }
        #sql-chatbot-widget.collapsed #sql-chatbot-header,
        #sql-chatbot-widget.collapsed #sql-chatbot-messages,
        #sql-chatbot-widget.collapsed #sql-chatbot-input-area {
            display: none;
        }
    `;
    document.head.appendChild(style);

    // Build the HTML structure
    const widget = document.createElement('div');
    widget.id = 'sql-chatbot-widget';
    // Start expanded initially for demonstration
    widget.innerHTML = `
        <div id="sql-chatbot-icon">💬</div>
        <div id="sql-chatbot-header">
            <span>SQL Data Assistant</span>
            <span id="sql-chatbot-toggle">−</span>
        </div>
        <div id="sql-chatbot-messages">
            <div class="sql-chatbot-msg bot">Hi! I can query the database. What would you like to know?</div>
        </div>
        <div id="sql-chatbot-input-area">
            <input type="text" id="sql-chatbot-input" placeholder="Type a message..." autocomplete="off"/>
            <button id="sql-chatbot-send">Send</button>
        </div>
    `;
    document.body.appendChild(widget);

    // Elements
    const container = document.getElementById('sql-chatbot-widget');
    const toggleBtn = document.getElementById('sql-chatbot-toggle');
    const iconBtn = document.getElementById('sql-chatbot-icon');
    const messagesDiv = document.getElementById('sql-chatbot-messages');
    const inputField = document.getElementById('sql-chatbot-input');
    const sendBtn = document.getElementById('sql-chatbot-send');

    // Toggle logic
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        container.classList.add('collapsed');
    });

    iconBtn.addEventListener('click', () => {
        container.classList.remove('collapsed');
        inputField.focus();
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `sql-chatbot-msg ${sender}`;
        msgDiv.textContent = text;
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function addTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'sql-chatbot-msg bot typing';
        msgDiv.id = 'sql-chatbot-typing';
        msgDiv.innerHTML = '<span class="typing-indicator"></span><span class="typing-indicator"></span><span class="typing-indicator"></span>';
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingItem = document.getElementById('sql-chatbot-typing');
        if (typingItem) typingItem.remove();
    }

    async function handleSend() {
        const text = inputField.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        inputField.value = '';
        inputField.disabled = true;
        sendBtn.disabled = true;

        addTypingIndicator();

        try {
            // Send request to our FastAPI backend
            // Note: Update this port/IP if you deploy the backend somewhere else.
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: text })
            });

            const data = await response.json();
            removeTypingIndicator();

            if (response.ok) {
                addMessage(data.response, 'bot');
            } else {
                addMessage('Error: ' + data.detail, 'error');
            }
        } catch (err) {
            removeTypingIndicator();
            addMessage('Network Error. Is the Chatbot API running on localhost:8000?', 'error');
        } finally {
            inputField.disabled = false;
            sendBtn.disabled = false;
            inputField.focus();
        }
    }

    sendBtn.addEventListener('click', handleSend);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

})();
