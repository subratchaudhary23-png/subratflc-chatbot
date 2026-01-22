(function () {
  const API_BASE = window.FLC_CHAT_API || "http://localhost:10000";

  const BOT_NAME = "Subrat Assistant";

  // ? Rules
  const RULES = [
    {
      keywords: ["hi", "hello", "hey"],
      reply: "Hi ?? Welcome! How can I help you today? ??"
    },
    {
      keywords: ["service", "services", "what do you do"],
      reply:
        "? I build:\n1) Websites\n2) Admin Panels\n3) APIs\n4) AI + Rule-based Chatbots\n\nType: pricing / contact / hire me"
    },
    {
      keywords: ["price", "pricing", "cost", "charges", "budget"],
      reply:
        "?? Pricing depends on scope:\n? Basic Website: ?5k - ?15k\n? Admin Panel: ?20k+\n? Chatbot: ?10k+\n\nType: lead (to send your details)"
    },
    {
      keywords: ["contact", "email", "phone", "whatsapp"],
      reply:
        "?? You can contact using the website form.\nOr type: lead ? (to send message here)"
    },
    {
      keywords: ["hire", "freelance", "available"],
      reply:
        "? Yes I’m available for freelance work.\nType: lead ? to send your requirement."
    },
    {
      keywords: ["lead", "send lead", "submit"],
      reply:
        "? Sure! Please enter in this format:\n\nname: Your Name\nemail: yourmail@gmail.com\nphone: 9876543210\nmessage: I need a website\n\n(You can skip email/phone if you want)"
    }
  ];

  function findReply(msg) {
    const text = msg.toLowerCase().trim();
    for (const rule of RULES) {
      for (const kw of rule.keywords) {
        if (text.includes(kw)) return rule.reply;
      }
    }
    return "?? Sorry, I didn’t understand.\nTry: services / pricing / lead / contact";
  }

  // ? Lead Parser (name:, email:, phone:, message:)
  function parseLead(text) {
    const lines = text.split("\n").map((l) => l.trim());

    let name = "";
    let email = "";
    let phone = "";
    let message = "";

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith("name:")) name = line.slice(5).trim();
      if (lower.startsWith("email:")) email = line.slice(6).trim();
      if (lower.startsWith("phone:")) phone = line.slice(6).trim();
      if (lower.startsWith("message:")) message = line.slice(8).trim();
    }

    // fallback: if no message: take all as message
    if (!message && text.length > 0 && (name || email || phone)) {
      message = "Lead submitted from chatbot.";
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

  // ? UI
  const style = document.createElement("style");
  style.innerHTML = `
    #flc-chat-btn{
      position:fixed; bottom:20px; right:20px;
      width:55px;height:55px;border-radius:50%;
      background:#111;color:#fff;display:flex;
      align-items:center;justify-content:center;
      font-size:22px;cursor:pointer;z-index:99999;
      box-shadow:0 10px 25px rgba(0,0,0,.2);
    }
    #flc-chat-box{
      position:fixed; bottom:85px; right:20px;
      width:330px; height:450px; background:#fff;
      border-radius:16px; overflow:hidden;
      box-shadow:0 10px 30px rgba(0,0,0,.2);
      display:none; flex-direction:column;
      z-index:99999; font-family:Arial;
    }
    #flc-chat-head{
      background:#111;color:#fff;
      padding:12px 14px; font-weight:bold;
      display:flex; justify-content:space-between; align-items:center;
    }
    #flc-chat-close{ cursor:pointer; font-size:18px; }
    #flc-chat-body{
      flex:1; padding:12px; overflow:auto; background:#f6f6f6;
    }
    .flc-msg{ margin:8px 0; padding:10px 12px; border-radius:12px; max-width:85%; white-space:pre-line; }
    .flc-user{ background:#111; color:#fff; margin-left:auto; }
    .flc-bot{ background:#fff; color:#111; border:1px solid #ddd; }
    #flc-chat-input{
      display:flex; gap:8px; padding:10px; border-top:1px solid #eee; background:#fff;
    }
    #flc-chat-input input{
      flex:1; padding:10px; border-radius:10px; border:1px solid #ddd;
      outline:none;
    }
    #flc-chat-input button{
      padding:10px 12px;border:none;border-radius:10px;background:#111;color:#fff;cursor:pointer;
    }
  `;
  document.head.appendChild(style);

  const btn = document.createElement("div");
  btn.id = "flc-chat-btn";
  btn.innerHTML = "??";

  const box = document.createElement("div");
  box.id = "flc-chat-box";
  box.innerHTML = `
    <div id="flc-chat-head">
      <div>${BOT_NAME}</div>
      <div id="flc-chat-close">?</div>
    </div>
    <div id="flc-chat-body"></div>
    <div id="flc-chat-input">
      <input id="flc-msg" placeholder="Type message..." />
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

  async function handleLeadIfPresent(userText) {
    const lower = userText.toLowerCase();
    const isLeadFormat =
      lower.includes("name:") || lower.includes("email:") || lower.includes("phone:") || lower.includes("message:");

    if (!isLeadFormat) return false;

    const lead = parseLead(userText);

    if (!lead.name || !lead.message) {
      addMsg("?? Please provide at least:\nname: Your Name\nmessage: Your requirement", "flc-bot");
      return true;
    }

    addMsg("? Sending your details...", "flc-bot");

    try {
      const result = await submitLead(lead);

      if (result.success) {
        addMsg("? Thank you! Your message was sent successfully.\nSubrat will contact you soon. ??", "flc-bot");
      } else {
        addMsg("? Failed to send lead. Please try again.", "flc-bot");
      }
    } catch (err) {
      addMsg("? Server error. Please try later.", "flc-bot");
    }

    return true;
  }

  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    addMsg(msg, "flc-user");
    input.value = "";

    // ? detect lead submission format first
    const leadHandled = await handleLeadIfPresent(msg);
    if (leadHandled) return;

    // ? normal rule response
    const reply = findReply(msg);
    setTimeout(() => addMsg(reply, "flc-bot"), 400);
  }

  btn.onclick = () => {
    box.style.display = "flex";
    btn.style.display = "none";
    addMsg(
      "Hi ?? I’m Subrat’s freelancer assistant.\n? Website Development\n? Admin Panels\n? APIs\n? AI / Rule-based Chatbots\n\nType: services / pricing / lead / contact",
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
