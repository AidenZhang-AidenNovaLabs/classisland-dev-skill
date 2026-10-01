<!-- 源: https://github.com/ClassIsland/classisland-docs-next/blob/main/src/dev/ipc/README.md | 文档页: https://docs.classisland.tech/dev/ -->

# 跨进程通信

您可以通过 ClassIsland 的跨进程通信（IPC）库来实现从其他应用获取 ClassIsland 的信息和事件和调用 ClassIsland 的功能，并且支持通过插件扩展 IPC 接口。

ClassIsland 的 IPC 基于命名管道，使用了[dotnetCampus.Ipc](https://github.com/dotnet-campus/dotnetCampus.Ipc)通讯库，并将 ClassIsland 内置的 IPC 接口和相关类封装到了 ClassIsland.Shared.Ipc 库中。此 IPC 库支持基于 .NET Framework 4.7.2 及以上的项目或 .NET 8.0 及以上的项目。

建议同时阅读[dotnetCampus.Ipc 项目的文档](https://github.com/dotnet-campus/dotnetCampus.Ipc?tab=readme-ov-file#%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95)。

## 这个功能可以做什么

其它软件可以通过 IPC 与 ClassIsland 进行联动：比如通过获取当前上课科目，在不同的课程中使用不同的配置；或者在 ClassIsland 发出上/下课提醒时做相应的响应等等。甚至 ClassIsland 同时也是自身的 IPC 客户端[^1]。

[^1]: ClassIsland 在处理 URL 协议时，如果当前已经有 ClassIsland 实例运行，会通过 IPC 让这个实例处理这个 URL。

## 目录

这个部分的文档分为以下几部分：

- [使用 IPC](./ipc.md)：从其它应用获取 ClassIsland 信息和调用功能。
- [扩展 IPC 接口]()：扩展自定义的 IPC 接口以供其它应用实现更多 IPC 功能。
- [IPC 参考](./reference.md)：了解 IPC 中可以远程调用的服务和侦听的事件 ID。
