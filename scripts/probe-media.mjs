import {fileURLToPath} from 'node:url';
import path from 'node:path';

export async function probeMedia(input,{fetchImpl=fetch,expectedType='video/mp4',origin}={}){
 const url=new URL(input);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new Error('需要无凭据、无签名查询参数的公开 HTTPS 测试文件地址');
 const options={credentials:'omit',redirect:'error',signal:AbortSignal.timeout(10000)};
 const head=await fetchImpl(url,{...options,method:'HEAD'});
 if(head.status!==200)throw new Error(`匿名 HEAD 未返回 200（实际 ${head.status}）`);
 const type=head.headers.get('content-type')?.split(';')[0].trim();
 if(type!==expectedType)throw new Error(`Content-Type 应为 ${expectedType}，实际 ${type||'未设置'}`);
 const size=Number(head.headers.get('content-length'));
 if(!Number.isSafeInteger(size)||size<32)throw new Error('文件必须至少 32 bytes，并返回有效的 Content-Length');
 const response=await fetchImpl(url,{...options,method:'GET',headers:{Range:'bytes=0-31',...(origin?{Origin:origin}:{})},signal:AbortSignal.timeout(10000)});
 if(response.status!==206){await response.body?.cancel();throw new Error(`Range 未返回 206（实际 ${response.status}），已停止读取，未主动下载整段视频`);}
 if(response.headers.get('content-range')!==`bytes 0-31/${size}`){await response.body?.cancel();throw new Error('Content-Range 与请求/文件长度不符');}
 const reader=response.body?.getReader();if(!reader)throw new Error('响应体为空');
 let received=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;received+=value.byteLength;if(received>32)throw new Error('响应超过指定的 32 bytes');}}
 finally{await reader.cancel();}
 if(received!==32)throw new Error(`Range 数据长度错误：${received}`);
 return {url:url.href,https:true,anonymousHead:head.status,contentType:type,objectBytes:size,rangeStatus:response.status,rangeBytes:received,contentDisposition:head.headers.get('content-disposition'),accessControlAllowOrigin:response.headers.get('access-control-allow-origin'),scope:'Read-only transport check; does not verify browser decoding, full-file integrity, write permissions, or billing.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(!process.env.MEDIA_TEST_URL)throw new Error('请先设置 MEDIA_TEST_URL 为已获准测试的公开 HTTPS 小样地址');console.log(JSON.stringify(await probeMedia(process.env.MEDIA_TEST_URL,{expectedType:process.env.MEDIA_TEST_TYPE||'video/mp4',origin:process.env.MEDIA_TEST_ORIGIN}),null,2));}
 catch(error){console.error(error instanceof Error?error.message:'测试请求失败');process.exitCode=1;}
}
