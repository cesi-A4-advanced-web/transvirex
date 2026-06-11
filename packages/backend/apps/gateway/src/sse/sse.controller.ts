import { Controller, Get, Req, Res, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../../../../libs/guards/src/public.decorator';
import { SseService } from './sse.service';

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

@Controller()
export class SseController {
    constructor(
        private readonly sseService: SseService,
        private readonly jwtService: JwtService,
    ) {}

    @ApiTags('Gateway')
    @Public()
    @Get('events')
    @ApiExcludeEndpoint()
    async subscribe(@Req() req: Request, @Res() res: Response) {
        const token = (req.query.token as string) || (req.cookies?.access_token as string);
        if (!token) {
            throw new UnauthorizedException('Token manquant');
        }

        let payload: JwtPayload;
        try {
            payload = this.jwtService.verify<JwtPayload>(token, {
                secret: process.env.JWT_SECRET,
            });
        } catch {
            throw new UnauthorizedException('Token invalide ou expiré');
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        res.write(`data: ${JSON.stringify({ type: 'connected', userId: payload.sub, role: payload.role })}\n\n`);

        this.sseService.addClient(payload.sub, payload.role, res);

        req.on('close', () => {
            this.sseService.removeClient(payload.sub);
        });
    }
}
