import crypto from 'crypto';
import 'dotenv/config';

// Obter chave de encriptação do ambiente
const masterKey = '4f92c7b1ea6dd0f38719ac4b5e0d3f1c8bb6e2a4d1f7c9530ad4b8e6c2f1097a';
if (!masterKey) {
    console.error('ERRO: MASTER_ENCRYPTION_KEY não encontrada no ficheiro .env');
    process.exit(1);
}

const key = Buffer.from(masterKey, 'hex');
const iv = Buffer.alloc(16, 0);

function encrypt(value) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return encrypted.toString('base64');
}

// Exemplo de uso:
// Descomenta as linhas abaixo e substitui pelos valores que queres encriptar
// console.log('DB_HOST:', encrypt('62.28.239.206'));
// console.log('DB_PORT:', encrypt('4002'));
// console.log('DB_USER:', encrypt('sa'));
// console.log('DB_PASSWORD:', encrypt('MicroLop3s@2025!'));

// console.log('SMTP_HOST:', encrypt('smtp.gmail.com'));
// console.log('SMTP_PORT:', encrypt('587'));
// console.log('SMTP_SECURE:', encrypt('false'));
// console.log('SMTP_USER:', encrypt('teu.email@gmail.com'));
// console.log('SMTP_PASS:', encrypt('tua-password-ou-app-password'));
// console.log('SMTP_FROM:', encrypt('no-reply@microlopes.pt'));

console.log('SMTP CONFIG:', encrypt('{"provider":"SMTP","enabled":true,"smtp":{"host":"smtp.hostinger.com","port":587,"secure":false,"username":"noreply@nautis.pt","password":"/7Bj?eCdi","fromName":"Nautis CEO","fromEmail":"noreply@nautis.pt"}}'));

console.log('Script pronto para encriptar valores usando MASTER_ENCRYPTION_KEY do .env');
console.log('Descomenta as linhas de exemplo acima para encriptar valores.');
