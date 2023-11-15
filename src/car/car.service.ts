import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CarResponseDto } from './dto/car-response.dto';

@Injectable()
export class CarService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCarDto: CreateCarDto): Promise<CarResponseDto> {
    const newCar = await this.prismaService.car.create({
      data: createCarDto,
    });
    return newCar;
  }

  async findAll(): Promise<CarResponseDto[]> {
    const cars = await this.prismaService.car.findMany({
      where: { is_deleted: false },
      orderBy: [{ is_rented: 'asc' }, { updated_at: 'desc' }],
    });
    return cars;
  }

  async findOne(id: number): Promise<CarResponseDto> {
    const car = await this.prismaService.car.findUnique({ where: { id } });
    if (!car) {
      throw new NotFoundException();
    }
    return car;
  }

  async update(
    id: number,
    updateCarDto: UpdateCarDto,
  ): Promise<CarResponseDto> {
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

  async remove(id: number): Promise<CarResponseDto> {
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
