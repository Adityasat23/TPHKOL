'use client';

import { useState, useEffect } from 'react';
import DownloaderTool from '../components/tools/DownloaderTool';
import ProductCardTool from '../components/tools/ProductCardTool';
import FakeCommentTool from '../components/tools/FakeCommentTool';
import WordCheckerTool from '../components/tools/WordCheckerTool';
import WaChatTool from '../components/tools/WaChatTool';
import DisclaimerTool from '../components/tools/DisclaimerTool';
type TabType = 'downloader' | 'comment' | 'product' | 'disclaimer' | 'checker' | 'wa';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('product');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-[#F5F5F7] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-[#F5F5F7] to-gray-200 flex flex-col items-center py-12 px-4 font-sans text-[#1D1D1F] relative overflow-hidden selection:bg-gray-300/50 selection:text-[#1D1D1F]">
      
      <div className="max-w-3xl w-full text-center mb-10 mt-6 relative z-10">
        <h1 className="text-4xl md:text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-b from-black to-gray-600 mb-3 tracking-tight leading-tight">
          Editor Tools
        </h1>
        <p className="text-gray-500 text-base font-medium tracking-wide max-w-xl mx-auto">
          Semoga membantu, kalo bug Ding aja
        </p>
      </div>

      <div className="flex bg-white/50 backdrop-blur-3xl rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.1)] border-[1.5px] border-white p-1.5 mb-10 w-full max-w-5xl justify-center gap-2 z-10 overflow-x-auto custom-scrollbar">
        {(['downloader', 'comment', 'product', 'disclaimer', 'checker', 'wa'] as TabType[]).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap capitalize ${activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {tab === 'wa' ? 'WA Chat' : tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* RENDER HARUS PRESISI, TIDAK BOLEH TERTUKAR */}
      {activeTab === 'downloader' && <DownloaderTool />}
      {activeTab === 'comment' && <FakeCommentTool />}
      {activeTab === 'product' && <ProductCardTool />}
      {activeTab === 'disclaimer' && <DisclaimerTool />}
      {activeTab === 'checker' && <WordCheckerTool />}
      {activeTab === 'wa' && <WaChatTool />}

      <footer style={{ marginTop: '60px', paddingTop: '30px', paddingBottom: '30px', textAlign: 'center', width: '100%', maxWidth: '1152px', borderTop: '1px solid rgba(0,0,0,0.05)', zIndex: 10 }}>
        <p style={{ color: '#8E8E93', fontSize: '14px', fontWeight: 500 }}>
          &copy; {new Date().getFullYear()} <span style={{ fontWeight: '600', color: '#1D1D1F' }}>Internal Tools</span>. All rights reserved.
        </p>
      </footer>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.15); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,0.25); }
      `}} />
    </main>
  );
}