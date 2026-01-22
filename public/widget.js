(function () {
  const STORAGE_KEY = "subrat_freelancer_chat_history_v1";

  // ? Change API BASE if needed
  const API_BASE = window.FLC_CHAT_API || "https://subratflc-chatbot.onrender.com";

  let unreadCount = 0;

  // ? Lead First Flow
  let leadStep = 0;
  let leadSubmitted = false;

  const leadData = {
    name: "",
    email: "",
    phone: "",
    message: ""
  };

  // ? Rule based replies AFTER lead submitted
  const RULES = [
    {
      keywords: ["service", "services", "what do you do"],
      reply:
        "My Services:\n1) Website Development\n2) Admin Panels\n3) APIs / Backend\n4) Chatbots (Rule-based + AI)\n\nType: pricing / contact"
    },
    {
      keywords: ["pricing", "price", "cost", "charges", "budget"],
      reply:
        "Pricing (Approx):\n• Basic Website: INR 5k - 15k\n• Admin Panel: INR 20k+\n• Chatbot: INR 10k+\n\nType: contact to connect."
    },
    {
      keywords: ["react", "next", "frontend"],
      reply: "Yes! I build modern UI using React / Next.js."
    },
    {
      keywords: ["node", "express", "api", "backend"],
      reply: "Yes! I build fast backend APIs using Node.js / Express."
    },
    {
      keywords: ["contact", "email", "phone", "whatsapp"],
      reply:
        "Contact:\nEmail: yourmail@gmail.com\nWhatsApp: +91 XXXXX XXXXX\n\nOr use Contact form on website."
    }
  ];

  function findReply(msg) {
    const text = msg.toLowerCase().trim();
    for (const rule of RULES) {
      for (const kw of rule.keywords) {
        if (text.includes(kw)) return rule.reply;
      }
    }
    return 'Try: "services", "pricing", "contact"';
  }

  async function submitLead() {
    const res = await fetch(`${API_BASE}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        message: leadData.message
      })
    });

    return res.json();
  }

  function playSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  function saveChat() {
    const messages = document.getElementById("messages").innerHTML;
    localStorage.setItem(STORAGE_KEY, messages);
  }

  function loadChat() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      document.getElementById("messages").innerHTML = saved;
      return;
    }

    document.getElementById("messages").innerHTML =
      `<div class="msg bot">Hello! Welcome to Subrat Freelancer Support.\nPlease type "hi" to start.</div>`;
  }

  function clearChat() {
    localStorage.removeItem(STORAGE_KEY);

    unreadCount = 0;
    updateBadge();

    leadStep = 0;
    leadSubmitted = false;
    leadData.name = "";
    leadData.email = "";
    leadData.phone = "";
    leadData.message = "";

    document.getElementById("messages").innerHTML =
      `<div class="msg bot">Hello! Welcome to Subrat Freelancer Support.\nPlease type "hi" to start.</div>`;

    saveChat();
  }

  function updateBadge() {
    const badge = document.getElementById("badge");
    if (unreadCount > 0) {
      badge.style.display = "block";
      badge.innerText = unreadCount;
    } else {
      badge.style.display = "none";
    }
  }

  function toggleChat() {
    const box = document.getElementById("chatBox");

    if (box.classList.contains("open")) {
      closeChat();
    } else {
      box.classList.add("open");
      unreadCount = 0;
      updateBadge();

      setTimeout(() => {
        document.getElementById("input").focus();
      }, 150);
    }
  }

  function closeChat() {
    document.getElementById("chatBox").classList.remove("open");
  }

  // ? Lead first handler
  async function handleLeadFlow(msg) {
    const text = msg.trim();

    // start lead flow after "hi"
    if (leadStep === 0) {
      leadStep = 1;
      return "Great! Before we continue, please enter your name.";
    }

    if (leadStep === 1) {
      leadData.name = text;
      leadStep = 2;
      return "Thanks. Please enter your email (or type skip).";
    }

    if (leadStep === 2) {
      if (text.toLowerCase() !== "skip") leadData.email = text;
      leadStep = 3;
      return "Enter your phone number (or type skip).";
    }

    if (leadStep === 3) {
      if (text.toLowerCase() !== "skip") leadData.phone = text;
      leadStep = 4;
      return "Now describe your requirement (example: I need a website / admin panel).";
    }

    if (leadStep === 4) {
      leadData.message = text;

      if (!leadData.name || !leadData.message) {
        return "Please provide valid name and requirement.";
      }

      const result = await submitLead();

      if (result.success) {
        leadSubmitted = true;
        return (
          "Thank you! Your details are saved.\n\nNow you can type:\nservices / pricing / contact"
        );
      } else {
        return "Failed to submit. Please try again.";
      }
    }

    return "";
  }

  async function send() {
    const input = document.getElementById("input");
    const msg = input.value.trim();
    if (!msg) return;

    const messages = document.getElementById("messages");

    // ? user msg
    messages.innerHTML += `<div class="msg user">${msg}</div>`;
    input.value = "";
    messages.scrollTop = messages.scrollHeight;
    saveChat();

    // ? typing loader
    const typingId = "typing-" + Date.now();
    messages.innerHTML += `<div class="msg bot typing" id="${typingId}">Typing...</div>`;
    messages.scrollTop = messages.scrollHeight;

    try {
      let reply = "";

      // ? Lead mandatory first
      if (!leadSubmitted) {
        reply = await handleLeadFlow(msg);
      } else {
        reply = findReply(msg);
      }

      // remove typing
      const typingDiv = document.getElementById(typingId);
      if (typingDiv) typingDiv.remove();

      messages.innerHTML += `<div class="msg bot">${reply}</div>`;
      messages.scrollTop = messages.scrollHeight;

      saveChat();
      playSound();

      const box = document.getElementById("chatBox");
      if (!box.classList.contains("open")) {
        unreadCount++;
        updateBadge();
      }
    } catch (err) {
      const typingDiv = document.getElementById(typingId);
      if (typingDiv) typingDiv.remove();

      messages.innerHTML += `<div class="msg bot">Server error. Please try again.</div>`;
      messages.scrollTop = messages.scrollHeight;
      saveChat();
    }
  }

  // ? Inject HTML + CSS
  const css = document.createElement("style");
  css.innerHTML = `
    body { font-family: Arial; margin: 0; background: transparent; }

    .chat-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #111; /* MATCH YOUR WEBSITE */
      color: #fff;
      padding: 12px 16px;
      border-radius: 50px;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,.3);
      z-index: 999999;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
    }

    .badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: red;
      color: white;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 20px;
      font-weight: bold;
      display: none;
    }

    .chat-box {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 340px;
      height: 470px;
      background: #f6f6f6; /* CLEAN BG */
      border-radius: 12px;
      overflow: hidden;
      z-index: 999999;
      box-shadow: 0 4px 10px rgba(0,0,0,.3);

      transform: translateY(30px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s ease;
      display: flex;
      flex-direction: column;
    }

    .chat-box.open {
      transform: translateY(0px);
      opacity: 1;
      pointer-events: auto;
    }

    .chat-header {
      background: #111; /* MATCH YOUR WEBSITE */
      color: #fff;
      padding: 10px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .header-title {
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .header-subtitle {
      font-size: 11px;
      opacity: 0.85;
      font-weight: normal;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0;
    }

    .chat-body {
      flex: 1;
      padding: 8px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .msg {
      padding: 8px 10px;
      border-radius: 10px;
      margin: 4px 0;
      max-width: 85%;
      font-size: 14px;
      white-space: pre-line;
      word-break: break-word;
      line-height: 1.25;
    }

    .user {
      background: #111; /* MATCH YOUR WEBSITE */
      color: white;
      align-self: flex-end;
    }

    .bot {
      background: #fff;
      align-self: flex-start;
      border: 1px solid #eee;
    }

    .typing {
      font-style: italic;
      opacity: 0.7;
    }

    .chat-footer {
      display: flex;
      padding: 6px;
      background: #fff;
      gap: 6px;
      border-top: 1px solid #eee;
    }

    input {
      flex: 1;
      padding: 10px;
      border-radius: 20px;
      border: 1px solid #ddd;
      outline: none;
      font-size: 14px;
    }

    .send-btn {
      padding: 10px 14px;
      border-radius: 20px;
      border: none;
      background: #111; /* MATCH YOUR WEBSITE */
      color: #fff;
      cursor: pointer;
      font-weight: 700;
    }

    .mini-icon {
      width: 14px;
      height: 14px;
      display: inline-block;
    }
  `;
  document.head.appendChild(css);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="chat-btn" id="chatBtn">
      <span class="badge" id="badge">0</span>

      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
          stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      Chat
    </div>

    <div class="chat-box" id="chatBox">

      <div class="chat-header">
        <div class="header-left">
          <div class="header-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v2M8 4h8M7 20h10a4 4 0 0 0 4-4v-5a6 6 0 0 0-6-6H9a6 6 0 0 0-6 6v5a4 4 0 0 0 4 4Z"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 13h.01M15 13h.01"
                stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 17c1.2 1 2.5 1.5 4 1.5s2.8-.5 4-1.5"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${BOT_NAME}
          </div>

          <div class="header-subtitle">
            <svg class="mini-icon" viewBox="0 0 24 24" fill="none">
              <path d="M20 6 9 17l-5-5"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${BOT_SUBTITLE}
          </div>
        </div>

        <div class="header-actions">
          <button class="header-btn" id="clearBtn" title="Clear Chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M6 6l1 16h10l1-16"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button class="header-btn" id="closeBtn" aria-label="Close Chat" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="chat-body" id="messages"></div>

      <div class="chat-footer">
        <input id="input" placeholder="Type message..." />
        <button class="send-btn" id="sendBtn">Send</button>
      </div>

    </div>
  `;

  document.body.appendChild(wrapper);

  // ? Events
  document.getElementById("chatBtn").addEventListener("click", toggleChat);
  document.getElementById("closeBtn").addEventListener("click", closeChat);
  document.getElementById("clearBtn").addEventListener("click", clearChat);
  document.getElementById("sendBtn").addEventListener("click", send);

  document.addEventListener("DOMContentLoaded", () => {
    loadChat();
    const input = document.getElementById("input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") send();
    });
  });

  // ? load immediately if DOM already ready
  loadChat();
})();
