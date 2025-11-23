export interface IdiomaInterface {
    code: string;  // ISO language code (e.g., 'pt', 'en')
    name: string;  // Language name in its own language
    flag: string;  // Flag emoji or icon identifier
    region?: string;  // Optional region specification (e.g., 'PT', 'US')
}

export class Idioma implements IdiomaInterface {
    code: string;
    name: string;
    flag: string;
    region?: string;

    constructor(data: IdiomaInterface) {
        this.code = data.code;
        this.name = data.name;
        this.flag = data.flag;
        this.region = data.region;
    }

    get fullCode(): string {
        return this.region ? `${this.code}-${this.region}` : this.code;
    }

    get displayName(): string {
        return this.region ? `${this.name} (${this.region})` : this.name;
    }
}

export const AVAILABLE_LANGUAGES: IdiomaInterface[] = [
    {
        code: 'pt',
        name: 'Português',
        flag: '🇵🇹',
        region: 'PT'
    },
    {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        region: 'US'
    }
];

export const DEFAULT_LANGUAGE: IdiomaInterface = AVAILABLE_LANGUAGES[0];