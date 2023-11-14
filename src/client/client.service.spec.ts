import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { Client } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateClientDto } from './dto/update-client.dto';

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

describe('ClientService', () => {
  let clientService: ClientService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      client: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    clientService = module.get<ClientService>(ClientService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(clientService).toBeDefined();
  });

  describe('createClient', () => {
    it('should create a new client calling prismaService.create with the passed data', async () => {
      jest
        .spyOn(prismaService.client, 'create')
        .mockResolvedValue(mockCreatedClient);

      const result = await clientService.createClient(createClientDto);

      expect(result).toEqual(mockCreatedClient);

      expect(prismaService.client.create).toHaveBeenCalledWith({
        data: createClientDto,
      });
    });

    it('should throw a BadRequestException if email is already registered', async () => {
      // Mock findUnique: Looking in db to checl if user already exists return an existing client
      jest
        .spyOn(prismaService.client, 'findUnique')
        .mockResolvedValue(mockCreatedClient);

      await expect(clientService.createClient(createClientDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllClients', () => {
    it('should return an array of clients', async () => {
      const mockClients = [mockCreatedClient];

      jest
        .spyOn(prismaService.client, 'findMany')
        .mockResolvedValue(mockClients);

      const result = await clientService.getAllClients();

      expect(result).toEqual(mockClients);
      expect(prismaService.client.findMany).toHaveBeenCalled();
    });
  });

  describe('findClientById', () => {
    it('should return a single client by id', async () => {
      const ID = 880;
      const mockClient = { ...mockCreatedClient, id: ID };

      jest
        .spyOn(prismaService.client, 'findUnique')
        .mockResolvedValue(mockClient);

      const result = await clientService.findClientById(ID);

      expect(result).toEqual(mockClient);
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: ID },
      });
    });

    it('should throw a NotFoundException if client is not found', async () => {
      const ID = 999;
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(null);

      await expect(clientService.findClientById(ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: ID },
      });
    });
  });

  describe('update', () => {
    const updateClientDto: UpdateClientDto = {
      ...createClientDto,
      nombre: 'Robert',
    };
    const mockUpdatedClient = { ...mockCreatedClient, nombre: 'Robert' };

    it('should update a client by id', async () => {
      jest
        .spyOn(prismaService.client, 'findUnique')
        .mockResolvedValue(mockCreatedClient);
      jest
        .spyOn(prismaService.client, 'update')
        .mockResolvedValue(mockUpdatedClient);

      const result = await clientService.update(
        mockCreatedClient.id,
        updateClientDto,
      );

      expect(result).toEqual(mockUpdatedClient);
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: mockCreatedClient.id },
      });
      expect(prismaService.client.update).toHaveBeenCalledWith({
        where: { id: mockCreatedClient.id },
        data: updateClientDto,
      });
    });
    it('should throw a NotFoundException if client is not found', async () => {
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(null);

      await expect(clientService.update(999, updateClientDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a client by id', async () => {
      jest
        .spyOn(prismaService.client, 'findUnique')
        .mockResolvedValue(mockCreatedClient);
      jest.spyOn(prismaService.client, 'update');

      await clientService.remove(mockCreatedClient.id);

      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: mockCreatedClient.id },
      });
      expect(prismaService.client.update).toHaveBeenCalledWith({
        where: { id: mockCreatedClient.id },
        data: { is_deleted: true },
      });
    });

    it('should throw a NotFoundException if client is not found', async () => {
      const ID = 8;
      jest.spyOn(prismaService.client, 'findUnique').mockResolvedValue(null);

      await expect(clientService.remove(ID)).rejects.toThrow(NotFoundException);
      expect(prismaService.client.findUnique).toHaveBeenCalledWith({
        where: { id: ID },
      });
    });
  });
});
