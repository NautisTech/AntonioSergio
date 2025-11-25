/**
 * Templates de email para autenticação
 */

interface EmailTemplateData {
    link: string;
    [key: string]: any;
}

export class AuthEmailTemplates {
    /**
     * Template para email de verificação
     */
    static emailVerification(data: EmailTemplateData): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; }
                    .content { padding: 20px 0; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
                    .link { word-break: break-all; color: #007bff; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Verificação de Email</h2>
                </div>
                <div class="content">
                    <p>Olá,</p>
                    <p>Obrigado por se registrar! Por favor, verifique seu email clicando no botão abaixo:</p>
                    <a href="${data.link}" class="button" style="color: #ffffff;">Verificar Email</a>
                    <p>Ou copie e cole este link no seu navegador:</p>
                    <p class="link">${data.link}</p>
                    <p>Este link expira em 24 horas.</p>
                </div>
                <div class="footer">
                    <p>Se você não solicitou esta verificação, ignore este email.</p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Template para redefinição de senha
     */
    static passwordReset(data: EmailTemplateData): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; }
                    .content { padding: 20px 0; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: #ffffff !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
                    .link { word-break: break-all; color: #dc3545; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Redefinição de Senha</h2>
                </div>
                <div class="content">
                    <p>Olá,</p>
                    <p>Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:</p>
                    <a href="${data.link}" class="button" style="color: #ffffff;">Redefinir Senha</a>
                    <p>Ou copie e cole este link no seu navegador:</p>
                    <p class="link">${data.link}</p>
                    <p>Este link expira em 1 hora.</p>
                </div>
                <div class="footer">
                    <p>Se você não solicitou esta redefinição, ignore este email e sua senha permanecerá inalterada.</p>
                </div>
            </body>
            </html>
        `;
    }
}
