/**
 * title: View + Presenter
 * desc: presenter 层处理业务逻辑
 */
import { TagRadioGroup } from './view'
import debounce from 'lodash/debounce'

const MOCK_TAG_CONF = [
  { id: 1, title: '茶水间' },
  { id: 2, title: '文印室' },
  { id: 3, title: '卫生间', hidden: true }
]

const DEFAULT_FOLD_INTERVAL = 1000

class RadioViewPresenter {
  constructor (view) {
    this.view = view
    this.tagConfSource = MOCK_TAG_CONF
    
    this.debounceFold = debounce(() => console.log('fold'), DEFAULT_FOLD_INTERVAL)
  }

  onChange = id => {
    this.debounceFold()
    console.log('onChange', id)
  }

  onCollapse = collapse => {
    this.debounceFold()
    console.log('onCollapse', collapse)
  }
}

export default class DemoApp extends React.Component {
  constructor (props) {
    super(props)

    this.presenter = new RadioViewPresenter(this)

    this.state = {
      tagConfSource: this.presenter.tagConfSource
    }
  }
  render () {
    return (
      <TagRadioGroup
        source={this.state.tagConfSource}
        onChange={this.presenter.onChange}
        onCollapse={this.presenter.onCollapse}
      />
    )
  }
}