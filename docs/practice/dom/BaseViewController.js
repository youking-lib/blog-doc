/**
 * @file: description
 * @author: yongzhen
 * @Date: 2021-01-08 14:34:11
 * @LastEditors: yongzhen
 * @LastEditTime: 2021-01-10 15:10:14
 */
import * as utils from './utils';

const UN_BUBBLES_EVENTS = ['focus', 'blur'];

export default class BaseViewController {
  constructor(options) {
    this.options = options;
    this.el = options.el;

    this._events = [];
  }

  // 事件委托
  delegateEvent(selector, action, cb) {
    const handler = event => {
      const delegateNode = utils.dom.getDelegateNodeContainsTarget(selector, event.target, this.el);
      if (delegateNode) {
        event.delegateNode = delegateNode;
        cb(event);
      }
    };
    const removeEvent = () => {
      this.el.removeEventListener(action, handler);
      this._events = this._events.filter(item => item !== removeEvent);
    };

    const useCapture = UN_BUBBLES_EVENTS.includes(action);

    this.el.addEventListener(action, handler, useCapture);
    this._events.push(removeEvent);

    return removeEvent;
  }

  distroyEvents() {
    this._events.forEach(removeEvent => removeEvent());
  }
}
