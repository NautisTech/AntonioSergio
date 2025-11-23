import type { IdiomaInterface } from "@/models";

/**
 * Formata o código de idioma no formato esperado pela API
 * @example
 * ```ts
 * const idioma = formatLanguageCode({ code: 'pt', region: 'PT' })
 * // Retorna: 'pt-PT'
 *
 * const idioma2 = formatLanguageCode({ code: 'en', region: null })
 * // Retorna: 'en'
 * ```
 */
export function formatLanguageCode(language: IdiomaInterface): string {
	if (language.region) {
		return `${language.code}-${language.region}`;
	}
	return language.code;
}

/**
 * Normaliza um código de idioma para o formato esperado
 * Converte 'pt' -> 'pt-PT', etc.
 */
export function normalizeLanguageCode(code: string): string {
	const languageMap: Record<string, string> = {
		pt: "pt-PT",
		"pt-PT": "pt-PT",
		en: "en",
		es: "es",
		fr: "fr",
		de: "de",
		it: "it",
		ar: "ar",
	};

	return languageMap[code] || code;
}

/**
 * Verifica se uma URL é do YouTube
 */
export function isYouTubeUrl(url: string): boolean {
	if (!url) return false;
	try {
		const urlObj = new URL(url);
		return (
			urlObj.hostname.includes("youtube.com") ||
			urlObj.hostname.includes("youtu.be")
		);
	} catch {
		return false;
	}
}

/**
 * Verifica se uma URL é do Vimeo
 */
export function isVimeoUrl(url: string): boolean {
	if (!url) return false;
	try {
		const urlObj = new URL(url);
		return urlObj.hostname.includes("vimeo.com");
	} catch {
		return false;
	}
}

/**
 * Extrai o ID de vídeo de uma URL do YouTube
 * Suporta vários formatos:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
	if (!url) return null;
	try {
		const urlObj = new URL(url);
		let videoId = null;

		if (urlObj.hostname.includes("youtube.com")) {
			// Para URLs /live/VIDEO_ID
			if (urlObj.pathname.includes("/live/")) {
				videoId = urlObj.pathname.split("/live/")[1].split("?")[0];
			}
			// Para URLs /embed/VIDEO_ID
			else if (urlObj.pathname.includes("/embed/")) {
				videoId = urlObj.pathname.split("/embed/")[1].split("?")[0];
			}
			// Para URLs /watch?v=VIDEO_ID
			else {
				videoId = urlObj.searchParams.get("v");
			}
		}
		// Para URLs youtu.be/VIDEO_ID
		else if (urlObj.hostname.includes("youtu.be")) {
			videoId = urlObj.pathname.slice(1).split("?")[0];
		}

		return videoId || null;
	} catch {
		return null;
	}
}

/**
 * Gera uma URL de embed do YouTube para autoplay e stream
 * @param url URL original do YouTube
 * @param autoplay Se deve iniciar automaticamente
 * @param mute Se deve estar mudo
 * @param controls Se deve mostrar controles
 */
export function getYouTubeEmbedUrl(
	url: string,
	autoplay: boolean = true,
	mute: boolean = true,
	controls: boolean = false
): string | null {
	const videoId = extractYouTubeVideoId(url);
	if (!videoId) return null;

	const params = new URLSearchParams({
		autoplay: autoplay ? "1" : "0",
		mute: mute ? "1" : "0",
		controls: controls ? "1" : "0",
		disablekb: "1",
		fs: "0",
		modestbranding: "1",
		rel: "0",
		showinfo: "0",
	});

	return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
