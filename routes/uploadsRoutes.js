const AWS = require("aws-sdk");
const uuid = require("uuid/v1");
const keys = require("../config/keys");
const requireLogin = require("../middlewares/requireLogin");

const s3 = new AWS.S3({
  accessKeyId: keys.awsAccessKeyId,
  secretAccessKey: keys.awsSecretAccessKey,
  region: "eu-central-1",
});

module.exports = (app) => {
  app.get("/api/upload", requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.png`;
    s3.getSignedUrl(
      "putObject",
      {
        Bucket: "blogster-nodejs-advanced-concepts",
        ContentType: "image/png",
        Key: key,
      },
      (err, url) => res.send({ key, url })
    );
  });
};
