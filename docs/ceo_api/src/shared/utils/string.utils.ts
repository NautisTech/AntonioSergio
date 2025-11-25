/**
 * Gera slug a partir de string
 * Remove acentos, caracteres especiais e converte para lowercase
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/--+/g, '-') // Remove hífens duplos
        .trim();
}

/**
 * Trunca texto adicionando '...' no final
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Gera string aleatória com comprimento especificado
 */
export function generateRandomString(length: number = 10): string {
    return Math.random()
        .toString(36)
        .substring(2, length + 2);
}