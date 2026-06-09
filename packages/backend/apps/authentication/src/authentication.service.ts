import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@app/database';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import type { Redis } from 'ioredis';

const REFRESH_TTL = parseInt(process.env.JWT_REFRESH_TTL || '604800');

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        @Inject('REDIS') private readonly redis: Redis,
    ) {}

    async login(email: string, password: string) {
        const user = await this.prisma.user.findFirst({
            where: { email },
        });

        if (!user || !user.hash_password) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        const valid = await bcrypt.compare(password, user.hash_password);
        if (!valid) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        return this.generateTokens(user.id, user.email, user.role);
    }

    async refresh(refreshToken: string) {
        const userId = await this.redis.get(`refresh:${refreshToken}`);
        if (!userId) throw new UnauthorizedException('Refresh token invalide');

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('Utilisateur introuvable');

        await this.redis.del(`refresh:${refreshToken}`);
        return this.generateTokens(user.id, user.email, user.role);
    }

    async logout(refreshToken: string) {
        await this.redis.del(`refresh:${refreshToken}`);
        return { message: 'Déconnecté' };
    }

    private async generateTokens(id: string, email: string | null, role: string | null) {
        const payload = { sub: id, email, role };
        const accessToken = this.jwt.sign(payload);

        const refreshToken = randomUUID();
        await this.redis.set(`refresh:${refreshToken}`, id, 'EX', REFRESH_TTL);

        return { access_token: accessToken, refresh_token: refreshToken };
    }
}
