---
title: Java Network Programing Intro
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210715143838.jpg'
coverImg: /img/20210715143838.jpg
toc: true
date: 2021-08-15 00:30:10
top: false
cover: false
summary: Java 网络编程入门
categories: Java
keywords: [Java, Network Programing]
tags: Java
---



# 网络编程

## 一、网络编程入门

### 1、软件结构

- **C/S 结构**：全称为 Client/Server 结构，是指客户端和服务器结构，常见的有 QQ、百度网盘等软件
- **B/S 结构**：全称为 Browser/Server 结构，是指浏览器和服务器结构。



两种结构各有优势，但无论哪一种结构都离不开网络的支持。

**网络编程**，就是在一定的协议下，实现两台计算机通信。



### 2、网络通信协议

- **网络通信协议**：通过计算机网络可以使多台计算机实现连接，位于同一个网络中的计算机进行连接和通信时需要遵守一定的规则，这就好比在道路上行驶的汽车需要遵守交通规则一样。在计算机网络中，这些连接和通信的规则被称为 <strong style="color:red">网络通信协议</strong>。它对数据的传输格式、传输速率、传输步骤等做了统一规定，通信双方必须同时遵守才能完成数据交换。
- **TCP/IP 协议**：传输控制协议/因特网互连协议（Transmission Control Protocol/Internet Protocol），是 Internet 最基本、最广泛的协议。它定义了计算机如何连入因特网，以及数据如何在它们之间传输的标准。它的内部包含一系列的用于处理数据通信的协议，并采用了 4 层的分层模型，每一层都呼叫它的下一层所提供的协议来完成自己的需求：



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210813230640.png)

上图中，TCP/IP 协议中的四层分别是：

- 应用层：
  - 主要负责应用程序的协议，例如 HTTP 协议、FTP 协议等等
- 传输层：
  - 主要负责网络程序之间的通信，在进行网络通信时，可以采用 TCP 协议，也可以采用 UDP 协议
- 网络层：
  - 网络层是整个 TCP/IP 协议的核心，它主要用于将传输的数据进行分组，将分组数据发送到目标计算机或者网络
- 链路层：
  - 定义物理传输通道，通常是对某些网络设备的驱动协议，例如针对光纤、网线提供的驱动





### 3、协议分类

`java.net` 包中包含的类和接口，提供底层次的通信细节。

`java.net` 中提供了对两种常见的网络协议的支持：

- **UDP**：用户数据报协议（User Datagram Protocol）。UDP 是 **无连接通信协议**，即在数据传输时，数据的发送端和接收端不建立逻辑连接。简单来说，当一台计算机向另外一台计算机发送数据时，发送端不会确认接收端是否存在，而是直接发送数据，同样，接收端在收到数据时，也不会向发送端反馈是否收到了数据。
  - 由于使用 UDP 协议<font style="color:red">消耗资源少，通信效率高</font>，所以通常会用于音频、视频和普通数据的传输例如视频会议都使用 UDP 协议，因为这种情况下偶尔丢失一两个数据包，也不会对接收结果产生较大影响。
  - 但是在使用 UDP 协议传输数据时，由于 UDP 的面向无连接性，<font style="color:red">不能保证数据的完整性</font>，因此在传输重要数据时不建议使用 UDP 协议
  - 特点：**数据报大小被限制在 64KB 之内**，超过这个范围就不能发送

<strong style="color:red">数据报（Datagram）：网络传输的基本单位</strong>



- **TCP**：传输控制协议（Transmission Control Protocol）。TCP 协议是 **面向连接** 的通信协议，即传输数据之前，在发送端和接收端之间建立逻辑连接，然后再传输数据，它提供了两台计算机之间**可靠无差错**的数据传输。

  在 TCP 连接中必须要明确客户端与服务器端，由客户端向服务端发送请求连接，每次连接的创建都需要经过 "三次握手"

  - 三次握手：TCP 协议中，在发送数据的准备阶段，客户端与服务器之间的三次交互，以保证连接的可靠。
    - 第一次握手：客户端向服务器端发出连接请求
    - 第二次握手：服务器端向客户端回送一个响应，通知客户端自己收到了请求
    - 第三次握手：客户端再次向服务器端发送确认信息，确认连接。



### 4、网络编程三要素

概述：

- 协议
- IP 地址
- 端口号



