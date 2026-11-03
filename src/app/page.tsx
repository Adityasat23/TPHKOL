'use client';

import { useState, useEffect } from 'react';
import DownloaderTool from '../components/tools/DownloaderTool';
import ProductCardTool from '../components/tools/ProductCardTool';
import FakeCommentTool from '../components/tools/FakeCommentTool';
import WordCheckerTool from '../components/tools/WordCheckerTool';
import WaChatTool from '../components/tools/WaChatTool';
import DisclaimerTool from '../components/tools/DisclaimerTool';
import RetroUITool from '../components/tools/RetroUITool';

type TabType = 'product' | 'comment' | 'wa' | 'retro' | 'disclaimer' | 'checker' | 'downloader';

const TABS: { id: TabType; label: string; spec: string }[] = [
  { id: 'product', label: 'Product Card', spec: 'TK · Shopee' },
  { id: 'comment', label: 'Social Comment', spec: 'TikTok · Threads' },
  { id: 'wa', label: 'WhatsApp Chat', spec: 'iOS 375×812' },
  { id: 'retro', label: 'UI Template', spec: 'Retro · IG Notes' },
  { id: 'disclaimer', label: 'Disclaimer', spec: 'Promo Copy' },
  { id: 'checker', label: 'Word Checker', spec: 'Policy Scan' },
  { id: 'downloader', label: 'Downloader', spec: 'Video · Audio' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('product');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-[#18181A] flex flex-col font-sans antialiased selection:bg-[#18181A]/10 selection:text-[#18181A]">
      {/* TOP STUDIO WORKBENCH BAR */}
      <header className="sticky top-0 z-30 h-14 bg-[#F6F5F2]/95 backdrop-blur-sm border-b border-[#18181A]/[0.08] px-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#C83E2B]" />
          <span className="text-[15px] font-medium tracking-tight text-[#18181A]">Timephoria Studio</span>
          <span className="text-[#85827C] text-xs font-mono hidden sm:inline">/</span>
          <span className="text-xs text-[#85827C] hidden sm:inline">Creative Production Workbench</span>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-8 px-3 rounded-lg text-[13px] transition-colors duration-150 whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#18181A] text-[#FFFFFF] font-medium'
                    : 'text-[#575551] hover:text-[#18181A] hover:bg-[#18181A]/[0.04] font-normal'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden xl:flex items-center gap-2 shrink-0 font-mono text-[11px] text-[#85827C] tabular-nums">
          <span>{currentTab.spec}</span>
        </div>
      </header>

      {/* MAIN WORKBENCH CONTENT */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8 flex flex-col items-center">
        {activeTab === 'downloader' && <DownloaderTool />}
        {activeTab === 'comment' && <FakeCommentTool />}
        {activeTab === 'product' && <ProductCardTool />}
        {activeTab === 'disclaimer' && <DisclaimerTool />}
        {activeTab === 'checker' && <WordCheckerTool />}
        {activeTab === 'wa' && <WaChatTool />}
        {activeTab === 'retro' && <RetroUITool />}
      </main>

      {/* QUIET FOOTER */}
      <footer className="w-full max-w-[1440px] mx-auto px-6 py-5 border-t border-[#18181A]/[0.08] flex items-center justify-between text-xs text-[#85827C]">
        <span>Timephoria internal production suite</span>
        <span className="font-mono tabular-nums">{new Date().getFullYear()} · v2.4</span>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(24,24,26,0.14); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(24,24,26,0.24); }
      ` }} />
    </div>
  );
}
