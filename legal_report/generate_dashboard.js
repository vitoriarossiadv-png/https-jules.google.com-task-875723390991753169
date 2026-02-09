const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Set viewport to ensure charts render nicely
        await page.setViewport({ width: 1200, height: 1600 });

        const filePath = path.resolve(__dirname, 'dashboard.html');
        const fileUrl = `file://${filePath}`;

        console.log(`Loading: ${fileUrl}`);
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });

        // Optional: Wait a bit for chart animations to complete if needed
        await new Promise(r => setTimeout(r, 1000));

        // Generate PDF
        const pdfPath = path.resolve(__dirname, 'Dashboard_2026.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                bottom: '10mm',
                left: '10mm',
                right: '10mm'
            }
        });
        console.log(`PDF generated at: ${pdfPath}`);

        // Generate Screenshot for verification
        const screenshotPath = path.resolve(__dirname, 'dashboard_screenshot.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        console.log(`Screenshot generated at: ${screenshotPath}`);

        await browser.close();

    } catch (error) {
        console.error('Error generating Dashboard:', error);
        process.exit(1);
    }
})();
