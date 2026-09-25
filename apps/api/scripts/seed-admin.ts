import 'dotenv/config';
import { createUserDto } from '@ecomerece/shared';
import { eventBus } from '../core/infrastructure/buses/in-memory-event-bus';
import { UserAppService } from '../modules/user/application/user.app.service';
import { UserRepository } from '../modules/user/infra/user.repository';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function main(): Promise<void> {
  const { connectDB, disconnectDB } = await import('../lib/mongo');
  await connectDB();
  try {
    const userRepo = new UserRepository();
    if (await userRepo.ExistsAnyByRole('admin')) {
      throw new Error('An administrator already exists.');
    }

    const data = createUserDto.parse({
      name: {
        firstName: required('ADMIN_FIRST_NAME'),
        middleName: process.env.ADMIN_MIDDLE_NAME?.trim() || undefined,
        lastName: process.env.ADMIN_LAST_NAME?.trim() || undefined,
      },
      email: required('ADMIN_EMAIL'),
      password: required('ADMIN_PASSWORD'),
      role: 'admin',
    });
    const service = new UserAppService(userRepo, eventBus);
    const admin = await service.createUser(data);
    console.log(`Created administrator ${admin.id} (${admin.email}).`);
  } finally {
    await disconnectDB();
  }
}

await main();
