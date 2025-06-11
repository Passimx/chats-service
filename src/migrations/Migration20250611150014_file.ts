import { Migration } from '@mikro-orm/migrations';

export class Migration20250611150014_file extends Migration {
    up(): void {
        this.addSql(
            'create table "files" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz not null default now(), "original_name" varchar(255) not null, "size" int not null, "mime_type" varchar(255) not null, constraint "files_pkey" primary key ("id"));',
        );
        this.addSql('create index "files_id_index" on "files" using HASH ("id");');
    }

    down(): void {
        this.addSql('drop table if exists "files" cascade;');
    }
}
