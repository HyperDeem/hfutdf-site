import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { entrySchema } from './content/schema';
const entries = defineCollection({
  loader:glob({pattern:'*.md',base:'./src/content/entries',generateId:({entry})=>{
    const id=entry.replace(/\.md$/,'');
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))throw new Error(`内容文件名必须为小写英文或数字，以短横线连接：${entry}`);
    return id;
  }}),schema:entrySchema,
});
export const collections = {entries};