> 协议

- **协议**：计算机网络通信必须遵守的规则



> IP 地址

- **IP 地址**：**指互联网协议地址（Internet Protocol Address）**。俗称 ip，IP 地址用来给一个网络中的计算机设备作为唯一的编号。



**IP地址分类**：

- **IPv4**：是一个 32 位的二进制数，通常被分为 4 个字节，表示成 `a.b.c.d` 的形式，例如：`192.168.1.1`。其中 a、b、c、d 都是 0 - 255 之间的十进制整数，最多可以表示 42 亿个 IP 地址。
- **IPv6**：由于互联网蓬勃发展，IP 地址的需求量愈来愈大，为了扩大地址空间，拟通过 Ipv6 重新定义地址空间，采用 128 位地址长度，每 16 个字节一组，分为 8 组十六进制数，表示成 `ABCD:EF01:2356:6789:ABCD:EF01:2345:6789`。



> 常用命令

- 查看本机 IP 地址

```bash
ipconfig # Windows
```

- 检查网络是否连通

```bash
# ping 空格 IP 地址
ping 192.168.1.1
```

- 特殊的 IP：本机 IP ： 127.0.0.1、localhost



> 端口号

网络的通信，本质上是两个进程（应用程序）之间的通信。每台计算机有很多进程，那么在网络通信时，如何区分这些进程呢？

如果说 **IP 地址** 可以唯一标识网络中的设备，那么 **端口号** 就可以唯一标识这台设备中的进程了

- **端口号**：**用两个字节的表示的整数，它的取值范围是 0 - 65535**
  - 0 - 1023 之间的端口用于一些知名的网络服务和应用
  - 普通的应用程序应该使用 1024 以上的端口号。如果端口号被另外一个服务或则和应用占用，会导致当前程序启动失败



利用 `协议` + `IP 地址` + `端口号` 三元组合，就可以标识网络中的进程，那么进程间的通信就可以利用这个标识与其他进程进行交互。





## 二、TCP 通信程序

### 1、概述

TCP 通信能够实现两台计算机之间的数据交互，通信的两端，要严格区分为 客户端（Client）与 服务端（Server）。



**两端通信时的步骤：**

1. 服务端程序，需要事先启动，等待客户端的连接
2. 客户端主动连接服务器端，连接成功才能通信。服务端不可以主动连接客户端



**Java 中，提供了两个类用于实现 TCP 通信程序：**

1. 客户端：`java.net.Socket` 类表示，创建 **Socket** 对象，向服务端发送请求，服务端响应请求，两者建立连接开始通信
2. 服务端：`java.net.ServerSocket` 类表示，创建 **ServerSocket** 对象，相当于开启一个服务，并等待客户端的连接



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210814101640.png)



### 2、Socket 类

`Socket` 类：该类实现客户端套接字，套接字指的是两台设备之间通讯的端点。

注意：套接字的实际工作是有 `SocketImpl` 类的实例来执行。应用程序通过更改创建套接字实现的套接字工厂，可以配置自己创建适合本地防火墙的套接字。



**常用构造方法**

- `Socket(String host, int port)` ：创建流套接字并将其连接到指定主机上的指定端口号。 如果指定的 host 是 null，则相当于指定地址为本机回送地址



> Tip：回送地址（127.x.x.x）是本机回送地址（Loopback Address），主要用于网络软件测试及本机进程之间的通信。





### 3、ServerSocket 类

这个类实现了服务器套接字。服务器套接字等待通过网络进入的请求。它根据该请求执行一些操作，然后可能将结果返回给请求者。

服务器套接字的实际工作由`SocketImpl`类的实例执行。  应用程序可以更改创建套接字实现的套接字工厂，以配置自己创建适合本地防火墙的套接字。





 

### 4、编写测试代码



注意：本例中我们以发送消息为例子，所以为了方便显示文本信息，使用了适配器获得字符流显示。



#### （1）客户端

客户端：Client

