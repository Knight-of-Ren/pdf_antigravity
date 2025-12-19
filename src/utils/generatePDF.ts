type ThemeMode = 'light' | 'dark' | 'app-match';

interface GeneratePDIOptions {
    elementId: string;
    fileName: string;
    themeMode: ThemeMode;
    onProgress: (progress: number, status: string) => void;
}

// Helper to scrape all CSS from the current page
const collectStyles = (): string => {
    let cssString = '';
    const styleSheets = Array.from(document.styleSheets);

    styleSheets.forEach((sheet) => {
        try {
            // Only process local sheets to avoid CORS errors with external CDNs
            if (sheet.href === null || sheet.href.startsWith(window.location.origin)) {
                const rules = Array.from(sheet.cssRules);
                rules.forEach((rule) => {
                    cssString += rule.cssText;
                });
            }
        } catch (e) {
            console.warn('Access to stylesheet blocked (CORS):', sheet.href);
        }
    });
    return cssString;
};

// --- SERVER-SIDE ENGINE ---
// Offloads rendering to the local Node.js + Puppeteer server.
// "Processing on my computer" as requested.

export const generatePDF = async ({ fileName, onProgress }: GeneratePDIOptions) => {
    // Target the specific Shadow Render container
    const exportContainer = document.getElementById('export-container');

    if (!exportContainer) {
        onProgress(0, 'Error: Export container not found');
        return;
    }

    // The actual specific content
    const contentElement = exportContainer.firstElementChild as HTMLElement;
    if (!contentElement) {
        onProgress(0, 'Error: Export content empty');
        return;
    }

    try {
        onProgress(10, 'Collecting Page Styles...');
        const css = collectStyles();

        onProgress(30, 'Serializing Document...');
        const html = contentElement.outerHTML;

        onProgress(50, 'Sending to Local PDF Engine...');

        // Call the local server
        const response = await fetch('/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ html, css }),
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.statusText}`);
        }

        onProgress(80, 'Processing Binary Stream...');
        const blob = await response.blob();

        // Create Download Link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName || 'document'}.pdf`;
        document.body.appendChild(link);

        onProgress(90, 'Downloading...');
        link.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        onProgress(100, 'Done!');

    } catch (err: unknown) {
        console.error('Server-Side PDF Generation Error:', err);
        onProgress(0, `Failed: ${err instanceof Error ? err.message : 'Is the Server running? (npm run server)'}`);
        alert('PDF Generation Failed. Make sure the local server is running with "node server/index.js"!');
    }
};
