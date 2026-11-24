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
