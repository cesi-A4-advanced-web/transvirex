import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY, type UserRole } from '../decorators/roles.decorator';

/** Shape of the JWT payload after verification. */
interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}

/** Guard that validates JWT access tokens from cookies and enforces role-based access control. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) {}

    /** Determine whether the current request is allowed through. */
    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest<Request>();
        const token = request.cookies?.access_token as string | undefined;

        if (!token) {
            throw new UnauthorizedException('Access token manquant');
        }

        let payload: JwtPayload;
        try {
            payload = this.jwtService.verify<JwtPayload>(token, {
                secret: process.env.JWT_SECRET,
            });
        } catch {
            throw new UnauthorizedException('Access token invalide ou expiré');
        }

        (request as Request & { user: JwtPayload }).user = payload;

        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (requiredRoles && requiredRoles.length > 0) {
            if (!requiredRoles.includes(payload.role)) {
                throw new ForbiddenException(
                    `Accès refusé — rôle requis : ${requiredRoles.join(' ou ')}`,
                );
            }
        }

        return true;
    }
}
