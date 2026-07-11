import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://elektroschit.com.ua', 
  integrations: [
    sitemap({
      // Этот фильтр исключает динамические страницы выполняемых работ из карты сайта, 
      // чтобы сборка на GitHub Actions не падала из-за пустых путей
      filter: (page) => !page.includes('/vykonani-roboty/')
    })
  ],
});
