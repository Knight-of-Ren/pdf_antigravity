export interface Theme {
  id: string;
  name: string;
  className: string; // Tailwind class equivalent or CSS variable wrapper
  styles: {
    container: string;
    heading: string;
    content: string;
    badge: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'brutalist',
    name: 'Brutalist',
    className: 'theme-brutalist theme-brutalist-root', // Added root class for variables
    styles: {
      // Replaced hardcoded colors with semantic-* classes
      // Original: bg-yellow-50 text-black border-4 border-black
      container: 'semantic-bg semantic-text-primary semantic-border border-4 p-8 font-mono shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      heading: 'text-6xl font-black uppercase mb-6 tracking-tighter semantic-border border-b-4 pb-4',
      content: 'semantic-text-primary text-lg leading-relaxed space-y-4 font-mono',
      badge: 'semantic-badge px-3 py-1 text-sm font-bold uppercase inline-block mb-4'
    }
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    className: 'theme-futuristic theme-futuristic-root', // Added root class
    styles: {
      // Original: bg-black text-white
      // Note: Kept specific gradients because they are theme-essential, but base bg is semantic.
      // Gradient text header is kept as is because it's usually legibile or we want it preserved.
      container: 'semantic-bg semantic-text-primary semantic-border p-10 font-sans border shadow-[0_0_50px_rgba(6,182,212,0.2)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black',
      heading: 'text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 tracking-wide pb-2',
      content: 'semantic-text-secondary text-lg leading-loose font-light tracking-wide',
      badge: 'semantic-badge border px-4 py-1 rounded-full text-xs tracking-[0.2em] font-medium mb-4 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
    }
  },
  {
    id: 'luxury',
    name: 'Luxury',
    className: 'theme-luxury theme-luxury-root', // Added root class
    styles: {
      // Original: bg-stone-50 text-stone-900
      container: 'semantic-bg semantic-text-primary semantic-border p-12 font-serif border-y-8 w-full',
      heading: 'text-5xl font-light mb-8 italic semantic-text-primary tracking-tight',
      content: 'semantic-text-secondary text-xl leading-8 font-serif',
      badge: 'semantic-badge text-xs uppercase tracking-[0.3em] mb-6 border-b semantic-border pb-1 inline-block'
    }
  }
];