```java
/**
 * TCP 通信的客户端: 向服务器发送连接请求，向服务器发送数据，读取服务器回写的数据
 * 
 * 表示客户端：
 *      java.net.Scoket: 此类实现客户端套接字。套接字是两台机器间通信的端点
 *      套接字：包含了 IP 地址和端口号的网络单位
 *      
 * 常用方法：
 *      getInputStream() 返回此套接字的输入流
 *      getOutputStream() 返回此套接字的输出流
 *      close() 关闭此套接字
 *      
 * 使用步骤：
 *      1. 创建客户端 Socket 对象，构造方法绑定服务器的 Ip 地址和端口号
 *      2. 使用 Socket 对象的方法 getOutputStream 获取网络字节输出流 OutputStream 对象
 *      3. 使用网络字节输出流 OutputStream 对象方法 write, 给服务器发送数据
 *      4. 使用 Socket 对象的方法 getInputStream 获取网络字节输入流 InputStream 对象
 *      5. 使用网络字节输入流 InputStream 对象方法 read，读取服务器回写的数据
 *      6. 释放资源 (Socket)
 * 注意：
 *      1. 客户端和服务器端进行交互必须使用 Socket 中提供的网络流，不能使用自己创建的流对象
 *      2. 当我们创建完客户端对象 Socket 的时候，它就会请求服务器和服务器经过三次握手建立连接通路
 *          如果服务器没有启动，就会抛出异常
 *              ConnectException： Connection refused
 *          如果服务器已经启动，就可以正常传输数据
 */
public class TCPClient {

    public static void main(String[] args) {
        
        Socket socket = null;

        InputStreamReader isr = null;
        
        try {
            // 1. 创建客户端对象 Socket, 绑定要和服务器上的哪个端点通信（Ip:端口号）
            socket = new Socket("127.0.0.1", 8888);

            // 2. 获取网络字节输出流
            OutputStream os = socket.getOutputStream();

            // 3. 使用 write 向服务器发送数据
            os.write("你好，服务器。".getBytes());

            // 4. 获取网络字节输入流获取服务器回写的数据
            InputStream is = socket.getInputStream();
            
            isr = new InputStreamReader(is);
            char[] chars = new char[100];
            isr.read(chars);
            System.out.println("客户端接收到服务器端发送的数据: " + String.valueOf(chars));
        } catch (IOException e) {
            e.printStackTrace();
        } finally {

            try {
                // 5. 释放资源
                if (isr != null) {
                    isr.close();
                }
                
                if (socket != null) {
                    socket.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```



#### （2）服务器端

服务器端：Server

```java
/**
 * TCP 通信的服务器端：接收客户端的请求，读取客户端发送的数据，给客户端回写数据
 *      java.net.ServerSocket
 * 
 * 构造方法：
 *      ServerSocket(int port) : 创建绑定到特定端口的服务器套接字
 *      
 * 服务器端必须明确一件事情，必须知道是哪个客户端请求的服务器：
 *  需要使用 accept() 方法获取到客户端对象 Socket：
 *      Socket accept()  侦听要连接到此套接字并接受它。 
 * 
 * 服务器实现步骤：
 *      1. 创建 ServerSocket 对象，需要指定端口号
 *      2. 使用对象方法 accept 获取请求的客户端对象 Socket
 *      3. 使用获取到的客户端 Sokcet 对象获取相应的网络输入/输出流
 *      4. 通过网络输入/输出流对客户端数据进行读写操作
 *      5. 释放资源 (Socket、ServerSocket)
 */
public class TCPServer {

    public static void main(String[] args) {

        Socket clientScoket = null;
        
        ServerSocket serverSocket = null;

        InputStreamReader isr = null;

        try {
            // 1. 注意这里绑定的端口号是客户端指定的服务器端口号
            serverSocket = new ServerSocket(8888);

            // 2. 获取到客户端 Socekt 对象
            clientScoket = serverSocket.accept();    
            
            // 3. 获取网络字节输入流，获取客户端发送的数据
            InputStream is = clientScoket.getInputStream();
            
            isr = new InputStreamReader(is);

            char[] chars = new char[100];
            int read = isr.read(chars);
            if (read > 0) { // 说明服务器接收到客户端发送的数据，就显示出来并回写数据
                System.out.println("服务器端接收到客户端发送的数据: " + String.valueOf(chars));

                // 4. 获取网络字节输出流，向客户端回写数据
                OutputStream os = clientScoket.getOutputStream();

                os.write("你好，客户端。".getBytes());
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {

            // 5. 释放资源
            try {
                if (isr != null) {
                    isr.close();
                }

                if (clientScoket != null) {
                    clientScoket.close();
                }

                if (serverSocket != null) {
                    serverSocket.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```



