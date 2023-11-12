import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Put,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from '@prisma/client';

@Controller('api/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(
    @Body() createTransaction: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionService.createTransaction(createTransaction);
  }

  @Get()
  findAll(): Promise<Transaction[]> {
    return this.transactionService.getAllTransactions();
  }

  @Get(':id')
  findTransactionById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Transaction> {
    return this.transactionService.getTransactionById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransaction: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionService.update(id, updateTransaction);
  }

  //   @Delete(':id')
  //   remove(@Param('id', ParseIntPipe) id: number): Promise<Client> {
  //     return this.clientService.remove(id);
  //   }
}
