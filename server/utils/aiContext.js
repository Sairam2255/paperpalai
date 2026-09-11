const {
  AsyncLocalStorage,
} = require("async_hooks");

const aiContext =
  new AsyncLocalStorage();

const runWithAIKey = (
  apiKey,
  callback
) => {
  return aiContext.run(
    {
      apiKey: apiKey || null,
    },
    callback
  );
};

const getCurrentApiKey = () => {
  const store = aiContext.getStore();

  return store?.apiKey || null;
};

module.exports = {
  runWithAIKey,
  getCurrentApiKey,
};