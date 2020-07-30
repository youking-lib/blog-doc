const DEFAULT_SHOW_SIZE = 3

class TagConfEntity {
  constructor (source) {
    // 初始化数据
    this.source = source.map((radioItem, index) => {
      return {
        ...radioItem,
        selected: false,
        collapse: index >= DEFAULT_SHOW_SIZE
      }
    })
  }
  hasFold () {
    return !!this.source.find(item => item.collapse)
  }
  get (id) { return this.source.find(item => item.id === id) }
  select (id) {
    this.unSelectAll(id)
    const target = this.get(id)
    target && (target.selected = true)
    return target
  }
  unSelectAll () { this.source.forEach(item => (item.selected = false)) }
  fold () {
    this.source.forEach((radioItem, index) => {
      if (index >= DEFAULT_SHOW_SIZE) {
        radioItem.collapse = true
      }
    })
  }
  unFold () {
    this.source.forEach(radioItem => (radioItem.collapse = false))
  }
  toJSON () {
    return this.source.filter(radioItem => !radioItem.collapse)
  }
}

export default class RadioModel {
  static async getRadioConf () {
    const MOCK_TAG_CONF = [
      { id: 1, title: '办公位' },
      { id: 2, title: '健身房' },
      { id: 3, title: '邮件中心' },
      { id: 4, title: '711' },
      { id: 5, title: '茶水间' },
      { id: 6, title: '文印室' },
    ]
    // 模拟从 ajax 获取回来的数据
    const source = await MOCK_TAG_CONF
    return new TagConfEntity(source)
  }
}