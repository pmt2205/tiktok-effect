export interface LoginValues {
  username: string;
  password: string;
}

export type LoginField = keyof LoginValues;
export type LoginErrors = Partial<Record<LoginField, string>>;

export function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
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
  } else if (values.password.length > 128) {
    errors.password = 'Mật khẩu không được vượt quá 128 ký tự.';
  }

  return errors;
}
