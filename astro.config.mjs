import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  // Записали домен напрямую для карты сайта
  site: 'https://elektroschit.com.ua', 
  integrations: [sitemap()],
});
