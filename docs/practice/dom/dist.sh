#!/usr/bin/env bash

###
 # @file: description
 # @author: yongzhen
 # @Date: 2021-01-15 10:05:02
 # @LastEditors: yongzhen
 # @LastEditTime: 2021-01-15 10:10:58
### 

# 确保脚本抛出遇到的错误
set -e

npx rollup comment.js --environment NODE_ENV:production --file comment.dist.js --format umd --name "commentapi"