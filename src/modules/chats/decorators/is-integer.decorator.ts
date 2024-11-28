import { applyDecorators } from '@nestjs/common';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export const IsInteger = () => applyDecorators(IsNumber(), IsInt(), IsPositive());
