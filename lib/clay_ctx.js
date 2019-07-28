function ClayCtx(ctx) {
    if (ctx) {
        this.ctx = ctx;
        return new Proxy(this, {
            get(target, property) {
                if (!Reflect.has(target, property)) {
                    if (Reflect.has(target.ctx, property)) {
                        return target.ctx[property];
                    } else if (target.ctx.app && Reflect.has(target.ctx.app, property)) {
                        return target.ctx.app[property];
                    }
                }
                return target[property];
            }
        });
    }
}
module.exports = ClayCtx;
