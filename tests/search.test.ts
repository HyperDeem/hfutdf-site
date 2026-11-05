import test from 'node:test';
import assert from 'node:assert/strict';
import {searchRecord,searchRecords,originalFilename,type SearchRecord} from '../src/lib/search.ts';

test('搜索严格按标题、文件名、描述排序，同级保持顺序',()=>{
 const record=(id:string,title:string,filenames:string[],description:string):SearchRecord=>({id,title,filenames,description,href:'/library/academic/#resource-'+id});
 const rows=[record('description','课程',['document.pdf'],'Physics 资料'),record('filename','讲义',['Physics.pdf'],''),record('title-a','Physics A',[],''),record('title-b','Physics B',[],'')];
 assert.deepEqual(searchRecords(rows,' PHYSICS ').map(r=>r.id),['title-a','title-b','filename','description']);
 assert.deepEqual(searchRecords(rows,''),[]);
 assert.deepEqual(searchRecords(rows,'academic'),[]);
});
test('原始文件名来自 URL 解码，相册索引原图，不搜索未指定元数据',()=>{
 assert.equal(originalFilename('https://files.hfutdf.top/a/%E5%A4%A7%E5%AD%A6%E7%89%A9%E7%90%86%20v2.3.pdf'),'大学物理 v2.3.pdf');
 const row=searchRecord({id:'album',data:{title:'活动',category_id:'photos',type:'photo_album',status:'published',order:100,summary:'合照',note:'不参与匹配',images:[{src:'https://files.hfutdf.top/a/%E7%85%A7%E7%89%87.jpg',alt:'不搜索的图注'}],archive_url:'https://files.hfutdf.top/a/album.zip'}});
 assert.deepEqual(row.filenames,['照片.jpg']);assert.equal(row.href,'/library/photos/#resource-album');
 assert.equal(searchRecords([row],'照片.jpg').length,1);
 assert.equal(searchRecords([row],'不参与匹配').length,0);assert.equal(searchRecords([row],'图注').length,0);
});
