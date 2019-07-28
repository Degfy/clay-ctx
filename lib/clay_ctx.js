const is = require('is-type-of');
const rubbi = require('rubbi');

function ClayCtx(ctx) {
    if (ctx) {
        this.ctx = ctx;
        return new Proxy(this, {
            get(target, property) {
                if (!Reflect.has(target, property)) {
                    if (Reflect.has(target.ctx, property)) {
                        let attr = target.ctx[property];
                        const config = target.ctx.config;
                        if (config && config.clayCtxLogging && is.function(attr)) {
                            attr = async (...args) => {
                                const logger = target.ctx.logger || console;
                                const {
                                    io,
                                    timeUse,
                                    executedSlow,
                                    whiteList,
                                } = config.clayCtxLogging;

                                try {
                                    if (io && logger[io]) {
                                        const inputArgs = [];
                                        args.forEach(arg => {
                                            if (arg === ctx && is.array(whiteList)) {
                                                inputArgs.push(
                                                    rubbi.whiteBlock(ctx, whiteList)
                                                )
                                            } else {
                                                inputArgs.push(arg);
                                            }
                                        });
                                        logger[io](`${target.constructor.name}.${property} input:`, JSON.stringify(inputArgs));
                                    }
                                } catch (e) {
                                    logger.error(e);
                                }

                                const timeBegin = Date.now();

                                // before ============>
                                let out = target.ctx[property].apply(this, args);
                                if (is.promise(out)) {
                                    out = await out;
                                }
                                // after <=============

                                try {
                                    if (timeUse && logger[timeUse]) {
                                        const useTime = Date.now() - timeBegin;
                                        logger[timeUse](`${target.constructor.name}.${property} useTime: +%dms`, useTime);
                                        if (executedSlow > 0 && logger[executedSlow] && executedSlow <= useTime) {
                                            logger[executedSlow](`${target.constructor.name}.${property} is slow: +%dms`, useTime);
                                        }
                                    }
                                    if (io && logger[io]) {
                                        logger[io](`${target.constructor.name}.${property} output:`, JSON.stringify(out));
                                    }
                                } catch (e) {
                                    logger.error(e);
                                }
                                return out;
                            }
                        }
                        return attr;
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
