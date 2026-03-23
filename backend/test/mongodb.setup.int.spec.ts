describe('MongoDB Setup', () => {
  it('mongoUri should be defined on enviroments', () => {
    expect(process.env.MONGO_URI).toBeDefined();
    expect(process.env.MONGO_URI).toMatch(/^mongodb:\/\//);
  });
});
