const handlers = require('../handlers');

describe('view handlers', () => {
  it('should home page', () => {
    const req = {};
    const res = { render: jest.fn() };
    handlers.home(req, res);
    expect(res.render.mock.calls[0][0]).toBe('home');
  });

  it('should render about page with fortune', () => {
    const req = {};
    const res = { render: jest.fn() };
    handlers.about(req, res);
    expect(res.render.mock.calls.length).toBe(1);
    // the first array index specifies which invocation, the second array index specifies which argument
    expect(res.render.mock.calls[0][0]).toBe('about');
    expect(res.render.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        fortune: expect.stringMatching(/\W/),
      }),
    );
  });

  it('should render the 404 hanlder', () => {
    const req = {};
    const res = { render: jest.fn() };
    handlers.notFound(req, res);
    expect(res.render.mock.calls[0][0]).toBe('404');
  });

  it('shold render the 500 handler', () => {
    const err = new Error('some error');
    const req = {};
    const res = { render: jest.fn() };
    const next = jest.fn();
    handlers.serverError(err, req, res, next);
    expect(res.render.mock.calls.length).toBe(1);
    expect(res.render.mock.calls[0][0]).toBe('500');
  });
});
