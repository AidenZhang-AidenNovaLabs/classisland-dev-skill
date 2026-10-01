---
name: classisland-dev-skill
description: ClassIsland 本体/插件开发知识库，完整镜像官方开发文档（docs.classisland.tech/dev，来自 GitHub classisland-docs-next 源文件）。凡涉及 ClassIsland 插件开发、组件（Component）、提醒（Notification）、课表/课程服务（LessonsService）、Uri 导航（classisland://）、IPC 跨进程通信、规则集、依赖注入、日志、设置页面、图标表达式、插件打包上架（cipx/PluginIndex），或用户提出要给 ClassIsland 写插件/扩展功能时，先读本 skill 再动手。
license: CC-BY-NC-SA-4.0
---

# ClassIsland 开发

ClassIsland 是面向教室大屏的课表信息显示应用。技术栈：**.NET 8 + C#**，UI 用 **Avalonia + FluentAvalonia**，依赖注入用 **Microsoft.Extensions.Hosting**（通用主机）。当前主线是 **2.x**（插件 apiVersion ≥ 2.0.0.0）。文档部分章节仍在编写中，遇到 stub 属正常（见文末"已知的 stub 页面"）。

## 三种扩展方式

1. **插件**（首选）：添加组件、提醒、设置页面等，无需改本体。→ `references/dev/plugins/create-project.md`
2. **IPC 跨进程通信**：外部程序读取课表/科目、监听上下课事件、调用功能。→ `references/dev/ipc/ipc.md`
3. **修改本体**：前两者不够用时直接改源码提 PR。→ 环境配置见 `references/dev/get-started/development.md`

## 铁律（违反会导致插件不工作或内存泄漏）

- **注册必须在插件入口的 `Initialize(context, services)` 里完成**。主机启动后才能注册的，订阅事件（如 `AppStarted`）后再注册。
- 服务获取用 `IAppHost.GetService<T>()`/`TryGetService<T>()`，或在注册到主机上的类（组件、设置页、提醒提供方等）里用**构造函数注入**。
- 组件里订阅外部服务事件后，**必须在 `Unloaded` 时取消订阅**，否则无法 GC。
- `ComponentBase<TSettings>` 的 `Settings` 属性在构造函数和 `OnInitialized` 里是 **null**，初始化完成后才可用。
- 插件配置存 `PluginConfigFolder`，**不要**存插件安装目录（更新会删且不备份）。读写用 `ConfigureFileHelper.LoadConfig/SaveConfig`。
- 插件只能向 `classisland://plugins/...` 主机注册 Uri 导航（`HandlePluginsNavigation`）；`HandleAppNavigation` 是 internal。
- 提醒用 **V2 API**（NotificationProviderBase），V1 已弃用。
- 插件间程序集隔离（AssemblyLoadContext）：同名类型 ≠ 同一类型；跨插件调用需声明 `dependencies` 并通过共享接口项目（可发 NuGet）。
- XAML 引 ClassIsland.Core 控件用 `xmlns:ci="http://classisland.tech/schemas/xaml/core"`。
- Windows 下 Warning+ 级日志会进系统事件查看器，不要高频写。

## 任务 → 参考文件路由

references 是官方文档源文件的完整镜像，按需读取：

