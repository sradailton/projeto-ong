const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🚀 Iniciando processo de build...');

try {
  // Limpa dist anterior
  if (fs.existsSync('dist')) {
    fs.removeSync('dist');
    console.log('✅ Pasta dist limpa');
  }

  // Executa Webpack
  console.log('📦 Executando Webpack...');
  execSync('npx webpack --mode production', { stdio: 'inherit' });

  // Copia arquivos estáticos adicionais
  if (fs.existsSync('src/assets')) {
    fs.copySync('src/assets', 'dist/assets');
    console.log('✅ Assets copiados');
  }

  // Gera sitemap
  generateSitemap();

  // Valida HTML
  console.log('🔍 Validando HTML...');
  execSync('npx html-validate dist/**/*.html', { stdio: 'inherit' });

  // Teste de acessibilidade
  console.log('♿ Testando acessibilidade...');
  execSync('npx pa11y-ci dist/**/*.html --threshold 5', { stdio: 'inherit' });

  console.log('🎉 Build concluído com sucesso!');
  console.log('📁 Pasta dist pronta para deploy');

} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}

function generateSitemap() {
  const baseUrl = 'https://sradailton.github.io/projeto-ong';
  const pages = [
    { url: '/', priority: '1.0' },
    { url: '/projetos.html', priority: '0.8' },
    { url: '/cadastro.html', priority: '0.7' }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;

  fs.writeFileSync('dist/sitemap.xml', sitemap);
  console.log('✅ Sitemap gerado');
}