import { useState, useEffect, ReactNode } from 'react';

export interface BannedItem {
  word: string;
  suggestion: string;
  regexStr: string;
}

export function useBannedWords() {
  const [bannedData, setBannedData] = useState<BannedItem[]>([]);

  useEffect(() => {
    const fetchBannedWords = async () => {
      try {
        const url1 = `https://docs.google.com/spreadsheets/d/1RUWiTF4k0JVVU4HOWmPCrECv0T5k2MHssfi7sZMn70I/export?format=csv&gid=520891865&t=${new Date().getTime()}`;
        const url2 = `https://docs.google.com/spreadsheets/d/1cDI2VEyloCxr3M5AeOpLTjh3NWUoM6v3mvwl-SExaww/export?format=csv&gid=1767021555&t=${new Date().getTime()}`;

        // Mengambil dua sumber data sekaligus
        const [res1, res2] = await Promise.all([
          fetch(url1, { cache: 'no-store' }),
          fetch(url2, { cache: 'no-store' })
        ]);

        const csvText1 = await res1.text();
        const csvText2 = await res2.text();

        const parsedData: BannedItem[] = [];

        // Helper Processor agar parsing modular
        const processCsv = (csv: string, bannedColIndex: number, suggestionColIndex: number) => {
          const rows: string[][] = [];
          let row: string[] = [];
          let currentVal = '';
          let insideQuotes = false;

          for (let i = 0; i < csv.length; i++) {
            const char = csv[i];
            const nextChar = csv[i + 1];

            if (char === '"' && insideQuotes && nextChar === '"') {
              currentVal += '"'; i++; 
            } else if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              row.push(currentVal); currentVal = '';
            } else if ((char === '\n' || char === '\r') && !insideQuotes) {
              if (char === '\r' && nextChar === '\n') i++;
              row.push(currentVal); rows.push(row); row = []; currentVal = '';
            } else {
              currentVal += char;
            }
          }
          if (currentVal || row.length > 0) { row.push(currentVal); rows.push(row); }

          rows.forEach((cols, index) => {
            if (index === 0) return; // Skip Header
            
            if (cols.length > bannedColIndex) {
              const bannedCell = cols[bannedColIndex] || '';
              const suggestion = (cols[suggestionColIndex] && cols[suggestionColIndex].trim() !== '') ? cols[suggestionColIndex].trim() : '-take out-';
              const cleanCell = bannedCell.replace(/\([^)]*\)/g, '');
              const wordsInCell = cleanCell.split(/[\n,\/]+/).map(w => w.trim().toLowerCase()).filter(w => w.length > 1);
              
              wordsInCell.forEach(word => {
                let cleanWord = word.replace(/^[^a-zA-Z0-9%]+|[^a-zA-Z0-9%]+$/g, '');
                if (!cleanWord) return;
                const tokens = cleanWord.split(/([\W_]+)/);
                let regexStr = "";
                for (let i = 0; i < tokens.length; i++) {
                  const token = tokens[i];
                  if (i % 2 === 0) { regexStr += token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); } 
                  else { regexStr += token.includes('%') ? '[\\W_]*%[\\W_]*' : '[\\W_]*'; }
                }
                const prefix = /^[a-zA-Z0-9]/.test(cleanWord) ? '\\b' : '';
                const suffix = /[a-zA-Z0-9]$/.test(cleanWord) ? '\\b' : '';
                
                const newRegex = `${prefix}${regexStr}${suffix}`;
                
                // Mencegah duplikasi kata jika ada di 2 sheet
                if (!parsedData.some(item => item.word === cleanWord)) {
                  parsedData.push({ word: cleanWord, suggestion, regexStr: newRegex });
                }
              });
            }
          });
        };

        // Spreadsheet 1: Kolom B (Index 1) untuk Banned, Kolom C (Index 2) untuk Suggestion
        processCsv(csvText1, 1, 2);
        
        // Spreadsheet 2: Kolom D (Index 3) untuk Banned, Kolom E (Index 4) untuk Suggestion
        processCsv(csvText2, 3, 4);

        setBannedData(parsedData.sort((a, b) => b.word.length - a.word.length));

      } catch (err) {
        console.error("Gagal load banned words:", err);
      }
    };

    fetchBannedWords();
  }, []);

  const getDetectedBannedWords = (text: string): BannedItem[] => {
    if (!text) return [];
    const detected: BannedItem[] = [];
    bannedData.forEach(item => {
      try {
        const regex = new RegExp(item.regexStr, 'i');
        if (regex.test(text) && !detected.some((d: BannedItem) => d.word === item.word)) detected.push(item);
      } catch (e) { console.error("Regex Invalid:", item.regexStr); }
    });
    return detected;
  };

  const renderWithHighlights = (text: string): ReactNode => {
    if (!bannedData.length || !text) return text;
    
    const detectedItems = getDetectedBannedWords(text);
    if (detectedItems.length === 0) return text;

    const regexParts = detectedItems.map((d: BannedItem) => d.regexStr).filter(Boolean);
    const combinedRegex = new RegExp(`(${regexParts.join('|')})`, 'gi');
    
    const parts = text.split(combinedRegex);
    
    return parts.map((part: string, i: number) => {
      if (!part) return null;
      const isBanned = detectedItems.some((d: BannedItem) => new RegExp(`^${d.regexStr}$`, 'i').test(part));
      return isBanned ? (
        <span key={i} style={{ backgroundColor: '#FF3B30', color: 'white', padding: '0 4px', borderRadius: '4px', display: 'inline-block' }}>
          {part}
        </span>
      ) : (
        part
      );
    });
  };

  return { bannedData, getDetectedBannedWords, renderWithHighlights };
}