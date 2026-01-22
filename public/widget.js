(function () {
  const API_BASE = "https://subratflc-chatbot.onrender.com";
  const BOT_NAME = "Subrat Assistant";

  const RULES = [
    {
      keywords: ["hi", "hello", "hey"],
      reply: "Hello! Welcome to Subrat’s freelance support. How can I help you today?"
    },
    {
      keywords: ["service", "services", "what do you do"],
      reply:
        "My Services:\n1) Website Development\n2) Admin Panels\n3) APIs / Backend\n4) Chatbots (Rule-based + AI)\n\nType: pricing / contact / lead"
    },
    {
      keywords: ["pricing", "price", "cost", "charges", "budget"],
      reply:
        "Pricing (Approx):\n• Basic Website: ?5k - ?15k\n• Admin Panel: ?20k+\n• Chatbot: ?10k+\n\nType: lead to send your requirement."
    },
    {
      keywords: ["contact", "email", "phone", "whatsapp"],
      reply:
        "You can contact me using the website form.\nOr type: lead (to send details here)."
    },
    {
      keywords: ["hire", "freelance", "available"],
      reply:
        "Yes, I’m available for freelance work.\nType: lead to send your requirement."
    },
    {
      keywords: ["lead", "submit", "send details"],
      reply:
        "Please send details like this:\n\nname: Your Name\nemail: yourmail@gmail.com\nphone: 9876543210\nmessage: I need a website"
    }
  ];

  function findReply(msg) {
    const text = msg.toLowerCase().trim();
    for (const rule of RULES) {
      for (const kw of rule.keywords) {
        if (text.includes(kw)) return rule.reply;
      }
    }
    return "Sorry, I didn’t understand.\nTry: services / pricing / lead / contact";
  }

  function parseLead(text) {
    const lines = text.split("\n").map((l) => l.trim());
    let name = "", email = "", phone = "", message = "";

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith("name:")) name = line.slice(5).trim();
      if (lower.startsWith("email:")) email = line.slice(6).trim();
      if (lower.startsWith("phone:")) phone = line.slice(6).trim();
      if (lower.startsWith("message:")) message = line.slice(8).trim();
    }

    if (!message && (name || email || phone)) {
      message = "Lead submitted from website chatbot.";
    }

    return { name, email, phone, message };
  }

  async function submitLead(lead) {
    const res = await fetch(`${API_BASE}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead)
    });
    return res.json();
  }

  // ? Modern UI style
  const style = document.createElement("style");
  style.innerHTML = `
    #flc-chat-btn{
      position:fixed; bottom:20px; right:20px;
      width:60px;height:60px;border-radius:50%;
      background:linear-gradient(135deg,#111,#333);
      color:#fff;display:flex;
      align-items:center;justify-content:center;
      font-size:22px;cursor:pointer;z-index:99999;
      box-shadow:0 15px 30px rgba(0,0,0,.25);
      transition: transform .2s ease;
    }
    #flc-chat-btn:hover{ transform: scale(1.05); }

    #flc-chat-box{
      position:fixed; bottom:95px; right:20px;
      width:360px; height:520px; background:#fff;
      border-radius:18px; overflow:hidden;
      box-shadow:0 15px 40px rgba(0,0,0,.25);
      display:none; flex-direction:column;
      z-index:99999;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
    }

    #flc-chat-head{
      background:linear-gradient(135deg,#111,#2b2b2b);
      color:#fff; padding:14px 16px;
      display:flex; justify-content:space-between; align-items:center;
    }
    #flc-chat-head .title{
      font-size:15px; font-weight:700;
      letter-spacing:.2px;
    }
    #flc-chat-head .subtitle{
      font-size:12px; opacity:.85;
      margin-top:2px;
    }
    #flc-chat-close{
      cursor:pointer;
      font-size:18px;
      opacity:.85;
      padding:6px 8px;
      border-radius:10px;
      transition: background .2s ease;
    }
    #flc-chat-close:hover{ background:rgba(255,255,255,.12); opacity:1; }

    #flc-chat-body{
      flex:1; padding:14px;
      overflow:auto; background:#f5f6f8;
    }

    .flc-msg{
      margin:10px 0;
      padding:10px 12px;
      border-radius:14px;
      max-width:85%;
      white-space:pre-line;
      font-size:13.5px;
      line-height:1.4;
      box-shadow:0 6px 16px rgba(0,0,0,.06);
    }
    .flc-user{
      background:#111;
      color:#fff;
      margin-left:auto;
      border-bottom-right-radius:6px;
    }
    .flc-bot{
      background:#fff;
      color:#111;
      border:1px solid #e7e7e7;
      border-bottom-left-radius:6px;
    }

    #flc-chat-input{
      display:flex; gap:8px;
      padding:12px;
      border-top:1px solid #eee;
      background:#fff;
    }
    #flc-chat-input input{
      flex:1;
      padding:12px 12px;
      border-radius:12px;
      border:1px solid #ddd;
      outline:none;
      font-size:14px;
    }
    #flc-chat-input button{
      padding:12px 14px;
      border:none;
      border-radius:12px;
      background:#111;
      color:#fff;
      cursor:pointer;
      font-size:14px;
      font-weight:600;
    }
    #flc-chat-input button:hover{ opacity:.9; }
  `;
  document.head.appendChild(style);

  const btn = document.createElement("div");
  btn.id = "flc-chat-btn";
  btn.innerHTML = "??";

  const box = document.createElement("div");
  box.id = "flc-chat-box";
  box.innerHTML = `
    <div id="flc-chat-head">
      <div>
        <div class="title">${BOT_NAME}</div>
        <div class="subtitle">Freelancer Support Chat</div>
      </div>
      <div id="flc-chat-close">?</div>
    </div>

    <div id="flc-chat-body"></div>

    <div id="flc-chat-input">
      <input id="flc-msg" placeholder="Type your message..." />
      <button id="flc-send">Send</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(box);

  const body = box.querySelector("#flc-chat-body");
  const input = box.querySelector("#flc-msg");

  function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = `flc-msg ${type}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  async function handleLead(userText) {
    const lower = userText.toLowerCase();
    const isLeadFormat =
      lower.includes("name:") ||
      lower.includes("email:") ||
      lower.includes("phone:") ||
      lower.includes("message:");

    if (!isLeadFormat) return false;

    const lead = parseLead(userText);

    if (!lead.name || !lead.message) {
      addMsg("Please provide at least:\nname: Your Name\nmessage: Your requirement", "flc-bot");
      return true;
    }

    addMsg("Sending your details... Please wait.", "flc-bot");

    try {
      const result = await submitLead(lead);

      if (result.success) {
        addMsg("Thank you! Your message was sent successfully. Subrat will contact you soon.", "flc-bot");
      } else {
        addMsg("Failed to send. Please try again.", "flc-bot");
      }
    } catch {
      addMsg("Server error. Please try later.", "flc-bot");
    }

    return true;
  }

  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    addMsg(msg, "flc-user");
    input.value = "";

    const handled = await handleLead(msg);
    if (handled) return;

    const reply = findReply(msg);
    setTimeout(() => addMsg(reply, "flc-bot"), 300);
  }

  btn.onclick = () => {
    box.style.display = "flex";
    btn.style.display = "none";
    addMsg(
      "Hello! I’m Subrat’s freelancer assistant.\nYou can type: services / pricing / lead / contact",
      "flc-bot"
    );
  };

  box.querySelector("#flc-chat-close").onclick = () => {
    box.style.display = "none";
    btn.style.display = "flex";
  };

  box.querySelector("#flc-send").onclick = sendMessage;
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
