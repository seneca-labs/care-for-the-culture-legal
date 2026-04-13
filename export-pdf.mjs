import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = `file://${path.resolve(__dirname, 'index.html')}`;
const outputPath = path.resolve(__dirname, 'care-for-the-culture-deck.pdf');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for GIFs/images to load (longer for GIF first frames)
  await new Promise(r => setTimeout(r, 5000));

  const total = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log(`Found ${total} slides`);

  // Convert the deck to a printable stacked layout and force ALL animated elements visible
  await page.evaluate(() => {
    // Remove overflow hidden from body
    document.body.style.overflow = 'visible';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'visible';
    document.documentElement.style.height = 'auto';

    const deck = document.querySelector('.deck');
    deck.style.position = 'relative';
    deck.style.width = '100vw';
    deck.style.height = 'auto';

    // Hide nav, progress, counter
    const nav = document.querySelector('.nav');
    const progress = document.querySelector('.progress');
    const counter = document.querySelector('.counter');
    if (nav) nav.style.display = 'none';
    if (progress) progress.style.display = 'none';
    if (counter) counter.style.display = 'none';

    // Stack all slides vertically
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide) => {
      slide.style.position = 'relative';
      slide.style.opacity = '1';
      slide.style.pointerEvents = 'all';
      slide.style.width = '100vw';
      slide.style.height = '100vh';
      slide.style.pageBreakAfter = 'always';
      slide.style.pageBreakInside = 'avoid';
      slide.style.overflow = 'hidden';
      slide.classList.add('active');
    });

    // Force ALL elements with opacity:0 or translateY to be visible
    // This catches dir-tables, data-phases, path-rows, stagger children, etc.
    document.querySelectorAll('.dir-table, .data-phase, .path-row, .answer-col').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });

    // Force stagger children visible
    document.querySelectorAll('.stagger > *').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.style.transitionDelay = '0ms';
    });

    // Swap GIFs for static PNGs so they render in PDF
    document.querySelectorAll('img[src$=".gif"]').forEach(img => {
      const src = img.getAttribute('src');
      const staticSrc = src.replace('.gif', '-static.png');
      img.setAttribute('src', staticSrc);
    });

    // Force any remaining inline opacity:0 elements
    document.querySelectorAll('[style*="opacity: 0"], [style*="opacity:0"]').forEach(el => {
      if (el.id !== 'flow-bracket') {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });

    // Force animated bars to full width
    document.querySelectorAll('.anim-bar').forEach(el => {
      const w = getComputedStyle(el).getPropertyValue('--bar-w');
      if (w) el.style.width = w;
    });

    // Force anim-card, anim-num, anim-ring visible
    document.querySelectorAll('.anim-card').forEach(el => {
      el.style.opacity = '1'; el.style.transform = 'scale(1)';
    });
    document.querySelectorAll('.anim-num').forEach(el => {
      el.style.opacity = '1'; el.style.transform = 'translateY(0)';
    });
    document.querySelectorAll('.anim-ring').forEach(el => {
      const offset = getComputedStyle(el).getPropertyValue('--ring-offset');
      if (offset) el.style.strokeDashoffset = offset;
    });

    // Force approach slide cards visible
    const commonCard = document.getElementById('common-card');
    const ourCard = document.getElementById('our-card');
    const approachClosing = document.getElementById('approach-closing');
    if (commonCard) { commonCard.style.opacity = '0.45'; commonCard.style.transform = 'translateY(0)'; commonCard.style.filter = 'grayscale(0.6)'; }
    if (ourCard) { ourCard.style.opacity = '1'; ourCard.style.transform = 'translateY(0)'; }
    if (approachClosing) { approachClosing.style.opacity = '1'; }

    // Force dashboard views visible
    document.querySelectorAll('.dash-view-a').forEach(el => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
    document.querySelectorAll('.dash-view-b').forEach(el => { el.style.opacity = '0'; });
    document.querySelectorAll('.dash-dot').forEach(el => { el.style.opacity = '0.85'; el.style.transform = 'scale(1)'; });

    // Highlight the flow rows
    ['jr-3','jr-4','jr-5'].forEach(id => {
      const el = document.getElementById(id);
      if(el){ el.style.background='rgba(181,51,36,0.08)'; el.style.borderRadius='6px'; el.style.borderLeft='3px solid var(--coral)'; }
    });
    ['jr-6','jr-7','jr-8'].forEach(id => {
      const el = document.getElementById(id);
      if(el){ el.style.background='rgba(124,181,24,0.08)'; el.style.borderRadius='6px'; el.style.borderLeft='3px solid var(--teal)'; }
    });

    // Position and show the flow bracket
    const flowBracket = document.getElementById('flow-bracket');
    if (flowBracket) {
      const jr3 = document.getElementById('jr-3');
      const jr5 = document.getElementById('jr-5');
      if (jr3 && jr5) {
        const container = jr3.parentElement;
        const topOffset = jr3.offsetTop - container.offsetTop;
        const height = (jr5.offsetTop + jr5.offsetHeight) - jr3.offsetTop;
        flowBracket.style.marginTop = topOffset + 'px';
        const inner = flowBracket.querySelector('div');
        if (inner) inner.style.minHeight = height + 'px';
      }
      flowBracket.style.opacity = '1';
    }
  });

  // Extra wait for static PNGs to load after GIF swap
  await new Promise(r => setTimeout(r, 3000));

  await page.pdf({
    path: outputPath,
    width: '1440px',
    height: '900px',
    printBackground: true,
    preferCSSPageSize: false,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log(`PDF saved to: ${outputPath}`);
  await browser.close();
})();
