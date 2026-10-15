export const categories = [
 {id:'academic',name:'专业资料',icon:'document',summary:'让知识，走出课堂。',detail:'课程学习与专业实践的参考材料。'},
 {id:'photos',name:'照片',icon:'photo',summary:'把片刻，留给后来。',detail:'按主题收集的小相册，一张也值得留下。'},
 {id:'books',name:'图书资料',icon:'book',summary:'从一本书，走向更远。',detail:'书单、笔记与阅读资源，在这里相遇。'},
 {id:'videos',name:'比赛视频',icon:'play',summary:'重回交锋的现场。',detail:'按赛事整理录像，尚不明确的记录等待考证。'},
 {id:'debate-learning',name:'辩论学习资料',icon:'chat',summary:'每一次表达，都有积累。',detail:'从论点到论证，从准备到复盘。'},
 {id:'team-work',name:'辩论队工作材料',icon:'folder',summary:'让下一次筹备，更从容。',detail:'把工作中的方法与经验，留给下一位。'},
 {id:'tools',name:'其他工具',icon:'tool',summary:'小工具，帮一点忙。',detail:'实用的小程序和脚本，直接按名称列举。'},
];
export type Entry = {title:string;note:string;action:string;href?:string};
export const entries: Record<string,Entry[]> = {
 academic:[{title:'课程报告排版参考（模拟）',note:'PDF · 仅演示文件操作',action:'下载'},{title:'专业学习资料说明（模拟）',note:'阅读 · 示例文章',action:'阅读',href:'/entry/getting-started/'}],
 books:[{title:'从提问开始的阅读清单（模拟）',note:'书单 · 示例文章',action:'阅读',href:'/entry/getting-started/'},{title:'阅读笔记示例（模拟）',note:'PDF · 仅演示文件操作',action:'下载'},{title:'外部阅读资源（模拟）',note:'外部链接 · 尚未填写真实地址',action:'访问链接'}],
 'debate-learning':[{title:'让一个观点站得住：论证练习（模拟）',note:'阅读 · 约 2 分钟',action:'阅读',href:'/entry/getting-started/'},{title:'赛后复盘记录表（模拟）',note:'PDF · 仅演示文件操作',action:'下载'}],
 'team-work':[],
 tools:[{title:'辩论赛计时器（模拟）',note:'',action:'打开'},{title:'资料文件整理脚本（模拟）',note:'',action:'下载'},{title:'常用检索入口（模拟）',note:'',action:'访问链接'}],
};
export const albums = [{slug:'practice',title:'练习之间（模拟相册）',count:2},{slug:'a-moment',title:'一个片刻（模拟相册）',count:1}];
export const videos = [{slug:'demo-match',title:'论证练习赛录像（模拟）',event:'演示赛事（模拟）'},{slug:'unknown-match',title:'待考证录像 01（模拟）',event:null}];
