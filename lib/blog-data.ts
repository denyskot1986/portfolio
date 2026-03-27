export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
}

export const blogPosts: BlogPost[] = [

  {
    slug: "ai-safety-bounties-miss-the-real-problem-20260326",
    title: "AI Safety Bounties Miss the Real Problem",
    excerpt: "I think we're solving the wrong problem with AI safety bounties.  OpenAI just launched a bug bounty for prompt injection and data exfiltration. Good. ...",
    date: "2026-03-26",
    readTime: "2 min",
    category: "AI Agents",
    content: `I think we're solving the wrong problem with AI safety bounties.

OpenAI just launched a bug bounty for prompt injection and data exfiltration. Good. But here's what nobody says: the safety problems that matter don't look like bugs. They look like features working exactly as designed.

When an AI agent books the wrong flight because it misunderstood context, that's not a vulnerability. When it optimizes for the literal instruction instead of the intent, that's not a bug. When it chains together three correct actions that produce one terrible outcome, that's not something a bounty program catches.

I see this building SKYNET. The dangerous failures aren't injection attacks. They're compounding errors in multi-step reasoning. They're context windows that forget the why while remembering the what. They're agents that execute flawlessly on objectives that should never have been pursued.

We're building elaborate defense systems against adversarial attacks while the real risk is benign instructions meeting brittle reasoning. It's like putting locks on every door while the foundation cracks.

The hard part isn't preventing malicious actors from breaking your agent. It's preventing your agent from confidently doing exactly what you asked for in ways you didn't imagine.`,
  },
  {
    slug: "openai-s-safety-bug-bounty-reveals-ai-agent-risks-20260327",
    title: "OpenAI's Safety Bug Bounty Reveals AI Agent Risks",
    excerpt: "OpenAI just launched a Safety Bug Bounty program. They are paying security researchers to find ways to abuse their AI systems. Not just the usual expl...",
    date: "2026-03-27",
    readTime: "2 min",
    category: "AI Agents",
    content: `OpenAI just launched a Safety Bug Bounty program. They are paying security researchers to find ways to abuse their AI systems. Not just the usual exploits. They want you to break their agents.

The timing tells you everything. We are at the moment where AI agents are moving from demos to production. From toys to tools that execute real actions. OpenAI knows what is coming because they are building it. And they know the current safety approach is insufficient.

I have been building SKYNET for two years. Every day I see the gap between what agents can do and what safety systems can catch. Prompt injection is table stakes now. The real problems are subtler. Agents that gradually drift from their constraints. Systems that appear safe in testing but break under production load. Vulnerabilities that only emerge when multiple agents interact.

The bug bounty focuses on exactly these issues. Agentic vulnerabilities. Data exfiltration. Abuse vectors that only exist when AI can take actions autonomously. This is not defensive posturing. This is acknowledgment that the old safety playbook does not work for agents.

What makes this significant is the implicit admission. If you need a bounty program for safety bugs, you are saying your internal testing cannot find all the holes. You are saying the attack surface is too large. You are saying safety is now a continuous adversarial process, not a one time solution.

Every AI company will follow. They have to. Because the first major agent failure will set the entire field back. Not just the company that shipped it. All of us.

The question is whether bug bounties are enough. I doubt it. Finding vulnerabilities is useful. But the deeper problem is that we are building systems whose behavior we cannot fully predict. No amount of red teaming solves that.

We are past the point of preventing agent deployment. They are already here. The safety work now is figuring out how to operate them in a world where perfect safety is impossible. That starts with admitting we do not have all the answers. OpenAI just did.`,
  },
];
