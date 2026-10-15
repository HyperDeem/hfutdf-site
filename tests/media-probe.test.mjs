import test from 'node:test';
import assert from 'node:assert/strict';
import {probeMedia} from '../scripts/probe-media.mjs';
const url='https://test.example.org/phase3/sample.mp4';
function mock(status=206,type='video/mp4',range='bytes 0-31/1024'){
 const calls=[];return {calls,fetchImpl:async(input,options)=>{calls.push({url:String(input),...options});return options.method==='HEAD'?new Response(null,{status:200,headers:{'Content-Type':type,'Content-Length':'1024'}}):new Response(new Uint8Array(32),{status,headers:{'Content-Range':range}});}};
}
test('仅匿名 HEAD 和 32-byte Range GET，无上传或删除请求',async()=>{const fake=mock();const result=await probeMedia(url,fake);assert.equal(result.rangeBytes,32);assert.deepEqual(fake.calls.map(c=>c.method),['HEAD','GET']);assert(fake.calls.every(c=>c.credentials==='omit'&&c.redirect==='error'));});
test('禁止 HTTP、凭据和带签名参数地址，不发起网络请求',async()=>{for(const address of ['http://test.example.org/a','https://user:pass@test.example.org/a',url+'?signature=secret']){let calls=0;await assert.rejects(probeMedia(address,{fetchImpl:()=>{calls++;}}));assert.equal(calls,0);}});
test('服务器忽略 Range 或回错范围时失败',async()=>{await assert.rejects(probeMedia(url,mock(200)),/206/);await assert.rejects(probeMedia(url,mock(206,'video/mp4','bytes 0-63\/1024')),/Content-Range/);});
test('不把错误的 Content-Type 当作媒体支持',async()=>{await assert.rejects(probeMedia(url,mock(206,'text/html')),/Content-Type/);});
