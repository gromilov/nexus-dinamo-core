import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	// Схема метаданных для постов
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Преобразование строки в объект Date
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		tags: z.array(z.string()).default(['nexus', 'logic']),
	}),
});

export const collections = { blog };
