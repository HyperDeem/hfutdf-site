import { z } from 'astro/zod';
import { categoryIds } from '../data/categories.ts';

// Site-local assets only in phase 2; remote media integration awaits approval.
export const localPath = z.string().regex(/^\/(?!\/)(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\/?$/, '使用站内绝对路径，例如 /files/example.txt；不接受远程地址或查询串')
  .refine(value => !value.split('/').some(part => part === '.' || part === '..'), '路径不能包含 . 或 ..');
const common = {
  title: z.string().trim().min(1, '标题不能为空'),
  category_id: z.enum(categoryIds),
  status: z.enum(['draft','published']).default('draft'),
  demo: z.literal(true).default(true),
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
  z.strictObject({...common, type:z.literal('file'), url:localPath.optional()}),
  z.strictObject({...common, type:z.literal('link'), url:z.url().refine(value => value.startsWith('https://'), '外链仅允许 HTTPS').optional()}),
  z.strictObject({...common, type:z.literal('video'), event:z.string().trim().min(1).nullable().default(null)}),
  z.strictObject({...common, type:z.literal('photo_album'), images:z.array(z.strictObject({src:localPath,alt:z.string().trim().min(1),caption:z.string().optional()})).min(1, '相册至少有一张图像')}),
  z.strictObject({...common, type:z.literal('tool'), action:z.enum(['open','download','external']),url:localPath.optional()}),
]);
export const entrySchema = record.superRefine((data,ctx) => {
  const allowed:Record<string,string[]> = {academic:['article','file','link'],books:['article','file','link'],'debate-learning':['article','file','link'],'team-work':['article','file','link'],photos:['photo_album'],videos:['video'],tools:['tool']};
  if(!allowed[data.category_id].includes(data.type)) ctx.addIssue({code:'custom',path:['type'],message:'资料类型与所属分类不匹配'});
  if(data.type==='tool' && data.action==='external' && data.url) ctx.addIssue({code:'custom',path:['url'],message:'阶段 2 外部工具仅模拟，请留空 url'});
});
export type EntryData = z.infer<typeof entrySchema>;
