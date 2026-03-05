# H46 Sorter

日向坂46（Hinatazaka46）成员排序工具 - 基于 Vue 3 + Vite 开发

🌐 **在线访问**: [https://h46sorter.pages.dev](https://h46sorter.pages.dev)

参考 [n46sorter.com](https://n46sorter.com)，为初学开发练手项目。

## 功能特点

- 🎯 **成员排序**：通过两两对比，生成个人喜好的成员排名
- 🌐 **多语言支持**：中文、日文、英文三种界面语言
- 📊 **排名结果**：支持生成排名列表和阵型图
- 💾 **进度保存**：自动保存排序进度，可随时继续
- ⌨️ **键盘快捷键**：支持键盘快速操作（← → 选择，空格/回车平局，Ctrl+Z 撤销）
- 📷 **图片导出**：支持导出 TOP5 排名图和选拔阵型图

## 技术栈

- **前端框架**：Vue 3 Composition API
- **构建工具**：Vite
- **路由**：Vue Router
- **国际化**：Vue I18n
- **图片导出**：html2canvas
- **样式**：原生 CSS

## 开发运行

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
h46-vue/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── components/    # Vue组件
│   │   ├── composables/   # 组合式函数
│   │   ├── data/          # 成员数据
│   │   ├── i18n/          # 国际化配置
│   │   ├── locales/       # 语言文件
│   │   ├── router/        # 路由配置
│   │   ├── views/         # 页面视图
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md              # 本文档
```

## 数据来源

- 成员信息：[日向坂46 Wikipedia](https://ja.wikipedia.org/wiki/日向坂46)
- 成员图片：[日向坂46 官方网站](https://www.hinatazaka46.com/)

此项目参考 [n46sorter.com](https://n46sorter.com)，为初学开发练手项目。

## 算法说明

排序算法基于归并排序（Merge Sort）变种，通过两两对比确定成员偏好顺序。

## License

MIT License © 2026 H46 Sorter
