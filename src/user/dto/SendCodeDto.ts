import { IsEmail, IsNotEmpty } from 'class-validator';
export class SendCodeDto {
  @IsEmail({}, { message: 'Value must be a valid email' })
  @IsNotEmpty({ message: 'Value cannot be empty' })
  email: string;
}
