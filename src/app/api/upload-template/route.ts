import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface CustomTemplateItem {
  id: string;
  name: string;
  fileUrl: string;
  fileType: 'video' | 'gif' | 'image';
  mimeType: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'templates');
const REGISTRY_FILE = path.join(UPLOADS_DIR, 'registry.json');

function ensureDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function getRegistry(): CustomTemplateItem[] {
  ensureDir();
  if (!fs.existsSync(REGISTRY_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(REGISTRY_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRegistry(items: CustomTemplateItem[]) {
  ensureDir();
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const items = getRegistry();
    return NextResponse.json({ templates: items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    ensureDir();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawName = formData.get('name') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang dipilih' }, { status: 400 });
    }

    const name = (rawName && rawName.trim()) || file.name.replace(/\.[^/.]+$/, '');
    const ext = path.extname(file.name).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.mp4'];

    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: 'Format tidak didukung. Harap upload format JPG, JPEG, PNG, GIF, atau MP4.' },
        { status: 400 }
      );
    }

    let fileType: 'video' | 'gif' | 'image' = 'image';
    if (ext === '.mp4') fileType = 'video';
    else if (ext === '.gif') fileType = 'gif';

    const id = `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const savedFileName = `${id}${ext}`;
    const filePath = path.join(UPLOADS_DIR, savedFileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const newItem: CustomTemplateItem = {
      id,
      name,
      fileUrl: `/uploads/templates/${savedFileName}`,
      fileType,
      mimeType: file.type || (ext === '.mp4' ? 'video/mp4' : ext === '.gif' ? 'image/gif' : 'image/jpeg'),
      fileName: file.name,
      fileSize: file.size,
      createdAt: new Date().toISOString(),
    };

    const registry = getRegistry();
    registry.unshift(newItem);
    saveRegistry(registry);

    return NextResponse.json({ success: true, template: newItem });
  } catch (error: any) {
    console.error('Upload template error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengupload template' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing template ID' }, { status: 400 });
    }

    const registry = getRegistry();
    const itemIndex = registry.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 });
    }

    const item = registry[itemIndex];
    const filePath = path.join(process.cwd(), 'public', item.fileUrl.replace(/^\//, ''));

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Failed to delete file from disk:', err);
      }
    }

    registry.splice(itemIndex, 1);
    saveRegistry(registry);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menghapus template' }, { status: 500 });
  }
}
