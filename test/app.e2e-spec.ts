import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Full Application (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminToken: string;

  const regularUser = {
    username: 'john',
    password: 'passjohn',
  };
  const adminUser = {
    username: 'admin',
    password: 'passadmin',
  };

  beforeAll(async () => {
    // Set the environment variable for the test database
    process.env.PG_DATABASE = 'e2e_test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should allow a user to sign up', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'testuser',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
  });

  it('should allow a user to login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: regularUser.username,
        password: regularUser.password,
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    // Save the token for later use
    authToken = response.body.access_token;
  });

  it('should throw an error if the user does not exists ', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'anotheruser',
        password: regularUser.password,
      })
      .expect(404);
  });

  it('should throw an Unauthorized error when invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: regularUser.username,
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('should allow a user to execute a transaction', async () => {
    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 100,
        // When using the seed script the second regular user has an id of 3
        receiverId: 3,
        denomId: 1,
      })
      .expect(201);
  });

  it('should throw an error if the receiver does not exists', async () => {
    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 100,
        // When using the seed script the second regular user has an id of 3
        receiverId: 88,
        denomId: 1,
      })
      .expect(404);
  });

  it('should throw an error if the denom does not exists or the user does not have sufficient funds', async () => {
    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 100,
        // When using the seed script the second regular user has an id of 3
        receiverId: 3,
        denomId: 55,
      })
      .expect(400);
  });

  it('should reject a regular user trying to access admin protected endpoint', async () => {
    await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403);
  });

  it('should allow an admin to login and access admin endpoint', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: adminUser.username,
        password: adminUser.password,
      })
      .expect(201);

    adminToken = loginResponse.body.access_token;

    await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
