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
    slug: "debugging-ai-agents-it-s-always-the-embeddings-20260326",
    title: "Debugging AI Agents: It's Always the Embeddings",
    excerpt: "I spent three weeks debugging a flaky AI agent before I realized the problem wasn't the agent. It was the embeddings.  We use embeddings everywhere in...",
    date: "2026-03-26",
    readTime: "2 min",
    category: "AI Agents",
    content: `I spent three weeks debugging a flaky AI agent before I realized the problem wasn't the agent. It was the embeddings.

We use embeddings everywhere in SKYNET. They power semantic search, route queries to the right tools, help agents decide what context matters. But most people use whatever embedding model their framework ships with. That's a mistake.

Generic embedding models are trained on everything. Wikipedia, Reddit, news articles, random web scraping. They're decent at general similarity but terrible at domain-specific nuance. In my case, I was building agents for technical documentation. The model couldn't tell the difference between "memory leak" and "memory allocation" because in its training data, both terms appeared in similar contexts.

Domain-specific embeddings solve this. You take a base model and fine-tune it on your actual data. The guide that came out this week from the Granite team shows you can do this in under a day. Not weeks. One day.

Here's what changed for me. I took about 5000 question-answer pairs from our actual user interactions. Ran them through a simple contrastive learning setup. Questions that led to the same answer should have similar embeddings. Questions with different answers should be far apart. Eight hours of training on a single GPU.

The improvement was immediate. Retrieval accuracy went from 67 percent to 91 percent. More importantly, the agent stopped making weird associations. It understood that in our domain, certain technical terms have specific relationships that don't exist in general English.

The setup is simpler than you think. You need pairs of related text. Could be question-answer pairs, could be document-summary pairs, could be search queries and clicked results. Anything where you know two pieces of text should be close or far in semantic space.

Most agent failures I see aren't reasoning failures. They're retrieval failures. The agent gets the wrong context, so even perfect reasoning leads to wrong answers. You can throw GPT-5 at the problem and it won't help if you're feeding it irrelevant documents.

Fine-tuning embeddings is the highest leverage thing you can do for an agent system. It's not sexy. Nobody demos their embedding layer. But it's the difference between an agent that works in screenshots and one that works in production.

If you're building anything with semantic search or RAG, stop using generic embeddings. One day of work. Massive improvement. Do it now.`,
  },
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
