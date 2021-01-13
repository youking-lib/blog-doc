/**
 * @file: description
 * @author: yongzhen
 * @Date: 2021-01-08 14:34:43
 * @LastEditors: yongzhen
 * @LastEditTime: 2021-01-08 14:35:12
 */
export const dom = {
  getDelegateNodeContainsTarget(selector, target, root) {
    let delegateNode = target;
    while (delegateNode) {
      if (delegateNode.matches(selector)) {
        return delegateNode;
      }
      if (root === delegateNode) {
        return null;
      }
      delegateNode = delegateNode.parentNode;
    }
    return null;
  },
  template(node, template) {
    node.innerHTML = template;
  }
};
