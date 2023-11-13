import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Patch,
  Query,
  ParseBoolPipe,
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
  findAll(
    @Query('active', new ParseBoolPipe({ optional: true })) active?: boolean,
  ): Promise<Transaction[]> {
    return this.transactionService.getAllTransactions(active);
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

  @Patch(':id')
  finishTransaction(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Transaction> {
    return this.transactionService.finishTransaction(id);
  }
}
