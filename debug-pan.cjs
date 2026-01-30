const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Wait for canvas to load
  await page.waitForSelector('canvas', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));

  // Get viewport dimensions
  const viewport = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  console.log('Viewport:', viewport);
  console.log('Center:', centerX, centerY);

  // Take initial screenshot
  await page.screenshot({ path: 'debug-1-initial.png' });
  console.log('Screenshot 1: Initial state');

  // Zoom in using mouse wheel
  console.log('Zooming in...');
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel({ deltaY: -100 });
    await new Promise(r => setTimeout(r, 100));
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'debug-2-zoomed.png' });
  console.log('Screenshot 2: After zoom');

  // Try to pan LEFT (drag from center to right)
  console.log('Panning LEFT (drag right)...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  for (let i = 0; i < 20; i++) {
    await page.mouse.move(centerX + (i * 20), centerY);
    await new Promise(r => setTimeout(r, 50));
  }
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'debug-3-pan-left.png' });
  console.log('Screenshot 3: After pan left');

  // Try to pan RIGHT (drag from center to left)
  console.log('Panning RIGHT (drag left)...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  for (let i = 0; i < 40; i++) {
    await page.mouse.move(centerX - (i * 20), centerY);
    await new Promise(r => setTimeout(r, 50));
  }
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'debug-4-pan-right.png' });
  console.log('Screenshot 4: After pan right');

  // Try to pan UP (drag down)
  console.log('Panning UP (drag down)...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  for (let i = 0; i < 20; i++) {
    await page.mouse.move(centerX, centerY + (i * 20));
    await new Promise(r => setTimeout(r, 50));
  }
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'debug-5-pan-up.png' });
  console.log('Screenshot 5: After pan up');

  // Try to pan DOWN (drag up)
  console.log('Panning DOWN (drag up)...');
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  for (let i = 0; i < 40; i++) {
    await page.mouse.move(centerX, centerY - (i * 20));
    await new Promise(r => setTimeout(r, 50));
  }
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'debug-6-pan-down.png' });
  console.log('Screenshot 6: After pan down');

  console.log('Done! Check debug-*.png files');

  await browser.close();
})();
