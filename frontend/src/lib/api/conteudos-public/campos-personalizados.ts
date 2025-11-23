import type { ValorCampoPersonalizado } from './types'

/**
 * Tipos auxiliares para campos personalizados
 */
export type CampoValor = string | number | boolean | Date | any

/**
 * Interface para mapear campos personalizados tipados
 */
export interface CamposPersonalizadosMap {
    [codigoCampo: string]: CampoValor
}

/**
 * Classe helper para trabalhar com campos personalizados
 */
export class CamposPersonalizadosHelper {
    private campos: ValorCampoPersonalizado[]

    constructor(campos: ValorCampoPersonalizado[] = []) {
        this.campos = campos
    }

    /**
     * Buscar campo por código
     * @example
     * ```ts
     * const helper = new CamposPersonalizadosHelper(conteudo.campos_personalizados)
     * const duracao = helper.get('duracao_leitura')
     * ```
     */
    get(codigoCampo: string): ValorCampoPersonalizado | undefined {
        return this.campos.find(c => c.codigo_campo === codigoCampo)
    }

    /**
     * Obter valor de texto
     * @example
     * ```ts
     * const autor = helper.getTexto('autor_convidado', 'Anônimo')
     * ```
     */
    getTexto(codigoCampo: string, defaultValue: string = ''): string {
        const campo = this.get(codigoCampo)
        return campo?.valor_texto || defaultValue
    }

    /**
     * Obter valor numérico
     * @example
     * ```ts
     * const duracao = helper.getNumero('duracao_leitura', 5)
     * console.log(`Leitura de ${duracao} minutos`)
     * ```
     */
    getNumero(codigoCampo: string, defaultValue: number = 0): number {
        const campo = this.get(codigoCampo)
        return campo?.valor_numero ?? defaultValue
    }

    /**
     * Obter valor booleano
     * @example
     * ```ts
     * const isPremium = helper.getBoolean('conteudo_premium')
     * if (isPremium) {
     *   return <PremiumBadge />
     * }
     * ```
     */
    getBoolean(codigoCampo: string, defaultValue: boolean = false): boolean {
        const campo = this.get(codigoCampo)
        return campo?.valor_boolean ?? defaultValue
    }

    /**
     * Obter valor de data
     * @example
     * ```ts
     * const dataEvento = helper.getData('data_evento')
     * if (dataEvento) {
     *   console.log(dataEvento.toLocaleDateString())
     * }
     * ```
     */
    getData(codigoCampo: string, defaultValue?: Date): Date | undefined {
        const campo = this.get(codigoCampo)
        if (!campo?.valor_data && !campo?.valor_datetime) {
            return defaultValue
        }

        try {
            return new Date(campo.valor_data || campo.valor_datetime!)
        } catch {
            return defaultValue
        }
    }

    /**
     * Obter valor JSON parseado
     * @example
     * ```ts
     * const config = helper.getJson<{ cor: string, icone: string }>('configuracao')
     * console.log(config?.cor)
     * ```
     */
    getJson<T = any>(codigoCampo: string, defaultValue?: T): T | undefined {
        const campo = this.get(codigoCampo)
        if (!campo?.valor_json) {
            return defaultValue
        }

        try {
            if (typeof campo.valor_json === 'string') {
                return JSON.parse(campo.valor_json) as T
            }
            return campo.valor_json as T
        } catch {
            return defaultValue
        }
    }

    /**
     * Verificar se campo existe
     * @example
     * ```ts
     * if (helper.has('video_url')) {
     *   return <VideoPlayer url={helper.getTexto('video_url')} />
     * }
     * ```
     */
    has(codigoCampo: string): boolean {
        return !!this.get(codigoCampo)
    }

    /**
     * Obter todos os campos como objeto chave-valor
     * @example
     * ```ts
     * const allCampos = helper.toObject()
     * console.log(allCampos.duracao_leitura)
     * ```
     */
    toObject(): CamposPersonalizadosMap {
        return this.campos.reduce((acc, campo) => {
            const valor =
                campo.valor_texto ??
                campo.valor_numero ??
                campo.valor_boolean ??
                campo.valor_data ??
                campo.valor_datetime ??
                campo.valor_json

            acc[campo.codigo_campo] = valor
            return acc
        }, {} as CamposPersonalizadosMap)
    }

    /**
     * Filtrar campos por prefixo
     * @example
     * ```ts
     * const metadados = helper.filterByPrefix('meta_')
     * // Retorna todos os campos que começam com "meta_"
     * ```
     */
    filterByPrefix(prefix: string): ValorCampoPersonalizado[] {
        return this.campos.filter(c => c.codigo_campo.startsWith(prefix))
    }

    /**
     * Obter lista de códigos de campos disponíveis
     */
    getCodigos(): string[] {
        return this.campos.map(c => c.codigo_campo)
    }

    /**
     * Verificar se algum campo tem valor
     */
    isEmpty(): boolean {
        return this.campos.length === 0
    }
}

/**
 * Factory function para criar helper
 * @example
 * ```ts
 * const campos = useCamposPersonalizados(conteudo.campos_personalizados)
 * const duracao = campos.getNumero('duracao_leitura')
 * ```
 */
export function createCamposHelper(
    campos: ValorCampoPersonalizado[] = []
): CamposPersonalizadosHelper {
    return new CamposPersonalizadosHelper(campos)
}