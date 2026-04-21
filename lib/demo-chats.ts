import type { Lang } from "./i18n";

interface DemoMessage {
  from: "bot" | "user";
  text: string;
}

interface DemoConfig {
  messages: DemoMessage[];
  tryLink: string;
  tryLabel: string;
}

const buyLink = (id: string) => `https://t.me/shop_by_finekot_bot?start=buy_${id}`;

const demoChatEN: Record<string, DemoConfig> = {
  "orban": {
    messages: [
      { from: "bot", text: "Send me a task — text, voice, or photo.\nI'll structure it and route to the right agent." },
      { from: "user", text: "Build a landing page for the new product launch, high priority" },
      { from: "bot", text: "Task structured:\n\n📋 Build landing page for product launch\n⚡ Priority: High\n🤖 Assigned to: T-1 (Fullstack)\n📁 Project: Marketing\n📅 Due: Tomorrow\n\nCreated in Todoist. T-1 will start shortly." },
      { from: "user", text: "Also research competitor pricing for AI tools" },
      { from: "bot", text: "Task structured:\n\n📋 Research competitor pricing — AI tools market\n⚡ Priority: Medium\n🤖 Assigned to: T-4 (Research)\n📁 Project: Strategy\n\nRouted to T-4. You'll get a report in the Dashboard." },
    ],
    tryLink: buyLink("orban"),
    tryLabel: "Meet Orban →",
  },
  "boris": {
    messages: [
      { from: "bot", text: "🌞 Good morning, Denys. I've been through your inbox and calendar. Want your morning brief?" },
      { from: "user", text: "yes" },
      { from: "bot", text: "📋 Today — 3 priorities:\n\n🔴 Sarah (TechFlow) waiting 2 days — $18k proposal, follow-up overdue\n🟡 10:30 call with Legion — pre-read: they killed the onboarding v2 idea last month, don't re-pitch it\n🟢 Andrey promised a Notion doc by EOD — still empty, nudge?\n\nInbox: 47 → 5 need you. Rest I've drafted replies for.\n\nShall I open Sarah's draft?" },
      { from: "user", text: "draft the reply to Sarah" },
      { from: "bot", text: "✍️ Draft in your voice:\n\n«Sarah — thanks for the patience. Scope is locked, sending the proposal by 18:00 CET today. One q before: are you still targeting the Q2 launch?»\n\n→ Send / Edit / Redo" },
    ],
    tryLink: buyLink("boris"),
    tryLabel: "Meet Boris →",
  },
  "eva": {
    messages: [
      { from: "bot", text: "📞 10:00 — calling mom (scheduled check-in)... 📲 connected, 8-min conversation complete." },
      { from: "user", text: "how was it?" },
      { from: "bot", text: "💗 She sounded good today. Talked about the tomato plants (new pride) and the weekend with Ira.\n\n✅ Blood pressure pill — taken at 8:45\n⚠️ Mentioned slight dizziness «earlier, passed now» — flagging for you\n📊 Mood: warm, talkative (↑ vs yesterday)\n\nShall I ping you tonight if dizziness comes back on the 19:00 call?" },
      { from: "user", text: "yes and remind me to send flowers this week" },
      { from: "bot", text: "🌷 Noted. I'll:\n1. Watch for dizziness keywords on the 19:00 call → alert you instantly\n2. Friday 14:00 — remind you «send mom flowers» with 3 local delivery options\n\nWeekly family report lands Sunday 10:00." },
    ],
    tryLink: buyLink("eva"),
    tryLabel: "Meet Eva →",
  },
  "david": {
    messages: [
      { from: "bot", text: "⚠️ Client pulse — 2 accounts went silent this week:\n\n🔴 Martin (Agency42) — 23 days silent, last invoice $8,400 pending\n🟡 Laura (BrightPath) — 18 days silent, renewal due in 9 days" },
      { from: "user", text: "draft a message to Martin" },
      { from: "bot", text: "✍️ Draft in your voice:\n\n«Martin — heads up, Q2 growth plan is ready whenever you're up for a call. Not pushing on the invoice yet, I know last quarter was wild. Just want to make sure you're not ghosting me because you're drowning 😄»\n\n→ Send via Telegram / Edit / Postpone\n\nP.S. Pulled tone from your last 6 messages to Martin — direct + warm." },
      { from: "user", text: "what about Laura?" },
      { from: "bot", text: "📊 Laura (BrightPath) profile:\n• Signed Jan 12, $2,400/mo\n• Last renewal blocker: wanted custom reporting → we built it in March\n• Last CSAT: 9/10\n\n💡 Move: remind her custom reports are live + offer a 2-call quarterly review. Draft ready?" },
    ],
    tryLink: buyLink("david"),
    tryLabel: "Meet David →",
  },
  "patrik": {
    messages: [
      { from: "bot", text: "🩺 New document ingested: CBC + ferritin, 2026-04-18. Indexed. Ask me anything." },
      { from: "user", text: "ferritin is 23, doctor said it's fine. is it?" },
      { from: "bot", text: "⚠️ Flagging a pattern from your history:\n\n📉 Ferritin timeline:\n• 2024-09: 68 ng/mL\n• 2025-06: 41 ng/mL\n• 2026-04: 23 ng/mL ← today\n\nThat's an 18-month drift toward depletion. Your last doctor saw today's number in isolation. Functional optimum for men your age: 80–150.\n\n💬 Ask your GP for transferrin saturation + CRP. Also check iron-blocker overlap (you started coffee-with-meals in Feb — correlated)." },
      { from: "user", text: "is this dangerous?" },
      { from: "bot", text: "🟡 Not emergency — not «fine» either.\n\nThink: low fuel, not engine failure. Common downstream effects: fatigue, cold hands, exercise intolerance, sleep quality drop — any of those feel familiar?\n\nThis isn't a diagnosis. It's context your GP didn't have. Follow-up labs in 6–8 weeks." },
    ],
    tryLink: buyLink("patrik"),
    tryLabel: "Meet Patrik →",
  },
  "taras": {
    messages: [
      { from: "bot", text: "Hi, I'm Taras 👋 Age profile: Sofia, 9. Ready for homework, stories, or just questions. What's up?" },
      { from: "user", text: "why does the sky change color at sunset" },
      { from: "bot", text: "Great question, Sofia 🌅\n\nThink of sunlight as a rainbow packed together. When the sun is high, blue light scatters most — that's why noon sky is blue.\n\nAt sunset, the sun is low, so light travels through MORE air. Blue scatters so much it gets «used up» along the way. Only red and orange reach your eyes 🟠\n\nWant to see it yourself? I can show a simple experiment with a glass of water + flashlight 🔦" },
      { from: "user", text: "yes and what about clouds" },
      { from: "bot", text: "Experiment:\n1. Fill a clear glass with water\n2. Shine a phone flashlight through it in a dark room\n3. Look from the side → bluish glow (that's scatter!)\n4. Look straight through → yellowish light (that's what gets through, like sunset)\n\n☁️ Sunset clouds: water droplets are bigger than air molecules, so they REFLECT the orange light from the low sun. That's why they glow pink & gold ✨\n\n(📩 your parents will see «Sofia learned about Rayleigh scattering today» in Sunday's digest)" },
    ],
    tryLink: buyLink("taras"),
    tryLabel: "Meet Taras →",
  },
  "ada": {
    messages: [
      { from: "bot", text: "🛰️ Ada ready. Fast or Deep Research?\n\nFast — 30s answer with sources\nDeep — 3–10min structured report" },
      { from: "user", text: "Deep: is the GLP-1 market peaking or still growing through 2027?" },
      { from: "bot", text: "⚙️ Deep Research in progress...\n• 27 sources pulled (Exa + Tavily + direct crawl)\n• Cross-verifying Bloomberg, Evaluate Pharma, JPM Healthcare 2026 deck, 4 earnings calls\n• 2 contradictions flagged" },
      { from: "user", text: "how long?" },
      { from: "bot", text: "📑 Report ready — 4m 12s.\n\n**GLP-1 market 2026–2027 outlook**\n\n🟢 Consensus (high confidence): $95B → $130B by end-2027, +37%\n🟡 Driver shift: weight-loss overtakes diabetes as #1 revenue segment Q3 2026\n🔴 Contradiction: Evaluate forecasts supply-unconstrained by mid-2026; JPM deck says 14 months minimum. Source review → JPM more grounded.\n\n❓ Open: oral GLP-1 readouts (Lilly orforglipron Ph3 — H2 2026)\n\n📤 Export: Markdown / Notion / Google Docs / Telegram?" },
    ],
    tryLink: buyLink("ada"),
    tryLabel: "Meet Ada →",
  },
  "hanna": {
    messages: [
      { from: "bot", text: "✍️ Voice profile loaded: you (42 samples, updated 3d ago). Punch style, first-person, no motivational fluff. What are we shipping?" },
      { from: "user", text: "post about why I stopped doing free consultations" },
      { from: "bot", text: "📝 Draft in your voice:\n\n---\nI stopped doing free consultations last year.\n\nNot because I'm too busy. Because I watched 80% of them turn into a 45-minute strategy session the person then took to a cheaper contractor.\n\nIf you can't afford $200 for the first call, you can't afford the work. If you can, you're pre-qualified. Both parties save 40 minutes and zero dignity.\n\nPeople respect what they pay for. Charging is uncomfortable. It's also correct.\n---\n\n📊 Hook strength: 8/10 (rule-break opener — your top-performing pattern)\n✅ Not a repeat — you haven't posted on pricing since Feb 11" },
      { from: "user", text: "adapt for LinkedIn — more professional" },
      { from: "bot", text: "📝 LinkedIn version:\n\n---\nI stopped offering free discovery calls last year.\n\nThe data was clear: ~80% converted into unpaid strategy sessions, with the work later going to lower-priced competitors.\n\nNow the first call is $200 — credited if we work together. Conversion to paid engagements is up 3.2×. Signal quality is incomparable.\n\nCharging for your expertise isn't gatekeeping. It's respect — for your time and for the client's commitment.\n---\n\n📌 Same core, tuned for LinkedIn. Ready to publish?" },
    ],
    tryLink: buyLink("hanna"),
    tryLabel: "Meet Hanna →",
  },
};

