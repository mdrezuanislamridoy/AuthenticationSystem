import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterUser } from './dto/register-user-dto';
import bcrypt from 'bcrypt';
import cloudinary from '@/lib/utils/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mail: MailerService,
  ) {}
  async sendSignupCode(email: string) {
    try {
      const isUser = await this.prisma.client.user.findFirst({
        where: {
          email: email,
        },
      });

      if (isUser) {
        throw new ConflictException('User already exists');
      }

      const verificationCode = Math.ceil(100000 + Math.random() * 99999);
      await this.mail.sendMail({
        from: 'Auth Service',
        to: email,
        subject: "You've recieved a verification code from AuthSystem",
        html: `
        <h3>AuthSystem</h3>
        <p>You've recieved an code from AuthSystem</p>

        <h2>${verificationCode}</h2>

        <p>Please confirm the code to verify it's you</p>
        
        `,
      });

      const emails = await this.prisma.client.verificationCode.findMany({
        where: { email },
      });

      if (emails) {
        await this.prisma.client.verificationCode.deleteMany({
          where: { email },
        });
      }

      await this.prisma.client.verificationCode.create({
        data: {
          email,
          code: verificationCode,
        },
      });

      return { message: 'Please verify your code to see the result' };
    } catch (error) {
      throw error;
    }
  }

  async verifySignupCode(data: { email: string; verificationCode: string }) {
    try {
      const code = Number(data.verificationCode);

      const isValid = await this.prisma.client.verificationCode.findFirst({
        where: {
          email: data.email,
          code,
        },
      });

      const now: any = new Date();
      const createdAt = new Date(isValid?.createdAt as Date);

      const isValidInTime =
        now.getTime() - createdAt.getTime() > 15 * 60 * 1000;

      if (!isValid && !isValidInTime) {
        throw new ForbiddenException("You're not valid or expired code");
      }

      await this.prisma.client.verificationCode.update({
        where: {
          id: isValid?.id,
        },
        data: {
          isVerified: true,
        },
      });

      return {
        message: 'email verified successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async register(userData: RegisterUser, profile: Express.Multer.File) {
    try {
      const isValid = await this.prisma.client.verificationCode.findFirst({
        where: { email: userData.email, isVerified: true },
      });
      if (!isValid) {
        throw new ForbiddenException(
          "You're not allowed to signup. Please verify first or login to your account",
        );
      }

      if (!profile) {
        throw new HttpException(
          'Profile picture is missing',
          HttpStatus.BAD_REQUEST,
        );
      }

      const uploadStream = (file: Express.Multer.File) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'authServiceProfile',
            },
            (err, data) => {
              if (data) resolve(data);
              else reject(err);
            },
          );
          stream.end(file.buffer);
        });
      };

      const result: UploadApiResponse = (await uploadStream(
        profile,
      )) as UploadApiResponse;

      const imageUrl = result.secure_url;

      const hashedPass = await bcrypt.hash(userData.password, 10);

      await this.prisma.client.user.create({
        data: {
          ...userData,
          password: hashedPass,
          profilePicture: imageUrl,
        },
      });

      await this.prisma.client.verificationCode.delete({
        where: {
          id: isValid.id,
        },
      });

      return {
        message: 'User created successfully, you can now join your account',
      };
    } catch (error) {
      throw error;
    }
  }

  async profile(req: Request) {
    return req.user;
  }

  async resetPasswordCode(email: string) {
    try {
      const isUser = await this.prisma.client.user.findFirst({
        where: {
          email: email,
        },
      });

      if (!isUser) {
        throw new NotFoundException('Acount not found');
      }

      const verificationCode = Math.ceil(100000 + Math.random() * 99999);

      await this.mail.sendMail({
        from: 'Ridoy Auth',
        to: email,
        subject: `Reset password request for AuthService`,
        html: `
            <h1>Verify your code to reset your password</h1>
            <p>Your reset password code is ${verificationCode}</p>
            <em style="background-color:red; color:white">Don't share with anyone</em>
          `,
      });

      const emails = await this.prisma.client.verificationCode.findMany({
        where: { email },
      });

      if (emails) {
        await this.prisma.client.verificationCode.deleteMany({
          where: { email },
        });
      }

      await this.prisma.client.resetCode.create({
        data: {
          email,
          code: verificationCode,
        },
      });

      return {
        message: 'Reset password email sent to your mail',
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyResetCode(data: { email: string; verificationCode: string }) {
    try {
      const code = Number(data.verificationCode);
      const isValid = await this.prisma.client.resetCode.findFirst({
        where: {
          email: data.email,
          code,
        },
      });
      if (!isValid) {
        throw new ForbiddenException(
          'Not allowed to reset or no account with this mail',
        );
      }

      const now = new Date().getTime();

      const createdAt = new Date(isValid.createdAt).getTime();

      const ExpirationLimit = 15 * 60 * 1000;

      if (now - createdAt > ExpirationLimit) {
        throw new ForbiddenException(
          'Your request to reset code is not valid yet',
        );
      }

      await this.prisma.client.resetCode.update({
        where: {
          id: isValid.id,
        },
        data: {
          isVerified: true,
        },
      });

      return {
        message: 'Code is verified, now you can change your password',
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(data: { email: string; password: string }) {
    try {
      const isValid = await this.prisma.client.resetCode.findFirst({
        where: {
          email: data.email,
          isVerified: true,
        },
      });

      if (!isValid) {
        throw new ForbiddenException('Your request is invalid');
      }

      const user = await this.prisma.client.user.findFirst({
        where: {
          email: data.email,
        },
      });

      if (!user || !user?.password) {
        throw new BadRequestException('Invalid user or social login account');
      }

      const isPresentPassMatched = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (isPresentPassMatched) {
        throw new ForbiddenException("You're already using this one");
      }

      let resetPassRecord = await this.prisma.client.resetPassword.findFirst({
        where: { userId: user.id },
      });

      if (!resetPassRecord) {
        resetPassRecord = await this.prisma.client.resetPassword.create({
          data: {
            userId: user.id,
            passwords: [],
          },
        });
      }

      if (resetPassRecord) {
        for (const oldPass of resetPassRecord.passwords) {
          const isMatched = await bcrypt.compare(data.password, oldPass);
          if (isMatched) {
            throw new ForbiddenException(
              'Password already used. Try another one',
            );
          }
        }
      }

      const hashedPass = await bcrypt.hash(data.password, 10);

      await this.prisma.client.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPass,
        },
      });

      await this.prisma.client.resetPassword.update({
        where: {
          id: resetPassRecord.id,
        },
        data: {
          passwords: {
            push: user?.password!,
          },
        },
      });

      await this.prisma.client.resetCode.delete({
        where: {
          id: isValid.id,
        },
      });

      return {
        message: 'Password reset successfull',
      };
    } catch (error) {
      throw error;
    }
  }
}