### 5、运行

上面的例子中我们指定了端口号 8888

先来看看未启动服务器端时该端口的监听情况：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210814111021.png)



启动服务器进程：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210814111033.png)



最终结果

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210814111047.png)

## 三、文件上传

### 1、流程分析

1. 【客户端】输入流：从硬盘中读取文件数据到程序中
2. 【客户端】输出流：从内存中写出文件数据到网络流
3. 【服务端】输入流：从网络流中读取文件数据到服务器端程序中
4. 【服务端】输出流：从内存中写出文件数据到服务器本地硬盘



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210814112051.png)



### 2、基本实现

#### （1）客户端

```java
/**
 * 文件上传案例之客户端程序
 */
public class Client {

    public static void main(String[] args) {
        
        // 准备工作
        FileInputStream fis = null;
        
        Socket clientSocket = null;

        try {
            // 创建输入流对象，从硬盘中读取文件数据
            fis = new FileInputStream("src\\main\\java\\com\\naivekyo\\Java_Net\\FileUpload\\client_picture.jpg");

            // 创建客户端 Socket 对象, 测试使用：本机 9999 端口
            clientSocket = new Socket("127.0.0.1", 9999);

            System.out.println("开始上传");
            // 获取网络输出和输入流用于上传数据和接收服务端消息
            OutputStream os = clientSocket.getOutputStream();
            InputStream is = clientSocket.getInputStream();


            // 上传方式一：使用 read() 方法一个一个字节的来读，效率极低，但是不会阻塞
            // int read;
            // while ((read = fis.read()) != -1) {
            //     System.out.println("客户端发送一个字节：" + read);
            //     os.write(read);
            // }

            // 上传方式二：构建一个缓冲数组，效率比上面的高，但是会导致文件大小不一致
            // int len = -1;
            // byte[] buf = new byte[1024];
            // while ((len = fis.read(buf)) != -1) {
            //     System.out.println("客户端发送一个字节数组的大小: " + len);
            //     os.write(buf);
            // }
            
            // 上传方式三：推荐，使用缓存数组同时使用特定方法做处理
            System.out.println("上传中...");
            int len = -1;
            byte[] bytes = new byte[1024];
            while ((len = fis.read(bytes)) != -1) {
                os.write(bytes, 0, len);
            }

            /**
             * 解决：上传完文件后，给服务器传过去一个网络流结束的标志
             * void shutdownOutput()
             *      禁用此套接字的输出流
             *      对于 TCP套接字，任何先前写入的数据将被发送，随后是 TCP的正常连接终止序列。
             */
            clientSocket.shutdownOutput();
            
            // 上传成功后，清空缓存区
            Arrays.fill(bytes, (byte) 0);
            
            // 得到服务端传递回来的消息
            while ((len = is.read(bytes)) != -1) {
                System.out.println(new String(bytes, 0, len));
            }
     
            clientSocket.shutdownInput();
            
        } catch (IOException e) {
            e.printStackTrace();
        } finally {

            try {
                if (fis != null) {
                    fis.close();
                }

                if (clientSocket != null) {
                    clientSocket.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```





#### （2）服务端

```java
/**
 * 文件上传案例之服务器端
 */
public class Server {

    public static void main(String[] args) {
        
        // 准备工作
        FileOutputStream fos = null;

        ServerSocket serverSocket = null;

        Socket clientSocket = null;

        try {
            // 创建对象
            fos = new FileOutputStream("src\\main\\java\\com\\naivekyo\\Java_Net\\FileUpload\\server_picture.jpg");

            serverSocket = new ServerSocket(9999);    // 服务器指定监听 9999 端口

            clientSocket = serverSocket.accept();

            // 获取网络输入流，取出数据并写出到服务器端磁盘
            InputStream is = clientSocket.getInputStream();

            // 获取网络输出流，告诉客户端已经处理成功了
            OutputStream os = clientSocket.getOutputStream();

            // 接收方式一：一个字节一个字节的读写
            // int read;
            // while ((read = is.read()) != -1) {
            //     System.out.println("服务端接收一个字节：" + read);
            //     fos.write(read);
            // }

            // 接收方式二：一个数组一个数组的读，同样一个数组一个数组的写，会导致文件大小不一致问题
            // int len = -1;
            // byte[] bytes = new byte[1024];
            // while ((len = is.read(bytes)) != -1) {
            //     System.out.println("服务端接收一个字节数组的大小: " + len);
            //     fos.write(bytes);
            // }
            
            // 接收方式三：一个数组一个数组的读，每次写入读取的总字节
            int len = -1;
            byte[] bytes = new byte[1024];
            while ((len = is.read(bytes)) != -1) {
                System.out.println("服务端从网络输入流中一次得到的字节数: " + len);
                fos.write(bytes, 0, len);
            }
            
            // 结束这次网络输入流的连接
            clientSocket.shutdownInput();
            
            // 清空缓冲区
            Arrays.fill(bytes, (byte) 0);
            
            // 读取完毕，告诉客户端已经处理成功了
            os = clientSocket.getOutputStream();
            os.write("服务端: 文件接收完毕!".getBytes());
            
            clientSocket.shutdownOutput();
            
        } catch (IOException e) {
            e.printStackTrace();
        } finally {

            try {
                if (fos != null) {
                    fos.close();
                }

                if (clientSocket != null) {
                    serverSocket.close();
                }
                
                if (serverSocket != null) {
                    serverSocket.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```



