import { IsUUID } from 'class-validator';

/** DTO for refresh-token requests. */
export class RefreshDto {
    /** UUID of the refresh token. */
    @IsUUID()
    refresh_token: string;
}
