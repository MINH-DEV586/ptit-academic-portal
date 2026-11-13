const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const NUMBER_TEXT_REGEX = /^-?\d+(\.\d+)?$/;

function isValidDate(text) {
  if (!DATE_REGEX.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

const today = () => new Date().toISOString().slice(0, 10);

function checkValue(raw, rule, coerce) {
  switch (rule.type) {
    case 'string': {
      if (typeof raw !== 'string') return { error: 'phải là chuỗi ký tự' };
      let text = raw.trim();
      if (rule.lower) text = text.toLowerCase();
      if (rule.upper) text = text.toUpperCase();
      if (rule.min !== undefined && text.length < rule.min) return { error: `phải có ít nhất ${rule.min} ký tự` };
      if (rule.max !== undefined && text.length > rule.max) return { error: `không được quá ${rule.max} ký tự` };
      if (rule.pattern && !rule.pattern.test(text)) return { error: rule.patternMessage || 'sai định dạng' };
      return { value: text };
    }

    case 'integer':
    case 'number': {
      let num = raw;
      if (coerce && typeof num === 'string') {
        if (!NUMBER_TEXT_REGEX.test(num.trim())) return { error: 'phải là số' };
        num = Number(num);
      }
      if (typeof num !== 'number' || !Number.isFinite(num)) return { error: 'phải là số' };
      if (rule.type === 'integer' && !Number.isInteger(num)) return { error: 'phải là số nguyên' };
      if (rule.min !== undefined && num < rule.min) return { error: `phải lớn hơn hoặc bằng ${rule.min}` };
      if (rule.max !== undefined && num > rule.max) return { error: `phải nhỏ hơn hoặc bằng ${rule.max}` };
      return { value: num };
    }

    case 'date': {
      if (typeof raw !== 'string' || !isValidDate(raw)) return { error: 'phải là ngày hợp lệ dạng YYYY-MM-DD' };
      const max = rule.max === 'today' ? today() : rule.max;
      if (rule.min && raw < rule.min) return { error: `không được trước ngày ${rule.min}` };
      if (max && raw > max) return { error: rule.max === 'today' ? 'không được ở tương lai' : `không được sau ngày ${max}` };
      return { value: raw };
    }

    case 'enum':
      if (!rule.values.includes(raw)) return { error: `phải là một trong: ${rule.values.join(', ')}` };
      return { value: raw };

    default:
      throw new Error(`Kiểu dữ liệu không hỗ trợ: ${rule.type}`);
  }
}

function validate(input, schema, { partial = false, coerce = false } = {}) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const value = {};
  const errors = [];

  for (const [name, rule] of Object.entries(schema)) {
    const raw = source[name];
    const missing = raw === undefined || raw === null || raw === '';

    if (missing) {
      if (rule.nullable && (raw === null || raw === '')) {
        value[name] = null;
      } else if (rule.required && !partial) {
        errors.push({ field: name, message: `${name} là bắt buộc` });
      } else if (rule.default !== undefined && !partial) {
        value[name] = rule.default;
      }
      continue;
    }

    const result = checkValue(raw, rule, coerce);
    if (result.error) errors.push({ field: name, message: `${name} ${result.error}` });
    else value[name] = result.value;
  }

  return { value, errors };
}

module.exports = { validate, isValidDate };
