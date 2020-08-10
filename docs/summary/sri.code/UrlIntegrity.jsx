import React, { useState, useEffect } from 'react'
import { Card, Input } from 'antd'
import { generateIntegrity } from './utils'
import fetch from 'node-fetch'

function useUrlIntegrity (defaultUrl) {
  const [url, setUrl] = useState(defaultUrl)
  const [loading, setLoading] = useState(false)
  const [integrity, setIntegrity] = useState(null)
  
  useEffect(() => {
    if (!url.trim()) return

    setLoading(true)
    
    fetch(url.trim())
      .then(res => res.text())
      .then(content => {
        const result = generateIntegrity(content)
        setIntegrity(result)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [url])

  return [integrity, loading, setUrl]
}


export default function UrlIntegrity () {
  const [integrity, loading, setUrl] = useUrlIntegrity('')
  
  const handleGenerateUrlIntegrity = url => {
    setUrl(url)
  }
  
  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }}>
      <Input.Search
        enterButton="生成"
        autoComplete="true"
        placeholder="输入 URL"
        loading={loading}
        onSearch={value => handleGenerateUrlIntegrity(value)}
        style={{ marginBottom: 20 }}
      />
      <Card.Meta description={integrity} />
    </Card>
  )
}
