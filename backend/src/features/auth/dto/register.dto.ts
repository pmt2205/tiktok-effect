import { IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Tài khoản phải là chuỗi ký tự' })
  @Length(3, 64, { message: 'Tài khoản phải có từ 3 đến 64 ký tự' })
  @Matches(/^[^\s]+$/, { message: 'Tài khoản không được chứa khoảng trắng' })
  username: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @Length(10, 128, { message: 'Mật khẩu phải có từ 10 đến 128 ký tự' })
  @Matches(/[a-z]/, { message: 'Mật khẩu phải có ít nhất một chữ thường' })
  @Matches(/[A-Z]/, { message: 'Mật khẩu phải có ít nhất một chữ hoa' })
  @Matches(/\d/, { message: 'Mật khẩu phải có ít nhất một chữ số' })
  password: string;
}
