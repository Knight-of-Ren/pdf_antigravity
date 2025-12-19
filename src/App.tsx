import { useState, useEffect } from 'react';
import { themes } from './themes';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { ThemeSelector } from './components/ThemeSelector';
import { Login } from './components/Login';
import { generatePDF } from './utils/generatePDF';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Download, Sparkles, Sun, Moon, Laptop } from 'lucide-react';

type ExportTheme = 'light' | 'dark' | 'app-match';

function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [content, setContent] = useState<string>("Welcome to the future of documents.\n\nSelect a theme from the sidebar to transform this text into a stunning PDF.\n\nType here to edit, or upload a text file.");
  const [title, setTitle] = useState<string>("Project Antigravity");
  const [currentTheme, setCurrentTheme] = useState(themes[1]);

  // Check authentication status on mount
  useEffect(() => {
    fetch('/api/check-auth')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
      });
  }, []);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('Initializing...');
  const [exportThemeMode, setExportThemeMode] = useState<ExportTheme>('app-match');

  // System Theme Detection
  const [isSystemDark, setIsSystemDark] = useState(
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute Effective Export Mode to ensure WYSIWYG
  // If 'app-match', we lock it to the current detected system state so Puppeteer (Server) renders exactly what User (Browser) sees.
  const effectiveExportMode = exportThemeMode === 'app-match'
    ? (isSystemDark ? 'dark' : 'light')
    : exportThemeMode;

  const handleDownload = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('Starting export...');

    await generatePDF({
      elementId: 'export-preview', // Target the SHADOW element, not the live one!
      fileName: title,
      themeMode: exportThemeMode,
      onProgress: (progress, status) => {
        setExportProgress(progress);
        setExportStatus(status);
        if (progress === 100) {
          setTimeout(() => setIsExporting(false), 1000); // Wait for done animation
        }
      }
    });
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden font-sans text-slate-200 selection:bg-indigo-500/30">
      <LoadingOverlay
        isVisible={isExporting}
        progress={exportProgress}
        statusMessage={exportStatus}
      />

      {/* Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-white">ThemePDF</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* PDF Theme Toggle */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setExportThemeMode('light')}
              className={`p-1.5 rounded-md transition-all ${exportThemeMode === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              title="Force Light PDF"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExportThemeMode('dark')}
              className={`p-1.5 rounded-md transition-all ${exportThemeMode === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              title="Force Dark PDF"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExportThemeMode('app-match')}
              className={`p-1.5 rounded-md transition-all ${exportThemeMode === 'app-match' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              title="Match App Theme"
            >
              <Laptop className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-2 hidden md:block"></div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-6">
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeSelect={setCurrentTheme}
            />

            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-sm text-slate-400">
              <p className="font-semibold mb-1 text-slate-200">Export Settings</p>
              <p className="opacity-80 pb-2">PDF Theme: <span className="text-indigo-400 font-mono text-xs uppercase">{exportThemeMode}</span></p>
              <p className="opacity-60 text-xs">Toggle via the icons in the header.</p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 h-[calc(100vh-4rem)]">
          <div className="h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="flex-1 h-1/2 md:h-full overflow-hidden relative">
              <Editor
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
              />
            </div>
            <div className="flex-1 h-1/2 md:h-full overflow-hidden bg-slate-900/50 relative">
              {/* Live Preview (Interactive) */}
              <Preview
                title={title}
                content={content}
                theme={currentTheme}
                forcedMode={exportThemeMode}
              />
            </div>
          </div>
        </main>

        {/* --- SHADOW RENDER CONTAINER (For PDF Export) --- */}
        {/* This renders the exact same Preview component but isolated for capture at high res */}
        <div
          id="export-container"
          style={{
            position: 'fixed',
            top: 0,
            left: -10000, /* strictly offscreen but rendering */
            width: '210mm', /* A4 Width */
            minHeight: '297mm',
            zIndex: -9999,
            visibility: 'visible', /* Must be visible to render, just clipped/moved */
            pointerEvents: 'none'
          }}
        >
          {/* We pass the EXACT same props, guaranteeing 1:1 match */}
          <Preview
            title={title}
            content={content}
            theme={currentTheme}
            forcedMode={effectiveExportMode} // Pass Resolved Mode (Dark/Light) instead of 'app-match'
            id="export-preview" // Unique ID for capture
            isShadow={true} // Strip UI wrappers for pure PDF output
          />
        </div>

      </div>
    </div>
  );
}

export default App;
