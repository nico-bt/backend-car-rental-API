import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Car, Client, Transaction } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const createTransactionDto: CreateTransactionDto = {
  clientId: 22,
  carId: 76,
  start_date: '2023-11-14T03:00:00.000Z',
  finish_date: '2023-11-20T03:00:00.000Z',
};

const mockTransactionResponse: Transaction = {
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

const mockClient: Client = {
  id: 22,
  nombre: 'Maria Laura',
  apellido: 'Ramirez',
  tipo_documento: 'DNI',
  nro_documento: '40222555',
  nacionalidad: 'Argentina',
  direccion: 'Rivadavia 1234',
  telefono: '1141112222',
  email: 'mar.lr@mail.com',
  fecha_nacimiento: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
  is_renting: false,
  is_deleted: false,
};

const mockCar: Car = {
  id: 76,
  marca: 'Toyota',
  modelo: 'Corolla',
  year: 2022,
  km: 600,
  color: 'negro',
  ac: true,
  pasajeros: 5,
  cambios: 'MANUAL',
  price: 75,
  created_at: new Date(),
  updated_at: new Date(),
  is_deleted: false,
  is_rented: false,
};

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      transaction: {
        findUnique: jest.fn().mockResolvedValue(mockTransactionResponse),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      car: {
        findUnique: jest.fn().mockResolvedValue(mockCar),
        update: jest.fn(),
      },
      client: {
        findUnique: jest.fn().mockResolvedValue(mockClient),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(transactionService).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should create a new transaction calling prismaService.create with the passed data', async () => {
      jest
        .spyOn(prismaService.transaction, 'create')
        .mockResolvedValue(mockTransactionResponse);

      const result =
        await transactionService.createTransaction(createTransactionDto);

      expect(result).toEqual(mockTransactionResponse);

      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining(createTransactionDto),
      });
    });

    it('should throw a BadRequestException if car or client is not valid', async () => {
      // Mock findUnique: Looking in db to check if car or client is valid returns null
      jest.spyOn(prismaService.car, 'findUnique').mockResolvedValueOnce(null);

      await expect(
        transactionService.createTransaction(createTransactionDto),
      ).rejects.toThrow(BadRequestException);

      jest
        .spyOn(prismaService.client, 'findUnique')
        .mockResolvedValueOnce(null);

      await expect(
        transactionService.createTransaction(createTransactionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a BadRequestException if finish_date is less than start_date', async () => {
      const invalidDatesDto: CreateTransactionDto = {
        ...createTransactionDto,
        start_date: '2023-11-20T03:00:00.000Z',
        finish_date: '2023-11-14T03:00:00.000Z',
      };
      await expect(
        transactionService.createTransaction(invalidDatesDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllTransactions', () => {
    it('should return an array of transactions', async () => {
      const mockTransactions = [mockTransactionResponse];

      jest
        .spyOn(prismaService.transaction, 'findMany')
        .mockResolvedValue(mockTransactions);

      const result = await transactionService.getAllTransactions();

      expect(result).toEqual(mockTransactions);
      expect(prismaService.transaction.findMany).toHaveBeenCalled();
    });

    it('should return an array of active transactions if query?active=true is passed', async () => {
      const mockActiveTransactions = [mockTransactionResponse];

      jest
        .spyOn(prismaService.transaction, 'findMany')
        .mockResolvedValue(mockActiveTransactions);

      const result = await transactionService.getAllTransactions(true);

      expect(result).toEqual(mockActiveTransactions);
      expect(prismaService.transaction.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        include: { client: {}, car: {} },
        orderBy: [{ is_active: 'desc' }, { updated_at: 'desc' }],
      });
    });
  });

  describe('getTransactionById', () => {
    it('should return a single transaction by id', async () => {
      const ID = mockTransactionResponse.id;

      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(mockTransactionResponse);

      const result = await transactionService.getTransactionById(ID);

      expect(result).toEqual(mockTransactionResponse);
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: ID },
        include: { client: {}, car: {} },
      });
    });

    it('should throw a NotFoundException if transaction is not found', async () => {
      const ID = 999;
      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(null);

      await expect(transactionService.getTransactionById(ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: ID },
        include: { client: {}, car: {} },
      });
    });
  });

  describe('update', () => {
    const ID = mockTransactionResponse.id;

    const updateTransactionDto: CreateTransactionDto = {
      ...createTransactionDto,
      start_date: '2023-11-15T03:00:00.000Z',
    };
    const mockUpdatedTransaction = {
      ...mockTransactionResponse,
      start_date: new Date('2023-11-15T03:00:00.000Z'),
      total_price: 375,
    };

    it('should update a transaction by id', async () => {
      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(mockTransactionResponse);
      jest
        .spyOn(prismaService.transaction, 'update')
        .mockResolvedValue(mockUpdatedTransaction);

      await transactionService.update(ID, updateTransactionDto);

      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: ID },
      });

      expect(prismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: ID },
        data: {
          ...updateTransactionDto,
          price_per_day: 75,
          total_price: 375,
        },
      });
    });

    it('should throw a NotFoundException if transaction is not found', async () => {
      const ID = 999;
      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        transactionService.update(ID, updateTransactionDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException if finish_date is less than start_date', async () => {
      const ID = mockTransactionResponse.id;

      const invalidDatesDto: CreateTransactionDto = {
        ...createTransactionDto,
        start_date: '2023-11-20T03:00:00.000Z',
        finish_date: '2023-11-15T03:00:00.000Z',
      };
      await expect(
        transactionService.update(ID, invalidDatesDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('finishTransaction', () => {
    it('should finish a transaction by id and update asociated car and client', async () => {
      const ID = mockTransactionResponse.id;

      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(mockTransactionResponse);
      jest.spyOn(prismaService.car, 'update');
      jest.spyOn(prismaService.client, 'update');
      jest.spyOn(prismaService.transaction, 'update');

      await transactionService.finishTransaction(ID);

      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: ID },
      });
      expect(prismaService.car.update).toHaveBeenCalledWith({
        where: { id: mockTransactionResponse.carId },
        data: { is_rented: false },
      });
      expect(prismaService.client.update).toHaveBeenCalledWith({
        where: { id: mockTransactionResponse.clientId },
        data: { is_renting: false },
      });
      expect(prismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: ID },
        data: { is_active: false },
      });
    });

    it('should throw a NotFoundException if transaction is not found', async () => {
      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(null);

      await expect(transactionService.finishTransaction(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
