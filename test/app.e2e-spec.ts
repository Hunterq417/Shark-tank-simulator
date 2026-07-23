import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/server/app.module';

// Requires a reachable DATABASE_URL (see .env) since PrismaModule connects on bootstrap.
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET) reports ok', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });

  it('/api/auth/login (POST) rejects invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ userId: 'nobody@ventureflow.io', password: 'wrong' })
      .expect(401);
  });

  it('/api/offers (POST) requires authentication', () => {
    return request(app.getHttpServer())
      .post('/api/offers')
      .send({ startupId: 'x', amount: '$1', equity: '1%' })
      .expect(401);
  });
});
