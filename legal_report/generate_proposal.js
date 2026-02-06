const puppeteer = require('puppeteer');
const path = require('path');
const { exec } = require('child_process');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        const filePath = path.resolve(__dirname, 'proposal.html');
        const fileUrl = `file://${filePath}`;

        console.log(`Loading: ${fileUrl}`);
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfPath = path.resolve(__dirname, 'Proposta_Aquisicao_Bonecos.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm'
            }
        });
        console.log(`PDF generated at: ${pdfPath}`);

        // Generate Screenshot for verification
        const screenshotPath = path.resolve(__dirname, 'proposal_screenshot.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        console.log(`Screenshot generated at: ${screenshotPath}`);

        await browser.close();

        // Zip the PDF
        const zipPath = path.resolve(__dirname, 'Proposta_Aquisicao_Bonecos.zip');
        exec(`zip "${zipPath}" "${pdfPath}"`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error zipping file: ${err}`);
                // Don't exit with error here, as PDF is the main goal
            } else {
                console.log(`PDF zipped successfully at: ${zipPath}`);
                console.log(stdout);
            }
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        process.exit(1);
    }
})();
