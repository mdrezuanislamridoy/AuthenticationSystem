import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-11-17.clover',
    });
  }

  async createPayment(amount: number, currency: string = 'usd') {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
    });
    return paymentIntent;
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });
    return paymentIntent;
  }
}
