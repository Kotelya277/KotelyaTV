// 此文件由 scripts/convert-changelog.js 自动生成
// 请勿手动编辑

export interface ChangelogEntry {
  version: string;
  date: string;
  added: string[];
  changed: string[];
  fixed: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: '1.0.4 Beta',
    date: '2025-10-31',
    added: [
      '管理员页支持视频源配置导入/导出（sources.json）',
      '管理员页支持自定义分类导入/导出（categories.json），并在 D1/Upstash 环境下只读提示',
      '新增英文版 README（Contributing 与 Release Notes），中文 README 扩展快速开始（Docker/Vercel 一步到位）',
    ],
    changed: [
      '品牌标签（BrandPill）采用渐变文字并统一玻璃拟态风格；移动端底栏玻璃拟态与圆角统一',
      '首页新增“热门动漫”分区，采用 Douban 列表接口并带标签回退；“查看更多”指向动画标签页',
      '登录页与版本面板中的“前往仓库”链接更新为 https://github.com/Kotelya277/KotelyaTV/tree/main',
      '移除手机端头部居中站点名链接，简化移动端 UI',
    ],
    fixed: ['修复搜索页 BrandPill 导入缺失导致的报错'],
  },
  {
    version: '1.0.3',
    date: '2025-08-11',
    added: [
      // 无新增内容
    ],
    changed: ['升级播放器 Artplayer 至版本 5.2.5'],
    fixed: [
      // 无修复内容
    ],
  },
  {
    version: '1.0.2',
    date: '2025-08-11',
    added: [
      // 无新增内容
    ],
    changed: [
      '版本号比较机制恢复为数字比较，仅当最新版本大于本地版本时才认为有更新',
      '[运维] 自动替换 version.ts 中的版本号为 VERSION.txt 中的版本号',
    ],
    fixed: [
      // 无修复内容
    ],
  },
  {
    version: '1.0.1',
    date: '2025-08-11',
    added: [
      // 无新增内容
    ],
    changed: [
      // 无变更内容
    ],
    fixed: ['修复版本检查功能，只要与最新版本号不一致即认为有更新'],
  },
  {
    version: '1.0.0',
    date: '2025-08-10',
    added: [
      '基于 Semantic Versioning 的版本号机制',
      '版本信息面板，展示本地变更日志和远程更新日志',
    ],
    changed: [
      // 无变更内容
    ],
    fixed: [
      // 无修复内容
    ],
  },
];

export default changelog;
