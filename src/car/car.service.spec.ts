import { Test, TestingModule } from '@nestjs/testing';
import { CarService } from './car.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CajaType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('CarService', () => {
  let carService: CarService;
  let prismaService: PrismaService;

  const mockResponseGetAllCars = [];
  const mockCar = {
    marca: 'Toyota',
    modelo: 'Corolla',
    year: 2022,
    km: 600,
    color: 'negro',
    ac: true,
    pasajeros: 5,
    cambios: CajaType.MANUAL,
  };

  const mockCarResponse = {
    ...mockCar,
    id: 1,
    created_at: '2023-11-06T10:07:10.269Z',
    updated_at: '2023-11-06T10:08:47.105Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarService,
        {
          provide: PrismaService,
          useValue: {
            car: {
              findMany: jest.fn().mockReturnValue(mockResponseGetAllCars),
              findUnique: jest.fn().mockReturnValue(mockCarResponse),
              create: jest.fn().mockReturnValue(mockCarResponse),
              update: jest.fn().mockReturnValue(mockCarResponse),
              delete: jest.fn().mockReturnValue(mockCarResponse),
            },
          },
        },
      ],
    }).compile();

    carService = module.get<CarService>(CarService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(carService).toBeDefined();
  });

  describe('create', () => {
    it('Should call prisma car.create with the correct payload', async () => {
      const mockPrismaCarCreate = jest.fn().mockReturnValue(mockCarResponse);

      jest
        .spyOn(prismaService.car, 'create')
        .mockImplementation(mockPrismaCarCreate);

      await carService.create(mockCar);

      expect(mockPrismaCarCreate).toHaveBeenCalledWith({
        data: {
          marca: mockCar.marca,
          modelo: mockCar.modelo,
          year: mockCar.year,
          km: mockCar.km,
          color: mockCar.color,
          ac: mockCar.ac,
          pasajeros: mockCar.pasajeros,
          cambios: mockCar.cambios,
        },
      });
    });
  });

  describe('findAll', () => {
    it('Should call prisma car.findMany', async () => {
      const mockPrismaCarFindMany = jest
        .fn()
        .mockReturnValue(mockResponseGetAllCars);

      jest
        .spyOn(prismaService.car, 'findMany')
        .mockImplementation(mockPrismaCarFindMany);

      await carService.findAll();

      expect(mockPrismaCarFindMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call the prisma car.findUnique with the id that is passed', async () => {
      const mockPrismaFindUnique = jest.fn().mockReturnValue(mockCarResponse);

      jest
        .spyOn(prismaService.car, 'findUnique')
        .mockImplementation(mockPrismaFindUnique);

      await carService.findOne(6);

      expect(mockPrismaFindUnique).toHaveBeenCalledWith({ where: { id: 6 } });
    });

    it('should throw an error if no car is found', async () => {
      const mockPrismaFindUnique = jest.fn().mockReturnValue(null);

      jest
        .spyOn(prismaService.car, 'findUnique')
        .mockImplementation(mockPrismaFindUnique);

      await expect(carService.findOne(8000)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('Should call prisma car.update with the correct id and payload', async () => {
      const mockPrismaCarUpdate = jest.fn().mockReturnValue(mockCarResponse);

      jest
        .spyOn(prismaService.car, 'update')
        .mockImplementation(mockPrismaCarUpdate);

      await carService.update(1, mockCar);

      expect(mockPrismaCarUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockCar,
      });
    });

    it('should throw an error if no car is found with the passed id', async () => {
      const mockPrismaFindUnique = jest.fn().mockReturnValue(null);

      jest
        .spyOn(prismaService.car, 'findUnique')
        .mockImplementation(mockPrismaFindUnique);

      await expect(carService.update(8000, mockCar)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should call the prisma car.delete with the id that is passed', async () => {
      const mockPrismaDelete = jest.fn().mockReturnValue(mockCarResponse);

      jest
        .spyOn(prismaService.car, 'delete')
        .mockImplementation(mockPrismaDelete);

      await carService.remove(6);

      expect(mockPrismaDelete).toHaveBeenCalledWith({ where: { id: 6 } });
    });

    it('should throw an error if no car is found with the passed id', async () => {
      const mockPrismaFindUnique = jest.fn().mockReturnValue(null);

      jest
        .spyOn(prismaService.car, 'findUnique')
        .mockImplementation(mockPrismaFindUnique);

      await expect(carService.remove(8000)).rejects.toThrow(NotFoundException);
    });
  });
});
