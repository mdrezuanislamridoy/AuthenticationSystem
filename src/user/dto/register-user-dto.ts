import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUser {
  @IsEmail({}, { message: 'Value must be a valid email' })
  @IsNotEmpty({ message: 'Value cannot be empty' })
  email: string;

  @IsString({ message: 'Value must be a string' })
  @IsNotEmpty({ message: 'Value cannot be empty' })
  full_name: string;

  @IsString({ message: 'Value must be a string' })
  @IsNotEmpty({ message: 'Value cannot be empty' })
  gender: 'male' | 'female' | 'other';

  @IsString({ message: 'Value must be a string' })
  @IsNotEmpty({ message: 'Value cannot be empty' })
  dateOfBirth: string;

  @IsString({ message: 'Value must be a string' })
  @IsNotEmpty({ message: 'Value cannot be empty' })
  @MinLength(6, { message: 'Password needs to be at least 6 character' })
  password: string;

  @IsString({ message: 'Value must be a string' })
  @IsNotEmpty({ message: 'Value cannot be empty' })
  role: 'student' | 'faculty' | 'recruiter' | 'pro_partner';
}