### 3、效率及阻塞问题

#### 阻塞问题

我们现在使用的有两套 IO 流：

- Java 的 BIO
- Socket 的 BIO



它们都是 **同步且阻塞** 的 IO，而阻塞型 IO 主要阻塞在两个地方：

1. 调用 `InputStream.read` （或者 `OutputStream.write`）方法是阻塞的，它会一直等到数据到来（或者超时）才会返回
2. 调用 `ServerSocket.accept` 方法时，服务端会一直阻塞到有客户端连接才会返回



> 案例中出现的阻塞

对于普通的文件流来说：一般都是将文件加载到内存中，或从内存中把数据写入到文件

- read
- write

上面两个方法会阻塞当前线程，除非可以读/写到数据，一般都可以正常结束（文件末尾 -1 标志）。



重点在于通过 Socket 获取的网络读/写字节流，它们和普通的字节输入/输出流不一样，结束的标记是 TCP 释放连接时使用的 TCP 终止序列。这段终止序列有时候需要我们来指定，比如：

- 一段代码，上面使用了网络输出流，下面又准备使用网络输入流
  - 案例场景：使用网络输出流向服务器端发送数据，然后使用网络输入流获取服务器端返回的信息
- 那么两者中间我们一定要先结束掉输出流，为输出流结束 TCP 连接

使用 Socket 的方法:

- `shutdownOutput()`
- `shutdownInput()`



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210814185620.png)



对于服务器端也是如此（tip：上面第五步其实可以不用加）



使用类似如下代码测试是否关闭连接：

```java
System.out.println(clientSocket.isOutputShutdown() ? "网络输出流已结束" : "OuputStream -1");
System.out.println(clientSocket.isInputShutdown() ? "网络输入流已结束" : "InputStream -1");
```





> 效率问题

#### （1）read（）和 write()

对代码片段做一些处理：

在上述的例子中，我们是这样读取数据并上传的：

```java
int read;
while ((read = fis.read()) != -1) {
  	System.out.println("客户端发送一个字节：" + read);
  	os.write(read);
}
```



服务端是这样接收数据的：

```java
int read;
while ((read = is.read()) != -1) {
  	System.out.println("服务端接收一个字节：" + read);
  	fos.write(read);
}
```



这种情况下流程是这样的：

- 客户端从文件流中读取一个字节
  - 将该字节发送给 Socket 的网络流
  - 服务端从网络流中取出一个字节的数据
- 服务端将该字节写入到文件流



客户端和服务端采用 TCP 协议传输一个一个的字节，效率极其低下，但是传输不会出现问题。



#### （2）read（byte[] b) 和 write(byte[] b)

参数说明：

- byte[] b：读写数据的缓存区

一个字节一个字节的读取数据，效率太慢，但是如果我们使用 `read(byte[] b)` 这个重载的方法又会怎么样呢？



```java
// 客户端发送数据
int len = -1;
byte[] buf = new byte[1024];
while ((len = fis.read(buf)) != -1) {
  	System.out.println("客户端发送一个字节数组的大小: " + len);
  	os.write(buf);
}

// 服务端接收数据
int len = -1;
byte[] bytes = new byte[1024];
while ((len = is.read(bytes)) != -1) {
  	System.out.println("服务端接收一个字节数组的大小: " + len);
  	fos.write(bytes);
}
```



