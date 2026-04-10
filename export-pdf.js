const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 16:9 viewport at 1920x1080
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  const filePath = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 15000 });

  // Wait for fonts and animations
  await new Promise(r => setTimeout(r, 2000));

  // Get total slide count
  const totalSlides = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log(`Found ${totalSlides} slides`);

  // Hide nav buttons and counter for export
  await page.evaluate(() => {
    document.querySelector('.nav').style.display = 'none';
    document.querySelector('.counter').style.display = 'none';
    document.querySelector('.progress').style.display = 'none';
  });

  // Capture each slide as a screenshot, then combine into PDF
  const screenshots = [];

  for (let i = 0; i < totalSlides; i++) {
    // Navigate to slide
    await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach(s => s.classList.remove('active'));
      slides[idx].classList.add('active');
      // Force stagger animations to complete instantly
      const staggerItems = slides[idx].querySelectorAll('.stagger > *');
      staggerItems.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.transition = 'none';
      });
    }, i);

    // Wait for render
    await new Promise(r => setTimeout(r, 400));

    const screenshot = await page.screenshot({ type: 'png', fullPage: false });
    screenshots.push(screenshot);
    console.log(`Captured slide ${i + 1}/${totalSlides}`);
  }

  // Now create a PDF by loading each screenshot as a full-page image
  const pdfPage = await browser.newPage();
  await pdfPage.setViewport({ width: 1920, height: 1080 });

  // Build an HTML page with all screenshots as full-bleed pages
  const imagesHtml = screenshots.map((buf, i) => {
    const b64 = buf.toString('base64');
    return `<div class="page"><img src="data:image/png;base64,${b64}"></div>`;
  }).join('\n');

  const html = `<!DOCTYPE html><html><head><style>
    * { margin: 0; padding: 0; }
    @page { size: 1920px 1080px; margin: 0; }
    .page { width: 1920px; height: 1080px; page-break-after: always; overflow: hidden; }
    .page:last-child { page-break-after: avoid; }
    .page img { width: 100%; height: 100%; object-fit: cover; display: block; }
  </style></head><body>${imagesHtml}</body></html>`;

  await pdfPage.setContent(html, { waitUntil: 'networkidle0' });

  const outputPath = path.resolve(__dirname, 'care-for-the-culture-deck.pdf');
  await pdfPage.pdf({
    path: outputPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log(`PDF exported to: ${outputPath}`);
  await browser.close();
})();
