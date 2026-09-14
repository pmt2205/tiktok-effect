import { IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Tài khoản phải là chuỗi ký tự' })
  @Length(3, 64, { message: 'Tài khoản phải có từ 3 đến 64 ký tự' })
  @Matches(/^[^\s]+$/, { message: 'Tài khoản không được chứa khoảng trắng' })
  username: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @Length(1, 128, { message: 'Vui lòng nhập mật khẩu hợp lệ' })
  password: string;
}
