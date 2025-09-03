// audio.processor.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import * as os from 'os';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository, logger } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { EntityManager } from '@mikro-orm/core';
import { FileEntity } from '../../files/entity/file.entity';
import { FilesService } from '../../files/services/files.service';

const execAsync = promisify(exec);

interface AudioAnalysisJobData {
    fileId: string;
}

@Processor('audio_analysis_queue')
export class AudioProcessor extends WorkerHost {
    constructor(
        private readonly filesService: FilesService,
        @InjectRepository(FileEntity) private readonly fileRepository: EntityRepository<FileEntity>,
        private readonly em: EntityManager,
    ) {
        super();
    }

    async process(job: Job<AudioAnalysisJobData>): Promise<void> {
        const { fileId } = job.data;
        let tempFilePath: string | null = null;

        try {
            const { buffer } = await this.filesService.getFileData(fileId);

            if (!buffer) {
                return;
            }

            tempFilePath = path.join(os.tmpdir(), `${fileId}-${Date.now()}`);

            await fs.writeFile(tempFilePath, buffer);

            const duration = await this.getAudioDuration(tempFilePath);
            const loudnessData = await this.getLoudnessData(tempFilePath);

            const fileEntity = await this.fileRepository.findOne({ id: fileId });

            if (fileEntity) {
                fileEntity.duration = duration;
                fileEntity.loudnessData = loudnessData;
                await this.em.persistAndFlush(fileEntity);
            }
        } catch (error) {
            logger.error(`Не удалось проанализировать или обновить файл ${fileId}:`, error);
        } finally {
            if (tempFilePath) {
                try {
                    await fs.unlink(tempFilePath);
                } catch (e) {
                    logger.error(`Не удалось удалить временный файл ${tempFilePath}:`, e);
                }
            }
        }
    }

    private async getAudioDuration(filePath: string): Promise<number> {
        const { stderr } = await execAsync(`ffmpeg -i "${filePath}" -f null -`);

        const match = stderr.match(/time=([0-9.:]+)\s/);

        if (match && match[1]) {
            const timeString = match[1];
            const parts = timeString.split(':').map(Number);

            let duration = 0;

            if (parts.length === 3) {
                duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
                duration = parts[0] * 60 + parts[1];
            } else if (parts.length === 1) {
                duration = parts[0];
            } else {
                return 0;
            }

            return duration;
        }

        return 0;
    }

    private async getLoudnessData(filePath: string): Promise<number[]> {
        const { stderr } = await execAsync(
            `ffmpeg -i "${filePath}" -af "astats=metadata=1:reset=1:length=0.1" -f null -`,
        );
        const lines = stderr.split('\n');
        const loudnessData: number[] = [];

        const regex = /RMS level dB:\s*(-?\d+\.\d+)/;

        lines.forEach((line) => {
            const match = line.match(regex);

            if (match) {
                loudnessData.push(parseFloat(match[1]));
            }
        });

        return loudnessData;
    }
}
