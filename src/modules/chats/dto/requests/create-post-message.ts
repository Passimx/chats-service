import { IsNumber, IsString } from 'class-validator';

export class CreateMessageDto {
    @IsString()
    readonly encryptMessage!: string;

    @IsNumber()
    readonly chatId!: number;
}
