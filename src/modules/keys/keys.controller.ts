import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DataResponse } from '../../common/swagger/data-response.dto';
import { ApiData } from '../../common/swagger/api-data.decorator';
import { ApiDataEmpty } from '../../common/swagger/api-data-empty.decorator';
import { KeysService } from './keys.service';
import { PublicKeyDto } from './dto/responses/public-key.dto';
import { GetPublicKeyDto } from './dto/requests/get-public-key.dto';
import { KeepPublicKeyDto } from './dto/requests/keep-public-key.dto';

@Controller('keys')
export class KeysController {
    constructor(private readonly keysService: KeysService) {}

    @Get('publicKey')
    @ApiData(PublicKeyDto)
    getPublicKey(@Query() query: GetPublicKeyDto): Promise<DataResponse<PublicKeyDto | string>> {
        return this.keysService.getPublicKey(query.publicKeyHash);
    }

    @Post('publicKey')
    @ApiData(PublicKeyDto)
    keepPubicKey(@Body() body: KeepPublicKeyDto): Promise<DataResponse<PublicKeyDto | string>> {
        return this.keysService.keepPubicKey(body);
    }

    @Post('receiveKey/:chatId')
    @ApiDataEmpty()
    receiveKey(@Param('key') sdf: string) {
        return this.keysService.receiveKey(sdf);
    }
}
