import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Envs } from '../../../../common/envs/env';

@ValidatorConstraint({ async: false })
export class IsNotForbiddenTitleConstraint implements ValidatorConstraintInterface {
    validate(title: string) {
        const forbiddenTitles = Envs.title.exam ? Envs.title.exam.split(',').map((t) => t.trim()) : [];

        return !forbiddenTitles.includes(title);
    }

    defaultMessage() {
        return 'Title is not allowed.';
    }
}

export function IsNotForbiddenTitle(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            name: 'isNotForbiddenTitle',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsNotForbiddenTitleConstraint,
        });
    };
}
