'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DownloaderTool from '../components/tools/DownloaderTool';
import FakeTemplateTool from '../components/tools/FakeTemplateTool';
import ProductCardTool from '../components/tools/ProductCardTool';
import DisclaimerTool from '../components/tools/DisclaimerTool';
import WordCheckerTool from '../components/tools/WordCheckerTool';

const TABS = [
  { id: 'product', label: 'Product SS' },
  { id: 'faketemplate', label: 'Fake Template' },
  { id: 'disclaimer', label: 'Disclaimer' },
  { id: 'checker', label: 'Banned Word Check' },
  { id: 'downloader', label: 'Downloader' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('product');

  return (
    <main className="liquid-glass-backdrop min-h-screen flex flex-col selection:bg-[#2997FF] selection:text-white">
      {/* STICKY APPLE iOS SUBNAV BAR */}
      <header className="apple-sticky-nav sticky top-0 z-50 w-full">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          {/* Left: Studio Identity */}
          <div className="flex items-center justify-between shrink-0 px-1 sm:px-0">
            <h1 className="text-[13px] sm:text-[14px] font-semibold tracking-[-0.02em] text-[#F5F5F7]">
              Timephoria Studio
            </h1>
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
                      className="absolute inset-0 rounded-full bg-[#F5F5F7] shadow-[0_2px_12px_rgba(255,255,255,0.22),inset_0_1px_0_#FFFFFF] -z-10 pointer-events-none"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Spacer for Balanced Centered Pills on Desktop */}
          <div className="hidden lg:block w-[120px] shrink-0" />
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
            {activeTab === 'disclaimer' && <DisclaimerTool />}
            {activeTab === 'checker' && <WordCheckerTool />}
            {activeTab === 'downloader' && <DownloaderTool />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-[var(--label-3)]">
        <span>Aditya Satria Pratama</span>
      </footer>
    </main>
  );
}
