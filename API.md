# API示例文档
## 概述
本API提供了获取用户数据的功能和监控检查。

## API端点
API端点：https://example.com/webhook/:project

## 健康检查
请求
- 方法：GET
- 端点：/webhook/health
- 参数：无
响应
- 成功响应：
- 状态码：200 OK
- 返回内容： `health`

## 获取Github推送数据
请求
- 方法：POST
- 端点：/webhook/:project
- 参数：无
响应
- 成功响应：
- 状态码：200 OK
- 返回内容：webhook received

`:project`是指github推送地址的名称

例如：`https://yoursite.com/webhook/app1`, `app1` 就是 `:project`