const portfinder = require('portfinder');
const puppeteer = require('puppeteer');

const app = require('../meadowlark');

let server = null;
let port = null;

describe('basic nav in the site', () => {
  beforeEach(async () => {
    port = await portfinder.getPortPromise();
    server = app.listen(port);
  });

  afterEach(() => {
    server.close();
  });

  it('should link home page to about page', async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http:localhost:${port}`);
    await Promise.all([
      page.waitForNavigation(),
      page.click('[data-testid="about"]'),
    ]);
    expect(page.url()).toBe(`http://localhost:${port}/about`);
    await browser.close();
  });
});
