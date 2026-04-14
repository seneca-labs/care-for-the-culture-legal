export const speakerNotes = {
  0: {
    opener: "Thanks for making time. This is a product update on Care for the Culture, and we've structured it specifically for a legal and compliance review.",
    notes: "- Frame expectations: this is a review document, not a pitch deck\n- Every slide was designed knowing they'd be reading it"
  },
  1: {
    opener: "We'll start with the product, then move through backend, pilot posture, and the full legal section.",
    notes: "- Just a signpost, keep it brief"
  },
  2: {
    opener: "The brief from the client was to get HIV prevention data into Freddie parties without it feeling like a health booth.",
    notes: "- Freddie is a telehealth PrEP provider, their events are nightlife activations, not clinics\n- Insight: phones already run the room, so we're replacing a behavior, not introducing one\n- The existing behavior is proximity apps with faceless profiles\n- We thought the kiosk could replace that dynamic with something more careful"
  },
  3: {
    opener: "The common narrative for HIV prevention is fear-based. We wanted to avoid that.",
    notes: "- \"Show people where their community stands\" is the framing we designed around\n- Data is context, not the destination\n- The experience is the destination"
  },
  4: {
    opener: "Everything on the data side comes from AIDSVu, which is a public dataset from Emory University's Rollins School of Public Health.",
    gloss: "**AIDSVu** = the main public-facing visualization of HIV surveillance data in the US, published by county",
    notes: "- We pull directly from their spreadsheet, no derivation, no modeling\n- Prevalence is cumulative (people currently living with HIV)\n- New diagnoses is this year only\n- PrEP coverage is who's currently on prevention medication\n- \"The gap\" is our framing for the distance between new diagnoses and PrEP coverage\n- Personal answers from participants are optional and collected privately"
  },
  5: {
    opener: "This isn't a kiosk or an app. It's one system with two surfaces.",
    notes: "- Kiosk is the entry point, phone browser is the extension\n- Same backend for both\n- No app download, intentional for privacy and friction\n- Only required step is taking a photo"
  },
  6: {
    opener: "Eleven steps total. The highlighted ones feed the data personalization layer.",
    notes: "- Photo, zip, and PrEP answer shape steps 6, 7, and 8\n- Everything downstream of step 5 is optional\n- User can opt out at any step without losing the experience"
  },
  7: {
    opener: "Next we'll walk through the product, with legal notes on each slide where we've flagged something to return to.",
    notes: "- Signpost, keep it brief"
  },
  8: {
    opener: "Before we collect anything, we start with the why.",
    gloss: "**TCPA** = Telephone Consumer Protection Act, the federal law governing SMS consent\n**Pre-capture** = we show consent language before taking the phone number, not after\n**18+ age gate** = for non-21+ venues like Pride events and conferences",
    notes: "- Users see what they'll be asked before they're asked\n- Opt-out is equal-weight with opt-in, no dark patterns\n- TCPA and age gate both get fuller treatment in the Privacy section"
  },
  9: {
    opener: "This is the first data card users see. It's the national PrEP story from 2012 to today.",
    gloss: "**MLR** = Medical, Legal, Regulatory review, the pharma industry's standard process for reviewing any user-facing content that touches a product or disease state. Every surface a patient or consumer sees typically goes through MLR.",
    notes: "- Unbranded disease awareness, no product names anywhere\n- Slider shows PrEP totals over time, pulled from AIDSVu\n- We need guidance on MLR scope: which surfaces, what turnaround"
  },
  10: {
    opener: "This is where it gets personal. The map shows HIV prevalence and PrEP coverage for the user's county.",
    notes: "- 250 dots, ratioed from AIDSVu numbers\n- Orange for HIV prevalence, green for PrEP coverage\n- Every dot is a calculation, not a real person or place\n- \"Proportional, not geographic\" appears on every map\n- \"Per 100K\" appears next to every rate so users don't read rates as headcounts"
  },
  11: {
    opener: "Four swipes show how PrEP coverage breaks down by race, age, gender, and overall in the user's county.",
    notes: "- Still AIDSVu data, still aggregate\n- Nothing at the individual level\n- We never store identity data linked to the user's answers"
  },
  12: {
    opener: "This is the output. A photo card, tinted by the user's PrEP answer.",
    notes: "- Four colors: green for on PrEP, orange for heard of it, warm for learning, neutral for opted out\n- The tint is subtle, the key is never published anywhere except inside the onboarding flow\n- Card looks like a party photo, which is intentional\n- If pushed on the tint being a de facto disclosure: honest answer is harm reduction, not perfect obscurity. We reduce the out-of-context disclosure risk compared to a labeled photo."
  },
  13: {
    opener: "The data stays constant. The storytelling around the data changes based on the user's answer.",
    notes: "- Four variants: \"I'm on it,\" \"I've heard of it,\" \"What's PrEP?,\" \"Prefer not to say\"\n- None of the four variants mention any product by name\n- All unbranded disease awareness\n- Every copy path would go through MLR before launch"
  },
  14: {
    opener: "Three states: feed, data cards, and map toggle.",
    notes: "- Feed visibility is always opt-in\n- Takedown process exists for bystanders and participants\n- More on the takedown process in the Privacy section"
  },
  15: {
    opener: "Short section, one slide. We want to be explicit about scope.",
    notes: "- Signpost, keep it brief"
  },
  16: {
    opener: "The pilot is NYC and LA, at Freddie events. We want to name the bigger opportunity, but we also want to be clear that nothing ships beyond that without a fresh legal review.",
    gloss: "**HCP** = Healthcare Provider. Medical conferences like IDWeek are what we mean.",
    notes: "- Three blocks: Freddie parties, where it could go, what has to happen first\n- The \"what has to happen first\" block is deliberately non-committal about your team's exact role\n- We don't want to commit your team to a gate you don't want to own\n- Scope of review is something we'd agree on case by case"
  },
  17: {
    opener: "Three slides here: data movement, data roles, and methodology.",
    notes: "- Signpost, keep it brief"
  },
  18: {
    opener: "Four columns: consent, collection, storage, deletion. I'll walk through deletion since that's the one that usually gets questions.",
    gloss: "**AES-256** = the encryption standard the federal government uses for classified data\n**TLS 1.2+** = the protocol that secures data in transit between your device and a server\nBoth are table stakes for any modern application.",
    notes: "- Most data deleted within 24 hours\n- Photos stay on the feed until the morning after, then pulled\n- One exception: TCPA consent ledger must persist to defend against TCPA complaints\n- Ledger lives in a separate store with no join key back to any other user data\n- If asked how long: four years, the federal TCPA limitations period (some vendors use five as a buffer)"
  },
  19: {
    opener: "This slide addresses the controller and processor question directly, which is usually the first thing privacy teams ask.",
    gloss: "**Controller** = the entity that determines the purposes of data processing\n**Processor** = the entity that processes data on behalf of a controller\nStandard GDPR and CPRA vocabulary.\n**DPIA** = Data Protection Impact Assessment, a formal privacy risk assessment document",
    notes: "- Our proposed position: your team is controller, we and Majority are processors\n- Redlines welcome\n- Session linkage: during the event, a session ID links photo, zip, PrEP answer, phone\n- At purge, everything deleted together except the consent ledger\n- We'd like your privacy team's DPIA template\n- Breach response: 24-hour notification, 48-hour forensics"
  },
  20: {
    opener: "Every number on every map traces back to the AIDSVu spreadsheet. No AI, no modeling.",
    notes: "- Slider uses national PrEP totals from 2012 to 2023\n- Community map uses prevalence, PrEP, and new diagnoses per county\n- Gap ratio is direct division of two published numbers\n- If asked: it's math, not inference"
  },
  21: {
    opener: "This is the longest section. Ten slides. The first names every framework we know applies, the rest address each in more depth.",
    notes: "- Signpost, keep it brief"
  },
  22: {
    opener: "This is the most important slide in the deck. It names every framework we believe applies. None of these are solved. All need your team's guidance.",
    gloss: "**FDA OPDP** = Office of Prescription Drug Promotion, the FDA division that regulates pharmaceutical advertising\n**AKS** = Anti-Kickback Statute, federal law prohibiting inducements to prescribe or use federally reimbursed healthcare products\n**Sunshine Act** = federal law requiring pharma companies to report payments or transfers of value to physicians and teaching hospitals. \"Open Payments\" is the database.\n**BIPA** = Biometric Information Privacy Act (Illinois). Private right of action, real statutory damages.\n**CUBI** = Capture or Use of Biometric Identifiers Act (Texas). Equivalent to BIPA.",
    notes: "- FDA OPDP: designed as unbranded, but if anything reads as branded, OPDP rules attach\n- MLR: already covered on slide 10\n- AKS: Freddie prescribes your products, so the chain from event to prescription needs commercial compliance analysis\n- Sunshine Act: separate from AKS but adjacent\n- HIV Confidentiality: state-level laws, stricter than general privacy law, more in two slides\n- Biometric Privacy: NYC has a local law, we've mapped our photo pipeline to the exemption\n- DPIA: already covered on slide 20\n- TCPA: already covered on slide 9. Open question: is our morning text informational or marketing"
  },
  23: {
    opener: "Three risks on the data side, all about how users might misread the visualizations.",
    notes: "- \"Per 100K\" labels on every rate\n- \"Proportional, not geographic\" on every map\n- Gap ratio is simple division, not derived analytics"
  },
  24: {
    opener: "Privacy is in two slides. First is about preventing unintended exposure. Second is about collection and consent.",
    notes: "- PrEP status on photo cards: color only, never text, key never published\n- Screenshotted tinted photos: explicit opt-in warning, we control our surfaces not screenshots\n- Morning text outing risk: neutral sender name, neutral preview, option to send to a different number\n- Bystanders in photos: venue signage plus takedown process\n- Mid-event removal: tap \"remove my photo\" on a kiosk or ask a staffer, one-tap removal link via SMS if phone provided, photo pulled from every feed within seconds"
  },
  25: {
    opener: "Second privacy slide is about how we collect, not what we display.",
    gloss: "**CPRA** = California Privacy Rights Act, which amended the California Consumer Privacy Act\n**SPI** = Sensitive Personal Information, a category CPRA added\nSPI includes health information and information about sex life or sexual orientation.\nThe PrEP answer probably qualifies on both counts.",
    notes: "- Onboarding explains everything before any input\n- \"Prefer not to say\" is equal-sized with other options\n- TCPA language appears before the phone number is entered\n- Age gate at the kiosk for any non-21+ venue\n- Flow designed around the CPRA right to limit use and disclosure of SPI"
  },
  26: {
    opener: "State HIV laws are stricter than general privacy law. This is where we take them seriously.",
    gloss: "**27-F** = New York Public Health Law Article 27-F, the HIV confidentiality statute, in effect since 1989\n**PHI** = Protected Health Information, the term HIPAA uses for health data with legal protections\nWe're not technically under HIPAA, but we're choosing to treat PrEP status as if it were PHI.",
    notes: "- Two open questions for NY healthcare counsel:\n  1. Whether the kiosk operator counts as a provider of a \"health or social service\" under the statute\n  2. Whether \"I'm on PrEP\" falls inside the definition of HIV-related information (which is built around testing and diagnosis, not prevention)\n- We're designing as if the answer to both is yes\n- State-by-state memo before any expansion (CA, TX, FL, IL at minimum)\n- Our posture block is a values position, not a legal claim: we treat PrEP status as PHI regardless of whether any statute technically requires it"
  },
  27: {
    opener: "Four rows: storage, purging, language, claims.",
    notes: "- Photos the morning after\n- Everything else within 24 hours\n- Exception: TCPA consent ledger is four years in an isolated store\n- Language: we say \"aware,\" never \"protected\"\n- No second-person health claims\n- Impact screen is a metaphor, not an efficacy statement"
  },
  28: {
    opener: "These are the exact phrases we'd use at each touchpoint. Proposed defaults, legal redlines welcome.",
    notes: "- Six touchpoints: onboarding, feed, SMS opt-in, SMS opt-out, prefer not to say, mid-event removal\n- We never say:\n  - \"Protective\" or \"you're protected\"\n  - \"At risk\" or \"your community is in danger\"\n  - \"You should get on PrEP\" or \"talk to your doctor\"\n  - \"Your status\" or \"your risk level\""
  },
  29: {
    opener: "Six blocks: encryption, purge, no PII co-location, contractual, insurance, breach response.",
    gloss: "**PII** = Personally Identifiable Information\n**Co-location** = storing pieces of PII together in a way that links them to one person",
    notes: "- Encryption is AES-256 and TLS 1.2+\n- PII co-location, honest version: during the event, a session ID links the data because the experience requires it. At purge, the session ID and all linked data are deleted. Nothing co-located survives the window.\n- Consent ledger is the only persistent store, no join key back to user data\n- Indemnification: we and Majority indemnify your team, carve-outs for gross negligence, terms to be finalized with counsel\n- Insurance: $5M+ cyber liability minimum, your team named as additional insured on request\n- Breach response: 24-hour notification, 48-hour forensics"
  },
  30: {
    opener: "Modeled on a pattern we built at Google for event-based data collection.",
    notes: "- Lightweight consent screen, agree-to-continue, plain language\n- 8th-grade reading level, one-sentence summary per clause\n- Retention is 24 hours max\n- Photos morning-after, phone after text\n- Opt-out is frictionless: skip any step, reply STOP, no penalty"
  },
  31: {
    opener: "That's the deck. Happy to take questions, and we're happy to come back with an updated version once you've had time to sit with this.",
    notes: "- Don't pitch next steps\n- Don't ask for a decision\n- Let them lead"
  }
};

export const generalNotes = {
  redirect: "**Phrase to have ready for \"what if\" questions:**\n\"That's one of the items we've flagged for your team's guidance.\"\nRedirects any framework question back to the Items We've Identified slide.",
  avoid: "**Phrase to avoid:**\n\"We're compliant with X\"\nInstead say: \"we've designed around X\" or \"we sit inside the exemption for X\" or \"we've flagged X for your guidance\"\nCompliance is something their counsel certifies, not something you assert.",
  tint_pushback: "**If a reviewer pushes on the tinted photo as a de facto disclosure:**\nAcknowledge the limitation directly.\n\"You're right that anyone who's been through the flow knows the key.\"\n\"The tint is harm reduction compared to a labeled photo, not perfect obscurity.\"\nDo not claim the tint is secret. It isn't.",
  unanswered: "**If a reviewer asks a question the deck doesn't answer:**\nWrite it down.\n\"That's a good question, I'll follow up in writing.\"\nDon't improvise legal positions in the room.",
  timeline: "**If a reviewer asks about timeline:**\n\"We'd want to come back with a revised deck reflecting your guidance before we talk dates.\""
};
