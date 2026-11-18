// Configuração lida do .env (variáveis EXPO_PUBLIC_* são embutidas no app em tempo de build).
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Bucket público "media" do Supabase Storage (capas dos planos, vídeos dos exercícios, etc.).
const MEDIA_BASE = `${SUPABASE_URL}/storage/v1/object/public/media`;

export const mediaUrl = (path: string | null | undefined): string | null =>
  path ? `${MEDIA_BASE}/${path}` : null;
