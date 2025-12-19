const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// --- SECURITY & PRODUCTION CONFIG ---
// Check ENV var OR command line flag (safer for Windows scripts)
// MOVED TO TOP to avoid ReferenceError
console.log('DEBUG: RAW ARGV:', process.argv);
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
console.log('DEBUG: DETECTED PRODUCTION MODE:', isProduction);

// Middleware
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});
app.use(cors());

// Increase limit for large HTML/Image payloads
app.use(bodyParser.json({ limit: '50mb' }));

// SPA Fallback (Must be after API routes)
if (isProduction) {
    console.log('🔒 SECURE MODE ENABLED');
    const basicAuth = require('express-basic-auth');

    // 1. Password Protection
    app.use(basicAuth({
        users: { 'admin': 'password' }, // Change this if you want!
        challenge: true,
        realm: 'AntigravitySecure'
    }));

    // 2. Serve Built Frontend (Single Port Architecture)
    app.use(express.static(path.join(__dirname, '../dist')));

    // Fallback for SPA (Catch-all)
    // NOTE: This must be checked LAST effectively, but middleware order matters.
    // However, for static files + API, usually we define API routes first.
    // But since this is inside an 'if', let's just register it.
    // Ideally catch-all is at the very end. 
}

// File Upload Config (Auto-Save)
// Project Root (Where package.json is, which is CWD)
const PROJECT_ROOT = process.cwd();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save directly to project root
        cb(null, PROJECT_ROOT);
    },
    filename: function (req, file, cb) {
        // Keep original name. Warning: Overwrites existing files.
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/save-upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    console.log(`Auto-saved file to: ${req.file.path}`);
    res.status(200).send({ message: 'File auto-saved successfully', path: req.file.path });
});

app.post('/generate-pdf', async (req, res) => {
    const { html, css } = req.body;

    if (!html) {
        return res.status(400).send('Missing HTML content');
    }

    console.log('Received PDF generation request...');
    let browser;

    try {
        // Launch Puppeteer (Headless Chrome)
        browser = await puppeteer.launch({
            headless: 'new', // Use new headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Safer (standard for docker/local)
        });

        const page = await browser.newPage();

        // Optimize for print
        // Standard A4 width in px at 96dpi is 794px.
        // We match this exactly so Tailwind classes render 1:1 with the Preview.
        // We use deviceScaleFactor to get High Res output (like a Retina screen).
        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 2
        });

        // construct complete HTML document
        const fullContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <!-- Fonts -->
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Oswald:wght@400;500;700&display=swap" rel="stylesheet">
                    <style>
                        /* Base Reset */
                        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        /* Injected Tailwind/Theme Styles */
                        ${css || ''}
                    </style>
                </head>
                <body>
                    ${html}
                </body>
            </html>
        `;

        // Load content
        await page.setContent(fullContent, {
            waitUntil: ['networkidle0', 'domcontentloaded'], // Wait for everything to settle
            timeout: 60000 // 60s timeout
        });

        console.log('Page loaded. Generating PDF...');

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // CRITICAL for themes
            margin: { top: 0, right: 0, bottom: 0, left: 0 } // Full bleed
        });

        console.log('PDF Generated successfully.');

        // Send back
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF Generation Failed:', error);
        res.status(500).send('PDF Generation Failed: ' + error.message);
    } finally {
        if (browser) await browser.close();
    }
});

// SPA Fallback (Must be after API routes)
if (isProduction) {
    // Fallback for SPA
    // We register this AFTER all API routes to ensure they take precedence
    app.use((req, res, next) => {
        // Only if GET request and not /generate-pdf or /save-upload (though those are POST)
        if (req.method === 'GET') {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        } else {
            next();
        }
    });
}

// Dev Mode Fallback
if (!isProduction) {
    app.get('/', (req, res) => {
        res.send('<h1>Server Running (Development Mode)</h1><p>The static site is not served in Dev mode. Run "npm run share" for production.</p>');
    });
}

app.listen(PORT, () => {
    console.log(`Server-side PDF Engine running on http://localhost:${PORT}`);
    console.log('Ready to process requests.');
});
