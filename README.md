# classisland-dev

ZCode skill：ClassIsland 本体/插件开发知识库。完整镜像官方开发文档（docs.classisland.tech/dev，32 页），供 AI 编码助手在开发 ClassIsland 插件/扩展时按需查阅。

- 文档站：https://docs.classisland.tech/dev/
- 上游源文件：https://github.com/ClassIsland/classisland-docs-next （main 分支，`src/dev/**`）
- 镜像日期：2026-10-01（commit 历史即每次刷新记录）
- API 参考：https://api.docs.classisland.tech/

## 结构

```
classisland-dev/
├── SKILL.md          # 触发条件 + ClassIsland 开发铁律 + 任务→参考文件路由表
├── references/       # 官方文档源文件完整镜像（32 个 md，文件头注释标注来源 URL）
│   ├── dev/          # 文档站 /dev/ 全部页面
│   └── app/profile/  # dev 侧栏交叉引用的档案附加设置页
├── scripts/
│   ├── crawl.mjs     # 从上游 GitHub 仓库重新拉取最新文档源文件
│   └── verify.mjs    # 完整性自检（镜像数量、SKILL.md 路由可达、无空文件）
└── LICENSE           # CC BY-NC-SA 4.0（整仓，随上游内容）
```

## 安装

把 `classisland-dev/` 整个目录放入：

- 个人级：`~/.agents/skills/`
- 项目级：`<项目>/.agents/skills/`

重启 ZCode 会话即被发现；也可用 `/skill classisland-dev` 强制加载。

## 刷新文档

```shell
cd scripts
node crawl.mjs                       # 重拉上游 main 的 32 个源文件到 docs-src/
cp -r docs-src/dev <skill>/references/
cp -r docs-src/app <skill>/references/
node verify.mjs                      # 应输出 OK: 32 mirrored files, N routes resolve
```

## 许可

本仓库整体以 **CC BY-NC-SA 4.0**（署名-非商业-相同方式共享 4.0 国际）许可发布，与上游一致（见 LICENSE）。

`references/` 内容镜像自 [ClassIsland/classisland-docs-next](https://github.com/ClassIsland/classisland-docs-next)，版权归 ClassIsland 文档项目所有；本仓库其余部分（SKILL.md、scripts/、README.md）以相同许可共享。