如果这样干了，就会出现这种情况：

- 客户端最后一次从文件流中读取到字节数是 137（举个例子）
- 但是服务端最后一次从网络输入流中读取到的字节数是 1024 （因为我们这里用的缓冲区的大小就是 1024 字节）

最终的结果是服务端保存的文件比客户端硬盘上的文件大。



原因在于：

- 缓冲数组只有刚开始的时候里面才是空的
- 第一次向缓冲数组写入数据是 1024 个字节，把数组填满了
- 此后每一次向缓冲区存入的字节数不一定都是 1024 
- 但是发送给服务端的一定是 1024 个字节





解决方法：见下文



#### （3）write（byte[] b, int off, int len）

参数说明：

- byte[] b：读取数据的缓冲区
- int off：目标数组 b 的起始偏移量：准确来说是每次写出数据的时候从数组的哪个下标开始
- int len：要写入的字节数



该方法结合 `read(byte[] b)`可以实现每次从文件流中读取多少数据就将多少字节传给网络流，最终服务器端可以将文件完整的保存下来：

```java
// 客户端
int len = -1;
byte[] bytes = new byte[1024];
while ((len = fis.read(bytes)) != -1) {
  	System.out.println("客户端发送到网络输出流的字节数: " + len);
  	os.write(bytes, 0, len);
}

// 服务端
int len = -1;
byte[] bytes = new byte[1024];
while ((len = is.read(bytes)) != -1) {
  	System.out.println("服务端从网络输入流中一次得到的字节数: " + len);
  	fos.write(bytes, 0, len);
}
```



这样一来，客户端和服务端上的文件大小就一样了。





### 4、优化分析

#### （1）文件名称写死的问题

服务端，保存文件的名称如果写死，最终会导致服务器硬盘，只保留一个文件，建议使用系统时间来优化，保证文件名唯一：

```java
FileOutputStream fis = new FileOutputStream(System.currentTimeMillis() + ".jpg");
BufferedOutputStream bos = new BufferedOutputStream(fis);
```



#### （2）循环接收问题

服务端，保存一个文件就关闭了，之后的用户无法再上传，这是不符合实际的，使用循环来改进，可以不断的接收不同用户的文件：

```java
// 每次接收新的连接，创建一个 Socket
while(true) {
  Socket socket = serverSocket.accept();
  ......
}
```



#### （3）效率问题

服务端，在接收大文件时，可能耗费的时间比较长，此时不能接收其他用户上传，所以，使用多线程技术优化：

```java
while(true) {
  Socket socket = serverSocket.accept();
  
  new Thread(() -> {
    // 接收文件的方法
  })
}
```



#### （4）优化后的代码

优化后的代码还是有一定的缺点：

- 不能检测文件类型，现在写死了上传的是 jpg 图片
- 没有使用缓冲流去进一步优化性能



> 客户端

```java
/**
 * 优化客户端上传
 */
public class EnhanceClient {

    public static void main(String[] args) {

        // 要上传的文件路径
        String file = "src\\main\\java\\com\\naivekyo\\Java_Net\\FileUploadImporve\\enhance_client_picture.jpg";

        // 测试上传 10 个文件
        for (int i = 0; i < 10; i++) {
            upload(file);
        }
    }

    private static void upload(String fileName) {
        
        System.out.println("文件上传线程 id: " +
                Thread.currentThread().getId() + " ---  线程名: " +
                Thread.currentThread().getName() + "开始执行");

        // 准备工作
        Socket socket = null;

        FileInputStream fis = null;

        // 创建对象
        try {
            socket = new Socket("127.0.0.1", 10000);

            fis = new FileInputStream(fileName);

            // 获取网络输出流
            OutputStream os = socket.getOutputStream();

            int len = -1;
            byte[] bytes = new byte[1024];
            while ((len = fis.read(bytes)) != -1) {
                os.write(bytes, 0, len);
            }

            // 上传完毕，关闭网络输出流，断开 TCP 连接
            socket.shutdownOutput();

            // 清空缓存数组
            Arrays.fill(bytes, (byte) 0);

            // 获取网络输入流以获取服务器端返回的消息
            InputStream is = socket.getInputStream();

            while ((len = is.read(bytes)) != -1) {
                System.out.print(new String(bytes, 0, len));
            }
            System.out.println();
            
            // 接收完毕，关闭网络输入流
            socket.shutdownInput();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {

            // 释放资源
            try {
                if (fis != null)
                    fis.close();
                if (socket != null)
                    socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```





