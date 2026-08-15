# 影像档案架

一个用于整理、检索和观看游戏官方视频的非官方 Web 应用

[访问网站](https://video.trrw.cn) · [报告问题](https://github.com/Trrrrw/hoyo_video/issues)

![影像档案架桌面端截图](public/screenshots/desktop-wide-1.png)

## 功能

- 按游戏、内容来源和标签浏览视频
- 根据关键词搜索视频，并进一步筛选标签
- 在线播放视频并查看相关内容
- 复制分类、搜索结果等页面的 RSS 订阅链接
- 使用浏览器下载视频、封面与 NFO 元数据
- 通过 Aria2 RPC 创建下载任务，并按 Emby 媒体库结构整理文件
- 支持桌面端与移动端，并可作为 PWA 安装
- 提供明暗主题切换

## 技术栈

- [React](https://react.dev/) 与 [TypeScript](https://www.typescriptlang.org/)
- [React Router](https://reactrouter.com/)
- [Ant Design](https://ant.design/) 与 [Tailwind CSS](https://tailwindcss.com/)
- [Video.js React](https://videojs.org/)
- [Vite](https://vite.dev/)

## 本地开发

请先安装 Node.js 和 [pnpm](https://pnpm.io/)，然后执行：

```bash
git clone https://github.com/Trrrrw/hoyo_video.git
cd hoyo_video
pnpm install
pnpm dev
```

开发服务器默认监听所有本地网络接口，终端会显示可访问的地址

## 环境变量

本地开发使用项目根目录下未提交的 `.env`：

```dotenv
VITE_DEV_BACKEND_BASE=http://127.0.0.1:7040
VITE_DEV_API_DELAY_MS=1000
```

`VITE_DEV_BACKEND_BASE` 只在 `pnpm dev` 的默认开发模式下生效，未配置时使用生产后端 `https://akasha.trrw.cn`。开发环境的接口延迟默认为一秒，可设置为 `0` 关闭

部署构建时可以通过 `VITE_BACKEND_BASE` 覆盖后端地址；否则使用 `https://akasha.trrw.cn`。接口请求超时默认为 15 秒，可通过 `VITE_API_TIMEOUT_MS` 调整。Vite 会在构建时写入这些变量，因此请勿在其中保存密钥或其他敏感信息

## 检查与构建

```bash
# 代码检查
pnpm lint

# 生产构建
pnpm build

# 本地预览构建结果
pnpm preview
```

构建产物位于 `dist` 目录。部署时需要将未知路径回退到 `index.html`，以支持前端路由直接访问和刷新

## 项目结构

```text
src/
├── api/          后端请求、缓存与数据类型
├── assets/       图片等静态资源
├── components/   通用组件、播放器与下载界面
├── hooks/        可复用 React Hooks
├── layouts/      页面布局
├── libs/         下载、Aria2 与格式化工具
├── pages/        路由页面
└── theme/        主题状态与配置
```

## 内容与版权声明

本项目是个人制作的非官方整理工具，仅用于索引、整理和个人非商业浏览相关游戏官方发布的视频内容，不代表米哈游或其他权利方，也未获得其官方授权

站内展示的视频、图片、游戏名称、角色名称及其他相关素材，其著作权、商标权和其他权利归米哈游及相关权利方所有。本项目不主张对上述素材享有任何权利

如有版权或内容问题，请通过 [Issues](https://github.com/Trrrrw/hoyo_video/issues) 或 [contact@trrw.cn](mailto:contact@trrw.cn) 联系
