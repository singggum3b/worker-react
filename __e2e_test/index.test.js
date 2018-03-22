import * as pupet from 'puppeteer';
import { toMatchImageSnapshot } from "jest-image-snapshot";

let browser, page;

expect.extend({ toMatchImageSnapshot });

beforeAll(async (done) => {
    browser = await pupet.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:9000');
    done();
});

beforeEach(async (done) => {
    await page.evaluate(() => {
        return window.localStorage.clear();
    });
    await page.reload();
    done();
});

afterAll(async (done) => {
    await browser.close();
    done();
});

async function addTodo(page, text) {
    const todoInput = await page.$('.new-todo');
    await todoInput.type(text);
    await todoInput.press('Enter');
}

async function toggleFirstTodo(page) {
    const todoItem = await page.$('.todo-list .item:first-child');
    const todoItemToggleButton = await todoItem.$('.toggle');
    await todoItemToggleButton.click();
}

describe("Basic todo flows", () => {

    it("first load correctly", async () => {
        const todoInput = await page.$('.new-todo');
        const rawInput = await page.evaluate((el) => ({
            outerHTML: el.outerHTML,
        }), todoInput);
        const snapshot = await todoInput.screenshot();
        expect(snapshot).toMatchImageSnapshot();
        expect(rawInput.outerHTML).toMatchSnapshot();
    });

    it("add todo correctly", async () => {
        await addTodo(page, 'todo1');
        const todoApp = await page.$('.todoapp');
        const snapshot = await todoApp.screenshot();
        expect(snapshot).toMatchImageSnapshot();
    });

    it("remove todo correctly", async () => {

        await addTodo(page, 'todo1');
        await toggleFirstTodo(page);
        const todoApp = await page.$('.todoapp');
        expect(await todoApp.screenshot()).toMatchImageSnapshot();

        const todoItem = await page.$('.todo-list .item:first-child');
        await todoItem.hover();
        const todoItem1RemoveButton = await todoItem.$('.destroy');
        await todoItem1RemoveButton.click();
        expect(await todoApp.screenshot()).toMatchImageSnapshot();
    });

    it("reload todo correctly", async () => {
        await addTodo(page, 'todo1');
        await page.reload();
        const todoItems = await page.$$('.todo-list .item:first-child');
        const todoApp = await page.$('.todoapp');
        expect(todoItems.length).toEqual(1);
        expect(await todoApp.screenshot()).toMatchImageSnapshot();
    });

    it("filter todo correctly", async () => {
        const todoApp = await page.$('.todoapp');
        await addTodo(page, 'todo1');
        await toggleFirstTodo(page);
        const activeFilter = await page.$(".filters a[href='/active']");
        await activeFilter.click();
        expect(await todoApp.screenshot()).toMatchImageSnapshot();
        const completedFilter = await page.$(".filters a[href='/completed']");
        await completedFilter.click();
        expect(await todoApp.screenshot()).toMatchImageSnapshot();
    });

});