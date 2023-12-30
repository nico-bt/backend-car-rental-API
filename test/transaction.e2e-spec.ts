import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { ClientResponseDto } from 'src/client/dto/client-response.dto';
import { CarResponseDto } from 'src/car/dto/car-response.dto';
import { TransactionResponseDto } from 'src/transaction/dto/transaction-response.dto';
import { AppModule } from 'src/app.module';

describe('TransactionController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
  let createdClient: ClientResponseDto;
  let createdTransaction: TransactionResponseDto;

  const createCarDto = {
    marca: 'Kia',
    modelo: 'Carnival',
    year: 2022,
    km: 7503,
    color: 'gris plata',
    ac: true,
    pasajeros: 7,
    cambios: 'AUTOMATICO',
    price: 36,
  };

  const createClientDto = {
    nombre: 'Keanu',
    apellido: 'Reeves',
    tipo_documento: 'PASAPORTE',
    nro_documento: '2444876',
    nacionalidad: 'Canadiense',
    direccion: 'Blue Street 4788',
    telefono: '4778887',
    email: 'keanu@mail.com',
    fecha_nacimiento: '1964-11-11T03:00:00.000Z',
  };

  const today = new Date();
  const afterTomorrow = new Date();
  afterTomorrow.setDate(today.getDate() + 2);
  const totalDays = 2;

  describe('create /POST api/transactions', () => {
    it('should create a new transaction successfully', async () => {
      // Create car
      const res = await request(app.getHttpServer())
        .post('/api/car')
        .send(createCarDto)
        .expect(201);
      createdCar = res.body;
      // Create client
      const res2 = await request(app.getHttpServer())
        .post('/api/clients')
        .send(createClientDto)
        .expect(201);
      createdClient = res2.body;

      // Create a transaction with the created car and client
      const createTransactionDto: CreateTransactionDto = {
        carId: createdCar.id,
        clientId: createdClient.id,
        start_date: today.toISOString(),
        finish_date: afterTomorrow.toISOString(),
      };

      return request(app.getHttpServer())
        .post('/api/transactions')
        .send(createTransactionDto)
        .expect(201)
        .then((res) => {
          const {
            id,
            price_per_day,
            total_price,
            is_active,
            created_at,
            updated_at,
            is_deleted,
            ...rest
          } = res.body;

          expect(typeof id).toBe('number');
          expect(is_deleted).toBe(false);
          expect(is_active).toBe(true);
          expect(updated_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          expect(created_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          expect(price_per_day).toBe(createdCar.price);
          expect(total_price).toBe(totalDays * createdCar.price);
          expect(rest).toEqual(createTransactionDto);
          createdTransaction = res.body;
        });
    });

    it('should throw an error if car is already rented', async () => {
      // Create a new client to try to rent the already rented car in transaction created in the previous test
      const res = await request(app.getHttpServer())
        .post('/api/clients')
        .send({ ...createClientDto, email: 'another@mail.com' })
        .expect(201);
      const createdClient2 = res.body;

      const createTransactionDto: CreateTransactionDto = {
        carId: createdCar.id,
        clientId: createdClient2.id,
        start_date: today.toISOString(),
        finish_date: afterTomorrow.toISOString(),
      };

      return request(app.getHttpServer())
        .post('/api/transactions')
        .send(createTransactionDto)
        .expect(400, {
          message: 'Not a valid Car',
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should throw an error if client is already renting', async () => {
      // Create a new car (free) to try to rent it with the already renting client
      const res = await request(app.getHttpServer())
        .post('/api/car')
        .send({ ...createCarDto, marca: 'New Free Car' })
        .expect(201);
      const createdCar2 = res.body;

      const createTransactionDto: CreateTransactionDto = {
        carId: createdCar2.id,
        clientId: createdClient.id,
        start_date: today.toISOString(),
        finish_date: afterTomorrow.toISOString(),
      };

      return request(app.getHttpServer())
        .post('/api/transactions')
        .send(createTransactionDto)
        .expect(400, {
          message: 'Not a valid Client',
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should throw an error if no car is found with the passed id', async () => {
      const createTransactionDto: CreateTransactionDto = {
        carId: 1234,
        clientId: createdClient.id,
        start_date: today.toISOString(),
        finish_date: afterTomorrow.toISOString(),
      };

      return request(app.getHttpServer())
        .post('/api/transactions')
        .send(createTransactionDto)
        .expect(400, {
          message: 'Not a valid Car',
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('should throw an error if no client is found with the passed id', async () => {
      // Create a new car (free) to try to rent it with an non-existent client
      const res = await request(app.getHttpServer())
        .post('/api/car')
        .send({ ...createCarDto, marca: 'New Free Car' })
        .expect(201);
      const createdCar2 = res.body;

      const createTransactionDto: CreateTransactionDto = {
        carId: createdCar2.id,
        clientId: 1234,
        start_date: today.toISOString(),
        finish_date: afterTomorrow.toISOString(),
      };

      return request(app.getHttpServer())
        .post('/api/transactions')
        .send(createTransactionDto)
        .expect(400, {
          message: 'Not a valid Client',
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('validations pipe: should throw an error when are missing properties in body to create a new transaction', async () => {
      return request(app.getHttpServer())
        .post('/api/transactions')
        .send({})
        .expect(400, {
          message: [
            'clientId should not be empty',
            'clientId must be a number conforming to the specified constraints',
            'carId should not be empty',
            'carId must be a number conforming to the specified constraints',
            'start_date must be a valid ISO 8601 date string',
            'start_date should not be empty',
            'finish_date must be a valid ISO 8601 date string',
            'finish_date should not be empty',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });

  describe('findAll /GET api/transactions', () => {
    it('should get all the transactions', async () => {
      return request(app.getHttpServer())
        .get('/api/transactions')
        .expect(200)
        .then((res) => {
          const {
            id,
            is_active,
            is_deleted,
            created_at,
            updated_at,
            clientId,
            carId,
          } = res.body[0];

          expect(typeof id).toBe('number');
          expect(carId).toBe(createdCar.id);
          expect(clientId).toBe(createdClient.id);
          expect(is_deleted).toBe(false);
          expect(is_active).toBe(true);
          expect(updated_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          expect(created_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
        });
    });

    it('should get only active transactions adding query ?active=true', async () => {
      const activeTransactionsResponse = await request(app.getHttpServer())
        .get('/api/transactions?active=true')
        .expect(200);

      expect(activeTransactionsResponse.body.length).toBe(1);

      // Finish transaction and make the request again
      await request(app.getHttpServer())
        .patch('/api/transactions/' + createdTransaction.id)
        .expect(200);

      const activeTransactionsResponse2 = await request(app.getHttpServer())
        .get('/api/transactions?active=true')
        .expect(200);

      expect(activeTransactionsResponse2.body.length).toBe(0);
    });
  });

  describe('findTransactionById GET /api/transactions/id', () => {
    it('should return a Transaction by id', async () => {
      return request(app.getHttpServer())
        .get('/api/transactions/' + createdTransaction.id)
        .expect(200)
        .then((res) => {
          expect(res.body.id).toBe(createdTransaction.id);
          expect(res.body.carId).toBe(createdTransaction.carId);
          expect(res.body.clientId).toBe(createdTransaction.clientId);
        });
    });

    it('should throw a 404 Not Found error if no transaction is found for the id', async () => {
      return request(app.getHttpServer())
        .get('/api/transactions/123456')
        .expect(404);
    });
  });

  describe('update PUT /api/transactions/id', () => {
    it('should throw an error try to update a non-existent transaction.', async () => {
      return request(app.getHttpServer())
        .put('/api/transactions/123456')
        .send({
          carId: 1,
          clientId: 1,
          start_date: today.toISOString(),
          finish_date: afterTomorrow.toISOString(),
        })
        .expect(404);
    });

    it('should throw an error try to update a transaction with a non-existent Car.', async () => {
      return request(app.getHttpServer())
        .put('/api/transactions/' + createdTransaction.id)
        .send({
          carId: 100000,
          clientId: createdTransaction.clientId,
          start_date: today.toISOString(),
          finish_date: afterTomorrow.toISOString(),
        })
        .expect(404, {
          message: 'Car not found or is already rented',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should throw an error try to update a transaction with a non-existent Client.', async () => {
      return request(app.getHttpServer())
        .put('/api/transactions/' + createdTransaction.id)
        .send({
          carId: createdTransaction.carId,
          clientId: 100000,
          start_date: today.toISOString(),
          finish_date: afterTomorrow.toISOString(),
        })
        .expect(404, {
          message: 'Client not found or is already renting a car',
          error: 'Not Found',
          statusCode: 404,
        });
    });

    it('should update all fields in transaction', async () => {
      // Create new transaction to update
      const transactionResponse = await request(app.getHttpServer())
        .post('/api/transactions')
        .send({
          carId: createdCar.id,
          clientId: createdClient.id,
          start_date: today.toISOString(),
          finish_date: afterTomorrow.toISOString(),
        })
        .expect(201);
      const actualTransaction = transactionResponse.body;

      // Create car
      const carResponse = await request(app.getHttpServer())
        .post('/api/car')
        .send({
          marca: 'Ford',
          modelo: 'Taunus',
          year: 2018,
          km: 80503,
          color: 'blanco',
          ac: true,
          pasajeros: 5,
          cambios: 'MANUAL',
          price: 36,
        })
        .expect(201);
      const newCar = carResponse.body;

      // Create client
      const clientResponse = await request(app.getHttpServer())
        .post('/api/clients')
        .send({
          nombre: 'Leonardo',
          apellido: 'Davinci',
          tipo_documento: 'PASAPORTE',
          nro_documento: '222222',
          nacionalidad: 'Italiano',
          direccion: 'Pizza 123456',
          telefono: '47722287',
          email: 'leo@mail.com',
          fecha_nacimiento: '1964-11-11T03:00:00.000Z',
        })
        .expect(201);
      const newClient = clientResponse.body;

      const updateTransactionDto: CreateTransactionDto = {
        carId: newCar.id,
        clientId: newClient.id,
        start_date: '2023-11-23T04:40:35.069Z',
        finish_date: '2023-11-28T04:40:35.069Z',
      };

      // Get actual car and client to later check if were set free for future new transactions
      const carToSetFree = actualTransaction.carId;
      const clientToSetFree = actualTransaction.clientId;

      request(app.getHttpServer())
        .get('/api/car/' + carToSetFree)
        .then((res) => expect(res.body.is_rented).toBe(true));
      request(app.getHttpServer())
        .get('/api/clients/' + clientToSetFree)
        .then((res) => expect(res.body.is_renting).toBe(true));

      // Update Transaction
      const updateResponse = await request(app.getHttpServer())
        .put('/api/transactions/' + actualTransaction.id)
        .send(updateTransactionDto);

      expect(updateResponse.body.carId).toBe(updateTransactionDto.carId);
      expect(updateResponse.body.clientId).toBe(updateTransactionDto.clientId);
      expect(updateResponse.body.start_date).toBe(
        updateTransactionDto.start_date,
      );
      expect(updateResponse.body.finish_date).toBe(
        updateTransactionDto.finish_date,
      );

      // Check if previous car and client were set free
      request(app.getHttpServer())
        .get('/api/car/' + carToSetFree)
        .then((res) => expect(res.body.is_rented).toBe(false));
      request(app.getHttpServer())
        .get('/api/clients/' + clientToSetFree)
        .then((res) => expect(res.body.is_renting).toBe(false));
    });
  });

  describe('finishTransaction PATCH /api/transactions/id', () => {
    it('should mark a transaction as finished and free the car and client involved', async () => {
      // Get the active transaction
      const res = await request(app.getHttpServer()).get(
        '/api/transactions?active=true',
      );
      const activeTransaction = res.body[0];

      // Finish Transaction
      await request(app.getHttpServer())
        .patch('/api/transactions/' + activeTransaction.id)
        .expect(200);

      // Check if previous car and client were set free
      request(app.getHttpServer())
        .get('/api/car/' + activeTransaction.carId)
        .then((res) => expect(res.body.is_rented).toBe(false));
      request(app.getHttpServer())
        .get('/api/clients/' + activeTransaction.clientId)
        .then((res) => expect(res.body.is_renting).toBe(false));
    });
  });
});
