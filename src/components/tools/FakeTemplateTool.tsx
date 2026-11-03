'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import FakeCommentTool from './FakeCommentTool';
import WaChatTool from './WaChatTool';
import RetroUITool from './RetroUITool';

type TemplateType = 'comment' | 'wachat' | 'ignotes';

const TEMPLATE_MODES: { id: TemplateType; label: string }[] = [
  { id: 'comment', label: 'Comment All Sosmed' },
  { id: 'wachat', label: 'WhatsApp Chat' },
  { id: 'ignotes', label: 'IG Notes Reply' },
];

export default function FakeTemplateTool() {
  const [templateType, setTemplateType] = useState<TemplateType>('comment');

  return (
    <div className="w-full space-y-5">
      {/* SUB-NAVIGATION: APPLE LIQUID GLASS PILLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <h2 className="text-[17px] font-semibold text-[var(--label)] tracking-[-0.02em]">
          Fake Template
        </h2>

        <div
          role="tablist"
          aria-label="Pilih tipe Fake Template"
          className="w-full sm:w-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-0.5"
        >
          {TEMPLATE_MODES.map((item) => {
            const active = templateType === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTemplateType(item.id)}
                data-active={active}
                className="apple-nav-pill whitespace-nowrap shrink-0"
              >
                {active && (
                  <motion.span
                    layoutId="fake-template-active-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-[#F5F5F7] shadow-[0_2px_12px_rgba(255,255,255,0.22),inset_0_1px_0_#FFFFFF] -z-10 pointer-events-none"
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE TEMPLATE WORKSPACE */}
      <motion.div
        key={templateType}
        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 390, damping: 32, mass: 0.55 }}
      >
        <div className={templateType === 'comment' ? 'block' : 'hidden'}>
          <FakeCommentTool />
        </div>
        <div className={templateType === 'wachat' ? 'block' : 'hidden'}>
          <WaChatTool />
        </div>
        <div className={templateType === 'ignotes' ? 'block' : 'hidden'}>
          <RetroUITool />
        </div>
      </motion.div>
    </div>
  );
}
