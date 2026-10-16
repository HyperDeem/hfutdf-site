// Fill only with the owner's actual Releases URL. No invented repository link.
// This is presentation configuration, not a content-schema change.
export const matchReleasesUrl: string | null = null;

export function validatedReleasesUrl(value: string | null): string | undefined {
 if(!value)return undefined;
 const url=new URL(value);
 if(url.protocol!=='https:'||url.hostname!=='github.com'||url.port||url.username||url.password||url.search||url.hash||!/^\/[^/]+\/[^/]+\/releases(?:\/(?:tag\/[^/]+|latest))?\/?$/.test(url.pathname))throw new Error('比赛资源需要真实的 GitHub Releases HTTPS 页面地址，不能填写站内文件或直接下载地址');
 return url.href;
}
