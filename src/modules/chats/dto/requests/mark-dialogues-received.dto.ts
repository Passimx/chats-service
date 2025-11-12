import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DialoguesReceivedDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly publicKey!: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsNotEmpty()
    readonly chatIds!: string[];
}
