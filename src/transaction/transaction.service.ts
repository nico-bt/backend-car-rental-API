import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { Transaction } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { carId, clientId, start_date, finish_date } = createTransactionDto;

    const isValidCar = await this.prismaService.car.findUnique({
      where: { id: carId, is_deleted: false, is_rented: false },
    });
    if (!isValidCar) {
      throw new BadRequestException('Not a valid Car');
    }

    const isValidClient = await this.prismaService.client.findUnique({
      where: { id: clientId, is_deleted: false, is_renting: false },
    });
    if (!isValidClient) {
      throw new BadRequestException('Not a valid Client');
    }

    const daysOfRental =
      (new Date(finish_date).getTime() - new Date(start_date).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysOfRental < 1) {
      throw new BadRequestException(
        'finish_date must be greater than start_date',
      );
    }

    const transaction = await this.prismaService.transaction.create({
      data: {
        carId,
        clientId,
        start_date: start_date,
        finish_date: finish_date,
        price_per_day: isValidCar.price,
        total_price: isValidCar.price * daysOfRental,
      },
    });

    // Set car to rented
    await this.prismaService.car.update({
      where: { id: carId },
      data: { is_rented: true },
    });
    // Set client to renting
    await this.prismaService.client.update({
      where: { id: clientId },
      data: { is_renting: true },
    });

    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const transactions = await this.prismaService.transaction.findMany({
      include: { client: {}, car: {} },
    });
    return transactions;
  }
}
