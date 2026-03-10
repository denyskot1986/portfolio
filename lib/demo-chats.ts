interface DemoMessage {
  from: "bot" | "user";
  text: string;
}

interface DemoConfig {
  messages: DemoMessage[];
  tryLink: string;
  tryLabel: string;
}

export const demoChatData: Record<string, DemoConfig> = {
  svetlana: {
    messages: [
      { from: "bot", text: "Hi! I'm AI-Admin, your business manager.\nHow can I help today?" },
      { from: "user", text: "I need to hire a nail technician" },
      { from: "bot", text: "Got it. I'll create a vacancy, publish it to job boards, and screen applicants.\n\nI'll notify you when I have 3+ qualified candidates ready for interview." },
      { from: "user", text: "Also, we're running low on gel polish" },
      { from: "bot", text: "Checking inventory... You have 4 units of OPI GelColor left (2 days supply).\n\nI'll place a reorder with your regular supplier. ETA: tomorrow by 2 PM." },
    ],
    tryLink: "https://t.me/shop_by_finekot_bot?start=buy_svetlana",
    tryLabel: "Get AI-Admin",
  },
  "skynet-intake": {
    messages: [
      { from: "bot", text: "Send me a task — text, voice, or photo.\nI'll structure it and route to the right agent." },
      { from: "user", text: "Build a landing page for the new product launch, high priority" },
      { from: "bot", text: "Task structured:\n\n📋 Build landing page for product launch\n⚡ Priority: High\n🤖 Assigned to: T-1 (Fullstack)\n📁 Project: Marketing\n📅 Due: Tomorrow\n\nCreated in Todoist. T-1 will start shortly." },
      { from: "user", text: "Also research competitor pricing for AI tools" },
      { from: "bot", text: "Task structured:\n\n📋 Research competitor pricing — AI tools market\n⚡ Priority: Medium\n🤖 Assigned to: T-4 (Research)\n📁 Project: Strategy\n\nRouted to T-4. You'll get a report in the Dashboard." },
    ],
    tryLink: "https://t.me/shop_by_finekot_bot?start=buy_skynet-intake",
    tryLabel: "Get SKYNET Intake",
  },
  "call-agent": {
    messages: [
      { from: "bot", text: "Good afternoon! You've reached Dr. Smith's office. How can I help you?" },
      { from: "user", text: "I'd like to book a dental cleaning" },
      { from: "bot", text: "Of course! I have openings this Thursday at 2 PM or Friday at 10 AM.\n\nWhich works better for you?" },
      { from: "user", text: "Thursday at 2" },
      { from: "bot", text: "You're booked for Thursday at 2 PM with Dr. Smith.\n\n✅ Confirmation sent to your phone.\n📅 Added to calendar.\n\nAnything else I can help with?" },
    ],
    tryLink: "https://t.me/shop_by_finekot_bot?start=buy_call-agent",
    tryLabel: "Get AI Call Agent",
  },
  "skynet-platform": {
    messages: [
      { from: "bot", text: "SKYNET online. 4 agents active.\nAwaiting your command, Commander." },
      { from: "user", text: "Build a customer portal with auth and dashboard" },
      { from: "bot", text: "Task decomposed:\n\n→ T-1: Frontend (React + Auth UI)\n→ T-2: Backend (API + DB schema)\n→ T-1: Dashboard components\n→ T-4: Security review\n\nAll agents notified. ETA: 6 hours.\nProgress → Dashboard channel." },
      { from: "user", text: "Status?" },
      { from: "bot", text: "T-1: Auth UI ✅ done (47 min)\nT-2: API endpoints ⏳ in progress (60%)\nT-1: Dashboard 🔜 queued\nT-4: Review 🔜 waiting for T-2\n\nOn track. Next update in 1 hour." },
    ],
    tryLink: "https://t.me/shop_by_finekot_bot?start=buy_skynet-platform",
    tryLabel: "Get SKYNET",
  },
  "supportbot-pro": {
    messages: [
      { from: "user", text: "My order hasn't arrived yet, it's been 5 days" },
      { from: "bot", text: "I understand the frustration. Let me check your order.\n\nOrder #4821 — shipped March 7, tracking shows it's at the local depot.\n\nEstimated delivery: tomorrow by 6 PM. Want me to send you the tracking link?" },
      { from: "user", text: "Yes please, and what's your return policy?" },
      { from: "bot", text: "Here's your tracking: track.example.com/4821\n\nReturn policy: 30 days from delivery, free returns on all items. Just message me when you're ready and I'll generate a return label.\n\nAnything else?" },
    ],
    tryLink: "https://t.me/shop_by_finekot_bot?start=buy_supportbot-pro",
    tryLabel: "Get SupportBot Pro",
  },
  leadhunter: {
    messages: [
      { from: "bot", text: "LeadHunter ready. What's your ideal customer profile?" },
      { from: "user", text: "SaaS companies in Europe, 10-50 employees, using HubSpot" },
      { from: "bot", text: "Scanning LinkedIn + directories...\n\n✅ Found 247 matches\n🎯 89 scored 8+/10 (high fit)\n📧 67 have verified emails\n\nTop lead: TechFlow GmbH — Berlin, 32 employees, HubSpot user, recently raised Series A.\n\nStart outreach campaign?" },
      { from: "user", text: "Yes, personalized emails to top 20" },
      { from: "bot", text: "Campaign created:\n\n→ 20 personalized emails drafted\n→ A/B testing: 2 subject lines\n→ Follow-up sequence: 3 touches\n→ Sending starts tomorrow 9 AM CET\n\nI'll report opens and replies to your Dashboard." },
    ],
    tryLink: "https://t.me/shop_by_finekot_bot?start=buy_leadhunter",
    tryLabel: "Get LeadHunter AI",
  },
};
