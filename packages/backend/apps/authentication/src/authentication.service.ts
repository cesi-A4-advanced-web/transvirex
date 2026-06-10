import { PrismaService } from '@app/database';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import type { Redis } from 'ioredis';

/** TTL in seconds for refresh tokens (defaults to 7 days). */
const REFRESH_TTL = parseInt(process.env.REFRESH_TOKEN_TTL || '604800', 10);

/** Service handling user authentication, token generation, refresh, and logout. */
@Injectable()
export class AuthenticationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        @Inject('REDIS') private readonly redis: Redis,
    ) {}

    /** Validate credentials and return access + refresh tokens. */
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

    /** Issue a new access token using a valid refresh token. */
    async refresh(refreshToken: string) {
        const userId = await this.redis.get(`refresh:${refreshToken}`);
        if (!userId) throw new UnauthorizedException('Refresh token invalide');

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('Utilisateur introuvable');

        await this.redis.del(`refresh:${refreshToken}`);
        return this.generateTokens(user.id, user.email, user.role);
    }

    /** Invalidate a refresh token. */
    async logout(refreshToken: string) {
        await this.redis.del(`refresh:${refreshToken}`);
        return { message: 'Déconnecté' };
    }

    /** Create a JWT access token and a UUID refresh token, persisting the latter in Redis. */
    private async generateTokens(id: string, email: string | null, role: string | null) {
        const payload = { sub: id, email, role };
        const accessToken = this.jwt.sign(payload);

        const refreshToken = randomUUID();
        await this.redis.set(`refresh:${refreshToken}`, id, 'EX', REFRESH_TTL);

        return { access_token: accessToken, refresh_token: refreshToken };
    }
}

