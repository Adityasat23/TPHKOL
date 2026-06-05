export const parseDisclaimer = (
  template: string, 
  data: Record<string, string>
): string => {
  if (!template) return "";
  
  // Regex mencari format [VARIABEL]
  return template.replace(/\[([^\]]+)\]/g, (match, key) => {
    return data[key] || match; // Kembalikan tag asli jika data tidak ditemukan
  });
};