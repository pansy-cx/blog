---
layout:     post
title:      "Python 建立 socket 通信传输图像"
date:       2017-12-04 18:12:00
tags:
    - Python
---

### Socket API 简介

| socket 类型 | 描述 |
| :---: | :----: |
| socket.AF_UNIX | 用于同一台机器上的进程通信（既本机通信） |
| socket.AF_INET | 用于服务器与服务器之间的网络通信 |
| socket.AF_INET6|	基于IPV6方式的服务器与服务器之间的网络通信 |
| socket.SOCK_STREAM |	基于TCP的流式socket通信 |
|socket.SOCK_DGRAM |	基于UDP的数据报式socket通信 |
| socket.SOCK_RAW | 原始套接字，普通的套接字无法处理ICMP、IGMP等网络报文，而SOCK_RAW可以；其次SOCK_RAW也可以处理特殊的IPV4报文；此外，利用原始套接字，可以通过IP_HDRINCL套接字选项由用户构造IP头 |
| socket.SOCK_SEQPACKET |	可靠的连续数据包服务 |

##### 服务端 API

| Socket 函数 | 描述 |
| :---: | :----: |
| s.bind(address) | 将套接字绑定到地址，在AF_INET下，以tuple(host, port)的方式传入，如s.bind((host, port)) |
| s.listen(backlog) |  开始监听TCP传入连接，backlog指定在拒绝链接前，操作系统可以挂起的最大连接数，该值最少为1，大部分应用程序设为5就够用了 |
| s.accept() | 接受TCP链接并返回（conn, address），其中conn是新的套接字对象，可以用来接收和发送数据，address是链接客户端的地址。 |

##### 客户端 API

| Socket 函数 | 描述 |
| :---: | :----: |
| s.connect(address) | 链接到address处的套接字，一般address的格式为tuple(host, port)，如果链接出错，则返回socket.error错误 |
| s.connect_ex(address) | 功能与s.connect(address)相同，但成功返回0，失败返回errno的值 |

##### 公共 API

| Socket 函数 |  描述 |
| :---: | :----: |
| s.recv(bufsize[, flag]) | 接受TCP套接字的数据，数据以字符串形式返回，buffsize指定要接受的最大数据量，flag提供有关消息的其他信息，通常可以忽略 |
| s.send(string[, flag]) | 发送TCP数据，将字符串中的数据发送到链接的套接字，返回值是要发送的字节数量，该数量可能小于string的字节大小 |
| s.sendall(string[, flag]) | 完整发送TCP数据，将字符串中的数据发送到链接的套接字，但在返回之前尝试发送所有数据。成功返回None，失败则抛出异常 |
| s.recvfrom(bufsize[, flag]) | 接受UDP套接字的数据u，与recv()类似，但返回值是tuple(data, address)。其中data是包含接受数据的字符串，address是发送数据的套接字地址 |
| s.sendto(string[, flag], address)|   发送UDP数据，将数据发送到套接字，address形式为tuple(ipaddr, port)，指定远程地址发送，返回值是发送的字节数 |
| s.close() | 关闭套接字 |

##### 创建 TCP 连接

```python
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((address, port))
```
- TCP 发送好数据后，已经建立好 TCP 连接，所以无需发送地址
- 服务端与客户端之间只能传输字符串数据

##### 开始监听

```python
sock.listen(5)
```

##### 进入循环

```python
while True:
    s.accept()  // 接受传输
    s.recv()    // 接收数据
    s.close()   // 关闭接收
```

##### 例子

<a href="https://gist.github.com/kevinkindom/108ffd675cb9253f8f71" target="_blank">Github</a>

服务端

```python
import socket

HOST = '192.168.1.100'
PORT = 8001

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))
s.listen(5)

print 'Server start at: %s:%s' %(HOST, PORT)
print 'wait for connection...'

while True:
    conn, addr = s.accept()
    print 'Connected by ', addr

    while True:
        data = conn.recv(1024)
        print data

        conn.send("server received you message.")

# conn.close()
```

客户端

```python
import socket
HOST = '192.168.1.100'
PORT = 8001

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))

while True:
    cmd = raw_input("Please input msg:")
    s.send(cmd)
    data = s.recv(1024)
    print data

    #s.close()
```

### 传输图片

##### 客户端：

图片转 base64 格式

```python
f = open(r'./1.png','rb')
img_64 = base64.b64encode(f.read())
f.close()
```

建立连接

```python
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(('127.0.0.1', 6666))
except socket.error as msg:
    print msg
    sys.exit(1)
```

发送数据

```python
while True:
    s.send(img_64)
    s.close()
    break
```

##### 服务端

创建 TCP

```python
try:
    # 创建 TCP Socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # 设置套接字选项的值
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('127.0.0.1', 6666))
    s.listen(10)
# 错误处理
except socket.error as msg:
    print msg
    sys.exit(1)
```

建立线程，使客户端可以重复发送数据

```python
while True:
    conn, addr = s.accept()
    t = threading.Thread(target = deal_data, args = (conn, addr))
    # 开启线程
    t.start()
```

线程运行函数

```python
def deal_data(conn, addr):
    while True:     
        img_64 = ''
        while True:
            data = conn.recv(1024)
            if data != '':
                img_64 += data
            else:
                print img_64
                img_64 = ''
                break

        conn.close()
        sys.exit()
```

##### 完整代码

client.py

```python
# -*- coding: utf-8 -*-

import socket
import sys
import base64
import time

def socket_client():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('127.0.0.1', 6666))
    except socket.error as msg:
        print msg
        sys.exit(1)

    print s.recv(1024)

    f = open(r'./1.png','rb')
    img_64 = base64.b64encode(f.read())
    f.close()

    ticks = time.time()

    while True:
        s.send(img_64)
        s.send('timestamp' + str(ticks))
        s.close()
        break

if __name__ == '__main__':
    socket_client()
```

server.py

```python
# -*- coding: utf-8 -*-

import socket
import threading
import sys
import re


def socket_service():
    try:
        # 创建 TCP Socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # 设置套接字选项的值
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(('127.0.0.1', 6666))
        s.listen(10)
    # 错误处理
    except socket.error as msg:
        print msg
        sys.exit(1)

    print 'Waiting connection...'

    while True:
        conn, addr = s.accept()
        t = threading.Thread(target = deal_data, args = (conn, addr))
        # 开启线程
        t.start()

def deal_data(conn, addr):
    print 'Accept new connection from {0}'.format(addr)

    conn.send('Hi, Welcome to the server!')

    while True:     
        print 'start receiving...'
        img_64 = ''
        
        while True:
            data = conn.recv(1024)

            if data != '':
                img_64 += data
            else:
                RegExp = r'timestamp(\d+\.\d+)$'
                ticks = re.search(RegExp, img_64)
                
                if ticks:
                    print ticks.group(1)

                img_64 = re.sub(RegExp, '', img_64)
                print img_64

                img_64 = ''
                break

        print 'end receive...'
        conn.close()
        sys.exit()

if __name__ == '__main__':
    socket_service()
```







