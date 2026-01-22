(function () {
  const API_BASE = "https://subratflc-chatbot.onrender.com";

  // ? Theme exactly like your website (black/white)
  const THEME_BG = "#0f0f0f";
  const THEME_TEXT = "#ffffff";
  const LIGHT_BG = "#f7f7f7";
  const CARD_BG = "#ffffff";
  const BORDER = "#e6e6e6";

  const BOT_NAME = "Subrat Assistant";
  const BOT_SUBTITLE = "Freelancer Support Chat";

  // ? Lead required before chatbot answers rules
  let leadStep = 0;
  let leadData = { name: "", email: "", phone: "", message: "" };
  let leadSubmitted = false;

  // ? Rule based replies (after lead submitted)
  const RULES = [
    {
      keywords: ["service", "services", "what do you do"],
      reply:
        "My Services:\n1) Website Development\n2) Admin Panels\n3) APIs / Backend\n4) Chatbots (Rule-based + AI)"
    },
    {
      keywords: ["pricing", "price", "cost", "charges", "budget"],
      reply:
        "Pricing (Approx):\n• Basic Website: INR 5k - 15k\n• Admin Panel: INR 20k+\n• Chatbot: INR 10k+"
    },
    {
      keywords: ["react", "next", "frontend"],
      reply: "Yes! I build modern UI using React / Next.js."
    },
    {
      keywords: ["node", "express", "api", "backend"],
      reply: "Yes! I build APIs using Node.js / Express with MongoDB/MySQL."
    },
    {
      keywords: ["contact", "email", "phone", "whatsapp"],
      reply:
        "You can contact using website form.\nOr WhatsApp: +91 XXXXX XXXXX\nEmail: yourmail@gmail.com"
    }
  ];

  function findReply(msg) {
    const text = msg.toLowerCase().trim();
    for (const rule of RULES) {
      for (const kw of rule.keywords) {
        if (text.includes(kw)) return rule.reply;
      }
    }
    return "Type: services / pricing / contact";
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
      position:fixed; bottom:22px; right:22px;
      width:62px; height:62px;
      border-radius:50%;
      background:${THEME_BG};
      color:${THEME_TEXT};
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:14px;
      font-weight:700;
      cursor:pointer;
      z-index:99999;
      box-shadow:0 15px 35px rgba(0,0,0,.25);
      transition: transform .2s ease;
      user-select:none;
    }
    #flc-chat-btn:hover{ transform: scale(1.05); }

    #flc-chat-box{
      position:fixed;
      bottom:95px;
      right:22px;
      width:360px;
      height:520px;
      background:${CARD_BG};
      border-radius:18px;
      overflow:hidden;
      box-shadow:0 18px 40px rgba(0,0,0,.25);
      display:none;
      flex-direction:column;
      z-index:99999;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
      border:1px solid ${BORDER};
    }

    #flc-chat-head{
      background:${THEME_BG};
      color:${THEME_TEXT};
      padding:14px 16px;
      display:flex;
      justify-content:space-between;
      align-items:center;
    }
    #flc-chat-head .title{
      font-size:15px;
      font-weight:800;
      letter-spacing:.2px;
    }
    #flc-chat-head .subtitle{
      font-size:12px;
      opacity:.9;
      margin-top:2px;
    }

    #flc-chat-close{
      cursor:pointer;
      font-size:16px;
      opacity:.95;
      padding:6px 10px;
      border-radius:10px;
      transition: background .2s ease;
      user-select:none;
    }
    #flc-chat-close:hover{
      background:rgba(255,255,255,.12);
    }

    #flc-chat-body{
      flex:1;
      padding:14px;
      overflow:auto;
      background:${LIGHT_BG};
    }

    .flc-msg{
      margin:10px 0;
      padding:10px 12px;
      border-radius:14px;
      max-width:88%;
      white-space:pre-line;
      font-size:13.5px;
      line-height:1.45;
      box-shadow:0 6px 16px rgba(0,0,0,.06);
    }
    .flc-user{
      background:${THEME_BG};
      color:${THEME_TEXT};
      margin-left:auto;
      border-bottom-right-radius:6px;
    }
    .flc-bot{
      background:${CARD_BG};
      color:#111;
      border:1px solid ${BORDER};
      border-bottom-left-radius:6px;
    }

    #flc-chat-input{
      display:flex;
      gap:8px;
      padding:12px;
      border-top:1px solid ${BORDER};
      background:${CARD_BG};
    }
    #flc-chat-input input{
      flex:1;
      padding:12px 12px;
      border-radius:12px;
      border:1px solid ${BORDER};
      outline:none;
      font-size:14px;
      background:#fff;
    }
    #flc-chat-input button{
      padding:12px 14px;
      border:none;
      border-radius:12px;
      background:${THEME_BG};
      color:${THEME_TEXT};
      cursor:pointer;
      font-size:14px;
      font-weight:700;
    }
    #flc-chat-input button:hover{ opacity:.92; }

    /* small quick buttons */
    .flc-quick{
      display:flex;
      gap:8px;
      flex-wrap:wrap;
      margin-top:8px;
    }
    .flc-qbtn{
      padding:8px 10px;
      border-radius:12px;
      border:1px solid ${BORDER};
      background:#fff;
      font-size:12.5px;
      cursor:pointer;
      user-select:none;
    }
    .flc-qbtn:hover{
      border-color:#bdbdbd;
    }
  `;
  document.head.appendChild(style);

  const btn = document.createElement("div");
  btn.id = "flc-chat-btn";
  btn.innerHTML = "CHAT";

  const box = document.createElement("div");
  box.id = "flc-chat-box";
  box.innerHTML = `
    <div id="flc-chat-head">
      <div>
        <div class="title">${BOT_NAME}</div>
        <div class="subtitle">${BOT_SUBTITLE}</div>
      </div>
      <div id="flc-chat-close">X</div>
    </div>

    <div id="flc-chat-body"></div>

    <div id="flc-chat-input">
      <input id="flc-msg" placeholder="Type here..." />
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

  function showQuickButtons() {
    const wrap = document.createElement("div");
    wrap.className = "flc-quick";

    const buttons = ["services", "pricing", "contact"];

    buttons.forEach((t) => {
      const b = document.createElement("div");
      b.className = "flc-qbtn";
      b.textContent = t;
      b.onclick = () => {
        addMsg(t, "flc-user");
        const reply = findReply(t);
        setTimeout(() => addMsg(reply, "flc-bot"), 250);
      };
      wrap.appendChild(b);
    });

    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  async function handleLeadFlow(userText) {
    const text = userText.trim();

    if (leadSubmitted) return false;

    // Step 1: Name
    if (leadStep === 1) {
      leadData.name = text;
      leadStep = 2;
      addMsg("Great. Now enter your email (or type skip).", "flc-bot");
      return true;
    }

    // Step 2: Email
    if (leadStep === 2) {
      if (text.toLowerCase() !== "skip") leadData.email = text;
      leadStep = 3;
      addMsg("Enter your phone number (or type skip).", "flc-bot");
      return true;
    }

    // Step 3: Phone
    if (leadStep === 3) {
      if (text.toLowerCase() !== "skip") leadData.phone = text;
      leadStep = 4;
      addMsg("Describe your requirement (example: I need a portfolio website).", "flc-bot");
      return true;
    }

    // Step 4: Message
    if (leadStep === 4) {
      leadData.message = text;

      // ? Basic check
      if (!leadData.name || !leadData.message) {
        addMsg("Please provide a valid name and requirement message.", "flc-bot");
        return true;
      }

      addMsg("Submitting your details... please wait.", "flc-bot");

      try {
        const result = await submitLead(leadData);

        if (result.success) {
          leadSubmitted = true;
          addMsg("Thank you! Your details are saved. Now you can ask: services / pricing / contact", "flc-bot");
          showQuickButtons();
        } else {
          addMsg("Failed to submit. Please try again.", "flc-bot");
        }
      } catch (e) {
        addMsg("Server error. Please try later.", "flc-bot");
      }

      return true;
    }

    return false;
  }

  async function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    addMsg(msg, "flc-user");
    input.value = "";

    // ? Lead first mandatory
    const leadHandled = await handleLeadFlow(msg);
    if (leadHandled) return;

    // ? After lead submitted -> rules
    const reply = findReply(msg);
    setTimeout(() => addMsg(reply, "flc-bot"), 250);
  }

  btn.onclick = () => {
    box.style.display = "flex";
    btn.style.display = "none";

    // Reset lead for new user
    leadStep = 1;
    leadData = { name: "", email: "", phone: "", message: "" };
    leadSubmitted = false;

    addMsg("Welcome! Before we continue, please enter your name.", "flc-bot");
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
