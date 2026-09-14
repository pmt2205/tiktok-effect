export interface RegisterValues {
  username: string;
  password: string;
  confirmPassword: string;
}

export type RegisterField = keyof RegisterValues;
export type RegisterErrors = Partial<Record<RegisterField, string>>;

export function validateRegistration(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};
  const username = values.username.trim();

  if (!username) {
    errors.username = 'Vui lòng nhập tài khoản hoặc email.';
  } else if (username.length < 3 || username.length > 64) {
    errors.username = 'Tài khoản phải có từ 3 đến 64 ký tự.';
  } else if (/\s/.test(username)) {
    errors.username = 'Tài khoản không được chứa khoảng trắng.';
  }

  if (!values.password) {
    errors.password = 'Vui lòng nhập mật khẩu.';
  } else if (values.password.length < 10 || values.password.length > 128) {
    errors.password = 'Mật khẩu phải có từ 10 đến 128 ký tự.';
  } else if (!/[a-z]/.test(values.password)) {
    errors.password = 'Mật khẩu cần ít nhất một chữ thường.';
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = 'Mật khẩu cần ít nhất một chữ hoa.';
  } else if (!/\d/.test(values.password)) {
    errors.password = 'Mật khẩu cần ít nhất một chữ số.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
  }

  return errors;
}

export function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object' || !('message' in payload)) return fallback;
  const message = payload.message;
  if (Array.isArray(message)) return message.filter((item): item is string => typeof item === 'string').join('. ');
  return typeof message === 'string' ? message : fallback;
}
