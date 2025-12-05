import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const req: Request = ctx.getRequest();
    const res: Response = ctx.getResponse();

    const status = exception.getStatus();

    res.status(status).json({
      statusCode: status,
      message: exception.message,
      path: req.url,
      time: new Date().toString(),
    });
  }
}
