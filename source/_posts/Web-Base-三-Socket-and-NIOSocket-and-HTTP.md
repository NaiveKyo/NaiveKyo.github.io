---
title: Web Base (三) Socket and NIOSocket and HTTP
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/banner/5.jpg'
coverImg: /medias/banner/5.jpg
toc: true
date: 2021-09-20 16:11:19
top: false
cover: false
summary: 网站基础知识之 Java Scoket、NioScoket 以及 HTTP 协议。
categories: "Website Basics"
keywords: ["Website Basics", "Java Scoket", "Java NioScoket", "HTTP"]
tags: "Website Basics"
---

## 一、Java Socket

### 1、普通 Socket 用法

Java 中网络通信是通过 Socket 实现的，Socket 分为 `ServerSocket` 和 `Socket` 两大类

- ServerSocket 用于服务端，可以通过 `accept` 方法监听请求，监听到请求后返回 Socket，该 Socket 用于具体完成数据传输
- 客户端可以直接使用 Socket 发起请求并完成传输数据

两者的用法具体参见：[Java 网络编程简介](https://naivekyo.github.io/2021/08/15/java-network-programing-intro/)



### 2、NioSocket 的用法

#### 2.1、简介

从 JDK 1.4 开始，Java 新增了新的 io 模式 —— nio（new IO），nio 在底层采用了全新的处理方式，极大的提高了 IO 的效率。我们使用的 Scoket 也属于 IO 的一种，nio 提供了相应的工具：

- `ServerSocketChannel`
- `SocketChannel`

它们分别对应原来的 ServerSocket 和 Socket

<br />

以前的处理方式，就是服务端 `ServerSocket` 作为一个监控线程，监听到一个客户端请求就处理它，处理完之后再继续监听等待下一个请求，在处理请求的过程中是阻塞的。

这种方式一次只能处理一个请求且处理期间无法进行其他操作，一旦请求变多了，效率将会极其低下。

<br />

下面看看 nio，如果想使用 NioSocket 必须先理解三个概念：

- **Buffer**
- **Channel**
- **Selector**

举个例子说明： nio 就和我们生活中快递的配送服务类似，商家和快递公司达成协议，每天快递公司在固定时间过来取一批货物，将这批货物发往中转站，中转站有专门的分拣员负责按配送范围把货物分给不同的送货员，这样效率就很高了。

这个过程中，`Buffer` 就相当于这批货物，`Channel` 就是送货员（或者开往某个区域的配货车），`Selector` 就是中转站的分拣员。

<br />

NioSocket 的使用中首先要创建 `ServerSocketChannel`，然后注册 `Selector`，接下来就可以用 `Selector` 接收请求并处理了。

`ServerSocketChannel` 可以使用自己的静态工厂方法 open 创建。每个 `ServerSocketChannel` 对应 一个 `ServerSocket`，可以调用其 socket 方法来获取，不过如果直接使用获取到的 ServerSocket 来监听请求，那还是原来的处理模式，一般使用获取到的 ServerSocket 来绑定端口。

`ServerSocketChannel` 可以通过 `configureBlocking` 方法来设置是否采用阻塞模式，如果要采用非阻塞模式可以用 `configureBlocking(false)` 来设置，设置了非阻塞模式之后就可以调用 register 方法注册 Selector 来使用了（阻塞模式不可以使用 Selector）。

<br />

`Selector` 可以通过其静态工厂方法 open 创建，创建后通过 Channel 的 register 方法注册到 `ServerSocketChannel` 或者 `SocketChannel`，注册完之后 Selector 就可以通过 select 方法来等待请求，select 方法有一个 long 类型的参数，代表最长等待时间，如果这段时间里接收到了相应操作的请求则返回可以处理的请求的数量，否则在超时后返回 0，程序继续往下走，如果传入的参数为 0 或者调用无参数的重载方法，select 方法会采用阻塞模式直到有相应操作的请求出现。当接收到请求后 Selector 调用 selectedKeys 方法返回 `SelectionKey` 的集合。

**SelectionKey 保存了处理当前请求的 Channel 和 Selector**，并且提供了不同的操作类型。

Channel 在注册 Selector 的时候可以通过 register 的第二个参数选择特定的操作，这里的操作就是在 SelectionKey 中定义的，一共四个：

- `SelectionKey.OP_ACCEPT`
- `SelectionKey.OP_CONNECT`
- `SelectionKey.OP_READ`
- `SelectionKey.OP_WRITE`

分别代表：接收请求操作、连接操作、读操作和写操作

只有在 register 方法中注册了相应的操作，Selector 才会关心相应类型操作的请求。

<br />

Channel 和 Selector 并没有谁属于谁的关系，就像一个分拣员可以为多个地区分拣货物而每个地区也可以有多个分拣员一样，它们类似数据库的多对多的关系，不过 Selector 这个分拣员分的更细，可以按照不同类型来分拣，分拣后的结果保存在 SelectionKey 中，可以分别通过 SelectionKey 的 channel 方法和 seletor 方法来获取对应的 Channel 和 Selector，而且还可以通过 isAcceptable、isConnectable、isReadable 和 isWriable 方法来判断是什么类型的操作。

<br />

#### 2.2、例子

NioSocket 中服务端的处理过程可以分为 5 步：

1. 创建 `ServerSocketChannel` 并设置相应参数
2. 创建 `Selector` 并注册到 `ServerSocketChannel` 上
3. 调用 `Selector` 的`select`方法等待请求
4. `Selector` 接收到请求后使用 `selectedKeys` 返回 `SelectionKey` 集合
5. 使用 `SelectionKey` 获取到 Channel、Selector 和操作类型并进行具体的操作



看下面的例子（实现功能：客户端向服务端发送数据）

> 客户端：

```java
public class Client {

    public static void main(String[] args) {
        
        String msg = "Client Data";
        
        try {
            // 创建一个 Socket, 跟本机的 8080 端口连接
            Socket socket = new Socket("127.0.0.1", 8080);
            // 使用 Socket 创建 PrintWriter 和 BufferedReader 进行读写数据
            PrintWriter pw = new PrintWriter(socket.getOutputStream());
            BufferedReader is = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            // 发送数据
            pw.println(msg);
            pw.flush();
            
            // 接收数据
            String line = is.readLine();
            System.out.println("received from server: " + line);
            // 关闭资源
            pw.close();
            is.close();
            socket.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

> 服务端

```java
public class NioServer {

    public static void main(String[] args) {
        
        try {
            // 1. 创建 ServerSocketChannel 监听 8080 端口
            ServerSocketChannel ssc = ServerSocketChannel.open();
            ssc.bind(new InetSocketAddress(8080));
            // 设置非阻塞模式
            ssc.configureBlocking(false);
            // 2. 为 ssc 注册选择器
            Selector selector = Selector.open();
            ssc.register(selector, SelectionKey.OP_ACCEPT);
            // 3. 创建自定义的构造器
            Handler handler = new Handler(1024);
            while (true) {
                // 等待请求，每次等待阻塞 3 秒，超过 3s 后线程继续向下运行，如果传入 0 或者不传入参数将一直阻塞
                if (selector.select(3000) == 0) {
                    System.out.println("等待请求超时...");
                    continue;
                }
                System.out.println("处理请求...");
                // 获取待处理的 SelectionKey
                Iterator<SelectionKey> keyIter = selector.selectedKeys().iterator();
                
                while (keyIter.hasNext()) {
                    SelectionKey key = keyIter.next();
                    
                    try {
                        // 接收到连接请求时
                        if (key.isAcceptable()) {
                            handler.handleAccept(key);
                        }
                        // 读数据
                        if (key.isReadable()) {
                            handler.handleRead(key);
                        }
                    } catch (IOException ex) {
                        keyIter.remove();
                        continue;
                    }
                    // 处理完后，从待处理的 SelectionKey 迭代器中移除当前所使用的 key
                    keyIter.remove();
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    private static class Handler {
        
        private int bufferSize = 1024;
        
        private String localCharset = "UTF-8";

        public Handler() {
        }

        public Handler(int bufferSize, String localCharset) {
            if (bufferSize > 0)
                this.bufferSize = bufferSize;
            if (localCharset != null && !"".equals(localCharset))
                this.localCharset = localCharset;
        }

        public Handler(int bufferSize) {
            this(bufferSize, null);
        }

        public Handler(String localCharset) {
            this(-1, localCharset);
        }
        
        public void handleAccept(SelectionKey key) throws IOException {

            // 得到 ServerSocketChannel 对应的 SocketChannel
            SocketChannel sc = ((ServerSocketChannel) key.channel()).accept();
            // 配置非阻塞模式
            sc.configureBlocking(false);
            // 注册选择器, 设置类型为 读操作，分配缓存区
            sc.register(key.selector(), SelectionKey.OP_READ, ByteBuffer.allocate(bufferSize));
        }
        
        public void handleRead(SelectionKey key) throws IOException {
            
            // 获取 channel
            SocketChannel sc = (SocketChannel) key.channel();
            // 获取 buffer 并重置
            ByteBuffer buffer = (ByteBuffer) key.attachment();
            buffer.clear();
            // 没有读取到内容则关闭
            if (sc.read(buffer) == -1) {
                sc.close();
            } else {
                // 将 buffer 转换为读状态
                buffer.flip();
                // 将 buffer 中接收到的值按 localCharset 格式编码后保存到 receivedString
                String receivedString = Charset.forName(localCharset).newDecoder().decode(buffer).toString();
                System.out.println("received from client: " + receivedString);
                
                // 返回数据给客户端
                String sendString = "received data: " + receivedString;
                buffer = ByteBuffer.wrap(sendString.getBytes(localCharset));
                sc.write(buffer);
                // 关闭 Socket
                sc.close();;
            }
        }
    }
}
```

在服务端程序中，当监听到请求时根据 SelectionKey 的状态交给内部类 Handler 处理，Handler 可以通过重载的构造方法设置编码格式和每次读取数据的最大值。

Handler 处理过程中用到了 Buffer，Buffer 是 java.nio 包中的一个类，专门用于存储数据，Buffer 中有 4 个属性非常重要：

- **capactiy**：容量，也就是 Buffer 最多可以保存元素的数量，在创建时设置，使用过程中不可以改变
- **limit**：可以使用的上限，开始创建时 limit 和 capacity 的值相同，如果给 limit 设置一个值之后，limit 就成了最大可以访问的值，其值不可以超过 capacity。
  - 比如，一个 Buffer 的容量 capacity 是 100，表示最多可以保存 100 个数据，但是现在只往里面写了 20 个数据然后要读取，在读取的时候 limit 就会设置为 20
- **position**：当前所操作元素所在的索引位置，position 从 0 开始，随着 get 和 put 方法自动更新
- **mark**：用来暂时保存 position 的值，position 保存到 mark 后就可以修改并进行相关操作，操作完后可以通过 reset 方法将 mark 的值恢复到 position。
  - 比如，Buffer 中一共保存了 20 个数据，position 的值是 10，现在想读取 15 到 20 之间的数据，这时就可以调用 `Buffer#mark()` 将当前的 position 保存到 mark 中，然后调用 `Buffer#position(15)` 将 position 指向第 15 个元素，这时就可以读取了，读取完之后调用 `Buffer#reset()` 将 position 恢复到 10。
  - mark 默认值为 -1，而且其值必须小于 position 的值，如果调用 `Buffer#postion(int newPosition)` 时传入的 newPosition 比 mark 小则会将 mark 设为 -1
- **这四个属性：mark \<= position \<= limit \<= capacity**



理解了这 4 个属性，Buffer 就容易理解了。

上诉 NioServer 类中中用到了 `clear` 和 `flip` 方法：

- clear：重新初始化 limit、position 和 mark 三个属性，让 limit = capacity 、position = 0、mark = -1
- flip：在保存数据时保存一个数据就让 position 加 1，保存完了之后如果想读出来就需要将 position 最后的值赋给 limit（表示要读取的数据量），然后 position 置为 0，这样就可以读取保存的数据了



`Buffer.java`

```java
public final Buffer clear() {
    position = 0;
    limit = capacity;
    mark = -1;
    return this;
}

public final Buffer flip() {
    limit = position;
    position = 0;
    mark = -1;
    return this;
}
```

#### 2.3、总结

<mark>总结：上面是 NioSocket 的简单使用方法，实际使用的时候一般都会采用多线程方式来处理</mark>





## 二、动手实现 HTTP 协议

HTTP 协议是在应用层解析内容的，只需要按照它规定的报文的格式封装和解析数据就可以了，具体的传输还是使用 Scoket。

我们可以修改上面的 `NioServer.java` ，因为 HTTP 协议是在接收到数据之后才会用到的，所以我们只需要修改 `Handler` 就可以了，修改后的 `HttpHandler`：

- 首先获取到请求报文并打印出报文的头部（包括首行）、请求的方法类型、Url 和 Http 版本
- 最后将接收到的请求报文信息封装到响应报文的主体中返回给客户端。



### 1、重构服务端代码

这里的 HttpHandler 也是采用单线程执行：

```java
public class HttpServer {

    public static void main(String[] args) throws IOException {
        
        // 创建 ServerSocketChannel, 监听 8080 端口
        ServerSocketChannel ssc = ServerSocketChannel.open();
        ssc.bind(new InetSocketAddress(8080));
        // 设置为非阻塞模式
        ssc.configureBlocking(false);
        // 为 ssc 注册 Selector
        Selector selector = Selector.open();
        ssc.register(selector, SelectionKey.OP_ACCEPT);
        // 创建处理器
        while (true) {
            // 等待请求，每次阻塞 3 秒，超过 3 秒就程序继续执行，如果传入 0 或者不穿参数将一直阻塞
            if (selector.select(3000) == 0) {
                continue;
            }
            // 获取待处理的 SelectionKey
            Iterator<SelectionKey> keyIter = selector.selectedKeys().iterator();
            
            while (keyIter.hasNext()) {
                SelectionKey key = keyIter.next();
                // 启动新线程来处理 SelectionKey
                new Thread(new HttpHandler(key)).run();
                // 处理完毕后，从待处理的 SelectionKey 迭代器中移除当前所使用的 key
                keyIter.remove();
            }
        }
    }
    
    private static class HttpHandler implements Runnable {
        
        private int bufferSize = 1024;
        
        private String localCharset = "UTF-8";
        
        private SelectionKey key;

        public HttpHandler(SelectionKey key) {
            this.key = key;
        }

        // 接收客户端请求,并为读取数据做准备
        public void handleAccept() throws IOException {
            // 获取客户端 Socket (即 nio 下的 SocketChannel)
            SocketChannel clientChannel = ((ServerSocketChannel) key.channel()).accept();
            clientChannel.configureBlocking(false);
            clientChannel.register(key.selector(), SelectionKey.OP_READ, ByteBuffer.allocate(bufferSize));
        }
        
        // 读取客户请求中包含的信息
        public void handleRead() throws IOException {
            // 获取 channel
            SocketChannel sc = (SocketChannel) key.channel();
            // 获取 buffer 并重置
            ByteBuffer buffer = (ByteBuffer) key.attachment();
            buffer.clear();
            // 没有读取到内容则关闭
            if (sc.read(buffer) == -1) {
                sc.close();
            } else {
                // 接收请求数据
                buffer.flip();
                String receivedString = Charset.forName(localCharset).newDecoder().decode(buffer).toString();
                // 控制台打印请求报文头
                String[] requestMessage = receivedString.split("\r\n");
                for (String s : requestMessage) {
                    System.out.println(s);
                    // 遇到空行说明报文头已经打印完了
                    if (s.isEmpty())
                        break;
                }
                // 控制台打印首行信息
                String[] firstLine = requestMessage[0].split(" ");
                System.out.println();
                System.out.println("Method:\t" + firstLine[0]);
                System.out.println("url:\t" + firstLine[1]);
                System.out.println("HTTP Version:\t" + firstLine[2]);
                System.out.println();
                
                // 返回客户端
                StringBuilder sendString = new StringBuilder();
                sendString.append("HTTP/1.1 200 OK\r\n"); // 响应报文首行，200 表示处理成功
                sendString.append("Content-Type:text/html;charset=" + localCharset + "\r\n");
                sendString.append("\r\n"); // 报文投结束后加一个空行
                
                sendString.append("<html><head><title>显示报文</title></head><body>");
                sendString.append("接收到的请求报文是:<br/>");
                for (String s : requestMessage) {
                    sendString.append(s + "<br/>");
                }
                sendString.append("</body></html>");
                buffer = ByteBuffer.wrap(sendString.toString().getBytes(localCharset));
                sc.write(buffer);
                sc.close();
            }
        }

        @Override
        public void run() {
            try {
                // 接收到连接请求时
                if (key.isAcceptable())
                    handleAccept();
                // 读数据
                if (key.isReadable())
                    handleRead();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

然后到浏览器输入：`localhost:8080`

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210920161445.png)

IDEA 控制台打印，注意这里会产生两次 http 请求，一次是内容，一次是网页的 favicon 的获取。我们只看第一次的请求报文。

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210920161458.png)



### 2、小结

上述的例子只是一个简单的例子，可以简单了解一下 HTTP 协议的实现方法，这里的功能还不够完善，它不能真正处理请求，实际处理中应该根据不同的 Url 和不同的请求方法进行不同的处理并返回不同的响应报文，另外这里的请求报文也必须在 bufferSize(1024) 范围内，如果太长就会接收不全，而且也不能返回图片等流类型的数据（流类型只需要在响应报文中写清楚 Content-Type 的类型，并将相应数据写入报文的主体就可以了），不过对于了解 HTTP 协议实现的方法已经够用了。