> 服务端

```java
/**
 * 优化服务端接收
 *  
 * 属于监控线程，一直开启
 */
@SuppressWarnings("all")
public class EnhanceServer {

    public static void main(String[] args) throws IOException {
        
        // 开启一个线程池，用于监控是否有客户端请求上传文件
        ExecutorService threadPool = Executors.newFixedThreadPool(7);

        ServerSocket serverSocket = null;
        
        serverSocket = new ServerSocket(10000);

        System.out.println("服务器启动，开始监控文件上传服务端口: " + serverSocket.getLocalPort());

        while (true) {

            System.out.println("当前监控线程 id: " + Thread.currentThread().getId() + " --- " +  
                    "当前监控线程 name: " + Thread.currentThread().getName());

            System.out.println("等待连接...");

            // 当前线程捕捉到客户端发送的一个请求
            // 注意这里 accept 方法阻塞的整个主线程
            final Socket socket = serverSocket.accept();
            
            System.out.println("客户端地址: " + socket.getInetAddress().getHostAddress() + " 连接成功!");
            
            // 开启一个子线程去处理，然后继续循环，继续阻塞
            threadPool.execute(() -> handler(socket));
        }
    }

    // 开启子线程处理上传服务
    private static void handler(Socket socket) {

        System.out.println("当前子线程: id -> " + Thread.currentThread().getId() + 
                " name -> " + Thread.currentThread().getName());
        
        // 准备工作
        FileOutputStream fos = null;

        // 开始
        // 创建一个文件夹用于保存上传的所有文件
        File file = new File("src\\main\\java\\com\\naivekyo\\Java_Net\\FileUploadImporve\\server_save_path");
        if (!file.exists()) {
            file.mkdir();
        }
        
        // 构建文件路径
        String fileName = file.getPath() + "\\file_" + System.currentTimeMillis() + ".jpg";

        try {
            fos = new FileOutputStream(fileName);

            // 获取网络输入流
            InputStream is = socket.getInputStream();

            // 开始存储文件
            int len = -1;
            byte[] bytes = new byte[1024];
            while ((len = is.read(bytes)) != -1) {
                fos.write(bytes, 0, len);
            }

            // 保存完成，关闭网络输入流、刷新缓冲数组、向客户端返回成功的信息
            socket.shutdownInput();

            Arrays.fill(bytes, (byte) 0);

            // 获取网络输出流，返回成功信息
            OutputStream os = socket.getOutputStream();
            os.write("上传成功!".getBytes());
            
            // 关闭网络输出流
            socket.shutdownOutput();

            System.out.println("当前子线程: id -> " + Thread.currentThread().getId() +
                    " name -> " + Thread.currentThread().getName() + " 处理完成!");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {

            try {
                // 释放资源
                if (fos != null)
                    fos.close();
                if (socket != null)
                    socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```



## 四、模拟 B/S 服务器

模拟网站服务器，使用浏览器访问自己编写的服务端程序，查看网页效果。



先做一个模拟服务器端，监听 8080 端口：

```java
/**
 * 模拟服务器端
 *      使用浏览器请求该模拟服务器
 */
public class TCPServer {

    public static void main(String[] args) throws IOException {

        // 监听本机 8080 端口
        ServerSocket serverSocket = new ServerSocket(8080);

        Socket socket = serverSocket.accept();
        
        // 使用网络输入流，获取请求的相关信息
        InputStream is = socket.getInputStream();
        
        int len = -1;
        byte[] bytes = new byte[1024];
        while ((len = is.read(bytes)) != -1) {
            System.out.println(new String(bytes, 0, len));
        }
    }
}
```



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210814234944.png)





### 1、服务端代码