const demoChatRU: Record<string, DemoConfig> = {
  "orban": {
    messages: [
      { from: "bot", text: "Отправьте мне задачу — текст, голос или фото.\nЯ структурирую и направлю нужному агенту." },
      { from: "user", text: "Сделать лендинг для запуска нового продукта, высокий приоритет" },
      { from: "bot", text: "Задача структурирована:\n\n📋 Создать лендинг для запуска продукта\n⚡ Приоритет: Высокий\n🤖 Назначено: T-1 (Fullstack)\n📁 Проект: Маркетинг\n📅 Дедлайн: Завтра\n\nСоздано в Todoist. T-1 скоро приступит." },
      { from: "user", text: "Ещё исследуй цены конкурентов на AI-инструменты" },
      { from: "bot", text: "Задача структурирована:\n\n📋 Исследование цен конкурентов — рынок AI\n⚡ Приоритет: Средний\n🤖 Назначено: T-4 (Research)\n📁 Проект: Стратегия\n\nНаправлено T-4. Отчёт появится в Dashboard." },
    ],
    tryLink: buyLink("orban"),
    tryLabel: "Встретить Orban →",
  },
  "boris": {
    messages: [
      { from: "bot", text: "🌞 Доброе утро, Denys. Прошёлся по инбоксу и календарю. Дать утренний бриф?" },
      { from: "user", text: "давай" },
      { from: "bot", text: "📋 Сегодня — 3 приоритета:\n\n🔴 Сара (TechFlow) ждёт 2 дня — предложение на $18k, follow-up просрочен\n🟡 10:30 созвон с Legion — pre-read: месяц назад они зарубили идею онбординга v2, не поднимай\n🟢 Андрей обещал Notion-док к концу дня — пусто, пнуть?\n\nИнбокс: 47 → 5 требуют тебя. Остальным черновики готовы.\n\nОткрыть черновик для Сары?" },
      { from: "user", text: "напиши ответ Саре" },
      { from: "bot", text: "✍️ Черновик в твоём тоне:\n\n«Сара — спасибо за терпение. Скоуп зафиксировал, пришлю предложение сегодня до 18:00 CET. Один вопрос перед этим: вы всё ещё целитесь в Q2 запуск?»\n\n→ Отправить / Править / Переписать" },
    ],
    tryLink: buyLink("boris"),
    tryLabel: "Встретить Boris →",
  },
  "eva": {
    messages: [
      { from: "bot", text: "📞 10:00 — звоню маме (плановый check-in)... 📲 соединение, разговор 8 минут." },
      { from: "user", text: "как она?" },
      { from: "bot", text: "💗 Сегодня звучала хорошо. Рассказала про помидоры (новая гордость) и выходные с Ирой.\n\n✅ Таблетка от давления — принята в 8:45\n⚠️ Упомянула лёгкое головокружение «было, прошло» — флаг для тебя\n📊 Настроение: тёплое, болтливое (↑ ко вчера)\n\nПингануть тебя вечером, если головокружение вернётся на 19:00-звонке?" },
      { from: "user", text: "да и напомни в пятницу отправить цветы" },
      { from: "bot", text: "🌷 Принято. Я:\n1. Слежу за ключевыми словами про головокружение на 19:00-звонке → алерчу тебя моментально\n2. Пятница 14:00 — напомню «отправить маме цветы» + 3 варианта локальной доставки\n\nСемейный отчёт придёт в воскресенье 10:00." },
    ],
    tryLink: buyLink("eva"),
    tryLabel: "Встретить Eva →",
  },
  "david": {
    messages: [
      { from: "bot", text: "⚠️ Пульс клиентов — 2 аккаунта замолчали на этой неделе:\n\n🔴 Мартин (Agency42) — молчит 23 дня, последний инвойс $8,400 висит\n🟡 Лаура (BrightPath) — молчит 18 дней, renewal через 9 дней" },
      { from: "user", text: "напиши Мартину" },
      { from: "bot", text: "✍️ Черновик в твоём тоне:\n\n«Мартин — на связи, Q2 growth plan готов, созвонимся когда будешь готов. Инвойс не давлю, помню что прошлый квартал был жёстким. Просто убедиться что ты не гостишь меня потому что тонешь в работе 😄»\n\n→ Отправить в Telegram / Править / Отложить\n\nP.S. Подтянул тон из последних 6 твоих сообщений Мартину — прямо + тепло." },
      { from: "user", text: "а Лаура?" },
      { from: "bot", text: "📊 Профиль Лауры (BrightPath):\n• Подписана 12 января, $2,400/мес\n• Блокер на прошлом renewal: хотела кастомный репортинг → сделали в марте\n• Последний CSAT: 9/10\n\n💡 Ход: напомни что кастомный репорт запущен + предложи 2-звонковый квартальный review. Черновик готов?" },
    ],
    tryLink: buyLink("david"),
    tryLabel: "Встретить David →",
  },
  "patrik": {
    messages: [
      { from: "bot", text: "🩺 Новый документ загружен: общий анализ крови + ферритин, 18.04.2026. Проиндексирован. Спрашивай что угодно." },
      { from: "user", text: "ферритин 23, врач сказал всё ок. правда?" },
      { from: "bot", text: "⚠️ Паттерн из твоей истории:\n\n📉 Динамика ферритина:\n• 09.2024: 68 нг/мл\n• 06.2025: 41 нг/мл\n• 04.2026: 23 нг/мл ← сегодня\n\nЭто 18-месячный дрейф к истощению. Врач видел только сегодняшнюю цифру. Функциональный оптимум для мужчин твоего возраста: 80–150.\n\n💬 Запроси у терапевта: насыщение трансферрина + CRP. И проверь совпадение с блокаторами железа (ты начал кофе с едой в феврале — коррелирует)." },
      { from: "user", text: "это опасно?" },
      { from: "bot", text: "🟡 Не скорая — но и не «всё ок».\n\nАналогия: мало топлива, не поломка двигателя. Типичные последствия: усталость, холодные руки, непереносимость нагрузок, падение качества сна — что-то из этого знакомо?\n\nЭто не диагноз. Это контекст, которого у врача не было. Следующие анализы через 6–8 недель." },
    ],
    tryLink: buyLink("patrik"),
    tryLabel: "Встретить Patrik →",
  },
  "taras": {
    messages: [
      { from: "bot", text: "Привет, я Taras 👋 Профиль: София, 9 лет. Готова к урокам, историям или просто вопросам. Что интересно?" },
      { from: "user", text: "почему небо на закате меняет цвет" },
      { from: "bot", text: "Классный вопрос, Соня 🌅\n\nПредставь солнечный свет как сложенную радугу. Когда солнце высоко, синий цвет рассеивается сильнее всего — поэтому в полдень небо синее.\n\nНа закате солнце низко, и свет проходит через БОЛЬШЕ воздуха. Синий рассеивается так сильно, что «заканчивается» по пути. До твоих глаз долетают только красный и оранжевый 🟠\n\nХочешь увидеть сама? Я покажу простой опыт со стаканом воды и фонариком 🔦" },
      { from: "user", text: "да а облака" },
      { from: "bot", text: "Опыт:\n1. Налей прозрачный стакан воды\n2. Посвети фонариком телефона через него в тёмной комнате\n3. Смотри сбоку → голубоватое свечение (это рассеяние!)\n4. Смотри прямо → желтоватый свет (это то что проходит, как закат)\n\n☁️ Облака на закате: капельки воды больше молекул воздуха, поэтому они ОТРАЖАЮТ оранжевый свет от низкого солнца. Вот почему закатные облака розовые и золотые ✨\n\n(📩 мама/папа увидят «Соня сегодня изучила рэлеевское рассеяние» в воскресном дайджесте)" },
    ],
    tryLink: buyLink("taras"),
    tryLabel: "Встретить Taras →",
  },
  "ada": {
    messages: [
      { from: "bot", text: "🛰️ Ada готова. Fast или Deep Research?\n\nFast — ответ за 30 сек с источниками\nDeep — структурированный отчёт за 3–10 мин" },
      { from: "user", text: "Deep: рынок GLP-1 на пике или растёт до 2027?" },
      { from: "bot", text: "⚙️ Deep Research в работе...\n• 27 источников (Exa + Tavily + прямой краулинг)\n• Кросс-верификация Bloomberg, Evaluate Pharma, JPM Healthcare 2026 deck, 4 earnings-колла аналитиков\n• 2 противоречия на флаге" },
      { from: "user", text: "сколько ещё?" },
      { from: "bot", text: "📑 Отчёт готов — 4м 12с.\n\n**Рынок GLP-1 — прогноз 2026–2027**\n\n🟢 Консенсус (высокая достоверность): $95B → $130B к концу 2027, +37%\n🟡 Сдвиг драйверов: weight-loss обгоняет диабет как #1 сегмент выручки в Q3 2026\n🔴 Противоречие: Evaluate прогнозирует снятие дефицита к середине 2026; JPM deck — минимум 14 месяцев. Обзор источников → JPM более обоснован.\n\n❓ Открытое: рид-ауты пероральных GLP-1 (Lilly orforglipron Ph3 — H2 2026)\n\n📤 Экспорт: Markdown / Notion / Google Docs / Telegram?" },
    ],
    tryLink: buyLink("ada"),
    tryLabel: "Встретить Ada →",
  },
  "hanna": {
    messages: [
      { from: "bot", text: "✍️ Voice-профиль загружен: ты (42 примера, обновлён 3 дня назад). Панчи, первое лицо, без мотивационной воды. Что пишем?" },
      { from: "user", text: "пост почему я перестал давать бесплатные консультации" },
      { from: "bot", text: "📝 Черновик в твоём голосе:\n\n---\nЯ перестал давать бесплатные консультации год назад.\n\nНе потому что я слишком занят. А потому что смотрел как 80% из них превращаются в 45-минутную стратсессию, которую человек потом нёс более дешёвому подрядчику.\n\nЕсли тебе жалко $200 за первый звонок — ты не можешь позволить себе работу. Если не жалко — ты пре-квалифицирован. Обе стороны экономят 40 минут и ноль достоинства.\n\nЛюди ценят то, за что платят. Брать деньги — неуютно. И правильно.\n---\n\n📊 Сила хука: 8/10 (открытие через нарушение правила — твой топ-паттерн)\n✅ Без повтора — о прайсинге не писал с 11 февраля" },
      { from: "user", text: "адаптируй под LinkedIn — посерьёзнее" },
      { from: "bot", text: "📝 LinkedIn версия:\n\n---\nГод назад я перестал давать бесплатные discovery-звонки.\n\nДанные были однозначны: ~80% превращались в неоплачиваемые стратсессии, а работа уходила более дешёвым конкурентам.\n\nТеперь первый звонок — $200, засчитывается в оплату если работаем дальше. Конверсия в платные проекты выросла в 3.2×. Качество сигнала — несравнимо.\n\nБрать деньги за экспертизу — не gatekeeping. Это уважение: к твоему времени и к готовности клиента идти в работу.\n---\n\n📌 То же ядро, настроено под LinkedIn. Публикуем?" },
    ],
    tryLink: buyLink("hanna"),
    tryLabel: "Встретить Hanna →",
  },
};

