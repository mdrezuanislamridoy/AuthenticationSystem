import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma';

export const role_str = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(role_str, roles);
