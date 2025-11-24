import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { DataResponse } from '../../common/swagger/data-response.dto';
import { ApiData } from '../../common/swagger/api-data.decorator';
import { ApiDataEmpty } from '../../common/swagger/api-data-empty.decorator';
import { KeysService } from './keys.service';
import { PublicKeyDto } from './dto/responses/public-key.dto';
import { GetPublicKeyDto } from './dto/requests/get-public-key.dto';
import { KeepPublicKeyDto } from './dto/requests/keep-public-key.dto';
import { UpdatePublicKey } from './dto/requests/update-public-key';

@Controller('keys')
export class KeysController {
    constructor(private readonly keysService: KeysService) {}

    @Get('publicKey')
    @ApiData(PublicKeyDto)
    getPublicKey(@Query() query: GetPublicKeyDto): Promise<DataResponse<PublicKeyDto | string>> {
        return this.keysService.getPublicKey(query.name);
    }

    @Post('publicKey')
    @ApiData(PublicKeyDto)
    keepPubicKey(@Body() body: KeepPublicKeyDto): Promise<DataResponse<PublicKeyDto | string>> {
        return this.keysService.keepPubicKey(body);
    }

    @Patch('publicKey')
    @ApiDataEmpty()
    updatePublicKey(@Headers('x-socket-id') socketId: string, @Body() body: UpdatePublicKey): Promise<void> {
        return this.keysService.updatePubicKey(socketId, body);
    }

    @Post('receiveKey/:chatId')
    @ApiDataEmpty()
    receiveKey(@Param('chatId') chatId: string, @Headers('x-socket-id') socketId: string) {
        return this.keysService.receiveKey(chatId, socketId);
    }
}
