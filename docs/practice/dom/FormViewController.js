/**
 * @file: description
 * @author: yongzhen
 * @Date: 2021-01-08 14:38:22
 * @LastEditors: yongzhen
 * @LastEditTime: 2021-01-13 18:26:57
 */
import * as utils from './utils';
import BaseViewController from './BaseViewController';

/**
 * type validator = {
 *   required: true
 * } | (fieldValue) => boolean
 * type validatorMap = {
 *   fieldName: validator[]
 * }
 */
const validatorMap = {
  nickname: [{ required: true, message: '请输入昵称' }],
  user_email: [
    { required: true, message: '请输入电子邮箱' },
    {
      validator: function (value) {
        return /\S+@\S+\.\S+/.test(value);
      },
      message: '输入的电子邮箱格式不正确'
    }
  ],
  comment: [
    { maxLen: 20, message: '您输入的文字太多' },
    { minLen: 10, message: '您输入的文字太少' }
  ]
};

export default class FormViewControler extends BaseViewController {
  constructor(options) {
    super(options);

    this.init();
  }

  init() {
    this.render();

    this.formEl = this.el.querySelector('#comment-form');
    this.formHelper = new FormHelper({
      el: this.formEl,
      validatorMap: validatorMap
    });

    this.formHelper.bindSubmitCallback(this.onSubmit.bind(this));
  }

  onSubmit(event, fieldValueMap) {
    alert(JSON.stringify(fieldValueMap));
  }

  render() {
    utils.dom.template(
      this.el,
      `
      <form id="comment-form">
        <div class="form-group">
          <label for="nickname">nickname</label>
          <input type="text" class="form-control" name="nickname">
          <div class="invalid-feedback">
            Please provide a valid city.
          </div>
          <div class="valid-feedback">
            Looks good!
          </div>
        </div>
        <div class="form-group">
          <label for="user_email">Email</label>
          <input type="email" class="form-control" name="user_email">
          <small class="form-text text-muted">We'll never share your email with anyone else.</small>
        </div>
        <div class="form-group">
          <label for="comment">Content</label>
          <textarea class="form-control" name="comment" rows="3"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
      `
    );
  }
}

class FormHelper extends BaseViewController {
  constructor(options) {
    super(options);

    this.init();
  }

  init() {
    this.delegateEvent('.form-control', 'blur', this._handleFormControlBlur.bind(this));
  }

  bindSubmitCallback(callback) {
    this.delegateEvent('button[type="submit"]', 'click', event => {
      event.preventDefault();

      const { errors, fieldValueMap } = this.validateForm();

      if (errors.length === 0) {
        callback(event, fieldValueMap);
      }
    });
  }

  _handleFormControlBlur(e) {
    const fieldName = e.target.name;
    const fieldVal = e.target.value;

    this.validateField(fieldName, fieldVal);
  }

  validateForm() {
    const controlEls = this.el.querySelectorAll('.form-control');
    const allFieldErrors = [];
    const fieldValueMap = {};

    controlEls.forEach(controlEl => {
      const fieldName = controlEl.name;
      const fieldVal = controlEl.value;

      const errors = this.validateField(fieldName, fieldVal);
      if (errors.length) {
        allFieldErrors.push({
          field: fieldName,
          errors
        });
      }

      fieldValueMap[fieldName] = fieldVal;
    });

    return {
      errors: allFieldErrors,
      fieldValueMap: fieldValueMap
    };
  }

  setFieldControlInValid(fieldName, errors) {
    const fieldControlEl = this.el.querySelector(`.form-control[name="${fieldName}"]`);
    const parentNode = fieldControlEl.parentNode;
    const invalidEls = parentNode.querySelectorAll('.invalid-feedback');
    const fragement = document.createDocumentFragment();

    fieldControlEl.classList.remove('is-valid');
    fieldControlEl.classList.add('is-invalid');

    invalidEls.forEach(invalidEl => {
      parentNode.removeChild(invalidEl);
    });

    errors.forEach(errorMessage => {
      const invalidEl = document.createElement('div');
      invalidEl.textContent = errorMessage;
      invalidEl.classList.add('invalid-feedback');

      fragement.appendChild(invalidEl);
    });

    parentNode.appendChild(fragement);
  }

  setFieldControlValid(fieldName) {
    const fieldControlEl = this.el.querySelector(`.form-control[name="${fieldName}"]`);
    fieldControlEl.classList.remove('is-invalid');
    fieldControlEl.classList.add('is-valid');
  }

  validateField(fieldName, fieldVal) {
    const validators = this.options.validatorMap[fieldName];

    if (!validators) {
      return [];
    }

    const errors = this.validate(fieldVal, validators);

    if (errors.length) {
      this.setFieldControlInValid(fieldName, errors);
    } else {
      this.setFieldControlValid(fieldName);
    }

    return errors;
  }

  validate(fieldVal, validators) {
    const errors = [];
    validators.forEach(validator => {
      const validatorObj = {
        fieldVal,
        validator: null, // internal validator key or custom validator function
        errorMessgae: '',
        options: null
      };

      for (let key in validator) {
        if (key === 'message') {
          validatorObj.errorMessgae = validator[key];
          continue;
        }
        if (key === 'validator') {
          // custom validator
          validatorObj.validator = validator[key];
          continue;
        }

        const internalValidator = FormHelper.internalValidatorMap[key];

        if (internalValidator) {
          validatorObj.validator = internalValidator;
          validatorObj.options = validator[key];
        } else {
          throw new Error('unknown options: ' + key);
        }
      }

      // invoke validator
      const isValid = validatorObj.validator(validatorObj.fieldVal, validatorObj.options);
      if (!isValid) {
        errors.push(validatorObj.errorMessgae);
      }
    });
    return errors;
  }

  validateInternal(fieldVal, validatorMap) {
    let isValid = true;
    Object.keys(validatorMap).forEach(key => {
      const internalValidator = FormHelper.internalValidatorMap[key];

      if (internalValidator) {
        isValid = internalValidator(fieldVal, validatorMap[key]);
      }
    });
    return isValid;
  }

  static internalValidatorMap = {
    required(value, required) {
      if (required) {
        return value !== 0 && Boolean(value);
      }
      return true;
    },
    maxLen(value, len) {
      if (typeof value === 'string' && value.length > len) {
        return false;
      }
      return true;
    },
    minLen(value, len) {
      if (typeof value === 'string' && value.length < len) {
        return false;
      }
      return true;
    }
  };
}
