---
title: Java Core Technology Review (四)
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220225221826.jpg'
coverImg: /img/20220225221826.jpg
cover: false
toc: true
mathjax: false
date: 2022-06-06 22:26:34
summary: "Java 核心技术回顾(四) IO、文件拷贝"
categories: "Java"
keywords: "Java"
tags: "Java"
---

# 前言

从五个方面来分析 Java：

- Java 基础：基本特性和机制；
- Java 并发：并发编程、Java 虚拟机；
- Java 框架：数据库框架、Spring 生态、分布式框架等等；
- Java 安全：常见的安全问题和处理方法；
- Java 性能：掌握工具、方法论。

# Java 基础

# 11、Java IO 方式，NIO 多路复用

## IO 常见分类

IO 一直是软件开发中的核心部分之一，伴随着海量数据增长和分布式系统的发展，IO 扩展能力愈发重要。幸运的是，Java 平台 IO 机制经过不断完善，虽然在某些方面仍有不足，但 已经在实践中证明了其构建高扩展性应用的能力。

Q：Java 提供了哪些 IO 方式？NIO 如何实现多路复用？

A：Java IO 方式有很多种，基于不同的 IO 抽象模型和交互方式，可以进行简单区分。

（1）首先，传统的 `java.io` 包，它基于流模型实现，提供了我们最熟知的一些 IO 功能，比如 File 抽象、输入输出流等。交互方式是同步、阻塞的方式，也就是说，在读取输入流或者写入输 出流时，在读、写动作完成之前，线程会一直阻塞在那里，它们之间的调用是可靠的线性顺序。

`java.io` 包的好处是代码比较简单、直观，缺点则是 IO 效率和扩展性存在局限性，容易成为应用性能的瓶颈。

很多时候，人们也把 `java.net` 下面提供的部分网络 API，比如 `Socket`、`ServerSocket`、`HttpURLConnection` 也归类到同步阻塞 IO 类库，因为网络通信同样是 IO 行为。

（2）在 Java 1.4 中引入了 NIO 框架（`java.nio` 包），提供了 `Channel`、`Selector`、`Buffer` 等新的抽象，可以构建多路复用的、同步非阻塞 IO 程序，同时提供了更接近操作系统底层的高性能数据操作方式。

（3）在 Java 7 中，NIO 有了进一步的改进，也就是 NIO 2，引入了异步非阻塞 IO 方式，也有很多人叫它AIO（Asynchronous IO）。异步 IO 操作基于事件和回调机制，可以简单理解为，应用操作直接返回，而不会阻塞在那里，当后台处理完成，操作系统会通知相应线程进行后续工作。

总结：上面列出的是一种常见的分类方式，即所谓的 BIO、NIO、NIO 2（AIO）。

实际我们可以继续扩展：

- 基础 API 功能和设计，`InputStream/OutputStream` 和 `Reader/Writer` 的关系和区别；
- NIO、NIO 2 的基本组成；
- 给定场景，分别用不同模型实现，分析 BIO、NIO 等模式的设计和实现原理；
- NIO 提供的高性能数据操作方式是基于什么原理的？如何使用？
- 或者，从开发者的角度上看，你觉得 NIO 自身实现存在哪些问题？有什么改进的想法吗？

## 基本概念

- 区分同步或异步（`synchronous/asynchronous`）。简单来说，同步是一种可靠的有序运行机制，当我们进行同步操作时，后续的任务是等待当前调用返回，才会进行下一步； 而异步则相反，其他任务不需要等待当前调用返回，通常依靠事件、回调等机制来实现任务间次序关系；
- 区分阻塞与非阻塞（`blocking/non-blocking`）。在进行阻塞操作时，当前线程会处于阻塞状态，无法从事其他任务，只有当条件就绪才能继续，比如 `ServerSocket` 新连接建立完毕，或数据读取、写入操作完成；而非阻塞则是不管 IO 操作是否结束，直接返回，相应操作在后台继续处理。

不能一概而论认为同步或阻塞就是低效，具体还要看应用和系统特征。

