import { toast } from '@/hooks/use-toast';

export const APP_SHARE_URL = 'https://piggybud.lovable.app';
export const APP_SHARE_TEXT =
  'Conheci o PiggyBud, um app divertido que me ajuda a controlar gastos com um mascote que reage às minhas compras! 🐽💰 Experimenta também:';

interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

export async function shareContent({ title, text, url }: ShareOptions) {
  const shareUrl = url ?? APP_SHARE_URL;
  const shareText = text ?? '';

  // Prefer native share sheet (mobile)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text: shareText, url: shareUrl });
      return;
    } catch (err: any) {
      // User cancelled — silently ignore
      if (err?.name === 'AbortError') return;
      // Otherwise fall through to clipboard
    }
  }

  // Fallback: copy to clipboard
  const composed = [shareText, shareUrl].filter(Boolean).join('\n\n');
  try {
    await navigator.clipboard.writeText(composed);
    toast({
      title: 'Link copiado!',
      description: 'Cole onde quiser para compartilhar.',
    });
  } catch {
    toast({
      title: 'Não foi possível compartilhar',
      description: 'Tente novamente ou copie o link manualmente.',
      variant: 'destructive',
    });
  }
}

export function shareApp() {
  return shareContent({
    title: 'PiggyBud',
    text: APP_SHARE_TEXT,
    url: APP_SHARE_URL,
  });
}
