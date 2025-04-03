# 米哈游游戏视频站

![Vue版本](https://img.shields.io/badge/Vue-3.5-blue)
![Vite版本](https://img.shields.io/badge/Vite-6.1-orange)
![Ant Design](https://img.shields.io/badge/Ant%20Design-4.2.6-blue?logo=ant-design)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

## 📂 数据说明

`src/data/` 目录下的所有数据文件（包括各游戏的`data.json`和`types.json`）均由后端爬虫自动生成，**请勿手动修改**这些文件。如需修改数据内容，请通过 [Issues](https://github.com/Trrrrw/hoyo_video/issues) 提出请求。

## 🎨 界面定制

本项目使用 [Ant Design Vue](https://antdv.com/components/overview-cn) 作为UI组件库，如需修改界面：

1. **页面布局**:
   - 主页面: `src/views/SpecificGame.vue`
   - 分类页面: `src/views/SpecificType.vue`
   - 视频播放页: `src/views/VideoPlayback.vue`

2. **组件修改**:
   - 卡片组件: `src/components/Card.vue`
   - 页脚组件: `src/components/Footer.vue`

## 🚀 开发指南

```bash
# 安装依赖
yarn

# 启动开发服务器
yarn dev

# 生产环境构建
yarn build
```