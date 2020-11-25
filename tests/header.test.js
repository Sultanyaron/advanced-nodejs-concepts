const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("Header", () => {
  it("Header includes brand text", async () => {
    const logoText = await page.getContentsOf("a.brand-logo");
    expect(logoText).toEqual("Blogster");
  });

  it("clicking login starts oauth flow", async () => {
    await page.click(".right a", (ele) => {
      ele;
    });
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
  });

  it("When signed in shows logout button", async () => {
    await page.login();
    const logoutButtonText = await page.getContentsOf('a[href="/auth/logout"]');
    expect(logoutButtonText).toEqual("Logout");
  });
});
