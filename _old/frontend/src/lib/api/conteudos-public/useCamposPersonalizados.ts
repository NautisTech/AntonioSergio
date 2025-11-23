import { useMemo } from 'react'
import type { ValorCampoPersonalizado } from './types'
import { CamposPersonalizadosHelper, createCamposHelper } from './campos-personalizados'

/**
 * Hook para trabalhar com campos personalizados de forma simplificada
 * @example
 * ```tsx
 * function ConteudoCard({ conteudo }) {
 *   const campos = useCamposPersonalizados(conteudo.campos_personalizados)
 *   const duracao = campos.getNumero('duracao_leitura', 5)
 *   const isPremium = campos.getBoolean('conteudo_premium')
 *   
 *   return (
 *     <div>
 *       <h2>{conteudo.titulo}</h2>
 *       <span>Leitura: {duracao} min</span>
 *       {isPremium && <PremiumBadge />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useCamposPersonalizados(
    campos: ValorCampoPersonalizado[] = []
): CamposPersonalizadosHelper {
    return useMemo(() => createCamposHelper(campos), [campos])
}

/**
 * Hook para obter valor específico de um campo
 * @example
 * ```tsx
 * function DuracaoLeitura({ conteudo }) {
 *   const duracao = useCampoPersonalizado(
 *     conteudo.campos_personalizados,
 *     'duracao_leitura',
 *     'numero',
 *     5
 *   )
 *   
 *   return <span>{duracao} min de leitura</span>
 * }
 * ```
 */
export function useCampoPersonalizado<T = any>(
    campos: ValorCampoPersonalizado[] = [],
    codigoCampo: string,
    tipo: 'texto' | 'numero' | 'boolean' | 'data' | 'json' = 'texto',
    defaultValue?: T
): T {
    const helper = useCamposPersonalizados(campos)

    return useMemo(() => {
        switch (tipo) {
            case 'numero':
                return helper.getNumero(codigoCampo, defaultValue as number) as T
            case 'boolean':
                return helper.getBoolean(codigoCampo, defaultValue as boolean) as T
            case 'data':
                return helper.getData(codigoCampo, defaultValue as Date) as T
            case 'json':
                return helper.getJson<T>(codigoCampo, defaultValue)!
            case 'texto':
            default:
                return helper.getTexto(codigoCampo, defaultValue as string) as T
        }
    }, [helper, codigoCampo, tipo, defaultValue])
}