const demoChatUA: Record<string, DemoConfig> = {
  "orban": {
    messages: [
      { from: "bot", text: "Надішліть мені задачу — текст, голос або фото.\nЯ структурую та спрямую потрібному агенту." },
      { from: "user", text: "Зробити лендинг для запуску нового продукту, високий пріоритет" },
      { from: "bot", text: "Задачу структуровано:\n\n📋 Створити лендинг для запуску продукту\n⚡ Пріоритет: Високий\n🤖 Призначено: T-1 (Fullstack)\n📁 Проєкт: Маркетинг\n📅 Дедлайн: Завтра\n\nСтворено в Todoist. T-1 скоро почне." },
      { from: "user", text: "Ще дослідити ціни конкурентів на AI-інструменти" },
      { from: "bot", text: "Задачу структуровано:\n\n📋 Дослідження цін конкурентів — ринок AI\n⚡ Пріоритет: Середній\n🤖 Призначено: T-4 (Research)\n📁 Проєкт: Стратегія\n\nСпрямовано T-4. Звіт з'явиться в Dashboard." },
    ],
    tryLink: buyLink("orban"),
    tryLabel: "Зустріти Orban →",
  },
  "boris": {
    messages: [
      { from: "bot", text: "🌞 Доброго ранку, Denys. Пройшовся по інбоксу та календарю. Дати ранковий бриф?" },
      { from: "user", text: "давай" },
      { from: "bot", text: "📋 Сьогодні — 3 пріоритети:\n\n🔴 Сара (TechFlow) чекає 2 дні — пропозиція на $18k, follow-up прострочений\n🟡 10:30 дзвінок з Legion — pre-read: місяць тому вони зарубали ідею онбордингу v2, не піднімай\n🟢 Андрій обіцяв Notion-док до кінця дня — порожньо, штовхнути?\n\nІнбокс: 47 → 5 вимагають тебе. Для решти чернетки готові.\n\nВідкрити чернетку для Сари?" },
      { from: "user", text: "напиши відповідь Сарі" },
      { from: "bot", text: "✍️ Чернетка у твоєму тоні:\n\n«Сара — дякую за терпіння. Скоуп зафіксував, пришлю пропозицію сьогодні до 18:00 CET. Одне питання перед цим: ви все ще цілитесь на Q2 запуск?»\n\n→ Надіслати / Правити / Переписати" },
    ],
    tryLink: buyLink("boris"),
    tryLabel: "Зустріти Boris →",
  },
  "eva": {
    messages: [
      { from: "bot", text: "📞 10:00 — дзвоню мамі (плановий check-in)... 📲 з'єднання, розмова 8 хвилин." },
      { from: "user", text: "як вона?" },
      { from: "bot", text: "💗 Сьогодні звучала добре. Розповіла про помідори (нова гордість) та вихідні з Ірою.\n\n✅ Таблетка від тиску — прийнята о 8:45\n⚠️ Згадала легке запаморочення «було, минуло» — прапор для тебе\n📊 Настрій: теплий, балакучий (↑ до вчора)\n\nПінгнути тебе ввечері, якщо запаморочення повернеться на 19:00-дзвінку?" },
      { from: "user", text: "так і нагадай у п'ятницю надіслати квіти" },
      { from: "bot", text: "🌷 Прийнято. Я:\n1. Стежу за ключовими словами про запаморочення на 19:00-дзвінку → алерчу тебе миттєво\n2. П'ятниця 14:00 — нагадаю «надіслати мамі квіти» + 3 варіанти локальної доставки\n\nСімейний звіт прийде в неділю 10:00." },
    ],
    tryLink: buyLink("eva"),
    tryLabel: "Зустріти Eva →",
  },
  "david": {
    messages: [
      { from: "bot", text: "⚠️ Пульс клієнтів — 2 акаунти замовкли цього тижня:\n\n🔴 Мартін (Agency42) — мовчить 23 дні, останній інвойс $8,400 висить\n🟡 Лаура (BrightPath) — мовчить 18 днів, renewal через 9 днів" },
      { from: "user", text: "напиши Мартіну" },
      { from: "bot", text: "✍️ Чернетка у твоєму тоні:\n\n«Мартін — на зв'язку, Q2 growth plan готовий, скликаємося коли будеш готовий. Інвойс не тисну, пам'ятаю що минулий квартал був жорстким. Просто переконатися що ти не гостиш мене бо тонеш у роботі 😄»\n\n→ Надіслати в Telegram / Правити / Відкласти\n\nP.S. Підтягнув тон з останніх 6 твоїх повідомлень Мартіну — прямо + тепло." },
      { from: "user", text: "а Лаура?" },
      { from: "bot", text: "📊 Профіль Лаури (BrightPath):\n• Підписана 12 січня, $2,400/міс\n• Блокер на минулому renewal: хотіла кастомний репортинг → зробили в березні\n• Остання CSAT: 9/10\n\n💡 Хід: нагадай що кастомний репорт запущено + запропонуй 2-дзвінковий квартальний review. Чернетка готова?" },
    ],
    tryLink: buyLink("david"),
    tryLabel: "Зустріти David →",
  },
  "patrik": {
    messages: [
      { from: "bot", text: "🩺 Новий документ завантажено: загальний аналіз крові + феритин, 18.04.2026. Проіндексовано. Питай будь-що." },
      { from: "user", text: "феритин 23, лікар сказав все ок. правда?" },
      { from: "bot", text: "⚠️ Патерн із твоєї історії:\n\n📉 Динаміка феритину:\n• 09.2024: 68 нг/мл\n• 06.2025: 41 нг/мл\n• 04.2026: 23 нг/мл ← сьогодні\n\nЦе 18-місячний дрейф до виснаження. Лікар бачив лише сьогоднішню цифру. Функціональний оптимум для чоловіків твого віку: 80–150.\n\n💬 Запроси у терапевта: насичення трансферину + CRP. І перевір збіг з блокаторами заліза (ти почав каву з їжею у лютому — корелює)." },
      { from: "user", text: "це небезпечно?" },
      { from: "bot", text: "🟡 Не швидка — але й не «все ок».\n\nАналогія: мало палива, не поломка двигуна. Типові наслідки: втома, холодні руки, непереносимість навантажень, падіння якості сну — щось із цього знайоме?\n\nЦе не діагноз. Це контекст, якого у лікаря не було. Наступні аналізи через 6–8 тижнів." },
    ],
    tryLink: buyLink("patrik"),
    tryLabel: "Зустріти Patrik →",
  },
  "taras": {
    messages: [
      { from: "bot", text: "Привіт, я Taras 👋 Профіль: Софія, 9 років. Готова до уроків, історій або просто питань. Що цікаво?" },
      { from: "user", text: "чому небо на заході змінює колір" },
      { from: "bot", text: "Класне питання, Соня 🌅\n\nУяви сонячне світло як складену веселку. Коли сонце високо, синій колір розсіюється найбільше — тому опівдні небо синє.\n\nНа заході сонце низько, і світло проходить через БІЛЬШЕ повітря. Синій розсіюється так сильно, що «закінчується» по дорозі. До твоїх очей долітають лише червоний та помаранчевий 🟠\n\nХочеш побачити сама? Я покажу простий дослід зі склянкою води та ліхтариком 🔦" },
      { from: "user", text: "так а хмари" },
      { from: "bot", text: "Дослід:\n1. Налий прозору склянку води\n2. Посвіти ліхтариком телефону крізь неї в темній кімнаті\n3. Дивись збоку → блакитне сяйво (це розсіювання!)\n4. Дивись прямо → жовтувате світло (це те що проходить, як захід)\n\n☁️ Хмари на заході: крапельки води більші за молекули повітря, тому вони ВІДБИВАЮТЬ помаранчеве світло від низького сонця. Ось чому західні хмари рожеві та золоті ✨\n\n(📩 мама/тато побачать «Соня сьогодні вивчила релеївське розсіювання» у недільному дайджесті)" },
    ],
    tryLink: buyLink("taras"),
    tryLabel: "Зустріти Taras →",
  },
  "ada": {
    messages: [
      { from: "bot", text: "🛰️ Ada готова. Fast чи Deep Research?\n\nFast — відповідь за 30 сек з джерелами\nDeep — структурований звіт за 3–10 хв" },
      { from: "user", text: "Deep: ринок GLP-1 на піку чи росте до 2027?" },
      { from: "bot", text: "⚙️ Deep Research у роботі...\n• 27 джерел (Exa + Tavily + прямий краулінг)\n• Крос-верифікація Bloomberg, Evaluate Pharma, JPM Healthcare 2026 deck, 4 earnings-колли аналітиків\n• 2 протиріччя на прапорі" },
      { from: "user", text: "скільки ще?" },
      { from: "bot", text: "📑 Звіт готовий — 4хв 12с.\n\n**Ринок GLP-1 — прогноз 2026–2027**\n\n🟢 Консенсус (висока достовірність): $95B → $130B до кінця 2027, +37%\n🟡 Зсув драйверів: weight-loss обганяє діабет як #1 сегмент виторгу в Q3 2026\n🔴 Протиріччя: Evaluate прогнозує зняття дефіциту до середини 2026; JPM deck — мінімум 14 місяців. Огляд джерел → JPM обґрунтованіший.\n\n❓ Відкрите: рід-аути пероральних GLP-1 (Lilly orforglipron Ph3 — H2 2026)\n\n📤 Експорт: Markdown / Notion / Google Docs / Telegram?" },
    ],
    tryLink: buyLink("ada"),
    tryLabel: "Зустріти Ada →",
  },
  "hanna": {
    messages: [
      { from: "bot", text: "✍️ Voice-профіль завантажено: ти (42 приклади, оновлений 3 дні тому). Панчі, перша особа, без мотиваційної води. Що пишемо?" },
      { from: "user", text: "пост чому я перестав давати безкоштовні консультації" },
      { from: "bot", text: "📝 Чернетка у твоєму голосі:\n\n---\nЯ перестав давати безкоштовні консультації рік тому.\n\nНе тому що я надто зайнятий. А тому що дивився як 80% з них перетворюються на 45-хвилинну стратсесію, яку людина потім несла дешевшому підряднику.\n\nЯкщо тобі шкода $200 за перший дзвінок — ти не можеш дозволити собі роботу. Якщо не шкода — ти пре-кваліфікований. Обидві сторони економлять 40 хвилин і нуль гідності.\n\nЛюди цінують те, за що платять. Брати гроші — некомфортно. І правильно.\n---\n\n📊 Сила хука: 8/10 (відкриття через порушення правила — твій топ-патерн)\n✅ Без повтору — про прайсинг не писав з 11 лютого" },
      { from: "user", text: "адаптуй під LinkedIn — серйозніше" },
      { from: "bot", text: "📝 LinkedIn версія:\n\n---\nРік тому я перестав давати безкоштовні discovery-дзвінки.\n\nДані були однозначні: ~80% перетворювались на неоплачувані стратсесії, а робота йшла дешевшим конкурентам.\n\nТепер перший дзвінок — $200, зараховується в оплату якщо працюємо далі. Конверсія в платні проєкти зросла в 3.2×. Якість сигналу — незрівнянна.\n\nБрати гроші за експертизу — не gatekeeping. Це повага: до твого часу і готовності клієнта йти в роботу.\n---\n\n📌 Те саме ядро, налаштоване під LinkedIn. Публікуємо?" },
    ],
    tryLink: buyLink("hanna"),
    tryLabel: "Зустріти Hanna →",
  },
};

const allDemoChats: Record<Lang, Record<string, DemoConfig>> = {
  EN: demoChatEN,
  RU: demoChatRU,
  UA: demoChatUA,
};

export function getDemoChat(productId: string, lang: Lang): DemoConfig | undefined {
  return allDemoChats[lang]?.[productId];
}

// backwards compat — used in ProductPageClient
export const demoChatData = demoChatEN;
