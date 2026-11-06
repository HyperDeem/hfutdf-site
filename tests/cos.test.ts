import test from 'node:test';
import assert from 'node:assert/strict';
import {entrySchema} from '../src/content/schema.ts';
test('COS 文件和相册兼容已有模型，其他 origin 和签名地址仍被拒绝',()=>{
 const base={title:'资料',category_id:'academic',type:'file',status:'published'};
 assert(entrySchema.safeParse({...base,url:'https://files.hfutdf.top/archive/academic/a/%E4%B8%AD.pdf'}).success);
 const cloudbase='https://6866-hfutdf-sit-d9gfdn1tceb76d862-1508124540.tcb.qcloud.la';
 assert(entrySchema.safeParse({...base,url:cloudbase+'/%E5%A4%A7%E5%AD%A6%E7%89%A9%E7%90%86%20v2.3.pdf'}).success);
 for(const url of [cloudbase+'.evil.example/a.pdf','https://other.tcb.qcloud.la/a.pdf',cloudbase+'/a.pdf?signature=x',cloudbase+'/a/../a.pdf'])
  assert(!entrySchema.safeParse({...base,url}).success,url);
 for(const url of ['https://evil.example/x.pdf','https://files.hfutdf.top.evil.example/x','https://files.hfutdf.top/x?sign=x','https://user@files.hfutdf.top/x','https://files.hfutdf.top/a/../x','https://files.hfutdf.top/%2e%2e/x'])
  assert(!entrySchema.safeParse({...base,url}).success,url);
 assert(entrySchema.safeParse({title:'相册',category_id:'photos',type:'photo_album',
  images:[{src:'https://files.hfutdf.top/archive/photos/a/photo.png',alt:'照片'}],archive_url:'https://files.hfutdf.top/archive/photos/a/album.zip'}).success);
});
test('比赛 COS 下载沿用列表，符合现有视频结构',()=>{
 const data=entrySchema.parse({title:'比赛',category_id:'videos',type:'video',status:'published',url:'https://files.hfutdf.top/archive/videos/a/match.mp4'});
 assert.equal(data.type,'video');
});
