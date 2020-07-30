import RadioViewPresenter from './presenter'
import { TagRadioGroup } from './view'

export default class DemoApp extends React.Component {
  constructor (props) {
    super(props)

    this.presenter = new RadioViewPresenter(this)

    this.state = {
      radioSource: this.presenter.radioSource,
      collapse: true
    }
  }

  componentDidMount () {
    this.presenter.initRadioConf()
  }
  
  render () {
    return (
      <TagRadioGroup
        collapse={this.state.collapse}
        source={this.state.radioSource}
        onChange={this.presenter.onChange}
        onCollapse={this.presenter.onCollapse}
      />
    )
  }
}