对于 `java.io`，我们都非常熟悉，我这里就从总体上进行一下总结，如果需要学习更加具体的操作，你可以通过[教程](https://docs.oracle.com/javase/tutorial/essential/io/streams.html)等途径完成。总体上，我认为你至少需要理解：

- IO 不仅仅是对文件的操作，网络编程中，比如 Socket 通信，都是典型的 IO 操作目标；
- 输入流、输出流（`InputStream/OutputStream`）是用于读取或写入字节的，例如操作图片文件；
- 而 `Reader/Writer` 则是用于操作字符，增加了字符编解码等功能，适用于类似从文件中读取或者写入文本信息。本质上计算机操作的都是字节，不管是网络通信还是文件读取，`Reader/Writer` 相当于构建了应用逻辑和原始数据之间的桥梁；
- `BuferedOutputStream` 等带缓冲区的实现，可以避免频繁的磁盘读写，进而提高 IO 处理效率。这种设计利用了缓冲区，将批量数据进行一次操作，但在使用中千万别忘了 `flush` ；
- 参考下面这张类图，很多 IO 工具类都实现了 `Closeable` 接口，因为需要进行资源的释放。比如，打开`FileInputStream`，它就会获取相应的文件描述符（`FileDescriptor`），需要利用 `try-with-resources`、 `try-fnally` 等机制保证 `FileInputStream` 被明确关闭，进而相应文件描述符也会失效，否则将导致资源无法被释放。利用之前提到的 `Cleaner` 或 `fnalize` 机制作为资源释放的最后把关，也是必要的。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220605185201.png)

## Java NIO 概览

首先，熟悉一下 NIO 的主要组成部分：

- `Buffer`，高效的数据容器，除了布尔类型，所有原始数据类型都有相应的 Buffer 实现；
- `Channel`，类似在 Linux 之类操作系统上看到的文件描述符，是 NIO 中被用来支持批量式 IO 操作的一种抽象；

File 或者 Socket，通常被认为是比较高层次的抽象，而 Channel 则是更加操作系统底层的一种抽象，这也使得 NIO 得以充分利用现代操作系统底层机制，获得特定场景的性能优化，例如，DMA（Direct Memory Access）等。不同层次的抽象是相互关联的，我们可以通过 Socket 获取 Channel，反之亦然。

- `Selector`，是 NIO 实现多路复用的基础，它提供了一种高效的机制，可以检测到注册在 Selector 上的多个Channel 中，是否有 Channel 处于就绪状态，进而实现了单线程对多 Channel 的高效管理；

Selector 同样是基于底层操作系统机制，不同模式、不同版本都存在区别，例如，在最新的代码库里，相关实现如下：

Linux 上依赖于 epoll（http://hg.openjdk.java.net/jdk/jdk/fle/d8327f838b88/src/java.base/linux/classes/sun/nio/ch/EPollSelectorImpl.java）。

Windows 上 NIO2（AIO）模式则是依赖于 iocp（http://hg.openjdk.java.net/jdk/jdk/fle/d8327f838b88/src/java.base/windows/classes/sun/nio/ch/Iocp.java）。

- `Chartset`，提供 Unicode 字符串定义，NIO 也提供了相应的编解码器等，例如，通过下面的方式进行字符串到 `ByteBuffer` 的转换：

```java
Charset.defaultCharset().encode("Hello Word");
```

## NIO 能解决什么问题？

下面通过一个典型的场景来分析为什么需要 NIO，为什么需要多路复用。

设想，我们需要一个服务器应用，只简单要求能够同时服务多个客户端请求即可，使用 `java.io` 和 `java.net` 中的同步、阻塞式 API，可以简单实现：

