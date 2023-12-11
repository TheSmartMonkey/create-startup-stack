/**
 * @group unit
 */
import { fakeUser } from '@tests/fake';
import { initUnitTests, initUnitTestsMocks } from '@tests/helper';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { requireAuthToken } from './require-auth-token.middleware';

describe('auth token unit', () => {
  let token: string;
  let nextSpy: jest.Mock<any, any>;
  const user = fakeUser();

  beforeAll(() => {
    process.env.JWT_TOKEN_SECRET = '1234';
    token = sign(user, process.env.JWT_TOKEN_SECRET, { expiresIn: '30d' });
    initUnitTests();
  });

  beforeEach(() => {
    nextSpy = jest.fn();
    initUnitTestsMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should return a user when passing a token in http headers', async () => {
    // Given
    const req: Request = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;

    // When
    requireAuthToken(req, {} as Response, nextSpy);

    // Then
    expect(nextSpy).toHaveBeenCalled();
    expect(req.body).toEqual({ user: expect.objectContaining({ email: 'fake@gmail.com' }) });
  });

  test('Should throw 401 TOKEN_IS_UNDEFINED when token is empty', async () => {
    // Given
    const req: Request = {
      headers: {
        authorization: '',
      },
    } as Request;

    // When
    requireAuthToken(req, {} as Response, nextSpy);

    // Then
    expect(nextSpy).toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith({ message: 'TOKEN_IS_UNDEFINED', statusCode: 401 });
  });

  test('Should throw 401 TOKEN_IS_UNDEFINED when token is missing Bearer', async () => {
    // Given
    const req: Request = {
      headers: {
        authorization: '1234',
      },
    } as Request;

    // When
    requireAuthToken(req, {} as Response, nextSpy);

    // Then
    expect(nextSpy).toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith({ message: 'TOKEN_IS_UNDEFINED', statusCode: 401 });
  });

  test('Should throw 401 TOKEN_IS_UNDEFINED when token has only Bearer', async () => {
    // Given
    const req: Request = {
      headers: {
        authorization: 'Bearer ',
      },
    } as Request;

    // When
    requireAuthToken(req, {} as Response, nextSpy);

    // Then
    expect(nextSpy).toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith({ message: 'TOKEN_IS_UNDEFINED', statusCode: 401 });
  });

  test('Should throw 403 UNCORRECT_TOKEN_VERIFICATION_FAILED when verification fails', async () => {
    // Given
    const req: Request = {
      headers: {
        authorization: 'Bearer invalidToken',
      },
    } as Request;

    // When
    requireAuthToken(req, {} as Response, nextSpy);

    // Then
    expect(nextSpy).toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith({ message: 'UNCORRECT_TOKEN_VERIFICATION_FAILED', statusCode: 403 });
  });
});