```java
/**
 * 模拟服务器端
 *      使用浏览器请求该模拟服务器
 */
@SuppressWarnings("all")
public class TCPServer {

    // 测试路径： src/main/java/com/naivekyo/Java_Net/BS/index.html
    public static void main(String[] args) throws IOException {

        // 监听本机 8080 端口
        ServerSocket serverSocket = new ServerSocket(8080);

        // 线程池
        ExecutorService pool = Executors.newFixedThreadPool(10);
        
        while (true) {
            
            // 阻塞线程直到收到客户端请求
            final Socket socket = serverSocket.accept();

            /*
                注意，我们的 html 中有图片，而且默认网页有一个 favicon，我们也需要准备，所以会发起至少三次请求
                第一次返回 html
                第二次返回 favicon
                第三次返回 图片
                使用循环 + 多线程实现比较方便
             */
            
            // 处理请求
            pool.execute(() -> {
                
                try {
                    handler(socket);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
        }
        
     
    }

    private static void handler(Socket socket) throws IOException {

        // 使用网络输入流，获取请求的相关信息
        InputStream is = socket.getInputStream();

        // 通过转换流获取浏览器的请求信息
        BufferedReader br = new BufferedReader(new InputStreamReader(is));

        // 读取客户端请求的第一行数据，获取其中请求的资源路径
        // GET /src/main/java/com/naivekyo/Java_Net/BS/index.html HTTP/1.1
        String line = br.readLine();
        String[] arr = line.split(" ");
        String htmlPath = arr[1].substring(1);  // src/main/java/com/naivekyo/Java_Net/BS/index.html

        String url = htmlPath.replace("/", "\\");

        // 创建本地字节输入流
        FileInputStream fis = new FileInputStream(url);

        // 获取网络输出流
        OutputStream os = socket.getOutputStream();

        // 写入 Http 协议响应头，这是固定写法
        os.write("HTTP/1.1 200 OK\r\n".getBytes());
        os.write("Content-Type:text/html\r\n".getBytes());
        // 必须写入空行，否则浏览器不解析
        os.write("\r\n".getBytes());

        // 读取请求的 html 文件
        int len = 0;
        byte[] bytes = new byte[1024];
        while ((len = fis.read(bytes)) != -1) {
            os.write(bytes, 0, len);
        }

        // 释放资源
        fis.close();
        br.close();
        socket.close();
    }
}
```





### 2、效果

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210815002804.png)



## 五、Java 网络爬虫

```java
package com.naivekyo.network;

import sun.net.www.protocol.https.HttpsURLConnectionImpl;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author NaiveKyo
 * @version 1.0
 * @description: java 网络爬虫
 * @since 2022/3/16 10:33
 */
public class Spider {
    public static void main(String[] args) {

        // 爬取凤凰网首页的超链接信息
        String urls = "https://www.ifeng.com";
        String filePath = System.getProperty("user.dir") + "\\sortutil\\src\\com\\naivekyo\\network\\spider.txt";
        
        URL url = null;
        HttpsURLConnectionImpl httpsCi;
        InputStream is = null;
        InputStreamReader isr = null;
        BufferedReader br = null;
        FileOutputStream fos = null;
        OutputStreamWriter osw = null;
        BufferedWriter bw = null;
        
        try {
            url = new URL(urls);
            httpsCi = (HttpsURLConnectionImpl) url.openConnection();
            
            // 设置网络连接属性
            httpsCi.setConnectTimeout(2000);
            httpsCi.setReadTimeout(2000);
            httpsCi.setRequestMethod("GET");
            
            // 获取数据
            httpsCi.connect();
            is = httpsCi.getInputStream();
            isr = new InputStreamReader(is);
            br = new BufferedReader(isr);
            
            fos = new FileOutputStream(new File(filePath), true);
            osw = new OutputStreamWriter(fos);
            bw = new BufferedWriter(osw);            
            
            // 通过正则表达式匹配网页中的超链接地址, 并保存
            String pat = "https://\\w+\\.\\w+\\.[A-Za-z]+";
            
            String str = null;
            while ((str = br.readLine()) != null) {
                Pattern compile = Pattern.compile(pat);
                Matcher matcher = compile.matcher(str);
                while (matcher.find()) {
                    bw.write(matcher.group());
                    bw.newLine();
                }
            }
            System.out.println("爬取完毕!");
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            // 关闭流
            try {
                if (bw != null)
                    bw.close();
                if (osw != null)
                    osw.close();
                if (fos != null)
                    fos.close();
                if (br != null)
                    br.close();
                if (isr != null)
                    isr.close();
                if (is != null)
                    is.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

