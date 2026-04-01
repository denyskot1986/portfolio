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
};
