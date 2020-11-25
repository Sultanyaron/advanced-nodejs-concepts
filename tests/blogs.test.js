const Page = require("./helpers/page");

let page;
Number.prototype._called = {};

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("Blogs", () => {
  describe("When logged in ", async () => {
    beforeEach(async () => {
      await page.login();
      await page.click("a.btn-floating");
    });

    it("can see blog create form", async () => {
      const formLabel = await page.getContentsOf("form label");
      expect(formLabel).toEqual("Blog Title");
    });

    describe("And using valid inputs", () => {
      const blogTitle = "my blog title";
      const blogContent = "my blog content";
      beforeEach(async () => {
        await page.type(".title input", blogTitle);
        await page.type(".content input", blogContent);
        await page.click("form button");
      });

      it("Submitting takes user to review screen", async () => {
        const confirmTitle = await page.getContentsOf("h5");
        expect(confirmTitle).toEqual("Please confirm your entries");
      });

      it("Submitting and saving adds blog to index page", async () => {
        await page.click("button.green");
        await page.waitFor(".card");

        const title = await page.getContentsOf(".card-title");
        const content = await page.getContentsOf(".card p");
        expect(title).toEqual(blogTitle);
        expect(content).toEqual(blogContent);
      });
    });

    describe("And using invalid inputs", () => {
      beforeEach(async () => {
        await page.click("form button[type='submit']");
      });
      it("The form shows an error message", async () => {
        const blogInputError = await page.getContentsOf(".title .red-text");
        const blogContentInputError = await page.getContentsOf(
          ".content .red-text"
        );

        expect(blogInputError).toEqual("You must provide a value");
        expect(blogContentInputError).toEqual("You must provide a value");
      });
    });
  });

  describe("When not logged in", async () => {
    const actions = [
      {
        method: "get",
        path: "/api/blogs",
      },
      {
        method: "post",
        path: "/api/blogs",
        data: { title: "T", content: "C" },
      },
    ];
    it("Blog related actions are prohibited", async () => {
      const results = await page.execRequests(actions);
      results.forEach((result) => {
        expect(result).toEqual({ error: "You must log in!" });
      });
    });
  });
});
