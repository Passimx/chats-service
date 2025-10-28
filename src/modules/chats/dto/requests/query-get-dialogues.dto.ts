import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class QueryGetDialoguesDto {
    @ApiProperty({ description: 'Public key of the user' })
    @IsString()
    @IsNotEmpty()
    readonly public_key!: string;
}
