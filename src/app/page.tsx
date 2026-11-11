'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DownloaderTool from '../components/tools/DownloaderTool';
import FakeTemplateTool from '../components/tools/FakeTemplateTool';
import DesignTemplateTool from '../components/tools/DesignTemplateTool';
import ProductCardTool from '../components/tools/ProductCardTool';
import DisclaimerTool from '../components/tools/DisclaimerTool';
import WordCheckerTool from '../components/tools/WordCheckerTool';

const TABS = [
  { id: 'product', label: 'Product SS' },
  { id: 'faketemplate', label: 'Fake Template' },
  { id: 'designtemplate', label: 'Design Template' },
  { id: 'disclaimer', label: 'Disclaimer' },
  { id: 'checker', label: 'Banned Word Check' },
  { id: 'downloader', label: 'Downloader' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('product');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = window.localStorage.getItem('tph-studio-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    } else {
      document.documentElement.dataset.theme = 'light';
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('tph-studio-theme', next);
  };

  return (
    <main
      data-theme={theme}
      className="liquid-glass-backdrop min-h-screen flex flex-col selection:bg-[#2997FF] selection:text-white"
    >
      {/* STICKY APPLE iOS SUBNAV BAR */}
      <header className="apple-sticky-nav sticky top-0 z-50 w-full">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          {/* Left: Studio Identity + Mobile Theme Toggle */}
          <div className="flex items-center justify-between shrink-0 px-1 sm:px-0">
            <h1 className="text-[13px] sm:text-[14px] font-semibold tracking-[-0.02em] text-[var(--label)]">
              Timephoria Studio
            </h1>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Ganti tema Light atau Dark"
              className="sm:hidden apple-nav-pill flex items-center gap-1.5 !py-1 !px-3 text-xs"
            >
              {theme === 'light' ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  <span>Light</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          {/* Center: Apple iOS Pill Navigation */}
          <nav
            aria-label="Menu studio"
            className="w-full sm:w-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-1"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  data-active={isActive}
                  className="apple-nav-pill whitespace-nowrap shrink-0"
                >
                  {isActive && (
                    <motion.span
                      layoutId="apple-nav-active-pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="apple-nav-active-pill absolute inset-0 rounded-full -z-10 pointer-events-none"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Desktop Light / Dark Theme Toggle */}
          <div className="hidden sm:flex items-center justify-end w-[120px] shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Ganti tema Light atau Dark"
              className="apple-nav-pill flex items-center gap-1.5 !py-1.5 !px-3.5 text-xs"
            >
              {theme === 'light' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  <span>Light</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* WORKBENCH BODY WITH SMOOTH SPRING TRANSITION */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 py-4 sm:py-7 overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, scale: 0.992, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, scale: 0.992, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.6 }}
          >
            {activeTab === 'product' && <ProductCardTool />}
            {activeTab === 'faketemplate' && <FakeTemplateTool />}
            {activeTab === 'designtemplate' && <DesignTemplateTool />}
            {activeTab === 'disclaimer' && <DisclaimerTool />}
            {activeTab === 'checker' && <WordCheckerTool />}
            {activeTab === 'downloader' && <DownloaderTool />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 border-t border-[var(--separator)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--label-3)]">
        <div className="text-center sm:text-left">
          <span>
            Contact at Ding: <span className="font-medium text-[var(--label-2)]">Aditya Satria Pratama</span> / Email:{' '}
            <a href="mailto:adityasatriapwork@gmail.com" className="font-medium text-[var(--tint)] hover:underline">
              adityasatriapwork@gmail.com
            </a>{' '}
            jika ada bug, error atau request update
          </span>
        </div>
        <p className="text-[11px] text-[var(--label-3)] text-center sm:text-right font-medium">
          Confidential &amp; Proprietary: For internal use only. Do not copy, share, or misuse any data without authorization.
        </p>
      </footer>
    </main>
  );
}
