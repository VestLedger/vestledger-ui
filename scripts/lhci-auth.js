module.exports = async (browser) => {
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem(
      'user',
      JSON.stringify({
        name: 'Lighthouse User',
        email: 'lighthouse@vestledger.local',
        role: 'gp',
      })
    );
  });

  await page.close();
};
