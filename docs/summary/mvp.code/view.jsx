/**
 * title: View
 * desc: 接受 source、onChange、onCollapse 三个参数
 */
import React from 'react'
import { Radio, Button } from 'antd'

const MOCK_TAG_CONF = [
  { id: 1, title: '茶水间' },
  { id: 2, title: '文印室' },
  { id: 3, title: '卫生间', collapse: true }
]

export const TagRadioGroup = ({ source, collapse = true, onChange, onCollapse }) => {
  const isCollapse = !!collapse
  source = source || []

  const handleChange = event => {
    onChange && onChange(event.target.value, event)
  }
  const handleCollapse = () => {
    onCollapse && onCollapse(isCollapse)
  }
  
  return (
    <section>
      <Radio.Group onChange={handleChange}>
        {
          source.map(item =>
            <Radio value={item.id} key={item.id}>{item.title}</Radio>
          )
        }
        <Button type="link" onClick={handleCollapse}>{isCollapse ? '展开' : '折叠'}</Button>
      </Radio.Group>
    </section>
  )
}

export default class DemoApp extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      tagConfSource: MOCK_TAG_CONF
    }
  }

  onChange = id => {
    console.log('onChange', id)
  }

  onCollapse = collapse => {
    console.log('onCollapse', collapse)
  }

  render () {
    return (
      <TagRadioGroup
        source={this.state.tagConfSource}
        onChange={this.onChange}
        onCollapse={this.onCollapse}
      />
    )
  }
}
