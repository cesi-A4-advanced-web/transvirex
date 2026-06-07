import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@app/database';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
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

        const payload = { sub: user.id, email: user.email, role: user.role };
        return { access_token: this.jwt.sign(payload) };
    }
}
