import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from '@prisma/client';
import {
  CreateTransactionResponseDto,
  TransactionResponseDto,
} from './dto/transaction-response.dto';

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

  async getAllTransactions(
    active?: boolean,
  ): Promise<TransactionResponseDto[]> {
    const filter = active ? { is_active: active } : {};
    console.log(active);

    const transactions = await this.prismaService.transaction.findMany({
      where: filter,
      include: { client: {}, car: {} },
      orderBy: [{ is_active: 'desc' }, { updated_at: 'desc' }],
    });
    return transactions;
  }

  async getTransactionById(id: number): Promise<TransactionResponseDto> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
      include: { client: {}, car: {} },
    });
    if (!transaction) {
      throw new NotFoundException();
    }
    return transaction;
  }

  async update(
    id: number,
    updateTransactionDto: CreateTransactionDto,
  ): Promise<CreateTransactionResponseDto> {
    const { carId, clientId, start_date, finish_date } = updateTransactionDto;
    let carPrice: number;

    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException();
    }

    if (clientId !== transaction.clientId) {
      const client = await this.prismaService.client.findUnique({
        where: { id: clientId, is_renting: false, is_deleted: false },
      });
      if (!client) {
        throw new NotFoundException(
          'Client not found or is already renting a car',
        );
      }

      // Free the actual client in transaction and assign the new client to the updateTransactionDto
      await this.prismaService.client.update({
        where: { id: transaction.clientId },
        data: { is_renting: false },
      });
      updateTransactionDto.clientId = client.id;
    }

    if (carId !== transaction.carId) {
      const car = await this.prismaService.car.findUnique({
        where: { id: carId, is_rented: false, is_deleted: false },
      });
      if (!car) {
        throw new NotFoundException('Car not found or is already rented');
      }

      // Free the actual car in transaction and assign the new car to the updateTransactionDto
      await this.prismaService.car.update({
        where: { id: transaction.carId },
        data: { is_rented: false },
      });
      updateTransactionDto.carId = car.id;

      carPrice = car.price;
    } else {
      const car = await this.prismaService.car.findUnique({
        where: { id: carId },
      });
      carPrice = car.price;
    }

    const daysOfRental =
      (new Date(finish_date).getTime() - new Date(start_date).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysOfRental < 0) {
      throw new BadRequestException(
        'finish_date must be greater than start_date',
      );
    }

    const updatedTransaction = await this.prismaService.transaction.update({
      where: { id },
      data: {
        carId: updateTransactionDto.carId,
        clientId: updateTransactionDto.clientId,
        start_date: updateTransactionDto.start_date,
        finish_date: updateTransactionDto.finish_date,
        price_per_day: carPrice,
        total_price: carPrice * daysOfRental,
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

    return updatedTransaction;
  }

  async finishTransaction(id: number): Promise<CreateTransactionResponseDto> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException();
    }

    // Free car and client:
    // Set car to NOT rented
    await this.prismaService.car.update({
      where: { id: transaction.carId },
      data: { is_rented: false },
    });
    // Set client to NOT renting
    await this.prismaService.client.update({
      where: { id: transaction.clientId },
      data: { is_renting: false },
    });

    return this.prismaService.transaction.update({
      where: { id },
      data: { is_active: false },
    });
  }
}
