import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { Client } from '@prisma/client';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private readonly prismaService: PrismaService) {}

  async createClient(createClientDto: CreateClientDto): Promise<Client> {
    const isMailRegistered = await this.prismaService.client.findUnique({
      where: { email: createClientDto.email },
    });

    if (isMailRegistered) {
      throw new BadRequestException('Email already registered');
    }

    const newClient = await this.prismaService.client.create({
      data: createClientDto,
    });
    return newClient;
  }

  async getAllClients(): Promise<Client[]> {
    const clients = await this.prismaService.client.findMany({
      where: { is_deleted: false },
      orderBy: { updated_at: 'desc' },
    });
    return clients;
  }

  async findClientById(id: number): Promise<Client> {
    const client = await this.prismaService.client.findUnique({
      where: { id },
    });
    if (!client) {
      throw new NotFoundException();
    }
    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.prismaService.client.findUnique({
      where: { id },
    });
    if (!client) {
      throw new NotFoundException();
    }

    const updatedClient = await this.prismaService.client.update({
      where: { id },
      data: updateClientDto,
    });
    return updatedClient;
  }

  async remove(id: number): Promise<Client> {
    const client = await this.prismaService.client.findUnique({
      where: { id },
    });
    if (!client) {
      throw new NotFoundException();
    }
    const deletedClient = await this.prismaService.client.update({
      where: { id },
      data: { is_deleted: true },
    });

    return deletedClient;
  }
}
