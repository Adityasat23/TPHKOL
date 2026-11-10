export interface CustomTemplate {
  id: string;
  name: string;
  fileUrl: string;
  fileType: 'video' | 'gif' | 'image';
  mimeType: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

interface StoredTemplateRecord {
  id: string;
  name: string;
  fileBlob: Blob;
  fileType: 'video' | 'gif' | 'image';
  mimeType: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

const DB_NAME = 'timephoria_design_templates';
const STORE_NAME = 'team_templates';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB tidak didukung pada browser ini'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadCustomTemplates(): Promise<CustomTemplate[]> {
  if (typeof window === 'undefined' || !window.indexedDB) return [];
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = (req.result || []) as StoredTemplateRecord[];
        // Sort newest first
        records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const templates: CustomTemplate[] = records.map((r) => ({
          id: r.id,
          name: r.name,
          fileUrl: URL.createObjectURL(r.fileBlob),
          fileType: r.fileType,
          mimeType: r.mimeType,
          fileName: r.fileName,
          fileSize: r.fileSize,
          createdAt: r.createdAt,
        }));
        resolve(templates);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Gagal memuat template dari IndexedDB:', err);
    return [];
  }
}

export async function saveCustomTemplate(file: File, rawName?: string): Promise<CustomTemplate> {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.mp4'];
  if (!allowedExts.includes(ext)) {
    throw new Error('Format tidak didukung. Harap upload format JPG, JPEG, PNG, GIF, atau MP4.');
  }

  let fileType: 'video' | 'gif' | 'image' = 'image';
  if (ext === '.mp4') fileType = 'video';
  else if (ext === '.gif') fileType = 'gif';

  const name = (rawName && rawName.trim()) || file.name.replace(/\.[^/.]+$/, '');
  const id = `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  const record: StoredTemplateRecord = {
    id,
    name,
    fileBlob: file,
    fileType,
    mimeType: file.type || (ext === '.mp4' ? 'video/mp4' : ext === '.gif' ? 'image/gif' : 'image/jpeg'),
    fileName: file.name,
    fileSize: file.size,
    createdAt,
  };

  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  return {
    id,
    name,
    fileUrl: URL.createObjectURL(file),
    fileType,
    mimeType: record.mimeType,
    fileName: file.name,
    fileSize: file.size,
    createdAt,
  };
}

export async function deleteCustomTemplate(id: string): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function updateCustomTemplateName(id: string, newName: string): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const record = getReq.result as StoredTemplateRecord | undefined;
      if (record) {
        record.name = newName;
        const putReq = store.put(record);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      } else {
        resolve();
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
