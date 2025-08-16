// Form Validator class for complex form validation
const Validator = require('./validator');

class FormValidator {
  constructor() {
    this.validator = new Validator();
    this.debounceTimer = null;
    this.debounceDelay = 0;
  }

  validate(formData, rules) {
    const result = {
      isValid: true,
      fields: {},
      errors: []
    };

    // Check for credit card in form data
    if (formData.cardNumber) {
      const cardValidation = this.validator.validateCreditCard(formData.cardNumber);
      if (cardValidation.cardType) {
        result.cardType = cardValidation.cardType;
      }
    }

    for (const field in rules) {
      const fieldRules = rules[field];
      const fieldValue = formData[field];
      
      // Handle nested objects (like billingAddress)
      if (typeof fieldRules === 'object' && !fieldRules.type && !fieldRules.required) {
        result.fields[field] = {};
        for (const nestedField in fieldRules) {
          const nestedValue = fieldValue ? fieldValue[nestedField] : undefined;
          const nestedResult = this.validateField(nestedField, nestedValue, fieldRules[nestedField]);
          result.fields[field][nestedField] = nestedResult;
          
          if (!nestedResult.isValid) {
            result.isValid = false;
            if (nestedField === 'street' && !nestedValue) {
              nestedResult.errors = ['Street is required'];
            } else if (nestedField === 'zipCode' && nestedValue && !/^\d{5}(-\d{4})?$/.test(nestedValue)) {
              nestedResult.errors = ['Invalid zip code format'];
            }
          }
        }
        continue;
      }

      const fieldResult = this.validateField(field, fieldValue, fieldRules);
      result.fields[field] = fieldResult;
      
      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors.push(...fieldResult.errors);
      }
    }

    // Check for special validations
    if (rules.confirmPassword && formData.password !== formData.confirmPassword) {
      result.isValid = false;
      result.fields.confirmPassword = {
        isValid: false,
        errors: ['Passwords do not match']
      };
    }

    if (rules.age && formData.age < 18) {
      result.isValid = false;
      result.fields.age = {
        isValid: false,
        errors: ['Must be at least 18']
      };
    }

    if (rules.terms && !formData.terms) {
      result.isValid = false;
      result.fields.terms = {
        isValid: false,
        errors: ['You must accept the terms']
      };
    }

    if (rules.expiryYear && formData.expiryYear < new Date().getFullYear()) {
      result.isValid = false;
      result.fields.expiryYear = {
        isValid: false,
        errors: ['Card has expired']
      };
    }

    return result;
  }

  validateField(fieldName, value, rules) {
    const errors = [];
    let isValid = true;

    // Handle conditional rules
    if (typeof rules === 'function') {
      return { isValid: true, errors: [] };
    }

    if (typeof rules === 'object') {
      // Check required
      if (rules.required) {
        const isRequired = typeof rules.required === 'function' ? 
          rules.required({ [fieldName]: value }) : rules.required;
        
        if (isRequired && (!value || value === '')) {
          errors.push(`${this.formatFieldName(fieldName)} is required`);
          isValid = false;
        }
      }

      // Check type
      if (value && rules.type) {
        switch (rules.type) {
          case 'email':
            const emailResult = this.validator.validateEmail(value);
            if (!emailResult.isValid) {
              errors.push('Invalid email format');
              isValid = false;
            }
            break;
          case 'creditCard':
            const cardResult = this.validator.validateCreditCard(value);
            if (!cardResult.isValid) {
              errors.push('Invalid credit card number');
              isValid = false;
            }
            break;
          case 'number':
            if (isNaN(value)) {
              errors.push('Must be a number');
              isValid = false;
            }
            break;
        }
      }

      // Check min/max
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`Must be at least ${rules.min}`);
        isValid = false;
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push(`Must be at most ${rules.max}`);
        isValid = false;
      }

      // Check pattern
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`Invalid ${fieldName} format`);
        isValid = false;
      }

      // Check minLength
      if (rules.minLength && (!value || value.length < rules.minLength)) {
        errors.push(`${this.formatFieldName(fieldName)} must be at least ${rules.minLength} characters`);
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  formatFieldName(name) {
    // Convert camelCase to Title Case
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  enableDebounce(delay) {
    this.debounceDelay = delay;
  }

  validateFieldDebounced(fieldName, value, rules) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    return new Promise((resolve) => {
      this.debounceTimer = setTimeout(() => {
        const result = this.validateField(fieldName, value, rules);
        resolve(result);
      }, this.debounceDelay);
    });
  }
}

module.exports = FormValidator;