import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './create-transaction.dto';
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

  //   @Get(':id')
  //   findClientById(@Param('id', ParseIntPipe) id: number): Promise<Client> {
  //     return this.clientService.findClientById(id);
  //   }

  //   @Patch(':id')
  //   update(
  //     @Param('id', ParseIntPipe) id: number,
  //     @Body() updateClientDto: UpdateClientDto,
  //   ): Promise<Client> {
  //     return this.clientService.update(id, updateClientDto);
  //   }

  //   @Delete(':id')
  //   remove(@Param('id', ParseIntPipe) id: number): Promise<Client> {
  //     return this.clientService.remove(id);
  //   }
}