```java
public class DemoServer extends Thread {
    
    private ServerSocket serverSocket;
    
    public int getPort() {
        return serverSocket.getLocalPort();
    }
    
    public void run() {
        try {
            
            serverSocket = new ServerSocket(0);
            
            while (true) {
                Socket socket = serverSocket.accept();
                RequestHandler requestHandler = new RequestHandler(socket);
                requestHandler.start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (serverSocket != null) {
                try {
                    serverSocket.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public static void main(String[] args) {
        DemoServer server = new DemoServer();
        server.start();
        
        try (Socket client = new Socket(InetAddress.getLocalHost(), server.getPort())) {
            
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(client.getInputStream()));
            bufferedReader.lines().forEach(System.out::println);
            
        } catch (UnknownHostException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

// 简化实现，不做读取，直接发送字符串
class RequestHandler extends Thread {
    
    private Socket socket;

    public RequestHandler(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        try (PrintWriter out = new PrintWriter(socket.getOutputStream())) {
            out.println("Hello World!");
            out.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

其实现要点：

- 服务器端启动 ServerSocket，端口 0 表示自动绑定一个空闲端口；
- 调用 accept 方法，阻塞等待客户端连接；
- 利用 Socket 模拟了一个简单的客户端，只进行连接、读取、打印；
- 当连接建立后，启动一个单独线程负责回复客户端请求。

这样，一个简单的 Socket 服务器就被实现出来了。

思考一下，这个解决方案在扩展性方面，可能存在什么潜在问题呢？

大家知道 Java 语言目前的线程实现是比较重量级的，启动或者销毁一个线程是有明显开销的，每个线程都有单独的线程栈等结构，需要占用非常明显的内存，所以，每一个 Client 启动一个线程似乎都有些浪费。

那么，稍微修正一下这个问题，我们引入线程池机制来避免浪费。

```java
serverSocket = new ServerSocket(0);
ExecutorService executor = Executors.newFixedThreadPool(8);

while (true) {
    Socket socket = serverSocket.accept();
    RequestHandler requestHandler = new RequestHandler(socket);
    executor.execute(requestHandler);
}
```

这样做似乎好了很多，通过一个固定大小的线程池，来负责管理工作线程，避免频繁创建、销毁线程的开销，这是我们构建并发服务的典型方式。这种工作方式，可以参考下图来理解：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220605192141.png)

如果连接数并不是非常多，只有最多几百个连接的普通应用，这种模式往往可以工作的很好。但是，如果连接数量急剧上升，这种实现方式就无法很好地工作了，因为线程上下文切换开销会在高并发时变得很明显，这是同步阻塞方式的低扩展性劣势。

NIO 引入的多路复用机制，提供了另外一种思路：

```java
public class NIOServer extends Thread {
    
