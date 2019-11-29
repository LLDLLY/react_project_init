// 配置环境 生产打包配置, build, tar.gz, 拷贝
SHELL := /bin/bash
NODE_ENV=prod
OUT_PATH=dist
help:
	echo "Help info coming soon"

all: buildprod

buildprod:
	node --version
	npm --version
	NODE_ENV=$(NODE_ENV) OUT_PATH=$(OUT_PATH) npm update
	NODE_ENV=$(NODE_ENV) OUT_PATH=$(OUT_PATH) npm run clean:prod
	NODE_ENV=$(NODE_ENV) OUT_PATH=$(OUT_PATH) npm run build:prod
	cp -r src/app/config/WEB-INF $(OUT_PATH)/
	cp src/favicon.ico $(OUT_PATH)/
	cd $(OUT_PATH)/ && tar -zcf avenueui-framework.tar.gz *