import React from 'react'
import { Tabs } from 'antd'
import UrlIntegrity from './UrlIntegrity'
import FileIntegrity from './FileIntegrity'

export default function GenerateSRI () {
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Url" key="1">
        <UrlIntegrity />
      </Tabs.TabPane>
      <Tabs.TabPane tab="本地文件" key="2">
        <FileIntegrity />
      </Tabs.TabPane>
    </Tabs>
  )
}
