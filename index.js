#!/usr/bin/env node
const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const winston = require('winston');
const fs = require("fs");

const configFile = './config.json';

const config = JSON.parse(fs.readFileSync(configFile));

const app = express();
const port = config.port || 3000;

// Winston 配置
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: './logs/webhook.log' })
    ]
});

// 中间件
app.use(bodyParser.json());

// 路由
app.post('/webhook/:project', (req, res) => {
    const project = req.params.project;

    logger.info(`======= received webhook request for project ${project} =======`);
    if (!config[project]) {
        logger.error(`没有在配置文件中找到项目： ${project}，请检查名称是否正确！`);
        res.status(200).send(`Webhook received, but Not Found project ${project}.`);
        return
    }
    const payload = config[project]

    const deployPath = `${payload.path}/deploy.sh`
    logger.info(`======= deploying ${payload.name} project at ${deployPath} =======`);
    const deploy = spawn('sh', [deployPath], {
        shell: true
    });
    deploy.stdout.on('data', data => {
        logger.info(data.toString());
    });
    deploy.stderr.on('data', data => {
        logger.error(data.toString());
    });
    // 执行自定义的命令
    deploy.on('close', () => {
        logger.info(`======= deploy.sh done =======`);
        if (payload.command) {
        logger.info(`======= run command: ${payload.command} =======`);
            const postDeploy = spawn('sh', ['-c', payload.command]);
            postDeploy.stdout.on('data', data => {
                logger.info(data.toString());
            });
            postDeploy.stderr.on('data', data => {
                logger.error(data.toString());
            });
            postDeploy.on('close', () => {
                logger.info(`======= ${payload.name} command done =======`)
            })
        }
    });

    res.status(200).send('Webhook received');
});

// 启动服务
app.listen(port, () => {
    logger.info(`Webhook server listening on port ${port}`);
});
