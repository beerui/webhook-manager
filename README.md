### Webhook 自动部署

> 一个管理github的webhook自动部署项目

### 开始
1. 在服务器中安装 `npm i @brewer/webhook-manager -g`
2. 在服务器目录下新建文件夹`mkdir webhook && cd webhook`
3. 在`webhook`文件夹中新建配置文件 `config.json`
#### 基础配置
``` json
{
  "port": 3002,                 // 启动的服务端口号
  "app1": {                     // 项目一：app1是webhook添加的接口地址
    "name": "project1",         // 日志输出名称，预留的可以是pm2启动的服务名称
    "path": "./project1",       // 项目路径（真实地址要写绝对路径）
    "command": ""               // 额外运行的命令
  },
  "app2": {
    "name": "project2",
    "path": "./project2",
    "command": "cd /data/project2 && git pull origin main && npm i && npm run build"
  }
}
```
4. 配置完成后运行`brewer-webhook`
> 启动项目后将会生成 1 读取配置中的文件 2 生成日志文件`webhook/logs`
> 建议使用pm2来启动项目
5. 查看日志 `tail -f ./logs/webhook.log`
