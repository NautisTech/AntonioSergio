# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# instalar dependências
COPY package*.json ./
RUN npm ci

# copiar código e compilar
COPY . .
RUN npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV ESLINT_NO_DEV_ERRORS=true
ENV NODE_ENV=production
ENV PORT=3000
ENV API_URL=https://api-ceo.sites.microlopes.pt/api
ENV NEXT_PUBLIC_API_URL=https://api-ceo.sites.microlopes.pt/api
ENV TENANT_ID=1005
ENV NEXT_PUBLIC_TENANT_ID=1005
# criar user não-root
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# copiar artefactos do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./ 

EXPOSE 3000
USER nodeuser

CMD ["npm", "run", "start"]
