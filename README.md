# ini文件解析
## ini文件格式说明
https://zh.wikipedia.org/wiki/INI%E6%96%87%E4%BB%B6

``` java
; last modified 1 April 2001 by John Doe
[owner]
name=John Doe
organization=Acme Products

[database]
server=192.0.2.42 ; use IP address in case network name resolution is not working
port=143
file="acme payroll.dat"
```

## 附加说明
1. 键值对中，允许值中存在空格；
2. section 没有做嵌套处理


## 使用
参考 IndexTestTS.ts 文件
1. 先使用tsc命令将所有ts文件编译为js文件；
2. 在命令行下执行IndexTestTS.js文件，可以生成ini文件；