| 任务 | 读这个 |
| --- | --- |
| 环境搭建：编译运行本体 | `references/dev/get-started/development.md` |
| 环境搭建：插件开发（需源码构建本体才能热重载） | `references/dev/get-started/development-plugins.md` |
| 依赖注入、XML 命名空间、日志（基础概念） | `references/dev/basics/README.md`、`dependency-injection.md`、`logging.md` |
| 创建插件项目、manifest.yml 清单字段 | `references/dev/plugins/create-project.md` |
| 插件基础：程序集隔离、avares:// 资源、保存配置、AppBase | `references/dev/plugins/basics.md` |
| 插件入口类 PluginBase / Initialize / Info / PluginConfigFolder | `references/dev/plugins/plugin-base.md` |
| 插件依赖（跨插件调用、共享接口、可选依赖） | `references/dev/plugins/dependency.md` |
| 打包（`dotnet publish -p:CreateCipx=true`）与上架插件市场（PluginIndex） | `references/dev/plugins/publishing.md` |
| 主界面组件（ComponentBase、ComponentInfo、组件设置） | `references/dev/components.md` |
| 设置页面（SettingsPageBase、SettingsPageInfo、类别） | `references/dev/settings-page.md` |
| 提醒提供方、发送提醒、提醒设置界面（主文档，含 V2 全流程） | `references/dev/notifications/index.md` |
| 提醒内容 NotificationContent 与内置模板 | `references/dev/notifications/notification-content.md` |
| 提醒渠道 NotificationChannelInfo | `references/dev/notifications/notification-channels.md` |
| 事件（生命周期、主计时器 50ms、上课/下课/放学） | `references/dev/events.md` |
| 课程服务属性（CurrentSubject、CurrentState 等） | `references/dev/lessons-service.md` |
| Uri 导航（classisland://、HandlePluginsNavigation、NavHyperlink） | `references/dev/uri-navigation.md` |
| 图标表达式（fluent/lucide/bitmap、IconExpressionHelper） | `references/dev/ui/iconexpr.md` |
| IPC 客户端（IpcClient、CreateIpcProxy、AddNotifyHandler） | `references/dev/ipc/README.md`、`ipc/ipc.md`、`ipc/reference.md` |
| 规则集架构（调用方/提供方/StatusUpdated） | `references/dev/ruleset/README.md` |
| 档案附加设置（科目/时间点/课表/时间表覆盖全局） | `references/app/profile/attached-settings.md` |
| 文档总览、技术栈、调试菜单开关 | `references/dev/README.md` |
| 旧版/迁移占位页 | `references/dev/dev-migrate/README.md`、`references/dev/legacy/README.md` |

目录页（内容极少，通常不必读）：`dev/plugins/README.md`、`dev/ui/README.md`。

## 插件开发推荐阅读顺序

create-project → plugin-base → basics → dependency-injection → 之后再按需读 components / settings-page / notifications / events。

## 插件开发最小骨架

```csharp
// Plugin.cs —— [PluginEntrance] + 继承 PluginBase 是入口的唯一形态
[PluginEntrance]
public class Plugin : PluginBase
{
    public override void Initialize(HostBuilderContext context, IServiceCollection services)
    {
        services.AddSettingsPage<ExampleSettingsPage>();   // 设置页面
        services.AddComponent<MyComponent>();              // 主界面组件
        services.AddNotificationProvider<MyProvider>();    // 提醒提供方
        services.AddSingleton<MyService>();                // 普通服务
    }
}
```

manifest.yml 必填：`id`、`entranceAssembly`、`apiVersion`（2.x 插件填 2.0.0.0+）。

## 外部资源

- API 参考（控台生成，比文档更全）：https://api.docs.classisland.tech/
- 本体源码：https://github.com/ClassIsland/ClassIsland
- 官方示例插件（设置页/组件/提醒完整示例）：https://github.com/ClassIsland/ExamplePlugins
- 文档仓库（references 的来源，可查更新）：https://github.com/ClassIsland/classisland-docs-next

## references 文件约定与已知缺口

- 每个文件头部注释标了 GitHub 源与文档站 URL，可追溯。
- `:::tabs / @tab` 是文档的标签页/代码组语法；`:::info / > [!note]` 是提示容器；`[[TOC]]` 为目录占位——均按普通内容理解即可。
- 文内相对链接按 references 下的目录结构解析；指向未镜像的 `../../app/*.md` 或 `image/*.png` 的链接不可达，需要时用头部注释里的 URL 去线上看。
- **官方源文件即为空/极短的 stub 页**（非抓取缺失）：`notifications/advanced.md`（提醒进阶）、`ruleset/rule-provider.md`、`ruleset/rule-user.md`、`dev-migrate/`、`legacy/`。这些主题官方尚未写完，做法是查 API 参考或本体源码。
- 文档更新快，如发现与本体最新版本不符，以 GitHub main 分支与 https://api.docs.classisland.tech/ 为准。
