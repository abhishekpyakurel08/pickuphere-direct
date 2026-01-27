
import { products } from './src/data/mockData';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://daruhunting.com.np';

const generateSitemap = () => {
    const urls = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/products', priority: '0.8', changefreq: 'daily' },
        { loc: '/orders', priority: '0.5', changefreq: 'monthly' },
        { loc: '/cart', priority: '0.7', changefreq: 'daily' },
        { loc: '/auth', priority: '0.6', changefreq: 'monthly' },
    ];

    products.forEach((product) => {
        urls.push({
            loc: `/product/${product.id}`,
            priority: '0.7',
            changefreq: 'weekly',
        });
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
            .map(
                (url) => `  <url>
    <loc>${BASE_URL}${url.loc}</loc>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
  </url>`
            )
            .join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(process.cwd(), 'public/sitemap.xml'), sitemap);
    console.log('Sitemap updated with', urls.length, 'URLs');
};

generateSitemap();
