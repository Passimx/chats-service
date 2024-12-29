import { Inject, Injectable } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ClientKafka } from '@nestjs/microservices';
import { DataResponse } from '../../common/swagger/data-response.dto';
import { Envs } from '../../common/envs/env';
import { InjectEnum } from './types/inject.enum';
import { EventsEnum } from './types/events.enum';
import { MessageDto } from './dto/message.dto';
import { TopicsEnum } from './types/topics.enum';

@Injectable()
export class QueueService {
    private readonly producer!: Producer;
    private isConnected: boolean = false;

    constructor(@Inject(InjectEnum.NOTIFICATIONS_MICROSERVICE) private readonly kafkaClient: ClientKafka) {
        if (!Envs.kafka.kafkaIsConnect) return;

        const client = this.kafkaClient.createClient<Kafka>();

        this.producer = client.producer();

        this.producer.connect().then(() => (this.isConnected = true));
    }

    public sendMessage(
        topic: TopicsEnum,
        to: string | undefined,
        event: EventsEnum,
        data: DataResponse<unknown>,
    ): void {
        if (!Envs.kafka.kafkaIsConnect || !this.isConnected || !to) return;

        const message = new MessageDto(to, event, data);

        console.log(message);
        this.producer.send({ topic, messages: [{ value: JSON.stringify(message) }] });
    }
}
