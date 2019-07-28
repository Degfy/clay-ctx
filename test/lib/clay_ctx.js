const assert = require('assert');
const ClayCtx = require('../..');

describe('index.js', () => {
    it('1.controller', () => {
        class Controller extends ClayCtx {
            constructor(ctx) {
                super(ctx);
            }
        }

        const ctx = {
            a: 100,
            b() {
                return 200;
            }
        };

        const controller = new Controller(ctx);

        assert.equal(controller.a, ctx.a);
        assert.equal(controller.b, ctx.b);
        assert.equal(controller.ctx, ctx);

        class Service extends ClayCtx {
            constructor(ctx) {
                super(ctx);
            }
        }

        const ctx2 = {
            c: 200,
            d: 300,
        };

        const service = new Service(ctx2);
        assert.equal(service.ctx, ctx2);
        assert.equal(service.c, ctx2.c);
        assert.equal(service.d, ctx2.d);


        assert.equal(controller.a, ctx.a);
        assert.equal(controller.b, ctx.b);
        assert.equal(controller.ctx, ctx);

        assert(service instanceof Service);
        assert(controller instanceof Controller);
        assert(controller instanceof ClayCtx);
        assert(service instanceof ClayCtx);

        class MyService extends Service {
            constructor(ctx) {
                super(ctx);
            }

            test() {
                assert.equal(this.ctx.a, this.a);
                this.test2();

                assert.equal(this.b(), 200);
            }

            test2() {
                assert.equal(this.ctx.b, this.b);
            }
        }

        const myService = new MyService(ctx);
        myService.test();
        assert.equal(myService.a, ctx.a);
        assert.equal(myService.b, ctx.b);

        assert(myService instanceof MyService);
        assert(myService instanceof Service);
        assert(myService instanceof ClayCtx);

        const ctx3 = {
            app: {
                a() {
                    return 100;
                }
            },
        };

        const myService3 = new MyService(ctx3);
        assert.equal(myService3.a, ctx3.app.a);
        assert.equal(typeof myService3.a, 'function');
        assert.equal(myService3.a(), 100);
    });
});
