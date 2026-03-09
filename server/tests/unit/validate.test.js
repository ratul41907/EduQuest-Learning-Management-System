// Path: E:\EduQuest\server\tests\unit\validate.test.js

const { validate } = require('../../src/middleware/validate');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('should pass validation with valid data', () => {
    const middleware = validate({
      email: 'required|email',
      password: 'required|min:6',
    });

    req.body = {
      email: 'test@test.com',
      password: 'password123',
    };

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should fail validation with missing required field', () => {
    const middleware = validate({
      email: 'required|email',
    });

    req.body = {};

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'email is required',
          }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should fail validation with invalid email', () => {
    const middleware = validate({
      email: 'required|email',
    });

    req.body = { email: 'invalid-email' };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'email must be a valid email',
          }),
        ]),
      })
    );
  });

  test('should fail validation with password too short', () => {
    const middleware = validate({
      password: 'required|min:6',
    });

    req.body = { password: '123' };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: 'password must be at least 6 characters',
          }),
        ]),
      })
    );
  });
});