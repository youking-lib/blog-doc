import { InboxOutlined } from '@ant-design/icons'
import React from 'react'
import { Upload, List } from 'antd'
import { useState, useEffect } from 'react'
import { readerFileText, generateIntegrity } from './utils'

const parseCached = new WeakMap()

export function useFilesIntegrity (defaultFileList) {
  const [filesIntegrity, setFilesIntegrity] = useState([])
  const [fileList, setFileList] = useState(defaultFileList)
  
  useEffect(() => {
    const generate = async () => {
      const promises = fileList.map(async file => {
        if (parseCached.has(file)) {
          return parseCached.get(file)
        }
  
        const fileContent = await readerFileText(file.originFileObj)
        const fileIntegrity = {
          integrity: generateIntegrity(fileContent),
          filename: file.name,
          file
        }

        parseCached.set(file, fileIntegrity)
        return fileIntegrity
      })

      
      const filesIntegrity = await Promise.all(promises)
      setFilesIntegrity(filesIntegrity)
    }
    setFileList(fileList)
    generate()
  }, [fileList])

  return [filesIntegrity, setFileList]
}

export default function FileIntegrity () {
  const [filesIntegrity, updateFiles] = useFilesIntegrity([])
  const handleGenerateFilesIntegrity = event => updateFiles(event.fileList)
  
  return (
    <>
      <div>
        <Upload.Dragger
          multiple={true}
          beforeUpload={() => false}
          onChange={handleGenerateFilesIntegrity}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-hint">点击/拖拽上传文件</p>
        </Upload.Dragger>
      </div>
      <List>
        {
          filesIntegrity.map(fileIntegrity => {
            return (
              <List.Item key={fileIntegrity.integrity}>
                <List.Item.Meta
                  title={fileIntegrity.filename}
                  description={fileIntegrity.integrity}
                  style={{ wordBreak: 'break-word' }}
                />
              </List.Item>
            )
          })
        }
      </List>
    </>
  )
}