import { MetadataRoute } from 'next';
import { mockProducts } from '@/data/mockProducts';
import { getAllPages } from '@/lib/pageService';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atheer.store';

  const productUrls: MetadataRoute.Sitemap = mockProducts.map((p) => ({
    url: `${baseUrl}/products/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const pages = getAllPages();
  const customPageUrls: MetadataRoute.Sitemap = pages.filter((p) => p.isPublished).map((p) => ({
    url: `${baseUrl}/p/${p.slug}`,
    lastModified: new Date(p.updatedAt || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/account/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  return [...staticUrls, ...customPageUrls, ...productUrls];
}
