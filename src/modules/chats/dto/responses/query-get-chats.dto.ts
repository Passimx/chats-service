import { IsNumber, IsString } from 'class-validator';

export class QueryGetChatsDto {
    @IsString()
    title!: string;

    @IsNumber()
    limit?: number;
}
