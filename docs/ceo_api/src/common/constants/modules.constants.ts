/**
 * Configurações e metadados dos módulos do sistema
 */

export interface ModuleMetadata {
    codigo: string;
    nome: string;
    icone: string;
}

export const MODULE_METADATA: Record<string, ModuleMetadata> = {
    ADMIN: {
        codigo: 'ADMIN',
        nome: 'Administração',
        icone: 'settings',
    },
    RH: {
        codigo: 'RH',
        nome: 'Recursos Humanos',
        icone: 'users',
    },
    EMPRESAS: {
        codigo: 'EMPRESAS',
        nome: 'Empresas',
        icone: 'building',
    },
    CONTEUDOS: {
        codigo: 'CONTEUDOS',
        nome: 'Conteúdos',
        icone: 'file-text',
    },
    VEICULOS: {
        codigo: 'VEICULOS',
        nome: 'Veículos',
        icone: 'truck',
    },
    SUPORTE: {
        codigo: 'SUPORTE',
        nome: 'Suporte',
        icone: 'help-circle',
    },
    RELATORIOS: {
        codigo: 'RELATORIOS',
        nome: 'Relatórios',
        icone: 'bar-chart',
    },
};

/**
 * Obtém o nome do módulo pelo código
 */
export function getModuleName(codigo: string): string {
    return MODULE_METADATA[codigo]?.nome || codigo;
}

/**
 * Obtém o ícone do módulo pelo código
 */
export function getModuleIcon(codigo: string): string {
    return MODULE_METADATA[codigo]?.icone || 'circle';
}
