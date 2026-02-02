import { IsInt, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadMessageDto {
    @ApiProperty()
    @IsNumber()
    @IsInt()
    readonly number!: number;
}
