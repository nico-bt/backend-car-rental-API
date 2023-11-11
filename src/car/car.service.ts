import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Car } from '@prisma/client';

@Injectable()
export class CarService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    const { marca, modelo, year, km, color, ac, pasajeros, cambios } =
      createCarDto;
    const newCar = await this.prismaService.car.create({
      data: {
        marca,
        modelo,
        year,
        km,
        color,
        ac,
        pasajeros,
        cambios,
      },
    });
    return newCar;
  }

  async findAll(): Promise<Car[]> {
    const cars = await this.prismaService.car.findMany({
      where: { is_deleted: false },
      orderBy: { updated_at: 'desc' },
    });
    return cars;
  }

  async findOne(id: number): Promise<Car> {
    const car = await this.prismaService.car.findUnique({ where: { id } });
    if (!car) {
      throw new NotFoundException();
    }
    return car;
  }

  async update(id: number, updateCarDto: UpdateCarDto): Promise<Car> {
    const car = await this.prismaService.car.findUnique({ where: { id } });
    if (!car) {
      throw new NotFoundException();
    }

    const updatedCar = await this.prismaService.car.update({
      where: { id },
      data: updateCarDto,
    });
    return updatedCar;
  }

  async remove(id: number): Promise<Car> {
    const car = await this.prismaService.car.findUnique({ where: { id } });
    if (!car) {
      throw new NotFoundException();
    }
    const deletedCar = await this.prismaService.car.update({
      where: { id },
      data: { is_deleted: true },
    });

    return deletedCar;
  }
}
