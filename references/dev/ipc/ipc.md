<!-- 源: https://github.com/ClassIsland/classisland-docs-next/blob/main/src/dev/ipc/ipc.md | 文档页: https://docs.classisland.tech/dev/ -->

# 使用 IPC

本文档主要关于如何通过 ClassIsland.Shared.Ipc 在其他应用获取 ClassIsland 的信息，侦听相关事件和调用 ClassIsland 的功能。

> [!tip]
> 您可以查看[IPC 示例程序源代码](https://github.com/ClassIsland/ClassIsland/tree/master/Demos/ClassIsland.IpcDemo)来加深对 IPC 用法的理解。

## 安装 IPC 库

您需要在您的项目中安装 `ClassIsland.Shared.Ipc` 包来使用 IPC 相关功能。此包需要 .NET Framework 4.7.2 及以上的版本或 .NET 8 及以上的版本。

## IPC 客户端

IPC 客户端封装了一些基本的 IPC 对象和操作，如连接到对端。我们需要使用 IPC 客户端来将应用连接到 ClassIsland。

我们可以使用以下代码创建 IPC 客户端并将客户端连接到 ClassIsland。

``` csharp
var client = new IpcClient();
await client.Connect();
```

在连接到 ClassIsland 之后，我们就可以从 ClassIsland 获取信息和事件，调用功能了。

> [!important]
> 如果您要侦听事件，您需要在使用 `client.Connect()` 连接到 ClassIsland 之前注册事件处理器。

## 获取服务对象

> [!note]
> 关于此部分 API 的详细说明，可以参考 IPC 库的文档中的[文章 IpcRemotingObject](https://github.com/dotnet-campus/dotnetCampus.Ipc/blob/main/docs/IpcRemotingObject.md)。

ClassIsland 将不同的逻辑拆分到了不同的服务中，您可以通过 IPC 从另一个应用中远程获取一部分服务的对象，以实现获取信息和调用功能的目的。

可以使用以下代码要获取服务对象：

``` csharp
var foo = client.Provider.CreateIpcProxy<IFooSrevice>(client.PeerProxy);
```

上面的代码向 IPC 提供方的 CreateIpcProxy 传入了两个参数，其中泛型参数是要获取的服务的接口，方法的第一个参数是连接到 ClassIsland 的 PeerProxy，可以从客户端对象的 PeerProxy 属性获取。

获取到服务对象后，我们就可以像使用普通对象那样使用这个对象了，例如：

```csharp
foo.DoSomething()
```

上面的代码会在 ClassIsland 的终端中输出“Foobar”。

您可以浏览[IPC 参考文章](./reference.md#服务)来了解可以远程调用的服务。

## 侦听事件

> [!note]
> 关于此部分 API 的详细说明，可以参考 IPC 库的文档中的[文章 JsonIpcDirectRouted](https://github.com/dotnet-campus/dotnetCampus.Ipc/blob/main/docs/JsonIpcDirectRouted.md)。

您可以通过订阅事件，比如上课、下课事件，来在一些特定事件发生时做出响应。

订阅事件需要使用客户端中 JsonIpcProvider 的 AddNotifyHandler 方法，此方法包含以下参数：

| 参数名 | 类型 | 必须？ | 说明 |
| --- | --- | --- | --- |
| routedPath | `string` | **是** | 事件 ID。可以是 [ClassIsland 内置事件名称](./reference.md#事件-id)，也可以是扩展的自定义 ID。 |
| handler | `Action \| Action<T>` | **是** | 事件处理程序 |

例如下面的代码：

``` csharp
var client = new IpcClient();
client.JsonIpcProvider.AddNotifyHandler(IpcRoutedNotifyIds.OnClassNotifyId, () => MessageBox.Show("OnClass."));
await client.Connect();
```

上面的代码通过 JsonIpcProvider 的 AddNotifyHandler 方法为上课事件注册了一个事件处理器。当上课事件发出时，会显示一个内容为“OnClass.”的消息框。

ClassIsland 内置了一些事件，其 ID 包含在 IpcRoutedNotifyIds 类中的静态属性中，可以在事件 ID 参数中引用。

您可以浏览[IPC 参考文章](./reference.md#事件-id)来了解应用内置的事件 ID。
