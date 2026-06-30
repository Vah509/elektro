import { defineCollection, z } from 'astro:content';

const vykonaniRoboty = defineCollection({
  type: 'content',
  schema: z.object({
    // Назва роботи (H1)
    title: z.string(),

    // Дата виготовлення (для сортування, не відображається)
    date: z.date(),

    // Типи продукції — slug з AlsoMake (один або кілька)
    // hrshch | dymovydalennia | dvyhuny | shuz | krm | zenitni-lihtari | ahro | plk | elektromontazh
    types: z.array(z.string()),

    // Додаткові теги (avr, plk, fire, pryamyi-pusk, agro, promyslovist тощо)
    tags: z.array(z.string()).default([]),

    // Короткий опис для SEO meta description (150-160 символів)
    description: z.string(),

    // Повний опис (plain text, 2-4 абзаци — береться з тіла .md файлу)
    // body — автоматично з Astro Content Collections

    // Технічні характеристики
    specs: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).default([]),

    // Бренди/виробники обладнання
    brands: z.array(z.string()).default([]),

    // Фотографії
    photos: z.array(z.object({
      src: z.string(),       // /images/vykonani-roboty/slug/filename.jpg
      caption: z.string(),   // підпис для лайтбоксу та alt
    })).min(1),

    // SEO title (якщо не вказано — генерується з title)
    seoTitle: z.string().optional(),
  }),
});

export const collections = {
  'vykonani-roboty': vykonaniRoboty,
};
