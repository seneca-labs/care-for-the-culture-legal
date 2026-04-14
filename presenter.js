document.addEventListener('DOMContentLoaded', function(){
  var params = new URLSearchParams(window.location.search);
  var mode = params.get('mode');
  if (!mode) return;

  var CH_AUDIENCE = 'cftc-audience';
  var CH_PREVIEW = 'cftc-preview';

  // ===== AUDIENCE MODE =====
  if (mode === 'audience') {
    var ch = new BroadcastChannel(CH_AUDIENCE);
    var slides = document.querySelectorAll('.slide');

    function getCurrent() {
      return Array.from(slides).findIndex(function(s){ return s.classList.contains('active'); });
    }

    function reportState() {
      ch.postMessage({ type: 'state', slide: getCurrent() });
    }

    ch.onmessage = function(e) {
      // 'nav' = call the existing navigate() which handles all sub-step animations
      if (e.data.type === 'nav' && typeof window.navigate === 'function') {
        window.navigate(e.data.dir);
        // Report back after a short delay so animations have started
        setTimeout(reportState, 50);
      }
      // 'goto' = hard jump (used for initial sync only)
      if (e.data.type === 'goto') {
        var target = e.data.slide;
        if (target >= 0 && target < slides.length) {
          // Reset all animation states
          document.querySelectorAll('.legal-slide').forEach(function(s){ s.classList.remove('legal-active'); });
          document.querySelectorAll('.legal-sub').forEach(function(s){ s.classList.remove('visible'); });
          slides.forEach(function(s){ s.classList.remove('active'); });
          slides[target].classList.add('active');
          var counter = document.getElementById('counter');
          var progress = document.getElementById('progress');
          if (counter) counter.textContent = (target+1) + ' / ' + slides.length;
          if (progress) progress.style.width = ((target+1)/slides.length*100) + '%';
          slides[target].querySelectorAll('img[src$=".gif"]').forEach(function(img){
            var src = img.src; img.src = ''; img.src = src;
          });
        }
        setTimeout(reportState, 50);
      }
      if (e.data.type === 'ping') {
        ch.postMessage({ type: 'pong', slide: getCurrent() });
      }
    };

    ch.postMessage({ type: 'ready', slide: getCurrent() });

    // Hide nav in audience mode
    var nav = document.querySelector('.nav');
    if (nav) nav.style.display = 'none';
    // Block keyboard nav so only presenter controls it
    document.addEventListener('keydown', function(e){ e.stopImmediatePropagation(); }, true);
    return;
  }

  // ===== PREVIEW MODE (for presenter iframe thumbnails) =====
  if (mode === 'preview-cur' || mode === 'preview-nxt') {
    var pch = new BroadcastChannel(CH_PREVIEW);
    var slides = document.querySelectorAll('.slide');
    var nav = document.querySelector('.nav');
    var counter = document.getElementById('counter');
    if (nav) nav.style.display = 'none';
    if (counter) counter.style.display = 'none';
    document.querySelector('.progress').style.display = 'none';

    function jumpTo(n) {
      if (n < 0 || n >= slides.length) return;
      slides.forEach(function(s){ s.classList.remove('active'); });
      document.querySelectorAll('.legal-slide').forEach(function(s){ s.classList.remove('legal-active'); });
      document.querySelectorAll('.legal-sub').forEach(function(s){ s.classList.remove('visible'); });
      slides[n].classList.add('active');
    }

    pch.onmessage = function(e) {
      if (mode === 'preview-cur' && e.data.type === 'show-current') jumpTo(e.data.slide);
      if (mode === 'preview-nxt' && e.data.type === 'show-next') jumpTo(e.data.slide);
    };
    document.addEventListener('keydown', function(e){ e.stopImmediatePropagation(); }, true);
    return;
  }

  // ===== PRESENTER MODE =====
  if (mode !== 'presenter') return;

  var totalSlides = document.querySelectorAll('.slide').length;
  var currentSlide = 0;
  var timerStart = Date.now();
  var lastPong = 0;

  // Notes data
  var N={
    0:{o:"Thanks for making time. This is a product update on Care for the Culture, and we've structured it specifically for a legal and compliance review.",n:"Frame expectations: this is a review document, not a pitch deck\nEvery slide was designed knowing they'd be reading it"},
    1:{o:"We'll start with the product, then move through backend, pilot posture, and the full legal section.",n:"Just a signpost, keep it brief"},
    2:{o:"The brief from the client was to get HIV prevention data into Freddie parties without it feeling like a health booth.",n:"Freddie is a telehealth PrEP provider, their events are nightlife activations, not clinics\nPhones already run the room, so we're replacing a behavior, not introducing one\nThe existing behavior is proximity apps with faceless profiles\nWe thought the kiosk could replace that dynamic with something more careful"},
    3:{o:"The common narrative for HIV prevention is fear-based. We wanted to avoid that.",n:"\"Show people where their community stands\" is the framing we designed around\nData is context, not the destination\nThe experience is the destination"},
    4:{o:"Everything on the data side comes from AIDSVu, a public dataset from Emory University.",g:"AIDSVu = the main public-facing visualization of HIV surveillance data in the US, published by county",n:"We pull directly from their spreadsheet, no derivation, no modeling\nPrevalence is cumulative (people currently living with HIV)\nNew diagnoses is this year only\nPrEP coverage is who's currently on prevention medication\n\"The gap\" = distance between new diagnoses and PrEP coverage\nPersonal answers are optional and collected privately"},
    5:{o:"This isn't a kiosk or an app. It's one system with two surfaces.",n:"Kiosk is the entry point, phone browser is the extension\nSame backend for both\nNo app download, intentional for privacy and friction\nOnly required step is taking a photo"},
    6:{o:"Eleven steps total. The highlighted ones feed the data personalization layer.",n:"Photo, zip, and PrEP answer shape steps 6, 7, and 8\nEverything downstream of step 5 is optional\nUser can opt out at any step without losing the experience"},
    7:{o:"Next we'll walk through the product, with legal notes on each slide.",n:"Signpost, keep it brief"},
    8:{o:"Before we collect anything, we start with the why.",g:"TCPA = Telephone Consumer Protection Act\nPre-capture = consent language shown before taking phone number\n18+ age gate = for non-21+ venues",n:"Users see what they'll be asked before they're asked\nOpt-out is equal-weight, no dark patterns\nTCPA and age gate get fuller treatment in Privacy"},
    9:{o:"First data card. The national PrEP story from 2012 to today.",g:"MLR = Medical, Legal, Regulatory review for user-facing pharma content",n:"Unbranded disease awareness, no product names\nSlider shows PrEP totals over time from AIDSVu\nNeed guidance on MLR scope: which surfaces, what turnaround"},
    10:{o:"This is where it gets personal. The map shows HIV prevalence and PrEP coverage for the user's county.",n:"250 dots, ratioed from AIDSVu numbers\nOrange = HIV prevalence, green = PrEP coverage\nEvery dot is a calculation, not a real person or place\n\"Proportional, not geographic\" on every map\n\"Per 100K\" next to every rate"},
    11:{o:"Four swipes show PrEP coverage by race, age, gender, and overall.",n:"Still AIDSVu data, still aggregate\nNothing at the individual level\nWe never store identity data linked to user answers"},
    12:{o:"This is the output. A photo card, tinted by the user's PrEP answer.",n:"Four colors: green (on PrEP), orange (heard of it), warm (learning), neutral (opted out)\nTint is subtle, key never published outside onboarding flow\nCard looks like a party photo, intentional\nIf pushed on tint: harm reduction, not perfect obscurity"},
    13:{o:"The data stays constant. The storytelling changes based on the answer.",n:"Four variants, none mention any product by name\nAll unbranded disease awareness\nEvery copy path goes through MLR before launch"},
    14:{o:"Three states: feed, data cards, and map toggle.",n:"Feed visibility is always opt-in\nTakedown process for bystanders and participants\nMore in Privacy section"},
    15:{o:"Short section, one slide. Explicit about scope.",n:"Signpost, keep it brief"},
    16:{o:"NYC and LA at Freddie events. We want to name the bigger opportunity but nothing ships beyond that without a fresh legal review.",g:"HCP = Healthcare Provider. Medical conferences like IDWeek.",n:"Three blocks: Freddie parties, where it could go, what has to happen first\n\"What has to happen first\" is deliberately non-committal about your team's role\nScope of review agreed on case by case"},
    17:{o:"Three slides: data movement, data roles, and methodology.",n:"Signpost, keep it brief"},
    18:{o:"Four columns: consent, collection, storage, deletion. I'll walk through deletion.",g:"AES-256 = encryption standard for classified data\nTLS 1.2+ = secures data in transit",n:"Most data deleted within 24 hours\nPhotos stay until morning after, then pulled\nException: TCPA consent ledger persists\nLedger in separate store, no join key back\nIf asked how long: four years (federal TCPA limitations period)"},
    19:{o:"This addresses the controller and processor question directly.",g:"Controller = determines purposes of processing\nProcessor = processes on behalf of controller\nDPIA = Data Protection Impact Assessment",n:"Proposed: your team is controller, we and Majority are processors\nRedlines welcome\nSession ID links data during event, deleted at purge\nWe'd like your DPIA template\nBreach response: 24h notification, 48h forensics"},
    20:{o:"Every number traces back to the AIDSVu spreadsheet. No AI, no modeling.",n:"Slider: national PrEP totals 2012-2023\nCommunity map: prevalence, PrEP, new DX per county\nGap ratio: direct division of two published numbers\nIf asked: it's math, not inference"},
    21:{o:"Longest section. Ten slides. First names every framework, rest go deeper.",n:"Signpost, keep it brief"},
    22:{o:"Most important slide. Names every framework we believe applies. None solved. All need your guidance.",g:"FDA OPDP = Office of Prescription Drug Promotion\nAKS = Anti-Kickback Statute\nSunshine Act = reporting transfers of value to physicians\nBIPA = Biometric Information Privacy Act (IL)\nCUBI = Capture or Use of Biometric Identifiers (TX)",n:"FDA OPDP: designed as unbranded, OPDP attaches if anything reads as branded\nAKS: Freddie prescribes your products, chain needs compliance analysis\nSunshine Act: separate from AKS but adjacent\nHIV Confidentiality: state-level, more in two slides\nBiometric: NYC local law, mapped to exemption\nTCPA: is morning text informational or marketing?"},
    23:{o:"Three risks on the data side, about how users might misread visualizations.",n:"\"Per 100K\" on every rate\n\"Proportional, not geographic\" on every map\nGap ratio is simple division"},
    24:{o:"Privacy in two slides. First: preventing unintended exposure.",n:"PrEP status: color only, never text, key never published\nScreenshots: explicit opt-in warning\nMorning text: neutral sender, preview, different number option\nBystanders: venue signage + takedown\nMid-event removal: tap on kiosk or ask staffer, one-tap SMS link"},
    25:{o:"Second privacy slide: how we collect, not what we display.",g:"CPRA = California Privacy Rights Act\nSPI = Sensitive Personal Information (health + sexual orientation)\nPrEP answer qualifies on both counts",n:"Onboarding explains everything before input\n\"Prefer not to say\" is equal-sized\nTCPA language before phone number entry\nAge gate for non-21+ venues\nDesigned around CPRA right to limit SPI use"},
    26:{o:"State HIV laws are stricter than general privacy law. We're taking them seriously.",g:"27-F = NY Public Health Law Article 27-F (since 1989)\nPHI = Protected Health Information\nWe're not under HIPAA but treating PrEP status as PHI",n:"Two open questions for NY healthcare counsel:\n  1. Kiosk operator as \"health or social service\" provider?\n  2. \"I'm on PrEP\" inside HIV-related information definition?\nDesigning as if answer to both is yes\nState-by-state memo before expansion\nOur posture is a values position, not a legal claim"},
    27:{o:"Four rows: storage, purging, language, claims.",n:"Photos: morning after\nEverything else: 24 hours\nTCPA ledger: four years, isolated\nWe say \"aware,\" never \"protected\"\nNo second-person health claims\nImpact screen is metaphor, not efficacy"},
    28:{o:"Exact phrases at each touchpoint. Proposed defaults, redlines welcome.",n:"Six touchpoints: onboarding, feed, SMS in, SMS out, prefer not to say, removal\nNever say: \"Protective,\" \"At risk,\" \"You should get on PrEP,\" \"Your status\""},
    29:{o:"Six blocks: encryption, purge, PII co-location, contractual, insurance, breach.",g:"PII = Personally Identifiable Information\nCo-location = storing PII pieces together linking to one person",n:"Encryption: AES-256 + TLS 1.2+\nPII: session ID links during event, deleted at purge, nothing survives\nConsent ledger is only persistent store\nIndemnification: we and Majority indemnify your team\nInsurance: $5M+ cyber liability\nBreach: 24h notification, 48h forensics"},
    30:{o:"Modeled on a pattern we built at Google for event-based data collection.",n:"Lightweight consent, agree-to-continue, plain language\n8th-grade reading level\n24 hours max retention\nOpt-out: skip any step, reply STOP, no penalty"},
    31:{o:"That's the deck. Happy to take questions.",n:"Don't pitch next steps\nDon't ask for a decision\nLet them lead"}
  };

  var GEN=[
    {t:"Redirect phrase",c:"\"That's one of the items we've flagged for your team's guidance.\" Redirects any framework question back to Items We've Identified."},
    {t:"Phrase to avoid",c:"Never say \"We're compliant with X.\" Instead: \"we've designed around X\" or \"we sit inside the exemption for X\" or \"we've flagged X for your guidance.\""},
    {t:"Tint pushback",c:"\"You're right that anyone who's been through the flow knows the key. The tint is harm reduction, not perfect obscurity.\" Don't claim the tint is secret."},
    {t:"Unanswered question",c:"Write it down. \"That's a good question, I'll follow up in writing.\" Don't improvise legal positions."},
    {t:"Timeline",c:"\"We'd want to come back with a revised deck reflecting your guidance before we talk dates.\""}
  ];

  // Build UI
  document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="presenter.css">');
  var bp = window.location.pathname;

  document.body.innerHTML =
    '<div class="presenter-wrap">'
    +'<div class="presenter-left">'
    +'<div class="presenter-slide-frame"><iframe id="pf-cur" src="'+bp+'?mode=preview-cur"></iframe></div>'
    +'<div class="presenter-next"><span class="presenter-next-label">NEXT</span><iframe id="pf-nxt" src="'+bp+'?mode=preview-nxt"></iframe></div>'
    +'<div class="presenter-meta"><span class="presenter-counter" id="p-cnt">Slide 1 of '+totalSlides+'</span><span class="presenter-timer" id="p-tmr">00:00</span></div>'
    +'</div>'
    +'<div class="presenter-right">'
    +'<div class="presenter-sync"><div class="presenter-sync-dot disconnected" id="s-dot"></div><span class="presenter-sync-text" id="s-txt">Waiting for audience</span></div>'
    +'<div class="presenter-opener" id="p-opn"></div>'
    +'<div class="presenter-gloss" id="p-gls" style="display:none"></div>'
    +'<div class="presenter-notes" id="p-nts"></div>'
    +'</div>'
    +'</div>'
    +'<div class="presenter-general" id="g-pnl"><button class="presenter-general-close" id="g-cls">&times;</button><div id="g-cnt"></div></div>'
    +'<div class="presenter-footer">'
    +'<button id="b-prv">&larr; Previous</button>'
    +'<span class="presenter-footer-hint">&larr; &rarr; arrows &bull; space next &bull; esc reset timer &bull; g general notes</span>'
    +'<button id="b-nxt">Next &rarr;</button>'
    +'</div>';

  document.getElementById('b-prv').onclick=function(){navDir(-1);};
  document.getElementById('b-nxt').onclick=function(){navDir(1);};
  document.getElementById('g-cls').onclick=function(){document.getElementById('g-pnl').classList.remove('visible');};

  // General notes
  var gh='';GEN.forEach(function(g){gh+='<h3>'+g.t+'</h3><p>'+g.c+'</p>';});
  document.getElementById('g-cnt').innerHTML=gh;

  // Channels
  var chAud = new BroadcastChannel(CH_AUDIENCE);
  var chPrev = new BroadcastChannel(CH_PREVIEW);

  chAud.onmessage=function(e){
    if(e.data.type==='pong'||e.data.type==='ready'){
      lastPong=Date.now();
      document.getElementById('s-dot').className='presenter-sync-dot connected';
      document.getElementById('s-txt').textContent='Audience connected';
      // On first connect, hard-sync to current slide
      chAud.postMessage({type:'goto',slide:currentSlide});
    }
    // Audience reports its actual slide after navigating (may differ if sub-animation consumed the click)
    if(e.data.type==='state'){
      var reportedSlide = e.data.slide;
      if(reportedSlide !== currentSlide){
        currentSlide = reportedSlide;
        render();
        chPrev.postMessage({type:'show-current',slide:currentSlide});
        chPrev.postMessage({type:'show-next',slide:Math.min(currentSlide+1,totalSlides-1)});
      }
    }
  };

  setInterval(function(){chAud.postMessage({type:'ping'});},2000);
  setInterval(function(){
    if(Date.now()-lastPong>5000){
      document.getElementById('s-dot').className='presenter-sync-dot disconnected';
      document.getElementById('s-txt').textContent='Audience disconnected';
    }
  },3000);

  // Timer
  setInterval(function(){
    var e=Math.floor((Date.now()-timerStart)/1000);
    document.getElementById('p-tmr').textContent=String(Math.floor(e/60)).padStart(2,'0')+':'+String(e%60).padStart(2,'0');
  },1000);

  function navDir(dir){
    // Send navigate direction to audience (handles sub-step animations)
    chAud.postMessage({type:'nav',dir:dir});
    // Audience will report back its actual slide via 'state' message
    // which triggers render() and preview updates
  }

  function jumpTo(n){
    // Hard jump (for Home/End keys)
    if(n<0)n=0;if(n>=totalSlides)n=totalSlides-1;
    currentSlide=n;
    render();
    chAud.postMessage({type:'goto',slide:n});
    chPrev.postMessage({type:'show-current',slide:n});
    chPrev.postMessage({type:'show-next',slide:Math.min(n+1,totalSlides-1)});
  }

  function render(){
    document.getElementById('p-cnt').textContent='Slide '+(currentSlide+1)+' of '+totalSlides;
    var s=N[currentSlide]||{o:'',n:'',g:''};
    document.getElementById('p-opn').textContent='"'+(s.o||'')+'"';
    var gl=document.getElementById('p-gls');
    if(s.g){gl.style.display='block';gl.innerHTML='<p>'+fmt(s.g)+'</p>';}else{gl.style.display='none';}
    document.getElementById('p-nts').innerHTML=fmtNotes(s.n);
  }

  // Keyboard
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();navDir(1);}
    else if(e.key==='ArrowLeft'){e.preventDefault();navDir(-1);}
    else if(e.key==='Home'){e.preventDefault();jumpTo(0);}
    else if(e.key==='End'){e.preventDefault();jumpTo(totalSlides-1);}
    else if(e.key==='Escape'){e.preventDefault();timerStart=Date.now();}
    else if(e.key==='g'){e.preventDefault();document.getElementById('g-pnl').classList.toggle('visible');}
  });

  function fmt(t){
    if(!t)return'';
    return t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  }
  function fmtNotes(t){
    if(!t)return'';
    var lines=t.split('\n');
    var html='<ul>';
    lines.forEach(function(l){l=l.trim();if(l)html+='<li>'+l.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')+'</li>';});
    html+='</ul>';
    return html;
  }

  // Initial sync after iframes load
  setTimeout(function(){
    chPrev.postMessage({type:'show-current',slide:0});
    chPrev.postMessage({type:'show-next',slide:1});
  },1000);

  render();
});
