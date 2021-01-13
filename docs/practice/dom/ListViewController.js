/**
 * @file: description
 * @author: yongzhen
 * @Date: 2021-01-08 14:37:30
 * @LastEditors: yongzhen
 * @LastEditTime: 2021-01-08 14:39:05
 */
import * as utils from './utils';
import BaseViewController from './BaseViewController';

export default class ListViewController extends BaseViewController {
  constructor(options) {
    super(options);

    this.viewState = {
      loading: false,
      dataSource: []
    };

    this.init();
  }

  init() {
    this.loadCommentList();
  }

  loadCommentList() {
    this.viewState.loading = true;
    this.render();

    setTimeout(() => {
      this.viewState.loading = false;
      this.render();
    }, 1500);
  }

  render() {
    if (this.viewState.loading) {
      utils.dom.template(
        this.el,
        `
        <div class="d-flex align-items-center">
          <strong>Loading...</strong>
          <div class="spinner-border spinner-border-sm ms-auto" role="status" aria-hidden="true"></div>
        </div>
        `
      );
    } else {
      utils.dom.template(
        this.el,
        `
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Cras justo odio</li>
          <li class="list-group-item">Dapibus ac facilisis in</li>
          <li class="list-group-item">Morbi leo risus</li>
          <li class="list-group-item">Porta ac consectetur ac</li>
          <li class="list-group-item">Vestibulum at eros</li>
        </ul>
        `
      );
    }
  }
}
