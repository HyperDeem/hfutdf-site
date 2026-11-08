import { z } from 'astro/zod';
import { categoryIds } from './categories.ts';
import config from './subcategories.json' with { type: 'json' };

const catalogue = z.strictObject({
  subcategories: z.array(z.strictObject({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    category_id: z.enum(categoryIds),
    name: z.string().trim().min(1),
  })),
});

export type Subcategory = z.infer<typeof catalogue>['subcategories'][number];

export function parseSubcategories(value: unknown): Subcategory[] {
  const { subcategories } = catalogue.parse(value);
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const item of subcategories) {
    const key = `${item.category_id}:${item.name.normalize('NFKC').toLowerCase().trim()}`;
    if (ids.has(item.id)) throw new Error(`子分类 ID 重复：${item.id}`);
    if (names.has(key)) throw new Error(`同一大分类下子分类名称重复：${item.name}`);
    ids.add(item.id);
    names.add(key);
  }
  return subcategories;
}

export const subcategories = parseSubcategories(config);
export const subcategoryById = new Map(subcategories.map(item => [item.id, item]));
