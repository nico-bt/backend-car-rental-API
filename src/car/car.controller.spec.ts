import { Test, TestingModule } from '@nestjs/testing';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { Car } from '@prisma/client';
import { UpdateCarDto } from './dto/update-car.dto';

describe('CarController', () => {
  let carController: CarController;
  let carService: CarService;

  const mockCarService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarController],
      providers: [{ provide: CarService, useValue: mockCarService }],
    }).compile();

    carController = module.get<CarController>(CarController);
    carService = module.get<CarService>(CarService);
  });

  it('should be defined', () => {
    expect(carController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new car successfully', async () => {
      const createCarDto: CreateCarDto = {
        marca: 'Toyota',
        modelo: 'Corolla',
        year: 2022,
        km: 600,
        color: 'negro',
        ac: true,
        pasajeros: 5,
        cambios: 'MANUAL',
        price: 24,
      };

      const mockCreatedCar = {
        ...createCarDto,
        id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        is_rented: false,
      };

      jest.spyOn(carService, 'create').mockResolvedValue(mockCreatedCar);

      const result = await carController.create(createCarDto);

      expect(result).toEqual(mockCreatedCar);
      expect(carService.create).toHaveBeenCalledWith(createCarDto);
    });
  });

  describe('findAll', () => {
    it('should call the carServie.findAll and return an array of cars', async () => {
      const mockCars: Car[] = [];

      jest.spyOn(carService, 'findAll').mockResolvedValue(mockCars);

      const result = await carController.findAll();

      expect(carService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCars);
    });
  });

  describe('findOne', () => {
    it('should call the carService correctly and return a single car by id', async () => {
      const ID = 66;
      const mockCarResponse: Car = {
        id: ID,
        marca: 'Toyota',
        modelo: 'Corolla',
        year: 2022,
        km: 600,
        color: 'negro',
        ac: true,
        pasajeros: 5,
        cambios: 'MANUAL',
        price: 24,
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        is_rented: false,
      };

      jest.spyOn(carService, 'findOne').mockResolvedValue(mockCarResponse);

      const result = await carController.findOne(ID);

      expect(result).toEqual(mockCarResponse);
      expect(carService.findOne).toHaveBeenCalledWith(ID);
    });
  });

  describe('update', () => {
    it('should update a car by id, calling the carService.update with the passed data', async () => {
      const ID = 864;
      const updateCarDto: UpdateCarDto = {
        marca: 'Ford',
        modelo: 'Escort',
        year: 2020,
        km: 80600,
        color: 'rojo',
        ac: false,
        pasajeros: 5,
        cambios: 'MANUAL',
        price: 6,
      };

      const mockUpdatedCar = {
        id: ID,
        ...updateCarDto,
        created_at: new Date(),
        updated_at: new Date(),
        is_deleted: false,
        is_rented: false,
      } as Car;

      jest.spyOn(carService, 'update').mockResolvedValue(mockUpdatedCar);

      const result = await carController.update(ID, updateCarDto);

      expect(result).toEqual(mockUpdatedCar);
      expect(carService.update).toHaveBeenCalledWith(ID, updateCarDto);
    });
  });

  describe('remove', () => {
    it('should call carService.remove with the passed id', async () => {
      jest.spyOn(carService, 'remove');

      await carController.remove(12000);
      expect(carService.remove).toHaveBeenCalledWith(12000);
    });
  });
});
