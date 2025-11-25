import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');
    private readonly sensitiveFields = [
        'password',
        'senha',
        'senha_hash',
        'token',
        'access_token',
        'refresh_token',
        'authorization',
        'secret',
        'api_key',
        'apiKey',
        'credit_card',
        'cvv',
        'pin',
    ];

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user } = request;
        const now = Date.now();

        const userInfo = user ? `User: ${user.email} (Tenant: ${user.tenantId})` : 'Anonymous';

        this.logger.log(
            `→ ${method} ${url} | ${userInfo}`,
        );

        if (Object.keys(body || {}).length > 0 && process.env.NODE_ENV === 'development') {
            const sanitizedBody = this.sanitizeSensitiveData(body);
            this.logger.debug(`Body: ${JSON.stringify(sanitizedBody)}`);
        }

        return next.handle().pipe(
            tap({
                next: () => {
                    const responseTime = Date.now() - now;
                    this.logger.log(
                        `← ${method} ${url} | ${responseTime}ms`,
                    );
                },
                error: (error) => {
                    const responseTime = Date.now() - now;
                    this.logger.error(
                        `← ${method} ${url} | ${responseTime}ms | ERROR: ${error.message}`,
                    );
                },
            }),
        );
    }

    /**
     * Sanitiza dados sensíveis para logging
     * Remove ou mascara campos que podem conter informação sensível
     */
    private sanitizeSensitiveData(data: any): any {
        if (!data || typeof data !== 'object') {
            return data;
        }

        const sanitized = Array.isArray(data) ? [...data] : { ...data };

        for (const key in sanitized) {
            if (this.sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
                sanitized[key] = '***REDACTED***';
            } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
                sanitized[key] = this.sanitizeSensitiveData(sanitized[key]);
            }
        }

        return sanitized;
    }
}