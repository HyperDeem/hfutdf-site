import { z } from 'astro/zod';
import { categoryIds } from '../data/categories.ts';
import { subcategories, type Subcategory } from '../data/subcategories.ts';
export { parseSubcategories } from '../data/subcategories.ts';

// Local paths and public archive resource addresses.
export const localPath = z.string().regex(/^\/(?!\/)(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\/?$/, '使用站内绝对路径，例如 /files/example.txt；不接受远程地址或查询串')
  .refine(value => !value.split('/').some(part => part === '.' || part === '..'), '路径不能包含 . 或 ..');
const archiveOrigins = [
  'https://files.hfutdf.top',
  'https://6866-hfutdf-sit-d9gfdn1tceb76d862-1508124540.tcb.qcloud.la',
];
export const archiveUrl = z.string().refine(value => {
  try {
    const origin = archiveOrigins.find(origin => value.startsWith(`${origin}/`));
    if (!origin) return false;
    const u = new URL(value);
    const decoded = decodeURIComponent(value.slice(origin.length));
    return u.origin === origin && !u.username && !u.password && !u.search && !u.hash &&
      u.pathname.length > 1 && !decoded.includes('\\') && !/[\u0000-\u001f]/.test(decoded) &&
      !decoded.split('/').some(p => p === '.' || p === '..') && !/%(?:2e|2f|5c)/i.test(value);
  } catch { return false; }
}, '资源必须是已配置的 COS 或 CloudBase 域名上不含签名参数的 HTTPS 地址');
export const resourcePath = z.union([localPath, archiveUrl]);
const common = {
  title: z.string().trim().min(1, '标题不能为空'),
  category_id: z.enum(categoryIds),
  subcategory_id: z.string().optional(),
  status: z.enum(['draft','published']).default('draft'),
  order: z.number().int().nonnegative().default(100),
  summary: z.string().trim().optional(),
  note: z.string().trim().optional(),
  source_credit: z.string().trim().nullable().optional(),
  published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式为 YYYY-MM-DD').refine(value => {
    const date = new Date(value); return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0,10) === value;
  }, '日期无效').nullable().optional(),
};
const record = z.discriminatedUnion('type', [
  z.strictObject({...common, type:z.literal('article')}),
  z.strictObject({...common, type:z.literal('file'), url:resourcePath.optional()}),
  z.strictObject({...common, type:z.literal('link'), url:z.url().refine(value => value.startsWith('https://'), '外链仅允许 HTTPS').optional()}),
  z.strictObject({...common, type:z.literal('video'), event:z.string().trim().min(1).nullable().default(null),url:resourcePath.optional()}),
  z.strictObject({...common, type:z.literal('photo_album'), archive_url:archiveUrl.optional(), images:z.array(z.strictObject({src:resourcePath,alt:z.string().trim().min(1),caption:z.string().optional()})).min(1, '相册至少有一张图像')}),
  z.strictObject({...common, type:z.literal('tool'), action:z.enum(['open','download','external']),url:resourcePath.optional()}),
]);
export function createEntrySchema(items: Subcategory[]) {
const parents = new Map(items.map(item => [item.id, item.category_id]));
return record.superRefine((data,ctx) => {
  const allowed:Record<string,string[]> = {academic:['article','file','link'],books:['article','file','link'],'debate-learning':['article','file','link'],'team-work':['article','file','link'],photos:['photo_album','file'],videos:['video','file'],tools:['tool']};
  if(!allowed[data.category_id].includes(data.type)) ctx.addIssue({code:'custom',path:['type'],message:'资料类型与所属分类不匹配'});
  if(data.subcategory_id !== undefined && parents.get(data.subcategory_id) !== data.category_id)
    ctx.addIssue({code:'custom',path:['subcategory_id'],message:'子分类不存在或不属于当前大分类'});
});
}
export const entrySchema = createEntrySchema(subcategories);
export type EntryData = z.infer<typeof entrySchema>;
