const jsonwebtoken = require('jsonwebtoken');
const { localAuthenticationMiddleware } = require('./authentication');
const User = require('../models/User');

jest.mock('jsonwebtoken');
jest.mock('../models/User');

describe('local authentication middleware', () => {
  // beforeEach jsonwebtoken / User.findById in global scope;

  test("appContext.user is NOT added if req doesn't have cookie with key jwt", async () => {
    // mocks
    const mockRequest = { cookies: { key: 'no jwt cookie provided' } };
    const mockResponse = {};
    const mockNext = jest.fn();
    jsonwebtoken.verify.mockReturnValue({ id: 'abc' });
    User.findById.mockResolvedValue('Viktor');
    //
    await localAuthenticationMiddleware(mockRequest, mockResponse, mockNext);
    // expect
    expect(mockRequest).not.toHaveProperty('appContext.user');
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test("appContext.user is NOT added if req.cookies.jwt isn't a valid token", async () => {
    // mocks
    const mockRequest = { cookies: { jwt: 'encodedToken' } };
    const mockResponse = {};
    const mockNext = jest.fn();
    jsonwebtoken.verify.mockImplementation(() => {
      throw new Error('test jwt malformed');
    });
    User.findById.mockResolvedValue('Viktor');
    //
    await localAuthenticationMiddleware(mockRequest, mockResponse, mockNext);
    // expect
    expect(mockRequest).not.toHaveProperty('appContext.user');
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test("appContext.user is NOT added if req.cookies.jwt exists and is valid, but a user with decoded id does't exist", async () => {
    // mocks
    const mockRequest = { cookies: { jwt: 'encodedToken' } };
    const mockResponse = {};
    const mockNext = jest.fn();
    jsonwebtoken.verify.mockReturnValue({ id: 'abc' });
    User.findById.mockResolvedValue(null);
    //
    await localAuthenticationMiddleware(mockRequest, mockResponse, mockNext);
    // expect
    expect(mockRequest).not.toHaveProperty('appContext.user');
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test('appContext.user is added if req.cookies.jwt exists, jwt is valid, user with decoded id exists', async () => {
    // mocks
    const mockRequest = { cookies: { jwt: 'encoded token' } };
    const mockResponse = {};
    const mockNext = jest.fn();
    jsonwebtoken.verify.mockReturnValue({ id: 'abc' });
    User.findById.mockResolvedValue('Viktor');
    //
    await localAuthenticationMiddleware(mockRequest, mockResponse, mockNext);
    //
    expect(mockRequest).toHaveProperty('appContext.user', 'Viktor');
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
