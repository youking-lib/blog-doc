import debounce from 'lodash/debounce'
import RadioModel from './model'

const DEFAULT_FOLD_INTERVAL = 2000

export default class RadioViewPresenter {
  constructor (view) {
    this.view = view
    this.radioEntity = null
    this.radioSource = []

    this.debounceFold = debounce(() => {
      this.radioEntity.fold()
      this.view.setState({
        collapse: this.radioEntity.hasFold(),
        radioSource: this.radioEntity.toJSON()
      })
    }, DEFAULT_FOLD_INTERVAL)
  }

  async initRadioConf () {
    this.radioEntity = await RadioModel.getRadioConf()
    this.radioSource = this.radioEntity.toJSON()

    this.view.setState({
      radioSource: this.radioSource
    })
  }

  onChange = id => {
    this.debounceFold()
    this.radioEntity.select(id)

    this.view.setState({
      radioSource: this.radioEntity.toJSON()
    })
  }

  onCollapse = collapse => {
    this.debounceFold()

    if (collapse) {
      this.radioEntity.unFold()
    } else {
      this.radioEntity.fold()
    }
    this.view.setState({
      collapse: this.radioEntity.hasFold(),
      radioSource: this.radioEntity.toJSON()
    })
  }
}