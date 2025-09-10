import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { FileEntity } from '../../files/entity/file.entity';
import { FilesService } from '../../files/services/files.service';
import { TopicsEnum } from '../types/topics.enum';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as path from 'node:path';
import * as fs from 'fs/promises';
import { MessageDto } from '../dto/message.dto';

const execAsync = promisify(exec);

@Controller()
export class AudioAnalysisServer {
    constructor(
        private readonly filesService: FilesService,
        @InjectRepository(FileEntity) private readonly fileRepository: EntityRepository<FileEntity>,
        private readonly em: EntityManager,
    ) {}

    @EventPattern(TopicsEnum.AUDIO_ANALYSIS)
    async handleMessage(@Payload() msg: MessageDto): Promise<void> {
        const payload = msg?.data?.data as { fileId?: string } | undefined;
        const fileId: string | undefined = payload?.fileId;

        if (!fileId) return;

        const { buffer } = await this.filesService.getFileData(fileId);

        if (!buffer) return;

        const tmpFile = path.join(os.tmpdir(), `${fileId}-${Date.now()}`);
        await fs.writeFile(tmpFile, buffer);

        try {
            const duration = await this.getAudioDuration(tmpFile);
            const loudnessData = await this.getLoudnessData(tmpFile);

            const fileEntity = await this.fileRepository.findOne({ id: fileId });

            if (!fileEntity) return;

            fileEntity.duration = duration;

            fileEntity.loudnessData = loudnessData;

            await this.em.persistAndFlush(fileEntity);
        } finally {
            await fs.unlink(tmpFile).catch(() => {});
        }
    }

    private async getAudioDuration(filePath: string): Promise<number> {
        const { stderr } = await execAsync(`ffmpeg -i "${filePath}" -f null -`);
        const match = stderr.match(/time=([0-9.:]+)\s/);

        if (match && match[1]) {
            const parts = match[1].split(':').map(Number);

            if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];

            if (parts.length === 2) return parts[0] * 60 + parts[1];

            if (parts.length === 1) return parts[0];
        }

        return 0;
    }

    private async getLoudnessData(filePath: string): Promise<number[]> {
        const args = [
            '-i',
            filePath,
            '-vn',
            '-ac',
            '1',
            '-ar',
            '16000',
            '-acodec',
            'pcm_s16le',
            '-f',
            's16le',
            'pipe:1',
        ];
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            const ff = spawn('ffmpeg', args);
            ff.stdout.on('data', (c: Buffer) => chunks.push(c));
            ff.stderr.on('data', () => {});
            ff.on('error', reject);
            ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
        });
        const pcm = Buffer.concat(chunks);
        const samplesLen = (pcm.length / 2) | 0;
        const samples = new Array<number>(samplesLen);

        for (let i = 0; i < samplesLen; i++) samples[i] = pcm.readInt16LE(i * 2);

        const windowSize = 160;
        const windows = Math.max(1, (samplesLen / windowSize) | 0);
        const db = new Array<number>(windows);

        for (let w = 0; w < windows; w++) {
            let sumSquares = 0;
            const start = w * windowSize;

            for (let i = 0; i < windowSize; i++) {
                const s = (samples[start + i] ?? 0) / 32768;
                sumSquares += s * s;
            }

            const rms = Math.sqrt(sumSquares / windowSize) || 0;

            const dbVal = rms > 0 ? 20 * Math.log10(rms) : -100;
            db[w] = Math.max(-100, Math.min(0, dbVal));
        }

        const target = 50;

        if (db.length === 0) return new Array<number>(target).fill(-100);

        if (db.length === target) return db.slice();

        const out = new Array<number>(target).fill(0);

        const cnt = new Array<number>(target).fill(0);

        for (let i = 0; i < db.length; i++) {
            const b = Math.min(target - 1, ((i / db.length) * target) | 0);
            out[b] += db[i];
            cnt[b] += 1;
        }

        for (let i = 0; i < target; i++) out[i] = cnt[i] ? out[i] / cnt[i] : -100;

        return out;
    }
}
