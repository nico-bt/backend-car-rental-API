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
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateTransactionResponseDto,
  TransactionResponseDto,
} from './dto/transaction-response.dto';

@ApiTags('Transactions')
@Controller('api/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(
    @Body() createTransaction: CreateTransactionDto,
  ): Promise<CreateTransactionResponseDto> {
    return this.transactionService.createTransaction(createTransaction);
  }

  @ApiQuery({
    name: 'active',
    required: false,
    description:
      'Filter active transactions only by passing the query => ?active=true',
  })
  @Get()
  findAll(
    @Query('active', new ParseBoolPipe({ optional: true }))
    active?: boolean,
  ): Promise<TransactionResponseDto[]> {
    return this.transactionService.getAllTransactions(active);
  }

  @Get(':id')
  findTransactionById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.getTransactionById(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransaction: CreateTransactionDto,
  ): Promise<CreateTransactionResponseDto> {
    return this.transactionService.update(id, updateTransaction);
  }

  @Patch(':id')
  finishTransaction(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CreateTransactionResponseDto> {
    return this.transactionService.finishTransaction(id);
  }
}
