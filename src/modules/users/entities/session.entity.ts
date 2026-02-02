import { ApiProperty } from '@nestjs/swagger';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { SessionsRepository } from '../repositories/sessions.repository';
import { CreatedEntity } from '../../../common/entities/created.entity';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'sessions', repository: () => SessionsRepository })
export class SessionEntity extends CreatedEntity {
    constructor(payload: Partial<SessionEntity>) {
        super();
        Object.assign(this, payload);
    }

    @ApiProperty()
    @Property({ persist: false, lazy: true })
    readonly userId!: string;

    @ApiProperty()
    @Property({ length: 2 ** 12 })
    readonly encryptionUserAgent!: string;

    @ApiProperty()
    @Property({ default: false })
    readonly isOnline!: boolean;

    @ApiProperty()
    @Property({ defaultRaw: 'NOW()' })
    readonly updatedAt!: Date;

    @ApiProperty({ type: () => UserEntity })
    @ManyToOne(() => UserEntity, { joinColumn: 'user_id', referencedColumnNames: ['id'], length: 2 ** 6 })
    readonly user!: UserEntity;
}
