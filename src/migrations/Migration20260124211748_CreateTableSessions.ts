import { Migration } from '@mikro-orm/migrations';

export class Migration20260124211748_CreateTableSessions extends Migration {
    override up(): void {
        this.addSql(
            `create table "sessions" ("id" uuid not null default uuid_generate_v4(), "encryption_user_agent" varchar(4096) not null, "is_online" boolean not null default false, "updated_at" timestamptz not null default now(), "created_at" timestamptz not null default now(), "user_id" varchar(64) not null, constraint "sessions_pkey" primary key ("id"));`,
        );

        this.addSql(
            `alter table "sessions" add constraint "sessions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`,
        );

        this.addSql(`drop table if exists "images_images" cascade;`);
    }

    override down(): void {
        this.addSql(
            `create table "images_images" ("id" varchar(50) null, "path" varchar(1256) null, "originalname" varchar(1128) null, "issue_defect_number" varchar(50) null, "issue_defect_id" varchar(150) null, "status" varchar(1150) null);`,
        );

        this.addSql(`drop table if exists "sessions" cascade;`);
    }
}
