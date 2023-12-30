import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CarModule } from 'src/car/car.module';
import { CreateCarDto } from 'src/car/dto/create-car.dto';
import { CarResponseDto } from 'src/car/dto/car-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CarController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CarModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prismaService = moduleFixture.get(PrismaService);
    await prismaService.cleanDatabase();
  });

  let createdCar: CarResponseDto;

  const createCarDto: CreateCarDto = {
    marca: 'Toyota From e2e',
    modelo: 'Corolla',
    year: 2022,
    km: 600,
    color: 'negro',
    ac: true,
    pasajeros: 5,
    cambios: 'MANUAL',
    price: 24,
  };

  describe('create /POST api/car', () => {
    it('should create a new car successfully', async () => {
      return request(app.getHttpServer())
        .post('/api/car')
        .send(createCarDto)
        .expect(201)
        .then((response) => {
          const { id, created_at, updated_at, is_deleted, is_rented, ...rest } =
            response.body;

          expect(typeof id).toBe('number');
          expect(is_deleted).toBe(false);
          expect(is_rented).toBe(false);
          expect(updated_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          expect(created_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          expect(rest).toEqual(createCarDto);

          createdCar = response.body;
        });
    });

    it('validations pipe: should throw an error when are missing properties in body to create a new car', async () => {
      return request(app.getHttpServer())
        .post('/api/car')
        .send({})
        .expect(400, {
          error: 'Bad Request',
          statusCode: 400,
          message: [
            'marca should not be empty',
            'marca must be a string',
            'modelo should not be empty',
            'modelo must be a string',
            'year must not be greater than 2023',
            'year must not be less than 2015',
            'year must be an integer number',
            'year should not be empty',
            'km must not be greater than 400000',
            'km must be a positive number',
            'km must be an integer number',
            'km should not be empty',
            'color should not be empty',
            'color must be a string',
            'ac should not be empty',
            'ac must be a boolean value',
            'pasajeros must not be greater than 10',
            'pasajeros must not be less than 1',
            'pasajeros must be an integer number',
            'pasajeros should not be empty',
            'cambios must be one of the following values: MANUAL, AUTOMATICO',
            'cambios should not be empty',
            'price must not be greater than 10000',
            'price must be a positive number',
            'price must be a number conforming to the specified constraints',
            'price should not be empty',
          ],
        });
    });
  });

  describe('findAll /GET api/car', () => {
    it('should get all the cars', async () => {
      return request(app.getHttpServer())
        .get('/api/car')
        .expect(200, [createdCar]);
    });
  });

  describe('findOne GET /api/car/id', () => {
    it('should return a single car by id', async () => {
      return request(app.getHttpServer())
        .get('/api/car/' + createdCar.id)
        .expect(200, createdCar);
    });

    it('should throw a 404 Not Found error if no car is found for the id', async () => {
      return request(app.getHttpServer()).get('/api/car/123456').expect(404);
    });
  });

  describe('update PATCH /api/car/id', () => {
    let carToUpdate: CarResponseDto;
    it('should update a car by id. Only "marca" and "modelo"', async () => {
      // Add a car to update
      const response = await request(app.getHttpServer())
        .post('/api/car')
        .send({
          marca: 'Car',
          modelo: 'To Edit',
          year: 2020,
          km: 5000,
          color: 'negro',
          ac: true,
          pasajeros: 5,
          cambios: 'AUTOMATICO',
          price: 40,
        })
        .expect(201);

      carToUpdate = response.body;

      const updateCarData = {
        marca: 'Ford',
        modelo: 'Escort',
      };

      const res = await request(app.getHttpServer())
        .patch('/api/car/' + carToUpdate.id)
        .send(updateCarData);

      expect(res.body).toEqual({
        ...carToUpdate,
        ...updateCarData,
        updated_at: res.body.updated_at,
      });
    });

    it('should update a car by id. All props', async () => {
      const updateCarData = {
        marca: 'Audi',
        modelo: 'A6 Sedan',
        year: 2021,
        km: 26002,
        color: 'negro',
        ac: true,
        pasajeros: 5,
        cambios: 'AUTOMATICO',
        price: 224,
      };

      return request(app.getHttpServer())
        .patch('/api/car/' + carToUpdate.id)
        .send(updateCarData)
        .then((res) => {
          expect(res.body).toEqual({
            ...carToUpdate,
            ...updateCarData,
            updated_at: res.body.updated_at,
          });
        });
    });

    it('should throw a 404 Not Found error if trying to update a non-existent car.', async () => {
      return request(app.getHttpServer()).patch('/api/car/123456').expect(404);
    });
  });

  describe('remove DELETE /api/car/id', () => {
    it('should remove a car by id', async () => {
      // Add a car to delete
      const response = await request(app.getHttpServer())
        .post('/api/car')
        .send({
          marca: 'BMW',
          modelo: 'X6',
          year: 2022,
          km: 4200,
          color: 'negro',
          ac: true,
          pasajeros: 5,
          cambios: 'AUTOMATICO',
          price: 40,
        })
        .expect(201);

      const carToDelete: CarResponseDto = response.body;

      return request(app.getHttpServer())
        .delete('/api/car/' + carToDelete.id)
        .expect(200)
        .then((res) => {
          expect(res.body.updated_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          expect(res.body).toEqual({
            ...carToDelete,
            updated_at: res.body.updated_at,
            is_deleted: true,
          });
        });
    });

    it('should throw a 404 Not Found error if trying to delete a non-existent car', async () => {
      return request(app.getHttpServer()).delete('/api/car/123456').expect(404);
    });
  });
});
