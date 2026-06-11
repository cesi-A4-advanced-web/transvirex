import { PrismaService } from '@app/database';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UserFiltersDto } from './dto/user-filters.dto';

const userSelect = {
    id: true,
    reference: true,
    hub_id: true,
    firstname: true,
    lastname: true,
    phone_number: true,
    work_phone_number: true,
    email: true,
    work_email: true,
    status: true,
    role: true,
    hub: {
        select: { id: true, reference: true, name: true },
    },
    driver: {
        select: {
            id: true,
            reference: true,
            rating: true,
            vehicle_id: true,
            vehicle: {
                select: { id: true, reference: true, type: true, license_plate: true, status: true },
            },
        },
    },
} as const;

/** Service handling user-related business logic. */
@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    private async generateUserReference(): Promise<string> {
        const lastUser = await this.prisma.user.findFirst({
            orderBy: { reference: 'desc' },
            select: { reference: true },
        });
        let nextNum = 1;
        if (lastUser) {
            const match = lastUser.reference.match(/USR-(\d+)/);
            if (match) nextNum = parseInt(match[1], 10) + 1;
        }
        return `USR-${String(nextNum).padStart(3, '0')}`;
    }

    /**
     * Generate the next driver reference (DRV-XXX) based on the last existing reference.
     */
    private async generateDriverReference(): Promise<string> {
        const lastDriver = await this.prisma.driver.findFirst({
            orderBy: { reference: 'desc' },
            select: { reference: true },
        });
        let nextNum = 1;
        if (lastDriver) {
            const match = lastDriver.reference.match(/DRV-(\d+)/);
            if (match) nextNum = parseInt(match[1], 10) + 1;
        }
        return `DRV-${String(nextNum).padStart(3, '0')}`;
    }

    async findAll(page: number, limit: number, filters?: UserFiltersDto) {
        const where: {
            hub_id?: string;
            role?: UserFiltersDto['role'];
            status?: UserFiltersDto['status'];
        } = {};
        if (filters?.hub_id) where.hub_id = filters.hub_id;
        if (filters?.role) where.role = filters.role;
        if (filters?.status) where.status = filters.status;

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                select: userSelect,
                orderBy: { reference: 'asc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { data, page, limit, total };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: userSelect,
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }

    async create(dto: CreateUserDto) {
        const reference = dto.reference ?? (await this.generateUserReference());
        const hash_password = dto.password ? await bcrypt.hash(dto.password, 10) : null;

        return this.prisma.user.create({
            data: {
                reference,
                hub_id: dto.hub_id ?? null,
                firstname: dto.firstname ?? null,
                lastname: dto.lastname ?? null,
                phone_number: dto.phone_number ?? null,
                work_phone_number: dto.work_phone_number ?? null,
                email: dto.email ?? null,
                work_email: dto.work_email ?? null,
                hash_password,
                status: dto.status ?? null,
                role: dto.role ?? null,
            },
            select: userSelect,
        });
    }

    async update(id: string, dto: UpdateUserDto) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`User ${id} not found`);

        const updateData: Record<string, unknown> = {};
        if (dto.hub_id !== undefined) updateData.hub_id = dto.hub_id;
        if (dto.firstname !== undefined) updateData.firstname = dto.firstname;
        if (dto.lastname !== undefined) updateData.lastname = dto.lastname;
        if (dto.phone_number !== undefined) {
            updateData.phone_number = dto.phone_number;
        }
        if (dto.work_phone_number !== undefined) {
            updateData.work_phone_number = dto.work_phone_number;
        }
        if (dto.email !== undefined) updateData.email = dto.email;
        if (dto.work_email !== undefined) updateData.work_email = dto.work_email;
        if (dto.status !== undefined) updateData.status = dto.status;
        if (dto.role !== undefined) updateData.role = dto.role;
        if (dto.password !== undefined) {
            updateData.hash_password = await bcrypt.hash(dto.password, 10);
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: userSelect,
        });
    }

    async remove(id: string) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`User ${id} not found`);

        if (existing.status === 'inactive') {
            return this.prisma.user.findUnique({
                where: { id },
                select: userSelect,
            });
        }

        return this.prisma.user.update({
            where: { id },
            data: { status: 'inactive' },
            select: userSelect,
        });
    }

    /**
     * Create a Driver profile for a user.
     */
    async createDriver(userId: string, dto: { vehicle_id?: string; rating?: number }) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Utilisateur introuvable');
        if (user.role !== 'driver') {
            throw new BadRequestException("L'utilisateur doit avoir le rôle driver");
        }

        const existing = await this.prisma.driver.findUnique({
            where: { user_id: userId },
        });
        if (existing) {
            throw new BadRequestException('Un profil Driver existe déjà pour cet utilisateur');
        }

        const reference = await this.generateDriverReference();

        return this.prisma.driver.create({
            data: {
                reference,
                user_id: userId,
                vehicle_id: dto.vehicle_id,
                rating: dto.rating,
            },
            include: { user: true, vehicle: true },
        });
    }

    /**
     * Get the Driver profile for a user.
     */
    async getDriver(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        const driver = await this.prisma.driver.findUnique({
            where: { user_id: userId },
            include: { user: true, vehicle: true, deliveries: true },
        });
        if (!driver) throw new NotFoundException('Profil Driver introuvable');

        return driver;
    }
}