    @Override
    public void run() {
        try (Selector selector = Selector.open()) {
            ServerSocketChannel serverSocket = ServerSocketChannel.open();
            serverSocket.bind(new InetSocketAddress(InetAddress.getLocalHost(), 8888));
            // 配置非阻塞模式
            serverSocket.configureBlocking(false);
            // 注册到 Selector，并说明关注点
            serverSocket.register(selector, SelectionKey.OP_ACCEPT);
            
            while (true) {
                selector.select();  // 阻塞等待就绪的 channel, 这是关键点之一
                Set<SelectionKey> selectionKeys = selector.selectedKeys();
                Iterator<SelectionKey> iterator = selectionKeys.iterator();
                while (iterator.hasNext()) {
                    SelectionKey key = iterator.next();
                    // 生产系统中一般会额外进行就绪状态检查
                    if (key.isAcceptable()) {
                        sayHelloWorld((ServerSocketChannel) key.channel());
                    }
                    iterator.remove();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void sayHelloWorld(ServerSocketChannel server) {
        try (SocketChannel client = server.accept()) {
            client.write(Charset.defaultCharset().encode("Hello World!"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

这个非常精简的样例掀开了 NIO 多路复用的面纱，我们可以分析下主要步骤和元素：

- 首先，通过 `Selector.open()` 创建一个 `Selector`，作为类似调度员的角色；
- 然后，创建一个 `ServerSocketChannel`，并且向 `Selector` 注册，通过指定 `SelectionKey.OP_ACCEPT`，告诉调度员，它关注的是新的连接请求；

注意，为什么我们要明确配置非阻塞模式呢？这是因为阻塞模式下，注册操作是不允许的，会抛出 `IllegalBlockingModeException` 异常。

- `Selector` 阻塞在 `select` 操作，当有 `Channel` 发生接入请求，就会被唤醒；
- 在 `sayHelloWorld` 方法中，通过 `SocketChannel` 和 `Buffer` 进行数据操作，在本例中是发送了一段字符串。

可以看到，在前面两个样例中，IO 都是同步阻塞模式，所以需要多线程以实现多任务处理。而 NIO 则是利用了单线程轮询事件的机制，通过高效地定位就绪的 Channel，来决定做什么，仅仅 select 阶段是阻塞的，可以有效避免大量客户端连接时，频繁线程切换带来的问题，应用的扩展能力有了非常大的提高。下面这张图对这种实现思路进行了形象地说明：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220605212957.png)

在 Java 7 引入的 NIO 2 中，又增添了一种额外的异步 IO 模式，利用事件和回调，处理 Accept、Read 等操作。 AIO 实现看起来是类似这样子：

```java
AsynchronousServerSocketChannel serverSock = AsynchronousServerSocketChannel.open().bind(sockAddr);

serverSock.accept(serverSock, new CompletionHandler<>() { //为异步操作指定 CompletionHandler 回调函数
    @Override
    public void completed(AsynchronousSocketChannel sockChannel, AsynchronousServerSocketChannel serverSock) {
        serverSock.accept(serverSock, this);
        // 另外一个 write（sock，CompletionHandler{}）
        sayHelloWorld(sockChannel, Charset.defaultCharset().encode
                      ("Hello World!"));
    }
    // 省略其他路径处理方法...
});
```

概念：

- 基本抽象很相似，`AsynchronousServerSocketChannel` 对应于上面例子中的 `ServerSocketChannel`；`AsynchronousSocketChannel` 则对应 `SocketChannel`；
- 业务逻辑的关键在于，通过指定 `CompletionHandler` 回调接口，在 `accept/read/write` 等关键节点，通过事件机制调用，这是非常不同的一种编程思路。

## NIO 多路复用的局限性

（1）由于 NIO 实际上是同步非阻塞 IO，是一个线程在同步的进行事件处理，当一组 Channel 处理完毕之后，去检查有没有又可以处理的 Channel。这就是同步 + 非阻塞。同步，是指每个准备好的 Channel 处理是依次进行的，非阻塞，是指线程不会傻傻的等待读。只有当 Channel 准备好后，才会进行。

那么就会有这样一个问题：当每个 Channel 所进行的都是耗时操作，由于是同步的，就会积压很多 Channel 任务，从而影响效率。此时就需要对 NIO 进行类似负载均衡的操作，例如用线程池管理读写，将耗时的 Channel 分给其他线程执行，这样既充分利用每个线程，又不至于都堆积在一个线程中，等待执行。

（2）可以从三个方面看 NIO：

- 网络并非时刻可读可写。使用 NIO 时需要注意这个问题，Channel 是不能滥用的，当读不出来写不进去的时候，就需要考虑让度线程资源了；
- NIO 在不同的平台上实现方式不一样，比如 Linux 和 Windows，这就涉及到系统内核的相关知识了，比如 Linux 用的是 epoll 模型；
- NIO 在 IO 操作上本身还是阻塞的，也就是说它是同步 IO，AIO 读写行为的回调才是异步 IO，而这个真正实现，还是要看系统底层。 

**局限性：**对于多路复用 IO，当有的 IO 请求在数据拷贝阶段，出现由于资源类型过分庞大而导致线程长期阻塞，最后造成性能瓶颈的情况。

# 12、Java 各种文件拷贝方式

## 问题分析

我们要明白，NIO 不止是多路复用，NIO 2 也不只是异步 IO，下面看看 Java IO 体系中，其他不可忽略的部分。

Q：Java 中有几种文件拷贝方式？哪一种最高效？

A：Java 中有多种比较典型的文件拷贝方式，比如：

（1）利用 `java.io` 库，直接为源文件构建一个 `FileInputStream` 读取，然后再为目标文件构建一个 `FileOutputStream`，完成写入工作。

```java
public static void copyFileByStream(File source, File dest) {
    try (InputStream is = new FileInputStream(source);
         OutputStream os = new FileOutputStream(dest)) {

        byte[] buffer = new byte[1024];
        int length;
        while ((length = is.read(buffer)) > 0) {
            os.write(buffer, 0, length);
        }
    } catch (FileNotFoundException e) {
        e.printStackTrace();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

（2）或者，利用 `java.nio` 类库提供的 `transferTo` 或 `transferFrom` 方法实现。

```java
public static void copyFileByChannel(File source, File dest) {

    try (FileChannel sourceChannel = new FileInputStream(source).getChannel();
         FileChannel targetChannel = new FileOutputStream(dest).getChannel()) {

        for (long count = sourceChannel.size(); count > 0;) {
            long transferred = sourceChannel.transferTo(sourceChannel.position(), count, targetChannel);
            sourceChannel.position(sourceChannel.position() + transferred);
            count -= transferred;
        }
    } catch (FileNotFoundException e) {
        e.printStackTrace();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```



（3）当然，Java 标准类库本身已经提供了几种 `Files.copy` 的实现。

对于 Copy 的效率，这个其实与操作系统和配置等情况相关，总体上来说，NIO transferTo/From 的方式**可能**更快，因为它更能利用现代操作系统底层机制，避免不必要拷贝和上下 文切换。

从技术角度上，下面这些方面值得我们注意：

- 不同的 copy 方式，底层机制有什么区别？
- 为什么零拷贝（zero-copy）可能更有优势？
- Buffer 分类与使用；
- Direct Buffer 对垃圾回收等方面的影响与实际选择。

## 拷贝实现机制分析

先来理解一下，前面实现的不同拷贝方法，本质上有什么明显的区别。

首先，你需要理解用户态空间（User Space）和内核态空间（Kernel Space），这是操作系统层面的基本概念，操作系统内核、硬件驱动等运行在内核态空间，具有相对高的特权；而用户态空间，则是给普通应用和服务使用。你可以参考：https://en.wikipedia.org/wiki/User_space。

当我们使用输入输出流进行读写时，实际上是进行了多次上下文切换，比如应用读取数据时，先在内核态将数据从磁盘读取到内核缓存，再切换到用户态将数据从内核缓存读取到用 户缓存。

写入操作也是类似，仅仅是步骤相反，可以参考下面这张图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220606132523.png)

所以，这种方式会带来一定的额外开销，可能会降低 IO 效率。

而基于 `NIO transferTo` 的实现方式，在 Linux 和 Unix 上，则会使用到零拷贝技术，数据传输并不需要用户态参与，省去了上下文切换的开销和不必要的内存拷贝，进而可能提高应用 拷贝性能。注意，transferTo 不仅仅是可以用在文件拷贝中，与其类似的，例如读取磁盘文件，然后进行 Socket 发送，同样可以享受这种机制带来的性能和扩展性提高。

transferTo 的传输过程是：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220606132626.png)

## Java IO/NIO 源码

前面提到的第三种复制文件的方法：`java.nio.file.Files.copy`，该方法有几个重载（JDK 11）：

```java
public static Path copy(Path source, Path target, CopyOption... options)
        throws IOException
    
public static long copy(InputStream in, Path target, CopyOption... options)
        throws IOException
    
public static long copy(Path source, OutputStream out) throws IOException
```

从第一个方法可以看到 copy 不仅仅是支持文件之间操作，没有人限定输入输出流一定是针对文件的。

后面两种 copy 实现，能够在方法实现里直接看到使用的是 `InputStream.transferTo()`，你可以直接看源码，其内部实现其实是 stream 在用户态的读写；而对于第一种方法的分析过程要相对麻烦一些，可以参考下面片段。简单起见，我只分析同类型文件系统拷贝过程。

```java
public static Path copy(Path source, Path target, CopyOption... options)
    throws IOException
{
    FileSystemProvider provider = provider(source);
    if (provider(target) == provider) {
        // same provider
        provider.copy(source, target, options);  // 本文分析路径
    } else {
        // different providers
        CopyMoveHelper.copyToForeignTarget(source, target, options);
    }
    return target;
}
```

我把源码分析过程简单记录如下，JDK 的源代码中，内部实现和公共 API 定义也不是可以能够简单关联上的，NIO 部分代码甚至是定义为模板而不是 Java 源文件，在 build 过程自动生成源码，下面顺便介绍一下部分 JDK 代码机制和如何绕过隐藏障碍。

- 首先，直接跟踪，发现 `FileSystemProvider` 只是个抽象类，阅读它的[源码](http://hg.openjdk.java.net/jdk/jdk/file/f84ae8aa5d88/src/java.base/share/classes/java/nio/file/spi/FileSystemProvider.java)能够理解到，原来文件系统实际逻辑存在于 JDK 内部实现里，公共 API 其实是通过 `ServiceLoader` 机制加载一系列文件系统实现，然后提供服务。
- 我们可以在 JDK 源码里搜索 `FileSystemProvider` 和 nio，可以定位到 [sun/nio/fs](sun/nio/fs)，我们知道 NIO 底层是和操作系统紧密相关的，所以每个平台都有自己的部分特有文件系统逻辑。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220606170639.png)

- 省略掉一些细节，最后我们一步步定位到 `UnixFileSystemProvider` →  `UnixCopyFile.Transfer`，发现这是个本地方法。
- 最后，明确定位到 [UnixCopyFile.c](http://hg.openjdk.java.net/jdk/jdk/file/f84ae8aa5d88/src/java.base/unix/native/libnio/fs/UnixCopyFile.c)，其内部实现清楚说明这只是简单的用户态空间拷贝。

所以，我们明确这个最常见的 copy 方法其实不是利用 transferTo，而是本地技术实现的用户态拷贝。 前面谈了不少机制和源码，我简单从实践角度总结一下，如何提高类似拷贝等 IO 操作的性能，有一些宽泛的原则：

- 在程序中，使用缓存等机制，合理减少 IO 次数（在网络通信中，如 TCP 传输，window 大小也可以看作是类似思路）。
- 使用 transferTo 等机制，减少上下文切换和额外 IO 操作。
- 尽量减少不必要的转换过程，比如编解码；对象序列化和反序列化，比如操作文本文件或者网络通信，如果不是过程中需要使用文本信息，可以考虑不要将二进制信息转换成字符串，直接传输二进制信息。

## 掌握 NIO Buffer

前面提到 Buffer 是 NIO 操作数据的基本工具，Java 为每种原始数据类型都提供了相应的 Buffer 实现（布尔除外），所以掌握和使用 Buffer 是十分必要的，尤其是涉及到 `Direct Buffer` 的使用，因为其在垃圾回收等方面的特殊性，更要重点掌握。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220606171441.png)

`Buffer` 有几个基本属性：

- `capcity`，它反映这个 Buffer 到底有多大，也就是数组的长度；
- `position`，要操作的数据起始位置；
- `limit`，相当于操作的限额。在读取或者写入时，limit 的意义很明显是不一样的。比如，读取操作时，很可能将 limit 设置到所容纳数据的上限；而在写入时，则会设置容量或容量以下的可写限度；
- `mark`，记录上一次 postion 的位置，默认是 0，算是一个便利性的考虑，往往不是必须的。
- 大小关系：`Invariants: mark <= position <= limit <= capacity`

前面三个是我们日常使用最频繁的，我简单梳理下 Buffer 的基本操作：

- 我们创建了一个 `ByteBufer`，准备放入数据，`capcity` 当然就是缓冲区大小，而 `position` 就是 0，`limit` 默认就是 `capcity` 的大小；
- 当我们写入几个字节的数据时，`position` 就会跟着水涨船高，但是它不可能超过 `limit` 的大小；
- 如果我们想把前面写入的数据读出来，需要调用 `flip` 方法，将 `position` 设置为 0，`limit` 设置为以前的`position` 那里；
- 如果还想从头再读一遍，可以调用 `rewind`，让 `limit` 不变，`position` 再次设置为 0。

更进一步的详细使用，我建议参考相关[教程](https://jenkov.com/tutorials/java-nio/buffers.html)。

## Direct Buffer 和垃圾收集

我这里重点介绍两种特别的 `Buffer`。

- `Direct Buffer`：如果我们看到 `Buffer` 的方法定义，你会发现它定义了一个 `isDirect` 方法，返回当前 Buffer 是否是 Direct 类型。这是因为 Java 提供了堆内和堆外（Direct）Buffer，我们可以以它的 `allocate` 或者 `allocateDirect` 方法直接创建；
- `MappedByteBuffer`：它将文件按照指定大小直接映射为内存地址，当程序访问这个内存区域时，将直接操作这块儿的文件数据，省去了将数据从内核空间想用户空间传输的损耗。我们可以使用 [FileChannel.map](https://docs.oracle.com/javase/9/docs/api/java/nio/channels/FileChannel.html#map-java.nio.channels.FileChannel.MapMode-long-long-) 创建 `MappedByteBuffer`，它本质上也是种 Direct Buffer。

在实际使用中，Java 会尽量对 Direct Bufer 仅做本地 IO 操作，对于很多大数据量的 IO 密集操作，可能会带来非常大的性能优势，因为：

- `Direct Buffer` 生命周期内内存地址都不会再发生更改，进而内核可以安全地对其进行访问，很多 IO 操作会很高效。
- 减少了堆内对象存储的可能额外维护工作，所以访问效率可能有所提高。

但是请注意，Direct Buffer 创建和销毁过程中，都会比一般的堆内 Buffer 增加部分开销，所以通常都建议用于长期使用、数据较大的场景。

使用 Direct Buffer，我们需要清楚它对内存和 JVM 参数的影响。首先，因为它不在堆上，所以 Xmx 之类参数，其实并不能影响 Direct Buffer 等堆外成员所使用的内存额度，我们可 以使用下面参数设置大小：

```
-XX:MaxDirectMemorySize=512M
```

从参数设置和内存问题排查角度来看，这意味着我们在计算 Java 可以使用的内存大小的时候，不能只考虑堆的需要，还有 Direct Buffer 等一系列堆外因素。如果出现内存不足，堆外内存占用也是一种可能性。

另外，大多数垃圾收集过程中，都不会主动收集 Direct Buffer，它的垃圾收集过程，就是基于前面所介绍的Cleaner（一个内部实现）和幻象引用 （PhantomReference）机制，其本身不是 public 类型，内部实现了一个Deallocator 负责销毁的逻辑。对它的销毁往往要拖到 full GC 的时候，所以使用不当很容易导致OutOfMemoryError。

对于Direct Buffer 的回收，我有几个建议：

- 在应用程序中，显式地调用 `System.gc()` 来强制触发；
- 另外一种思路是，在大量使用 Direct Buffer 的部分框架中，框架会自己在程序中调用释放方法，Netty 就是这么做的，有兴趣可以参考其实现（PlatformDependent0）；
- 重复使用 Direct Buffer。

## 跟踪和诊断 Direct Buffer 内存占用

因为通常的垃圾收集日志等记录，并不包含 `Direct Buffer` 等信息，所以 Direct Buffer 内存诊断也是个比较头疼的事情。幸好，在 JDK 8 之后的版本，我们可以方便地使用 `Native Memory Tracking（NMT）` 特性来进行诊断，你可以在程序启动时加上下面参数：

```
-XX:NativeMemoryTracking={ summary | detail }
```

注意，激活 NMT 通常都会导致 JVM 出现 5%~10% 的性能下降，请谨慎考虑。

运行时，可以采用下面命令进行交互式对比：

```
// 打印 NMT 信息
jcmd <pid> VM.native_memory detail

// 进行 baseline，以对比分配内存变化
jcmd <pid> VM.native_memory baseline

// 进行 baseline，以对比分配内存变化
jcmd <pid> VM.native_memory detail.diff
```

我们可以在 Internal 部分发现 Direct Buffer 内存使用的信息，这是因为其底层实际是利用 `unsafe_allocatememory`。严格说，这不是 JVM 内部使用的内存，所以在 JDK 11 以后， 其实它是归类在 other 部分里。 JDK 9 的输出片段如下，“+”表示的就是 diff 命令发现的分配变化：

```
-Internal (reserved=679KB +4KB, committed=679KB +4KB)
 (malloc=615KB +4KB #1571 +4)
 (mmap: reserved=64KB, committed=64KB)
```

注意：JVM 的堆外内存远不止 Direct Buffer，NMT 输出的信息当然也远不止这些，后续再分析。

## Channel 读取时, 分段存储对应的 Buffer

（1）可以利用 NIO分散-scatter 机制来写入不同 buffer。 

```java
ByteBufer header = ByteBufer.allocate(128); 
ByteBufer body = ByteBufer.allocate(1024); 
ByteBufer[] buferArray = { header, body }; 
channel.read(buferArray);
```



 注意:该方法适用于请求头长度固定。

## 总结

（1）在初始化 `DirectByteBuffer` 对象时，如果当前堆外内存的条件很苛刻时，会主动调用 `System.gc()` 强制执行 FGC。所以一般建议在使用 netty 时开启 `XX:+DisableExplicitGC`

（2）零拷贝是不是可以理解为内核态空间与磁盘之间的数据传输，不需要再经过用户态空间