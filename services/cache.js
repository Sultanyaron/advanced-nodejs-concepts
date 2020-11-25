const mongoose = require("mongoose");
const redis = require("redis");
const { promisify } = require("util");
const keys = require("../config/keys");

const client = redis.createClient(keys.redisUrl);
client.hget = promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "defaultKey");
  // the return of this make this function chainable. so we can call the query().cache().limit(..)...
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    // if we didn't call the .cache when using the query, the useCache will be undefined
    // and we will return the normal exec function.
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  });
  const cacheValue = await client.hget(this.hashKey, key);

  if (cacheValue) {
    console.log("is cached");
    const parsedCachedValue = JSON.parse(cacheValue);
    // incase it's an array we need to transform each result to a mongoose doc
    // if its object we transform it.
    return Array.isArray(parsedCachedValue)
      ? parsedCachedValue.map((value) => new this.model(value))
      : new this.model(parsedCachedValue);
    // the new this.model is just like we do new Blog({cacheValue}), this is
    // creating the relevant model to return from the exec function
  }
  console.log("not cached");
  // otherwise, issue the query (from mongoose) and store the result in redis
  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey, key, JSON.stringify(result));
  return result;
};

module.exports = {
  clearHash(hasKey) {
    client.del(JSON.stringify(hasKey));
  },
};
