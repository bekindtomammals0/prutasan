import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('Application bootstrap (e2e)', () => {
  it('initializes the application module', async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleFixture.createNestApplication();

    try {
      await app.init();
      expect(app.getHttpServer()).toBeDefined();
    } finally {
      await app.close();
    }
  });
});
