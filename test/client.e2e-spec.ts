import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientModule } from 'src/client/client.module';
import { CreateClientDto } from 'src/client/dto/create-client.dto';
import { ClientResponseDto } from 'src/client/dto/client-response.dto';

describe('ClientController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ClientModule],
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

  let createdClient: ClientResponseDto;

  describe('create /POST api/clients', () => {
    it('should create a new client successfully', async () => {
      const createClientDto: CreateClientDto = {
        nombre: 'nn ',
        apellido: 'nn',
        tipo_documento: 'DNI',
        nro_documento: '123456',
        nacionalidad: 'Argentina',
        direccion: 'nn 1234',
        telefono: '11000110011',
        email: 'nn@mail.com',
        fecha_nacimiento: '1980-09-09T03:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post('/api/clients')
        .send(createClientDto)
        .expect(201)
        .then((response) => {
          const {
            id,
            created_at,
            updated_at,
            is_deleted,
            is_renting,
            ...rest
          } = response.body;

          expect(typeof id).toBe('number');
          expect(is_deleted).toBe(false);
          expect(is_renting).toBe(false);
          expect(updated_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          expect(created_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          expect(rest).toEqual(createClientDto);

          createdClient = response.body;
        });
    });

    it('should throw an error if email is already registered', async () => {
      const createClientDto: CreateClientDto = {
        nombre: 'Luciana ',
        apellido: 'nn',
        tipo_documento: 'DNI',
        nro_documento: '123456',
        nacionalidad: 'Argentina',
        direccion: 'nn 1234',
        telefono: '11000110011',
        email: createdClient.email,
        fecha_nacimiento: '1980-09-09T03:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post('/api/clients')
        .send(createClientDto)
        .expect(400, {
          message: 'Email already registered',
          error: 'Bad Request',
          statusCode: 400,
        });
    });

    it('validations pipe: should throw an error when are missing properties in body to create a new client', async () => {
      return request(app.getHttpServer())
        .post('/api/clients')
        .send({})
        .expect(400, {
          error: 'Bad Request',
          statusCode: 400,
          message: [
            'nombre should not be empty',
            'nombre must be a string',
            'apellido should not be empty',
            'apellido must be a string',
            'tipo_documento must be one of the following values: PASAPORTE, DNI, CEDULA',
            'tipo_documento should not be empty',
            'nro_documento should not be empty',
            'nacionalidad should not be empty',
            'nacionalidad must be a string',
            'direccion should not be empty',
            'direccion must be a string',
            'telefono should not be empty',
            'telefono must be a string',
            'email should not be empty',
            'email must be an email',
            'fecha_nacimiento should not be empty',
            'fecha_nacimiento must be a valid ISO 8601 date string',
          ],
        });
    });
  });

  describe('findAll /GET api/clients', () => {
    it('should get all the clients', async () => {
      return request(app.getHttpServer())
        .get('/api/clients')
        .expect(200, [createdClient]);
    });
  });

  describe('findClientById GET /api/clients/id', () => {
    it('should return a single client by id', async () => {
      return request(app.getHttpServer())
        .get('/api/clients/' + createdClient.id)
        .expect(200, createdClient);
    });

    it('should throw a 404 Not Found error if no client is found for the id', async () => {
      return request(app.getHttpServer())
        .get('/api/clients/123456')
        .expect(404);
    });
  });

  describe('update PATCH /api/clients/id', () => {
    it('should update a client by id. Only "nombre" y "apellido"', async () => {
      const updateClientData = {
        nombre: 'Ricardo',
        apellido: 'Ruben',
      };

      return request(app.getHttpServer())
        .patch('/api/clients/' + createdClient.id)
        .send(updateClientData)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            ...createdClient,
            ...updateClientData,
            updated_at: res.body.updated_at,
          });
        });
    });

    it('should update a client by id. All props', async () => {
      const updateClientData = {
        nombre: 'Nico ',
        apellido: 'Bt',
        tipo_documento: 'PASAPORTE',
        nro_documento: '30333222',
        nacionalidad: 'Italiano',
        direccion: 'Siempre VIva 1234',
        telefono: '1123451144',
        email: 'nicolas@mail.com',
        fecha_nacimiento: '1983-09-09T03:00:00.000Z',
      };

      return request(app.getHttpServer())
        .patch('/api/clients/' + createdClient.id)
        .send(updateClientData)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            ...createdClient,
            ...updateClientData,
            updated_at: res.body.updated_at,
          });
        });
    });

    it('should throw a 404 Not Found error if trying to update a non-existent client.', async () => {
      return request(app.getHttpServer())
        .patch('/api/clients/123456')
        .expect(404);
    });
  });

  describe('remove DELETE /api/clients/id', () => {
    it('should remove a client by id', async () => {
      // Add a client to delete
      const response = await request(app.getHttpServer())
        .post('/api/clients')
        .send({
          nombre: 'To be ',
          apellido: 'Deleted',
          tipo_documento: 'PASAPORTE',
          nro_documento: '30333222',
          nacionalidad: 'Italiano',
          direccion: 'Siempre VIva 1234',
          telefono: '1123451144',
          email: 'delete.me@mail.com',
          fecha_nacimiento: '1983-09-09T03:00:00.000Z',
        })
        .expect(201);

      const clientToDelete: ClientResponseDto = response.body;

      return request(app.getHttpServer())
        .delete('/api/clients/' + clientToDelete.id)
        .expect(200)
        .then((res) => {
          expect(res.body.updated_at).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          expect(res.body).toEqual({
            ...clientToDelete,
            updated_at: res.body.updated_at,
            is_deleted: true,
          });
        });
    });

    it('should throw a 404 Not Found error if trying to delete a non-existent client', async () => {
      return request(app.getHttpServer())
        .delete('/api/clients/123456')
        .expect(404);
    });
  });
});
