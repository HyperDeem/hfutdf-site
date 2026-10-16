import test from 'node:test';
import assert from 'node:assert/strict';
import {validatedReleasesUrl} from '../src/data/match-resources.ts';
test('地址未提供时不生成假链接；资源入口只接受 GitHub Releases 页面',()=>{
 assert.equal(validatedReleasesUrl(null),undefined);
 for(const url of ['https://github.com/example/archive/releases','https://github.com/example/archive/releases/tag/v1','https://github.com/example/archive/releases/latest'])assert.equal(validatedReleasesUrl(url),url);
 for(const url of ['http://github.com/example/archive/releases','https://github.com/example/archive','https://github.com/example/archive/releases/download/v1/file.mp4','https://other.example/example/archive/releases','https://github.com/example/archive/releases?token=secret','https://user:pass@github.com/example/archive/releases','/local/fictional-resource-4.mp4'])assert.throws(()=>validatedReleasesUrl(url));
});
