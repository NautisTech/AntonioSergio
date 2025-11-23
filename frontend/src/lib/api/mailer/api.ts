import { publicApiClient, type RequestConfig } from "../client";

class MailerAPI {
	private baseUrl = "/public/mailer";

	/**
	 * Enviar Email do Mailer
	 * @example
	 * ```ts
	 * const result = await mailerAPI.enviarEmail({
	 *   to: 'destinatario@exemplo.com',
	 *   subject: 'Teste rápido',
	 *   text: 'Olá! Este é um email de teste enviado via API.'
	 * })
	 * ```
	 */
	async enviarEmail(
		dados: {
			to: string;
			subject: string;
			text: string;
		},
		config?: RequestConfig
	): Promise<Response> {
		return publicApiClient.post<Response>(
			`${this.baseUrl}/send`,
			{
				...dados,
			},
			{
				...config,
			}
		);
	}

	/**
	 * Inscrever email na newsletter (público)
	 * @example
	 * ```ts
	 * await mailerAPI.subscribeNewsletter({ email: 'user@example.com', lang: 'pt' })
	 * ```
	 */
	async subscribeNewsletter(
		dados: {
			email: string;
			lang?: string;
			tenantId?: number;
		},
		config?: RequestConfig
	): Promise<Response> {
		const payload = {
			email: dados.email,
			lang: dados.lang,
			// use client tenant if not provided
			tenantId: dados.tenantId ?? publicApiClient.getTenantId(),
		};

		return publicApiClient.post<Response>(
			`${this.baseUrl}/newsletter/subscribe`,
			payload,
			{
				...config,
			}
		);
	}
}

export const mailerAPI = new MailerAPI();
