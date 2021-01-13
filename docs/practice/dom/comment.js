/**
 * @file: description
 * @author: yongzhen
 * @Date: 2021-01-07 09:40:08
 * @LastEditors: yongzhen
 * @LastEditTime: 2021-01-13 16:28:39
 */
import CommentViewController from './CommentViewController';
import { COMMENT_STYLE } from './style';

export default class CommentApi {
  static init(root, options) {
    CommentApi.DEBUG_loadBootstrapStyle();
    CommentApi.loadStyle(root);

    const container = document.createElement('div');
    root.appendChild(container);

    return new CommentViewController({
      el: container,
      ...options
    });
  }

  static loadStyle(root) {
    const style = document.createElement('style');
    style.innerHTML = COMMENT_STYLE;
    root.appendChild(style);
  }

  static DEBUG_loadBootstrapStyle() {
    const link = document.createElement('link');
    link.setAttribute(
      'href',
      'https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css'
    );
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('crossorigin', 'anonymous');
    document.head.appendChild(link);
  }
}
