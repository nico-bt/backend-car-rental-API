import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { CreateClientDto } from './dto/create-client.dto';
import { Client } from '@prisma/client';
import { ClientService } from './client.service';

const createClientDto: CreateClientDto = {
  nombre: 'Maria Laura',
  apellido: 'Ramirez',
  tipo_documento: 'DNI',
  nro_documento: '40222555',
  nacionalidad: 'Argentina',
  direccion: 'Rivadavia 1234',
  telefono: '1141112222',
  email: 'mar.lr@mail.com',
  fecha_nacimiento: '1990-06-20T03:00:00.000Z',
};

const mockCreatedClient = {
  ...createClientDto,
  id: 15,
  fecha_nacimiento: new Date(createClientDto.fecha_nacimiento),
  created_at: new Date(),
  updated_at: new Date(),
  is_renting: false,
  is_deleted: false,
} as Client;

describe('ClientController', () => {
  let clientController: ClientController;
  let clientService: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientService,
          useValue: {
            createClient: jest.fn(),
            getAllClients: jest.fn(),
            findClientById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    clientController = module.get<ClientController>(ClientController);
    clientService = module.get<ClientService>(ClientService);
  });

  it('should be defined', () => {
    expect(clientController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      jest
        .spyOn(clientService, 'createClient')
        .mockResolvedValue(mockCreatedClient);

      const result = await clientController.create(createClientDto);

      expect(result).toBe(mockCreatedClient);
      expect(clientService.createClient).toHaveBeenCalledWith(createClientDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      jest
        .spyOn(clientService, 'getAllClients')
        .mockResolvedValue([mockCreatedClient]);

      const result = await clientController.findAll();

      expect(result).toEqual([mockCreatedClient]);
      expect(clientService.getAllClients).toHaveBeenCalled();
    });
  });

  describe('findClientById', () => {
    it('should return a single client by id', async () => {
      const ID = mockCreatedClient.id;
      jest
        .spyOn(clientService, 'findClientById')
        .mockResolvedValue(mockCreatedClient);

      const result = await clientController.findClientById(ID);

      expect(result).toEqual(mockCreatedClient);
      expect(clientService.findClientById).toHaveBeenCalledWith(ID);
    });
  });

  describe('update', () => {
    it('should update a client by id', async () => {
      const ID = mockCreatedClient.id;
      jest.spyOn(clientService, 'update').mockResolvedValue(mockCreatedClient);

      const result = await clientController.update(ID, createClientDto);

      expect(result).toEqual(mockCreatedClient);
      expect(clientService.update).toHaveBeenCalledWith(ID, createClientDto);
    });
  });

  describe('remove', () => {
    it('should remove a client by id', async () => {
      const ID = mockCreatedClient.id;
      jest.spyOn(clientService, 'remove').mockResolvedValue(mockCreatedClient);

      const result = await clientController.remove(ID);

      expect(result).toEqual(mockCreatedClient);
      expect(clientService.remove).toHaveBeenCalledWith(ID);
    });
  });
});
