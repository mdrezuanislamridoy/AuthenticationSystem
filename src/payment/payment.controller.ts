import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CustomError } from '@/core/error/CustomErrorException';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('make-payment')
  async makePayment(@Body() data: { amount: number }) {
    const paymentIntent = await this.paymentService.createPayment(data.amount);
    return { clientSecret: paymentIntent.client_secret };
  }

  @Post('doing/:id')
  getDoing(@Param('id', ParseIntPipe) id: number) {
    return `You're doing a great work ${id}`;
  }

  @Post('custom-error')
  customError() {
    throw new CustomError('This is a custom error', HttpStatus.BAD_REQUEST);
  }
}
