import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  CreateTransactionResponseDto,
  TransactionResponseDto,
} from './dto/transaction-response.dto';

const createTransactionDto: CreateTransactionDto = {
  clientId: 22,
  carId: 76,
  start_date: '2023-11-14T03:00:00.000Z',
  finish_date: '2023-11-20T03:00:00.000Z',
};

const mockCreateTransactionResponse: CreateTransactionResponseDto = {
  id: 16,
  clientId: 22,
  carId: 76,
  start_date: new Date('2023-11-14T03:00:00.000Z'),
  finish_date: new Date('2023-11-20T03:00:00.000Z'),
  price_per_day: 75,
  total_price: 450,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  is_deleted: false,
};

const mockTransactionResponse: TransactionResponseDto = {
  id: 16,
  clientId: 22,
  carId: 76,
  start_date: new Date('2023-11-14T03:00:00.000Z'),
  finish_date: new Date('2023-11-20T03:00:00.000Z'),
  price_per_day: 75,
  total_price: 450,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  is_deleted: false,
  client: {
    id: 22,
    nombre: 'Carlos',
    apellido: 'Roa',
    tipo_documento: 'DNI',
    nro_documento: '20567897',
    nacionalidad: 'Argentina',
    direccion: 'San Martin 456',
    telefono: '4789987',
    email: 'c.roa@mail.com',
    fecha_nacimiento: new Date('1969-04-15T04:00:00.000Z'),
    created_at: new Date('2023-11-13T04:07:11.449Z'),
    updated_at: new Date('2023-11-14T01:28:48.952Z'),
    is_renting: true,
    is_deleted: false,
  },
  car: {
    id: 76,
    marca: 'Ferrari',
    modelo: '458 Spider',
    year: 2021,
    km: 14420,
    color: 'rojo',
    ac: true,
    pasajeros: 2,
    cambios: 'MANUAL',
    created_at: new Date('2023-11-10T20:42:19.399Z'),
    updated_at: new Date('2023-11-14T01:28:48.874Z'),
    is_deleted: false,
    is_rented: true,
    price: 75,
  },
};

describe('TransactionController', () => {
  let transactionController: TransactionController;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            createTransaction: jest.fn(),
            getAllTransactions: jest.fn(),
            getTransactionById: jest.fn(),
            update: jest.fn(),
            finishTransaction: jest.fn(),
          },
        },
      ],
    }).compile();
    transactionController = module.get<TransactionController>(
      TransactionController,
    );
    transactionService = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(transactionController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      jest
        .spyOn(transactionService, 'createTransaction')
        .mockResolvedValue(mockCreateTransactionResponse);

      const result = await transactionController.create(createTransactionDto);

      expect(result).toBe(mockCreateTransactionResponse);
      expect(transactionService.createTransaction).toHaveBeenCalledWith(
        createTransactionDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of transactions', async () => {
      const mockTransactions: TransactionResponseDto[] = [
        mockTransactionResponse,
      ];

      jest
        .spyOn(transactionService, 'getAllTransactions')
        .mockResolvedValue(mockTransactions);

      const result = await transactionController.findAll();

      expect(result).toEqual(mockTransactions);
      expect(transactionService.getAllTransactions).toHaveBeenCalled();
    });
  });

  describe('findTransactionById', () => {
    it('should return a single transaction by id', async () => {
      const ID = mockTransactionResponse.id;

      jest.spyOn(transactionService, 'getTransactionById');

      await transactionController.findTransactionById(ID);
      expect(transactionService.getTransactionById).toHaveBeenCalledWith(ID);
    });
  });

  describe('update', () => {
    it('should update a transaction by id', async () => {
      const ID = mockTransactionResponse.id;
      jest.spyOn(transactionService, 'update');

      await transactionController.update(ID, createTransactionDto);

      expect(transactionService.update).toHaveBeenCalledWith(
        ID,
        createTransactionDto,
      );
    });
  });

  describe('finishTransaction', () => {
    it('should finish a transaction by id', async () => {
      const ID = 66;
      jest.spyOn(transactionService, 'finishTransaction');

      await transactionController.finishTransaction(ID);
      expect(transactionService.finishTransaction).toHaveBeenCalledWith(ID);
    });
  });
});
