import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsersRepository } from '../repositories/users.repository';
import { SessionEntity } from './session.entity';

@Entity({ tableName: 'users', repository: () => UsersRepository })
export class UserEntity {
    @ApiProperty()
    @PrimaryKey({ length: 2 ** 6 })
    readonly id!: string;

    @ApiProperty()
    @Property({ length: 2 ** 5, nullable: true })
    readonly name!: string;

    @ApiProperty()
    @Property({ length: 2 ** 6 })
    readonly userName!: string;

    @ApiProperty()
    @Property({ length: 2 ** 12, hidden: true })
    readonly rsaPublicKey!: string;

    @ApiProperty()
    @Property({ length: 2 ** 14, hidden: true })
    readonly encryptedRsaPrivateKey!: string;

    @Property({ length: 2 ** 6, hidden: true })
    readonly passwordHash!: string;

    @Property({ length: 2 ** 6, hidden: true })
    readonly seedPhraseHash!: string;

    @ApiProperty()
    @Property({ defaultRaw: 'NOW()' })
    readonly createdAt!: Date;

    @ApiPropertyOptional({ type: () => SessionEntity, isArray: true })
    @OneToMany(() => SessionEntity, (session) => session.user)
    readonly sessions = new Collection<SessionEntity>(this);

    constructor(payload: Partial<UserEntity>) {
        Object.assign(this, payload);
    }
}
