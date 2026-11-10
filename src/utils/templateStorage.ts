import { isSupabaseConfigured, supabase } from './supabaseClient';

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

export const isCloudConnected = isSupabaseConfigured;

// ─────────────────────────────────────────────────────────────
// 1. LOCAL INDEXEDDB FALLBACK ENGINE
// ─────────────────────────────────────────────────────────────
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

async function loadFromIndexedDB(): Promise<CustomTemplate[]> {
  if (typeof window === 'undefined' || !window.indexedDB) return [];
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = (req.result || []) as StoredTemplateRecord[];
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

async function saveToIndexedDB(file: File, rawName?: string): Promise<CustomTemplate> {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
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

async function deleteFromIndexedDB(id: string): Promise<void> {
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

async function updateNameInIndexedDB(id: string, newName: string): Promise<void> {
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

// ─────────────────────────────────────────────────────────────
// 2. UNIFIED PUBLIC CLOUD (SUPABASE) + LOCAL ENGINE
// ─────────────────────────────────────────────────────────────

export async function loadCustomTemplates(): Promise<CustomTemplate[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('team_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          fileUrl: item.file_url,
          fileType: item.file_type,
          mimeType: item.mime_type,
          fileName: item.file_name,
          fileSize: Number(item.file_size) || 0,
          createdAt: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('Gagal memuat template dari Supabase Cloud, fallback ke IndexedDB:', err);
    }
  }

  // Fallback to local storage
  return loadFromIndexedDB();
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
  const mimeType =
    file.type || (ext === '.mp4' ? 'video/mp4' : ext === '.gif' ? 'image/gif' : 'image/jpeg');

  if (isSupabaseConfigured && supabase) {
    // 1. Upload file to Supabase Public Storage bucket
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${id}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('team-templates')
      .upload(storagePath, file, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Gagal upload file ke cloud: ${uploadError.message}`);
    }

    // 2. Get Public CDN URL
    const { data: publicUrlData } = supabase.storage
      .from('team-templates')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Insert metadata into public database table
    const { error: dbError } = await supabase.from('team_templates').insert({
      id,
      name,
      file_url: publicUrl,
      file_type: fileType,
      mime_type: mimeType,
      file_name: file.name,
      file_size: file.size,
      created_at: createdAt,
    });

    if (dbError) {
      throw new Error(`Gagal menyimpan template ke database: ${dbError.message}`);
    }

    return {
      id,
      name,
      fileUrl: publicUrl,
      fileType,
      mimeType,
      fileName: file.name,
      fileSize: file.size,
      createdAt,
    };
  }

  // Fallback to local storage
  return saveToIndexedDB(file, rawName);
}

export async function deleteCustomTemplate(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Delete metadata row
      const { error: dbError } = await supabase.from('team_templates').delete().eq('id', id);
      if (dbError) console.warn('Gagal menghapus row di Supabase:', dbError);
    } catch (err) {
      console.warn('Gagal menghapus template di cloud:', err);
    }
  }

  // Also clean up local DB
  await deleteFromIndexedDB(id);
}

export async function updateCustomTemplateName(id: string, newName: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('team_templates')
        .update({ name: newName })
        .eq('id', id);
      if (error) console.warn('Gagal update nama di Supabase:', error);
    } catch (err) {
      console.warn('Gagal update nama template di cloud:', err);
    }
  }

  // Also update local DB
  await updateNameInIndexedDB(id, newName);
}

// ─────────────────────────────────────────────────────────────
// 3. REALTIME SUBSCRIPTION FOR PUBLIC COLLABORATION
// ─────────────────────────────────────────────────────────────
export function subscribeCustomTemplates(onChange: () => void): () => void {
  if (isSupabaseConfigured && supabase) {
    try {
      const channel = supabase
        .channel('team_templates_live')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'team_templates' },
          () => {
            onChange();
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    } catch (err) {
      console.warn('Realtime subscription error:', err);
    }
  }
  return () => {};
}
