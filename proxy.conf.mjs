// Proxy do "ng serve": encaminha /api para o BACK-END e injeta o header X-Frontend-Key.
// A chave NÃO fica no código: vem da variável de ambiente FRONTEND_KEY ou do arquivo .env.local
// (FRONTEND_KEY=...), que deve ter o mesmo valor configurado no .env do back-end.
import { existsSync, readFileSync } from 'node:fs';

function lerChave() {
  if (process.env.FRONTEND_KEY) {
    return process.env.FRONTEND_KEY;
  }
  if (existsSync('.env.local')) {
    const linha = readFileSync('.env.local', 'utf8')
      .split(/\r?\n/)
      .find((l) => l.startsWith('FRONTEND_KEY='));
    if (linha) {
      return linha.substring('FRONTEND_KEY='.length).trim();
    }
  }
  console.warn('[proxy] FRONTEND_KEY não definida: a API recusará as requisições (403).');
  return '';
}

export default {
  '/api': {
    target: process.env.API_URL || 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    headers: { 'X-Frontend-Key': lerChave() },
  },
};
