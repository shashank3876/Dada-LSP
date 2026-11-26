import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@dadaadvisory.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'DadaDemo@2026' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;
}

export class OtpVerifyDto {
  @ApiProperty({ example: 'rajesh.k@techcorp.in' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otp!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'rajesh.k@techcorp.in' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6...' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'NewSecret@2026' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword!: string;
}

export class InitiateEmployeeRegistrationDto {
  @ApiProperty({ example: 'TECHCORP' })
  @IsString()
  @IsNotEmpty()
  organizationCode!: string;

  @ApiProperty({ example: 'TC-1002' })
  @IsString()
  @IsNotEmpty()
  employeeCode!: string;

  @ApiProperty({ example: 'priya.s@techcorp.in' })
  @IsEmail()
  @IsNotEmpty()
  officialEmail!: string;
}

export class RegisterEmployeeDto {
  @ApiProperty({ example: 'TECHCORP' })
  @IsString()
  @IsNotEmpty()
  organizationCode!: string;

  @ApiProperty({ example: 'TC-1002' })
  @IsString()
  @IsNotEmpty()
  employeeCode!: string;

  @ApiProperty({ example: 'priya.s@techcorp.in' })
  @IsEmail()
  @IsNotEmpty()
  officialEmail!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp!: string;

  @ApiProperty({ example: 'SecurePass@2026' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;
}
