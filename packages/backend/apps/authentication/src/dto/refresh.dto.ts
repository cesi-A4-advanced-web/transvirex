import { IsUUID } from 'class-validator';

export class RefreshDto {
    @IsUUID()
    refresh_token: string;
}
