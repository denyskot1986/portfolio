export interface ProductData {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  longDescription: string;
  features: { title: string; desc: string }[];
  useCases: string[];
  techStack: string[];
  pricing: { code: number; setup?: number; currency: string };
  deliveryTime: { template: string; integration: string };
  youtubeId: string | null;
  screenshots: string[];
  contact: string;
  diagram: string;
  available: boolean;
}

export const productsData: ProductData[] = [
  {
    id: "skynet-platform",
    name: "SKYNET",
    tagline: "Multi-Agent AI Platform",
    category: "AI Infrastructure",
    description: "Distributed multi-agent system with centralized command.",
    longDescription: "SKYNET is a command-and-control platform for managing multiple autonomous AI agents. Each agent (Terminator) is a dedicated AI instance accessible via Telegram. The central coordinator delegates tasks, monitors progress, and aggregates reports. Built for companies that need parallel AI workforce across development, operations, research, and QA.",
    features: [
      { title: "Multi-Agent Orchestration", desc: "Deploy 4+ autonomous agents, each specialized in different domains." },
      { title: "Telegram Control", desc: "Send tasks to any agent via Telegram bot. Get real-time status updates." },
      { title: "Central Dashboard", desc: "All agent activity in a single dashboard channel." },
      { title: "Isolated Workspaces", desc: "Each agent has its own sandboxed environment." },
      { title: "Auto-Reporting", desc: "Structured reports for every completed task." },
      { title: "Scalable Architecture", desc: "Add new agents by cloning config. Scale to 40+." },
    ],
    useCases: ["Software teams", "DevOps automation", "Research orgs", "Enterprise AI", "Agency operations"],
    techStack: ["Claude API", "Docker", "Telegram Bot API", "systemd", "PostgreSQL", "N8N"],
    pricing: { code: 1200, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for enterprise setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `            +-------------------------+
            |     COMMAND LAYER       |
            |  Telegram . Web . API   |
            +-----------+-------------+
                        |
            +-----------+-------------+
            |     SKYNET CORE         |
            |  +-------------------+  |
            |  | Task Decomposer   |  |
            |  | Agent Router      |  |
            |  | Quality Gate      |  |
            |  | Priority Queue    |  |
            |  | Memory Manager    |  |
            |  +-------------------+  |
            +---+--+--+--+-----------+
                |  |  |  |
      +--------+| ++-+ |+-+  +--------+
      | T-1    || T-2 || T-3 || T-4    |
      |Fullstk ||Back ||DevOp||Research|
      |        ||+DB  ||+Infr||+QA     |
      +--------++-----++-----++--------+
      |Claude  ||Claud||Claud||Claude  |
      |Code    ||Code ||Code ||Code    |
      +---+----++--+--++--+--++---+----+
          |        |      |       |
      +---+--------+------+------+----+
      |     SHARED CONTEXT LAYER      |
      |  Memory . Reports . Artifacts |
      +-------------------------------+
   +-----------------------------------+
   |  INFRASTRUCTURE LAYER             |
   |  Docker . systemd . Nginx . SSL   |
   +-----------------------------------+`,
    available: false,
  },
  {
    id: "svetlana",
    name: "AI-Admin",
    tagline: "AI Business Manager",
    category: "Business Automation",
    description: "Autonomous AI system that manages your entire business.",
    longDescription: "AI-Admin is a fully autonomous AI manager that takes over day-to-day business operations. You secure the location and handle the decor \u2014 AI-Admin handles everything else: recruiting staff, acquiring clients, managing supply chains, handling all communications, and delivering daily performance reports. Built for beauty salons, clinics, retail stores, and any service business that wants to run on autopilot.",
    features: [
      { title: "Auto-Recruiting", desc: "Posts vacancies, screens candidates, schedules interviews \u2014 qualified people show up ready to work." },
      { title: "Client Acquisition", desc: "Runs targeted outreach, manages social media inquiries, books appointments \u2014 clients come to you." },
      { title: "Supply Chain", desc: "Tracks inventory, auto-orders supplies when running low, negotiates with suppliers." },
      { title: "Full Communications", desc: "Handles all messenger conversations, emails, reviews \u2014 responds in the client\u2019s language." },
      { title: "Smart Escalation", desc: "Only important decisions reach you. No noise, no micromanagement needed." },
      { title: "Daily Reports", desc: "Revenue, client count, staff performance, inventory status \u2014 delivered to your Telegram every morning." },
    ],
    useCases: ["Beauty salons", "Dental clinics", "Retail stores", "Service businesses", "Franchise operations"],
    techStack: ["Claude API", "Telegram Bot API", "N8N Automation", "PostgreSQL", "Vector DB", "Redis"],
    pricing: { code: 500, setup: 2500, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "1 business day" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `                    +-------------------+
                    |   OWNER CONSOLE   |
                    |  (Telegram / Web)  |
                    +---------+---------+
                              |
                    +---------+---------+
                    | AI-ADMIN |
                    |  Decision Engine  |
                    |  Context Memory   |
                    |  Priority Queue   |
                    +--+---+---+---+--+-+
                       |   |   |   |  |
          +--------+   |   |   |  +--------+
          | HIRING |   |   |   |  | REPORTS|
          | MODULE |   |   |   |  | ENGINE |
          +--------+   |   |   |  +--------+
          |Vacancy |   |   |   |  | Daily  |
          |Screen  |   |   |   |  | Weekly |
          |Schedule|   |   |   |  | Alerts |
          +--------+   |   |   |  +--------+
               +-------+   |  +-------+
               |CLIENT |   |  | COMMS  |
               |ACQUIRE|   |  | HUB    |
               +-------+   |  +-------+
               |Ads    |   |  |Chat   |
               |Social |   |  |Email  |
               |Booking|   |  |Review |
               +-------+   |  +-------+
                    +-------+
                    | SUPPLY |
                    | CHAIN  |
                    +--------+
                    |Inventory|
                    |Orders  |
                    |Vendors |
                    +--------+
   +-------------------------------------------+
   |     MONITORING & LOGGING LAYER            |
   |  Uptime . Errors . Latency . Costs        |
   +-------------------------------------------+`,
    available: false,
  },
  {
    id: "c-admin",
    name: "C-Admin",
    tagline: "Universal Client Manager",
    category: "Business Automation",
    description: "AI admin for any service professional \u2014 bookings, clients, marketing.",
    longDescription: "C-Admin is a lightweight AI administrator built for any service professional: barbers, tutors, personal trainers, photographers, massage therapists, nail artists, freelance consultants \u2014 anyone who needs client bookings, automated reminders, and marketing on autopilot. It handles scheduling, client conversations, review management, and promotion \u2014 all from one Telegram bot. Lite version of AI-Admin, optimized for solo professionals.",
    features: [
      { title: "Smart Booking", desc: "Clients book through Telegram/web. Auto-confirms, reminds, reschedules." },
      { title: "Client CRM", desc: "Remembers every client: preferences, history, notes. Personalizes every interaction." },
      { title: "Auto-Marketing", desc: "Sends promotions, birthday offers, re-engagement messages to inactive clients." },
      { title: "Review Manager", desc: "Requests reviews after each visit. Responds to Google/Instagram reviews automatically." },
      { title: "Chat Autopilot", desc: "Handles client inquiries 24/7. Answers FAQs, sends portfolio, books slots." },
      { title: "Analytics", desc: "Client retention, booking rates, revenue tracking \u2014 daily digest to Telegram." },
    ],
    useCases: ["Barbers & hairdressers", "Tutors & coaches", "Personal trainers", "Photographers", "Nail artists", "Massage therapists", "Freelance consultants"],
    techStack: ["Claude API", "Telegram Bot API", "Google Calendar", "PostgreSQL", "N8N"],
    pricing: { code: 250, setup: 500, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "1 business day" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `              +-------------------+
              |   PROFESSIONAL    |
              |   (Telegram Bot)  |
              +---------+---------+
                        |
              +---------+---------+
              |   C-ADMIN CORE    |
              |  Booking Engine   |
              |  Client Memory    |
              |  Chat Handler     |
              +--+-----+-----+---+
                 |     |     |
          +------+  +--+--+  +------+
          |BOOKING|  |CLIENT|  |MARKET|
          |ENGINE |  | CRM  |  |ENGINE|
          +------+  +------+  +------+
          |Calendar| |History| |Promos|
          |Remind  | |Prefs  | |Reviews
          |Confirm | |Notes  | |Reach |
          +------+  +------+  +------+
                 |     |     |
          +------+-----+-----+------+
          |    ANALYTICS LAYER      |
          |  Retention . Revenue    |
          +-------------------------+`,
    available: true,
  },
  {
    id: "call-agent",
    name: "AI Call Agent",
    tagline: "Voice AI for Business",
    category: "Voice AI",
    description: "Autonomous voice agent that handles calls 24/7.",
    longDescription: "AI Call Agent is a production-grade voice AI system that handles both inbound and outbound phone calls around the clock. It conducts natural conversations, understands context, books appointments, answers FAQs, qualifies leads, and syncs everything to your CRM. Supports 15+ languages with natural-sounding voice synthesis.",
    features: [
      { title: "24/7 Call Handling", desc: "Never miss a call. Inbound and outbound, day or night." },
      { title: "Natural Conversation", desc: "Real conversational AI that understands context and handles objections." },
      { title: "CRM Integration", desc: "Every call logged, transcribed, and synced to your CRM." },
      { title: "Appointment Scheduling", desc: "Books meetings directly into your calendar." },
      { title: "Call Analytics", desc: "Sentiment analysis, conversion rates, call duration stats." },
      { title: "Multilingual", desc: "Speaks 15+ languages. Auto-detects and switches." },
    ],
    useCases: ["Customer support", "Sales outreach", "Appointment booking", "Lead qualification", "Survey calls"],
    techStack: ["Python", "Twilio Voice API", "Claude API", "OpenAI Whisper", "ElevenLabs TTS", "Docker"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `            +---------------------+
            |    TELEPHONY GW     |
            |   Twilio / SIP      |
            +---------+-----------+
                      |
           +----------+----------+
           v          |          v
     +--------+      |    +--------+
     |Whisper |      |    |  TTS   |
     |  STT   |      |    | Engine |
     +----+---+      |    +----+---+
          |          |         |
          v          v         v
     +---------------------------+
     |   DIALOGUE ENGINE         |
     |  +---------------------+  |
     |  | Intent Classifier   |  |
     |  | Context Manager     |  |
     |  | Response Builder    |  |
     |  | Objection Handler   |  |
     |  +---------------------+  |
     +----+-----+-----+----+----+
          |     |     |
     +----+-+ +--+--+ +--+-----+
     | CRM  | |Cal- | | Lead   |
     | Sync | |endar| | Score  |
     +------+ +-----+ +--------+
   +-------------------------------+
   |  ANALYTICS & RECORDING LAYER  |
   |  Transcripts . Sentiment . KPI|
   +-------------------------------+`,
    available: true,
  },
  {
    id: "contentfactory",
    name: "ContentFactory",
    tagline: "AI Content Production",
    category: "Content Automation",
    description: "AI content production system for all platforms.",
    longDescription: "ContentFactory is your AI-powered content team. It generates, edits, schedules, and publishes content across all your platforms \u2014 blog, social media, newsletters, video scripts. Maintains your brand voice consistently, optimizes for SEO, and tracks performance.",
    features: [
      { title: "Multi-Platform Publishing", desc: "Blog, Instagram, LinkedIn, Twitter/X, Telegram, YouTube." },
      { title: "Content Calendar", desc: "AI plans your content strategy weeks ahead." },
      { title: "Brand Voice AI", desc: "Learns your tone, style, and vocabulary." },
      { title: "SEO Optimization", desc: "Keyword research, meta tags, internal linking." },
      { title: "Performance Analytics", desc: "Engagement, reach, clicks, conversions." },
      { title: "15+ Languages", desc: "Create and localize content automatically." },
    ],
    useCases: ["Personal brands", "Startup marketing", "Agency content ops", "E-commerce", "SaaS marketing"],
    techStack: ["Claude API", "Social Media APIs", "WordPress API", "N8N", "Analytics APIs", "Airtable"],
    pricing: { code: 499, setup: 2000, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "1 business day" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +-------------------------+
     |   CONTENT BRIEF INPUT   |
     |  Topic . Tone . Platform|
     +-----------+-------------+
                 |
     +-----------+-------------+
     |   GENERATION ENGINE     |
     |  +-------------------+  |
     |  | Brand Voice Model |  |
     |  | SEO Optimizer     |  |
     |  | Format Adapter    |  |
     |  | Language Engine   |  |
     |  +-------------------+  |
     +---+----+----+----+-----+
         |    |    |    |
     +---+-++--+-++--+-++--+---+
     | Blog || Scl|| Nws|| Video|
     | Post || Med|| Ltr|| Scrpt|
     +--+--++--+--++--+--++--+--+
        |     |      |      |
     +--+-----+------+------+--+
     |    SCHEDULER & PUBLISHER |
     |  Calendar . Queue . Post |
     +-----------+--------------+
                 |
     +-----------+--------------+
     |  PERFORMANCE ANALYTICS   |
     |  Reach . Clicks . Convert|
     +--------------------------+`,
    available: false,
  },
  {
    id: "docmind",
    name: "DocMind",
    tagline: "AI Knowledge Base",
    category: "Knowledge Management",
    description: "RAG-powered document intelligence system.",
    longDescription: "DocMind turns your document chaos into an intelligent knowledge base. Upload contracts, manuals, regulations, internal docs \u2014 and get instant answers with exact source citations. Built on RAG (Retrieval-Augmented Generation) with vector search, it understands context across thousands of pages and serves answers in seconds.",
    features: [
      { title: "Universal Ingestion", desc: "Handles PDF, DOCX, XLSX, TXT, HTML, and more." },
      { title: "Instant Q&A", desc: "Ask questions in natural language. Get precise answers with source citations." },
      { title: "Vector Search (RAG)", desc: "Semantic search across all documents." },
      { title: "Access Control", desc: "Role-based permissions. Departments see only their documents." },
      { title: "Multi-Language", desc: "Ask in English, get answers from German documents." },
      { title: "API Integration", desc: "REST API for embedding DocMind into your existing tools." },
    ],
    useCases: ["Legal document search", "Internal knowledge base", "Compliance", "Customer support", "Research"],
    techStack: ["Claude API", "Pinecone / Weaviate", "LangChain", "Next.js", "PostgreSQL", "FastAPI"],
    pricing: { code: 299, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +-------------------------+
     |    DOCUMENT INGESTION   |
     |  PDF . DOCX . URL . API |
     +-----------+-------------+
                 |
     +-----------+-------------+
     |    PROCESSING PIPELINE  |
     |  +-------------------+  |
     |  | Chunker           |  |
     |  | Embedder          |  |
     |  | Metadata Extract  |  |
     |  | Language Detect   |  |
     |  +-------------------+  |
     +-----+--------+---------+
           |        |
     +-----+----++---+--------+
     | VECTOR   ||  METADATA  |
     |   DB     ||    STORE   |
     | Pinecone || PostgreSQL |
     +----+-----++----+-------+
          |           |
     +----+-----------+-------+
     |   RETRIEVAL ENGINE     |
     |  Query Rewrite > Search|
     |  Re-rank > Cite > Reply|
     +-----------+------------+
                 |
     +-----------+------------+
     |    ACCESS CONTROL LAYER|
     |  Roles . Perms . Audit |
     +------------------------+`,
    available: false,
  },
  {
    id: "leadhunter",
    name: "LeadHunter AI",
    tagline: "AI Sales Automation",
    category: "Sales Automation",
    description: "AI-powered lead generation and nurturing system.",
    longDescription: "LeadHunter AI finds your ideal clients, qualifies them, and initiates personalized outreach \u2014 all automatically. It scrapes target markets, builds prospect profiles, scores them against your ICP, and runs multi-channel outreach campaigns.",
    features: [
      { title: "Lead Sourcing", desc: "Finds prospects from LinkedIn, directories, databases, web scraping." },
      { title: "AI Qualification", desc: "Scores each lead against your ICP." },
      { title: "Personalized Outreach", desc: "Unique messages for each prospect, not templates." },
      { title: "Pipeline Management", desc: "Visual sales pipeline with auto-stage advancement." },
      { title: "Conversion Analytics", desc: "Open rates, reply rates, meeting rates, A/B testing." },
      { title: "CRM Integration", desc: "Syncs with HubSpot, Salesforce, Pipedrive via API." },
    ],
    useCases: ["B2B sales", "Agency new business", "SaaS outbound", "Consulting", "Freelancer lead gen"],
    techStack: ["Claude API", "LinkedIn API", "Email APIs", "N8N", "PostgreSQL", "Redis"],
    pricing: { code: 399, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +-------------------------+
     |   TARGET DEFINITION    |
     |  ICP . Industry . Geo  |
     +-----------+------------+
                 |
     +-----------+------------+
     |   SOURCING ENGINE      |
     |  +------------------+  |
     |  | LinkedIn Scraper |  |
     |  | Directory Crawl  |  |
     |  | Web Enrichment   |  |
     |  | Dedup Engine     |  |
     |  +------------------+  |
     +-----+--------+---------+
           |        |
     +-----+---++---+--------+
     |QUALIFY  ||  OUTREACH  |
     | ENGINE  ||  ENGINE    |
     +--------+++-----------+
     |ICP Fit  ||Personalize|
     |Budget   ||Multi-chan  |
     |BANT     ||A/B Test   |
     +----+----++----+------+
          |          |
     +----+----------+-------+
     |     PIPELINE MANAGER  |
     |  Stage . Score . CRM  |
     +------------------------+
   +----------------------------+
   |  CONVERSION ANALYTICS      |
   |  Opens . Replies . Meetings|
   +----------------------------+`,
    available: false,
  },
  {
    id: "contract-scanner",
    name: "Contract Scanner",
    tagline: "AI Legal Review",
    category: "RAG",
    description: "Upload any contract \u2014 get risk analysis in 30 seconds.",
    longDescription: "Contract Scanner reads legal documents and instantly identifies risks, red flags, missing clauses, and deviations from your templates. It produces plain-language summaries that anyone can understand \u2014 no legal degree required. Built on RAG with clause comparison engine.",
    features: [
      { title: "Risk Analysis", desc: "Identifies dangerous clauses, hidden obligations, unfair terms." },
      { title: "Red Flag Detection", desc: "Highlights clauses that deviate from industry standards." },
      { title: "Template Comparison", desc: "Compares against your approved contract templates." },
      { title: "Plain-Language Summary", desc: "Translates legalese into simple business language." },
      { title: "Multi-Language", desc: "Analyzes contracts in any language." },
      { title: "Audit Trail", desc: "Full history of every review and recommendation." },
    ],
    useCases: ["Legal departments", "Procurement", "Real estate", "Freelancers", "Startups"],
    techStack: ["Claude API", "LangChain", "ChromaDB", "FastAPI", "Next.js"],
    pricing: { code: 399, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   CONTRACT UPLOAD      |
     |  PDF . DOCX . Scan     |
     +----------+-------------+
                |
     +----------+-------------+
     |   ANALYSIS ENGINE      |
     |  +------------------+  |
     |  | Clause Extractor |  |
     |  | Risk Scorer      |  |
     |  | Template Matcher |  |
     |  | Language Parser  |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | RISK    ||  TEMPLATE |
     | REPORT  ||  COMPARE  |
     +---------++-----------+
     |Red Flags ||Deviations|
     |Liability ||Missing   |
     |Score     ||Clauses   |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |   PLAIN-LANGUAGE      |
     |   SUMMARY ENGINE      |
     +-----------+-----------+
                 |
     +-----------+-----------+
     |    AUDIT TRAIL LAYER  |
     |  History . Versions   |
     +-----------------------+`,
    available: false,
  },
  {
    id: "skynet-intake",
    name: "SKYNET Intake",
    tagline: "AI Task Assistant",
    category: "Bots",
    description: "Converts voice and text into structured tasks with AI routing.",
    longDescription: "SKYNET Intake turns raw ideas \u2014 voice messages, texts, screenshots \u2014 into structured, prioritized tasks. It parses your input with AI, categorizes it, assigns priority, routes to the right executor, and syncs everything to Todoist. Stop losing ideas. Start executing them.",
    features: [
      { title: "Voice Input", desc: "Send a voice message \u2014 it transcribes and structures automatically." },
      { title: "AI Prioritization", desc: "Assigns urgency and importance based on content analysis." },
      { title: "Smart Routing", desc: "Routes tasks to the right agent or team member." },
      { title: "Todoist Sync", desc: "Creates tasks with labels, projects, and due dates." },
      { title: "Multi-Input", desc: "Text, voice, photos, screenshots \u2014 all processed." },
      { title: "Daily Digest", desc: "Morning summary of what needs attention today." },
    ],
    useCases: ["Entrepreneurs", "Team leads", "Project managers", "Creative professionals", "Remote teams"],
    techStack: ["Claude API", "Whisper STT", "Todoist API", "aiogram", "Python"],
    pricing: { code: 499, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   INPUT LAYER          |
     |  Voice . Text . Photo  |
     +----------+-------------+
                |
     +----------+-------------+
     |   PROCESSING ENGINE    |
     |  +------------------+  |
     |  | Whisper STT      |  |
     |  | AI Parser        |  |
     |  | Priority Scorer  |  |
     |  | Category Engine  |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | ROUTING ||  TODOIST  |
     | ENGINE  ||  SYNC     |
     +---------++-----------+
     |Agent Map||Projects   |
     |Team Map ||Labels     |
     |Auto-Asn ||Due Dates  |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |    DAILY DIGEST       |
     |  Summary . Priorities |
     +-----------------------+`,
    available: false,
  },
  {
    id: "hiring-autopilot",
    name: "Hiring Autopilot",
    tagline: "AI Recruitment System",
    category: "HR Automation",
    description: "AI-powered end-to-end hiring pipeline.",
    longDescription: "Hiring Autopilot automates your entire recruitment process from job posting to offer letter. It writes and publishes job descriptions, screens incoming resumes with AI scoring, conducts initial interviews via chat, schedules meetings with top candidates, and maintains a ranked pipeline.",
    features: [
      { title: "Auto Job Posting", desc: "Generates job descriptions and publishes across platforms." },
      { title: "AI Resume Screening", desc: "Scores every resume against your criteria." },
      { title: "Chat Interviews", desc: "Structured first-round interviews via messenger." },
      { title: "Smart Scheduling", desc: "Coordinates calendars and books interview slots." },
      { title: "Candidate Ranking", desc: "Data-driven ranking across skills, experience, culture fit." },
      { title: "HR Analytics", desc: "Time-to-hire, source effectiveness, conversion funnel." },
    ],
    useCases: ["Startup hiring", "Agency recruitment", "Enterprise HR", "Seasonal staffing", "Remote teams"],
    techStack: ["Claude API", "Telegram Bot API", "Google Calendar API", "PostgreSQL", "N8N", "Redis"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   VACANCY DEFINITION   |
     |  Requirements . Criteria|
     +----------+-------------+
                |
     +----------+-------------+
     |   JOB DISTRIBUTION     |
     |  LinkedIn . Indeed . TG|
     +----------+-------------+
                |
     +----------+-------------+
     |   SCREENING ENGINE     |
     |  +------------------+  |
     |  | Resume Parser    |  |
     |  | Skill Matcher    |  |
     |  | Experience Score |  |
     |  | Bias Filter      |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+--------+
     |  CHAT   ||  SCHEDULE  |
     |INTERVIEW||  MANAGER   |
     |  Agent  ||  Calendar  |
     +----+----++----+-------+
          |          |
     +----+----------+------+
     |   RANKING & PIPELINE |
     |  Score . Compare     |
     +----------+-----------+
                |
     +----------+-----------+
     |   HR ANALYTICS LAYER |
     |  Funnel . Time . Src |
     +----------------------+`,
    available: false,
  },
  {
    id: "supportbot-pro",
    name: "SupportBot Pro",
    tagline: "AI Customer Support",
    category: "Bots",
    description: "First-line support trained on your knowledge base.",
    longDescription: "SupportBot Pro handles customer inquiries 24/7. Trained on your FAQ, documentation, and historical tickets \u2014 it resolves 80%+ of requests without human intervention. Complex cases are escalated with full context. Supports 10+ languages.",
    features: [
      { title: "Knowledge Base Training", desc: "Learns from your FAQ, docs, and past tickets." },
      { title: "Smart Escalation", desc: "Escalates to humans with full conversation context." },
      { title: "Multi-Language", desc: "Handles 10+ languages automatically." },
      { title: "Ticket Integration", desc: "Works with Zendesk, Intercom, Freshdesk." },
      { title: "Analytics Dashboard", desc: "Resolution rates, response times, satisfaction scores." },
      { title: "Continuous Learning", desc: "Improves from every resolved conversation." },
    ],
    useCases: ["E-commerce support", "SaaS help desk", "Telecom", "Banking", "Travel agencies"],
    techStack: ["Claude API", "RAG", "Telegram", "Zendesk API", "Python"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   CUSTOMER INPUT       |
     |  Chat . Email . Widget |
     +----------+-------------+
                |
     +----------+-------------+
     |   SUPPORT ENGINE       |
     |  +------------------+  |
     |  | Knowledge RAG    |  |
     |  | Intent Classify  |  |
     |  | Response Builder |  |
     |  | Escalation Logic |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | AUTO    ||  ESCALATE |
     | RESOLVE ||  TO HUMAN |
     +---------++-----------+
          |          |
     +----+----------+------+
     |   ANALYTICS & LEARN  |
     |  CSAT . Resolution   |
     +-----------------------+`,
    available: false,
  },
  {
    id: "realestate-ai",
    name: "RealEstate AI",
    tagline: "Property Assistant Bot",
    category: "Bots",
    description: "AI agent for real estate \u2014 matching, Q&A, booking viewings.",
    longDescription: "RealEstate AI is your 24/7 property assistant. It matches clients to listings by parameters, answers questions about properties, books viewings directly into Google Calendar, and updates your CRM. Works in Telegram, WhatsApp, or website widget.",
    features: [
      { title: "Smart Matching", desc: "Finds best properties by budget, location, size, amenities." },
      { title: "24/7 Q&A", desc: "Answers questions about any listing instantly." },
      { title: "Viewing Booking", desc: "Books viewings directly into Google Calendar." },
      { title: "CRM Updates", desc: "Logs every interaction and lead status." },
      { title: "Multi-Channel", desc: "Telegram, WhatsApp, website widget." },
      { title: "Photo Galleries", desc: "Sends property photos and virtual tour links." },
    ],
    useCases: ["Real estate agencies", "Property developers", "Rental companies", "Individual agents"],
    techStack: ["Claude API", "Telegram", "PostgreSQL", "Google Calendar", "Python"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   CLIENT REQUEST       |
     |  Budget . Area . Type  |
     +----------+-------------+
                |
     +----------+-------------+
     |   MATCHING ENGINE      |
     |  Filter > Score > Rank |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | LISTING ||  BOOKING  |
     | Q&A     ||  ENGINE   |
     +---------++-----------+
     |Details  ||Calendar   |
     |Photos   ||Reminders  |
     |Tours    ||Confirm    |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |    CRM & ANALYTICS   |
     |  Leads . Conversions |
     +-----------------------+`,
    available: false,
  },
  {
    id: "mailmind",
    name: "MailMind",
    tagline: "AI Email Automation",
    category: "Automation",
    description: "AI email processing \u2014 classify, draft, respond in 3 seconds.",
    longDescription: "MailMind reads every incoming email, classifies it by intent and urgency, drafts a response in 3 seconds, auto-sends standard replies, and escalates edge cases. It learns your communication style and gets better over time.",
    features: [
      { title: "Auto-Classification", desc: "Sorts incoming emails by type, urgency, and sender." },
      { title: "3-Second Drafts", desc: "AI drafts a response before you finish reading the email." },
      { title: "Auto-Respond", desc: "Sends standard replies automatically for known patterns." },
      { title: "Smart Escalation", desc: "Routes complex emails to the right person with context." },
      { title: "Style Learning", desc: "Learns your writing style and tone over time." },
      { title: "Analytics", desc: "Response times, volume tracking, pattern insights." },
    ],
    useCases: ["Customer service teams", "Sales teams", "Executive assistants", "Support desks", "Agencies"],
    techStack: ["Claude API", "N8N", "Gmail API", "OpenAI", "Supabase"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   INBOX MONITOR        |
     |  Gmail . Outlook . API |
     +----------+-------------+
                |
     +----------+-------------+
     |   EMAIL BRAIN          |
     |  Classify > Draft > Act|
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | AUTO    ||  ESCALATE |
     | REPLY   ||  + ROUTE  |
     +---------++-----------+
          |          |
     +----+----------+------+
     |   STYLE LEARNING     |
     |  Tone . Pattern . KPI|
     +-----------------------+`,
    available: false,
  },
  {
    id: "bizpulse",
    name: "BizPulse",
    tagline: "Business Intelligence Agent",
    category: "Automation",
    description: "AI monitors your metrics and diagnoses anomalies.",
    longDescription: "BizPulse connects to your databases, spreadsheets, and analytics tools \u2014 monitors revenue, CAC, LTV, conversion rates in real-time. When something goes off track, it sends a Telegram alert with root cause analysis and recommended actions.",
    features: [
      { title: "Metric Monitoring", desc: "Tracks revenue, CAC, LTV, churn, conversions in real-time." },
      { title: "Anomaly Detection", desc: "Spots unusual patterns before they become problems." },
      { title: "Root Cause Analysis", desc: "AI explains WHY metrics changed, not just that they did." },
      { title: "Daily Digest", desc: "Morning summary of all key metrics to Telegram." },
      { title: "Custom Alerts", desc: "Set thresholds. Get notified when they're breached." },
      { title: "Multi-Source", desc: "Connects to DB, Google Sheets, Metabase, Stripe, etc." },
    ],
    useCases: ["SaaS companies", "E-commerce", "Marketing teams", "CFOs", "Growth teams"],
    techStack: ["Claude API", "N8N", "PostgreSQL", "Metabase", "Telegram"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   DATA SOURCES         |
     |  DB . Sheets . Stripe  |
     +----------+-------------+
                |
     +----------+-------------+
     |   MONITOR ENGINE       |
     |  Track > Detect > Alert|
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | ANOMALY ||  ROOT     |
     | DETECT  ||  CAUSE    |
     +---------++-----------+
          |          |
     +----+----------+------+
     |   TELEGRAM DIGEST    |
     |  Daily . Alerts . Act|
     +-----------------------+`,
    available: false,
  },
  {
    id: "code-reviewer",
    name: "CodeReviewer",
    tagline: "Autonomous Code Review Agent",
    category: "Multi-Agent",
    description: "AI reviews PRs for bugs, security, and style in 60 seconds.",
    longDescription: "CodeReviewer analyzes every pull request automatically. Finds bugs, security vulnerabilities (OWASP), performance issues, and style violations. Writes inline comments like a senior developer. Learns your team's conventions over time.",
    features: [
      { title: "PR Analysis", desc: "Reviews pull requests in under 60 seconds." },
      { title: "Security Checks", desc: "OWASP top-10 vulnerability scanning." },
      { title: "Style Learning", desc: "Learns your team's coding conventions." },
      { title: "Inline Comments", desc: "Posts review comments directly on the PR." },
      { title: "Performance Hints", desc: "Spots N+1 queries, memory leaks, slow patterns." },
      { title: "CI Integration", desc: "Runs as part of your GitHub Actions / GitLab CI pipeline." },
    ],
    useCases: ["Development teams", "Open source projects", "Startups", "Enterprise dev", "Freelancers"],
    techStack: ["Claude API", "GitHub API", "AST Parsers", "Python", "Docker"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   GITHUB / GITLAB PR   |
     |  Webhook . CI Trigger  |
     +----------+-------------+
                |
     +----------+-------------+
     |   REVIEW ENGINE        |
     |  +------------------+  |
     |  | Diff Parser      |  |
     |  | Bug Detector     |  |
     |  | OWASP Scanner    |  |
     |  | Style Checker    |  |
     |  | Perf Analyzer    |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | INLINE  ||  SUMMARY |
     | COMMENT ||  REPORT  |
     +---------++-----------+
          |          |
     +----+----------+------+
     |   TEAM STYLE LEARN   |
     |  Conventions . Prefs |
     +-----------------------+`,
    available: false,
  },
  {
    id: "meeting-scribe",
    name: "Meeting Scribe",
    tagline: "AI Meeting Assistant",
    category: "Voice AI",
    description: "Transcribes meetings, extracts action items, assigns owners.",
    longDescription: "Meeting Scribe joins your Zoom/Meet calls, transcribes everything in real-time, extracts action items, assigns owners, and pushes tasks to your project management tools. Never lose a decision or follow-up again.",
    features: [
      { title: "Live Transcription", desc: "Real-time speech-to-text during meetings." },
      { title: "Action Items", desc: "Automatically extracts tasks and decisions." },
      { title: "Owner Assignment", desc: "Maps action items to team members." },
      { title: "Task Push", desc: "Sends tasks to Notion, Todoist, Jira, Asana." },
      { title: "Meeting Summary", desc: "Concise summary with key decisions and next steps." },
      { title: "Searchable Archive", desc: "Every meeting indexed and searchable." },
    ],
    useCases: ["Remote teams", "Agencies", "Board meetings", "Sales calls", "Standup meetings"],
    techStack: ["Whisper", "Claude API", "Zoom SDK", "Notion API", "Python"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   MEETING INPUT        |
     |  Zoom . Meet . Audio   |
     +----------+-------------+
                |
     +----------+-------------+
     |   SCRIBE ENGINE        |
     |  Transcribe > Extract  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | ACTION  ||  SUMMARY |
     | ITEMS   ||  ENGINE  |
     +---------++-----------+
     |Tasks    ||Decisions  |
     |Owners   ||Next Steps |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |   TASK PUSH & ARCHIVE|
     |  Notion . Jira . Srch|
     +-----------------------+`,
    available: false,
  },
  {
    id: "compliance-guard",
    name: "Compliance Guard",
    tagline: "Regulatory Compliance AI",
    category: "RAG",
    description: "Checks documents against regulations. Flags violations.",
    longDescription: "Compliance Guard monitors your documents, policies, and processes against regulatory requirements (GDPR, HIPAA, SOX, industry-specific). It flags violations, suggests fixes, tracks compliance scores over time, and maintains a full audit trail.",
    features: [
      { title: "Multi-Regulation", desc: "GDPR, HIPAA, SOX, PCI-DSS, and custom rule sets." },
      { title: "Violation Detection", desc: "Scans documents and flags non-compliant sections." },
      { title: "Fix Suggestions", desc: "Recommends specific changes to achieve compliance." },
      { title: "Compliance Score", desc: "Tracks organization-wide compliance over time." },
      { title: "Audit Trail", desc: "Full history of every check, finding, and remediation." },
      { title: "Scheduled Scans", desc: "Automated periodic compliance reviews." },
    ],
    useCases: ["Legal departments", "Healthcare", "Financial services", "Tech companies", "Government"],
    techStack: ["Claude API", "LangChain", "Pinecone", "FastAPI", "React"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   DOCUMENT UPLOAD      |
     |  Policies . Processes  |
     +----------+-------------+
                |
     +----------+-------------+
     |   COMPLIANCE ENGINE    |
     |  +------------------+  |
     |  | Regulation DB    |  |
     |  | Clause Matcher   |  |
     |  | Violation Detect |  |
     |  | Fix Generator    |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | SCORE   ||  AUDIT   |
     | TRACKER ||  TRAIL   |
     +---------++-----------+
          |          |
     +----+----------+------+
     |   SCHEDULED SCANS    |
     |  Daily . Weekly . Ad |
     +-----------------------+`,
    available: false,
  },
  {
    id: "reels-agent",
    name: "Reels Agent",
    tagline: "Instagram AI Automation",
    category: "Content Automation",
    description: "AI auto-reply bot for Instagram Reels comments. Boosts engagement 3x.",
    longDescription: "Reels Agent is an AI-powered Instagram automation tool that auto-replies to every comment on your Reels. It sounds like you, works 24/7, and boosts engagement by up to 3x. Set your brand voice, banned topics, and style — the AI handles everything. Smart filtering ignores spam, prioritizes real users, and escalates VIP comments. Connects via OAuth in one click. Built for creators, brands, and agencies managing multiple accounts.",
    features: [
      { title: "AI Auto-Replies", desc: "Instant, contextual responses to every comment. 24/7, no breaks." },
      { title: "Boost Engagement", desc: "Algorithm loves active accounts. More replies = more reach." },
      { title: "Brand-Safe", desc: "Set tone, banned topics, and style. Your brand voice, automated." },
      { title: "Analytics Dashboard", desc: "Track every reply, sentiment, and engagement metric in real-time." },
      { title: "Smart Filtering", desc: "Ignore spam, prioritize real users, escalate VIP comments." },
      { title: "1-Click Connect", desc: "Connect your Instagram in seconds via OAuth. No passwords shared." },
    ],
    useCases: ["Instagram creators", "Influencers", "Brands", "Social media agencies", "Content creators"],
    techStack: ["Claude API", "Instagram Graph API", "OAuth 2.0", "Next.js", "PostgreSQL", "Redis"],
    pricing: { code: 179, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   INSTAGRAM OAUTH      |
     |  1-Click Connect       |
     +----------+-------------+
                |
     +----------+-------------+
     |   REELS AGENT CORE     |
     |  +------------------+  |
     |  | Comment Monitor  |  |
     |  | Brand Voice AI   |  |
     |  | Spam Filter      |  |
     |  | Reply Generator  |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | AUTO    ||  SMART   |
     | REPLY   ||  FILTER  |
     +---------++-----------+
     |Context  ||Spam Block |
     |Tone     ||VIP Detect |
     |24/7     ||Escalate   |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |   ANALYTICS DASHBOARD |
     |  Replies . Sentiment  |
     +-----------------------+`,
    available: true,
  },
  {
    id: "shop-bot",
    name: "Shop Bot",
    tagline: "Telegram Sales Bot with Crypto Payments",
    category: "Bots",
    description: "Telegram shopping bot with product catalog, AI sales consultant, and USDC ERC20 payment verification.",
    longDescription: "Shop Bot is a production-ready Telegram sales bot with a built-in product catalog, AI-powered sales consultant (Claude), and blockchain payment processing via USDC ERC20. Supports deep linking from your website, multilingual interface (EN/RU/UA), automatic transaction verification via Etherscan, and commander notifications on every sale. FSM-based purchase flow handles the entire customer journey from browsing to payment to delivery.",
    features: [
      { title: "Product Catalog", desc: "Browse products by category with inline keyboards. Deep link support from website." },
      { title: "Crypto Payments", desc: "USDC ERC20 payments with automatic Etherscan verification." },
      { title: "AI Sales Consultant", desc: "Claude-powered chat that answers product questions using SPIN selling methodology." },
      { title: "Multilingual", desc: "Auto-detects language from Telegram. Supports EN, RU, UA with per-user override." },
      { title: "Deep Linking", desc: "Direct links to product cards and checkout from your website or ads." },
      { title: "Commander Alerts", desc: "Instant Telegram notifications on new sales, leads, and AI conversations." },
    ],
    useCases: ["Digital product sales", "AI product stores", "Telegram commerce", "Crypto-native businesses", "SaaS sales"],
    techStack: ["Python", "aiogram 3", "Claude API", "Etherscan API", "Docker", "httpx"],
    pricing: { code: 299, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   TELEGRAM CLIENT      |
     |  Deep Link . Catalog   |
     +----------+-------------+
                |
     +----------+-------------+
     |   SHOP BOT CORE        |
     |  +------------------+  |
     |  | Catalog Browser  |  |
     |  | FSM Buy Flow     |  |
     |  | AI Consultant    |  |
     |  | Language Engine   |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | PAYMENT ||  AI SALES |
     | ENGINE  ||  CONSULT  |
     +---------++-----------+
     |Etherscan||Claude API |
     |USDC ERC ||SPIN Method|
     |Verify TX||Chat Hist  |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |   DELIVERY & NOTIFY  |
     |  Token . Download    |
     +-----------------------+`,
    available: true,
  },
  {
    id: "salon-call-bot",
    name: "Salon Call Bot",
    tagline: "AI Phone Agent for Salons",
    category: "Voice AI",
    description: "AI voice agent that makes outbound calls to confirm, remind, and reschedule salon appointments.",
    longDescription: "Salon Call Bot is an AI-powered phone agent controlled via Telegram. Select a contact, describe the task, and the bot initiates a real phone call with natural voice dialogue. Built on Twilio for telephony, OpenAI Whisper for speech recognition, Claude for conversation intelligence, and ElevenLabs for natural voice synthesis. Pre-built scenarios include appointment confirmation, reminders, rescheduling, and custom tasks. The agent speaks conversational Russian with a friendly personality.",
    features: [
      { title: "Outbound AI Calls", desc: "Initiate real phone calls from Telegram. Full voice dialogue with AI agent." },
      { title: "Natural Voice", desc: "ElevenLabs multilingual TTS with fallback to OpenAI. Sounds human, not robotic." },
      { title: "Speech Recognition", desc: "OpenAI Whisper STT with silence detection and turn management." },
      { title: "Pre-built Scenarios", desc: "Confirm booking, 2-hour reminder, reschedule, or custom task." },
      { title: "Telegram Control", desc: "Select contact, input task, confirm call, receive transcript — all in Telegram." },
      { title: "Call Transcripts", desc: "Full conversation transcript delivered to Telegram after each call." },
    ],
    useCases: ["Beauty salons", "Dental clinics", "Medical offices", "Service businesses", "Appointment-based businesses"],
    techStack: ["Python", "Twilio", "OpenAI Whisper", "Claude API", "ElevenLabs", "aiohttp", "FFmpeg"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   TELEGRAM CONTROL     |
     |  Contact . Task . Go   |
     +----------+-------------+
                |
     +----------+-------------+
     |   CALL ORCHESTRATOR    |
     |  Twilio Media Streams  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | WHISPER ||  CLAUDE   |
     |   STT   ||  BRAIN    |
     +---------++-----------+
     |Russian  ||Scenarios  |
     |Silence  ||Confirm    |
     |Detect   ||Reschedule |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |   ELEVENLABS TTS     |
     |  Voice . Lip-sync    |
     +----------+-----------+
                |
     +----------+-----------+
     |   TRANSCRIPT DELIVERY|
     |  Telegram . History   |
     +-----------------------+`,
    available: false,
  },
  {
    id: "bot-factory",
    name: "Bot Factory",
    tagline: "Multi-Tenant Bot Platform",
    category: "AI Infrastructure",
    description: "One platform, unlimited AI bots. Multi-tenant architecture with per-client config, analytics, and admin API.",
    longDescription: "Bot Factory is a multi-tenant Telegram bot platform that lets you create unlimited AI-powered bots for different clients without separate deployments. Each client gets their own system prompt, welcome message, AI model, daily limits, and analytics — all managed through a REST API. Supports two modes: multi-tenant (single bot with deep links) and hybrid (clients bring their own bot token). Built for agencies and SaaS operators who need to scale bot deployments.",
    features: [
      { title: "Multi-Tenant Architecture", desc: "One deployment serves unlimited clients. Each client isolated with own config." },
      { title: "Per-Client AI Config", desc: "Custom system prompt, AI model, welcome message, and daily limits per client." },
      { title: "Admin REST API", desc: "Full CRUD for clients, users, analytics. Token-based auth. FastAPI." },
      { title: "Hybrid Mode", desc: "Clients can use shared bot OR bring their own bot token with webhook routing." },
      { title: "Analytics Dashboard", desc: "Daily stats per client: messages, unique users, token usage." },
      { title: "Rate Limiting", desc: "Per-user daily message limits. Tiered plans: free, pro, enterprise." },
    ],
    useCases: ["Bot agencies", "SaaS platforms", "White-label solutions", "Enterprise bot deployments", "Consulting firms"],
    techStack: ["Python", "FastAPI", "aiogram 3", "SQLite", "OpenRouter", "Pydantic", "uvicorn"],
    pricing: { code: 499, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   ADMIN API (FastAPI)  |
     |  CRUD . Auth . Stats   |
     +----------+-------------+
                |
     +----------+-------------+
     |   BOT FACTORY CORE     |
     |  +------------------+  |
     |  | Client Router    |  |
     |  | AI Engine        |  |
     |  | Rate Limiter     |  |
     |  | Analytics        |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | MULTI-  ||  HYBRID   |
     | TENANT  ||  WEBHOOK  |
     +---------++-----------+
     |DeepLink ||Own Token  |
     |Shared   ||Client Bot |
     |Bot      ||Routing    |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |   SQLITE DATABASE     |
     |  Clients . Users . Msg|
     +-----------------------+`,
    available: false,
  },
  {
    id: "reels-factory",
    name: "Reels Factory",
    tagline: "AI Video Production Pipeline",
    category: "Content Automation",
    description: "Photo + text → Instagram Reels with lip-sync, subtitles, and voice clone. Fully automated.",
    longDescription: "Reels Factory is an AI content production pipeline that turns a photo and text into a ready-to-post Instagram Reel (9:16, 1080x1920). Send a photo and script via Telegram — the system generates speech with your cloned voice (ElevenLabs), creates lip-sync video (Sync Labs), adds auto-generated subtitles, and delivers the final MP4. Built for creators and agencies who need consistent video content at scale.",
    features: [
      { title: "Voice Clone TTS", desc: "ElevenLabs multilingual voice cloning. Sounds exactly like you." },
      { title: "Lip-Sync Video", desc: "Sync Labs AI syncs lip movement to generated audio. Realistic talking head." },
      { title: "Auto Subtitles", desc: "SRT subtitles auto-generated from script text and video duration." },
      { title: "Photo → Video", desc: "Static photo auto-converted to video before lip-sync processing." },
      { title: "Instagram-Ready", desc: "Output: 9:16 aspect ratio, 1080x1920, H.264 MP4. Ready to post." },
      { title: "Telegram Bot", desc: "Send media + text to bot, receive finished Reel. Also works via CLI." },
    ],
    useCases: ["Instagram creators", "Content agencies", "Personal brands", "Marketing teams", "Social media managers"],
    techStack: ["Python", "ElevenLabs API", "Sync Labs API", "FFmpeg", "python-telegram-bot"],
    pricing: { code: 149, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   INPUT                |
     |  Photo + Script Text   |
     +----------+-------------+
                |
     +----------+-------------+
     |   TTS ENGINE           |
     |  ElevenLabs Voice Clone|
     +----------+-------------+
                |
     +----------+-------------+
     |   LIP-SYNC ENGINE      |
     |  Sync Labs AI          |
     |  Photo → Video → Sync  |
     +----------+-------------+
                |
     +----------+-------------+
     |   POST-PRODUCTION      |
     |  +------------------+  |
     |  | FFmpeg Pipeline  |  |
     |  | Scale 9:16       |  |
     |  | Embed Audio      |  |
     |  | Burn Subtitles   |  |
     |  +------------------+  |
     +----------+-------------+
                |
     +----------+-------------+
     |   OUTPUT               |
     |  MP4 1080x1920 H.264   |
     +-----------------------+`,
    available: false,
  },
  {
    id: "motivator-bot",
    name: "Motivator Bot",
    tagline: "AI Coach & Accountability Partner",
    category: "Bots",
    description: "AI accountability coach that reads your Todoist tasks and sends personalized micro-steps every hour.",
    longDescription: "Motivator Bot is an AI-powered Telegram coach that connects to your Todoist and sends personalized micro-steps every hour. Instead of vague motivation, it analyzes your actual tasks and generates specific, doable actions (5-15 min each). Supports work modes (working/paused/free), task completion from Telegram, and a status dashboard. Built for entrepreneurs and professionals who struggle with procrastination and need an accountability partner.",
    features: [
      { title: "Micro-Step Generation", desc: "AI analyzes your Todoist task and generates one concrete 10-min action step." },
      { title: "Smart Task Picking", desc: "Prioritizes by urgency. Avoids repeating nudges within 3 hours." },
      { title: "Work Modes", desc: "Working (auto-resumes 2h), Paused (1h/2h), Free (receives nudges)." },
      { title: "Todoist Integration", desc: "View all tasks, mark complete from Telegram. Two-way sync." },
      { title: "Hourly Nudges", desc: "Scheduled reminders with AI-generated action steps. Configurable interval." },
      { title: "Status Dashboard", desc: "Current mode, task count, last nudge, nudge counter — all in one view." },
    ],
    useCases: ["Entrepreneurs", "Freelancers", "Students", "Remote workers", "Anyone fighting procrastination"],
    techStack: ["Python", "python-telegram-bot", "Claude API", "Todoist API", "httpx"],
    pricing: { code: 79, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   TODOIST API          |
     |  Tasks . Projects      |
     +----------+-------------+
                |
     +----------+-------------+
     |   MOTIVATOR CORE       |
     |  +------------------+  |
     |  | Task Picker      |  |
     |  | AI Step Generator|  |
     |  | Mode Manager     |  |
     |  | Scheduler        |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | CLAUDE  ||  TELEGRAM |
     |  API    ||  BOT UI   |
     +---------++-----------+
     |Micro-stp||Buttons    |
     |Context  ||Dashboard  |
     |Persona  ||Tasks List |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |   NUDGE SCHEDULER    |
     |  Hourly . Smart Pick |
     +-----------------------+`,
    available: false,
  },
  {
    id: "intake-bot",
    name: "AI Intake Bot",
    tagline: "Voice/Text → Structured Tasks",
    category: "Business Automation",
    description: "Turn raw ideas into structured, actionable tasks with AI routing and Todoist integration.",
    longDescription: "AI Intake Bot transforms chaotic ideas into production-ready tasks. Send a voice message, text, or YouTube link — AI analyzes it, asks clarifying questions, builds a detailed concept, and creates a prioritized task in Todoist with automatic agent assignment. Supports 3-phase idea development (Explore → Expand → Ready), multi-task splitting, and conversation memory for context-aware follow-ups.",
    features: [
      { title: "Voice Input", desc: "Send a voice message — AI transcribes via Whisper and structures it into tasks." },
      { title: "YouTube Analysis", desc: "Paste a link — AI extracts key ideas and action items from any video." },
      { title: "3-Phase Development", desc: "Explore → Expand → Ready. AI asks smart questions to refine your idea." },
      { title: "Auto-Routing", desc: "AI assigns tasks to the right agent or team member automatically." },
      { title: "Todoist Integration", desc: "Tasks appear instantly in your project management with priority and assignee." },
      { title: "Conversation Memory", desc: "Remembers recent tasks for context-aware follow-up discussions." },
    ],
    useCases: ["Idea capture on the go", "Team task delegation", "YouTube research → action items", "Voice-first project management", "Multi-agent task routing"],
    techStack: ["Python", "aiogram 3", "OpenRouter / Claude", "OpenAI Whisper", "Todoist API", "Docker"],
    pricing: { code: 149, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "Contact for setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `     +------------------------+
     |   TELEGRAM CLIENT      |
     |  Voice . Text . Link   |
     +----------+-------------+
                |
     +----------+-------------+
     |   INTAKE BOT CORE      |
     |  +------------------+  |
     |  | Whisper STT      |  |
     |  | YouTube Extract  |  |
     |  | AI Questioner    |  |
     |  | Concept Builder  |  |
     |  +------------------+  |
     +-----+--------+--------+
           |        |
     +-----+---++---+-------+
     | TODOIST ||  AI ROUTE |
     | API     ||  ENGINE   |
     +---------++-----------+
     |Priority ||Agent Match|
     |Assignee ||Context    |
     |Deadline ||Memory     |
     +----+----++----+------+
          |          |
     +----+----------+------+
     |   TASK DISPATCH       |
     |  Agents . Dashboard   |
     +-----------------------+`,
    available: true,
  },
  {
    id: "subscription-guard",
    name: "Subscription Guard Bot",
    tagline: "Automated Paid Telegram Channel Access",
    category: "Telegram Bots",
    description: "Bot-gatekeeper for paid Telegram channels. Auto-adds users after crypto payment, removes access on expiry.",
    longDescription: "Subscription Guard Bot is a fully automated access management system for paid Telegram channels. It handles the entire subscription lifecycle: crypto payment (USDC/USDT), instant channel invite, expiry tracking, and automatic removal. Zero manual work for the channel owner. Set up once — runs forever.",
    features: [
      { title: "Crypto Payments", desc: "Accepts USDC/USDT on ERC20/TRC20. Payment confirmation in under 3 minutes." },
      { title: "Auto-Invite", desc: "User pays → instantly receives channel invite link. No manual approvals." },
      { title: "Subscription Tracking", desc: "Tracks expiry dates, sends renewal reminders 3 days before expiry." },
      { title: "Auto-Removal", desc: "Removes non-paying users from channel automatically on expiry." },
      { title: "Multi-Channel Support", desc: "One bot manages multiple paid channels with different pricing." },
      { title: "Admin Dashboard", desc: "View all subscribers, revenue, and expiry dates via bot commands." },
    ],
    useCases: ["Paid Telegram channels", "Trading signals", "Exclusive communities", "Online courses", "Premium content"],
    techStack: ["Python", "aiogram", "PostgreSQL", "Docker", "USDC/USDT ERC20"],
    pricing: { code: 249, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "1-2 hours setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `
    +------------------+
    |   SUBSCRIBER     |
    |  Sends /start    |
    +--------+---------+
             |
    +--------v---------+
    |  GUARD BOT       |
    |  Shows pricing   |
    |  Generates       |
    |  payment address |
    +--------+---------+
             |
    +--------v---------+    +------------------+
    |  PAYMENT MONITOR |    |  TELEGRAM API    |
    |  Watches wallet  +--->+  Sends invite    |
    |  Confirms in     |    |  link to user    |
    |  ~3 min          |    +------------------+
    +--------+---------+
             |
    +--------v---------+
    |  SUBSCRIPTION DB |
    |  Stores expiry   |
    |  Sends reminders |
    |  Auto-removes    |
    +------------------+`,
    available: false,
  },
  {
    id: "content-writer-bot",
    name: "AI Content Writer Bot",
    tagline: "Posts in Your Channel's DNA",
    category: "AI Content",
    description: "AI that learns your channel's style and generates on-brand posts, captions, and threads automatically.",
    longDescription: "AI Content Writer Bot studies your existing content — posts, tone, style, audience reactions — and generates new content that sounds exactly like you. Feed it a topic, a link, or a keyword. It produces ready-to-post content for Telegram, Instagram, or Twitter. Built for channel owners who want to post consistently without spending hours writing.",
    features: [
      { title: "Style Learning", desc: "Analyzes your last 100+ posts to extract your unique voice, tone, and structure." },
      { title: "Multi-Format Output", desc: "Generates Telegram posts, Instagram captions, Twitter threads — all in one bot." },
      { title: "Topic Expansion", desc: "Give a keyword or URL — bot researches and writes a full post." },
      { title: "Hashtag & Emoji Logic", desc: "Adds relevant hashtags and emojis matching your channel's style." },
      { title: "One-Click Publish", desc: "Approve and publish directly from Telegram. No copy-pasting needed." },
      { title: "Content Calendar", desc: "Schedule posts in advance. Bot maintains consistent posting frequency." },
    ],
    useCases: ["Telegram channel owners", "Instagram bloggers", "Twitter/X accounts", "Brand accounts", "News channels"],
    techStack: ["Python", "Claude API", "aiogram", "Docker", "PostgreSQL"],
    pricing: { code: 199, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "2-3 hours setup" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `
    +--------------------+
    |  YOUR CHANNEL      |
    |  Last 100 posts    |
    +--------+-----------+
             |
    +--------v-----------+
    |  DNA ANALYZER      |
    |  Tone / Structure  |
    |  Emoji patterns    |
    |  Post length       |
    +--------+-----------+
             |
    +--------v-----------+    +------------------+
    |  AI WRITER         |    |  INPUT           |
    |  Claude API        +<---+  Topic / URL     |
    |  Generates post    |    |  Keyword         |
    |  in your style     |    +------------------+
    +--------+-----------+
             |
    +--------v-----------+
    |  REVIEW & PUBLISH  |
    |  Approve in TG     |
    |  Schedule or post  |
    |  immediately       |
    +--------------------+`,
    available: false,
  },
  {
    id: "booking-bot",
    name: "Appointment Booking Bot",
    tagline: "AI Receptionist for Your Business",
    category: "Business Automation",
    description: "Voice AI + Telegram bot that books appointments, manages schedule, and sends reminders. Works 24/7.",
    longDescription: "Appointment Booking Bot replaces your receptionist. Clients book via Telegram or phone call — the voice AI handles the conversation, checks availability, and confirms the appointment. The master gets a daily schedule in Telegram every morning. Automatic reminders reduce no-shows by 60%. Built for beauty salons, clinics, coaches, and any appointment-based business.",
    features: [
      { title: "Voice AI Calls", desc: "AI answers phone calls, conducts natural conversation, books appointments in real time." },
      { title: "Telegram Booking", desc: "Clients book via Telegram bot with calendar view and slot selection." },
      { title: "Smart Scheduling", desc: "Configure working hours, breaks, service durations. No double-bookings." },
      { title: "Auto-Reminders", desc: "Sends reminders to clients 24h and 2h before appointment. Reduces no-shows by 60%." },
      { title: "Daily Brief", desc: "Master receives full schedule for the day every morning via Telegram." },
      { title: "Multi-Language", desc: "Supports Russian, English, and Ukrainian out of the box." },
    ],
    useCases: ["Beauty salons", "Barbershops", "Dental clinics", "Coaches & therapists", "Medical offices"],
    techStack: ["Python", "aiogram", "Voice AI API", "Docker", "PostgreSQL", "Redis"],
    pricing: { code: 299, currency: "USD" },
    deliveryTime: { template: "Instant download", integration: "1 business day" },
    youtubeId: null,
    screenshots: [],
    contact: "https://t.me/shop_by_finekot_bot",
    diagram: `
    +------------------+    +------------------+
    |   PHONE CALL     |    |  TELEGRAM BOT    |
    |  Client calls    |    |  Client messages |
    |  your number     |    |  /book command   |
    +--------+---------+    +--------+---------+
             |                       |
    +--------v-----------+-----------v---------+
    |         BOOKING AI CORE                  |
    |  Checks availability . Books slot        |
    |  Sends confirmation . Updates calendar   |
    +--------+-----------+-----------+---------+
             |                       |
    +--------v---------+    +--------v---------+
    |   MASTER PANEL   |    |  CLIENT REMINDERS|
    |  Daily schedule  |    |  24h before      |
    |  Manage bookings |    |  2h before       |
    |  Edit slots      |    |  Post-visit msg  |
    +------------------+    +------------------+`,
    available: false,
  },
];

export function getProductById(id: string): ProductData | undefined {
  return productsData.find((p) => p.id === id);
}
