!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.lorez=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';
var RGBA = _dereq_('./RGBA');

var microFont = _dereq_('../font/Micro');

var util = _dereq_('./util');

var clamp = util.clamp;

var alpha = new RGBA(0, 0, 0, 0);
var black = new RGBA(0, 0, 0);
var magenta = new RGBA(255, 0, 255);

var Bitmap = (function () {
    function Bitmap(width, height, useAlpha, buffer) {
        if (typeof useAlpha === "undefined") { useAlpha = false; }
        if (typeof buffer === "undefined") { buffer = null; }
        this.width = width;
        this.height = height;
        this.useAlpha = useAlpha;
        this.channels = (useAlpha ? 4 : 3);

        if (buffer) {
            var total = (this.width * this.height * this.channels);
            if (buffer.byteLength !== total) {
                throw new Error('bad raw data dimensions; expected ' + total + ', received ' + buffer.byteLength);
            }
            this.buffer = buffer;
            this.data = new Uint8ClampedArray(this.buffer);
        } else {
            this._resetData();
        }
    }
    Bitmap.prototype._resetData = function () {
        this.buffer = new ArrayBuffer(this.width * this.height * this.channels);

        this.data = new Uint8ClampedArray(this.buffer);
    };

    Bitmap.prototype.resizeTo = function (width, height) {
        if (width === this.width && height === this.height) {
            return;
        }
        this.width = width;
        this.height = height;
        this._resetData();
    };

    Bitmap.prototype.setPixel = function (x, y, col) {
        x = Math.floor(x);
        y = Math.floor(y);

        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return;
        }
        var p = (x + y * this.width) * this.channels;
        this.data[p] = col.r;
        this.data[p + 1] = col.g;
        this.data[p + 2] = col.b;
    };

    Bitmap.prototype.getPixel = function (x, y, col) {
        x = Math.floor(x);
        y = Math.floor(y);

        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return null;
        }
        col = (col || new RGBA());

        var p = (x + y * this.width) * this.channels;
        col.r = this.data[p];
        col.g = this.data[p + 1];
        col.b = this.data[p + 2];
        return col;
    };

    Bitmap.prototype.fillRect = function (x, y, w, h, col) {
        x = Math.floor(x);
        y = Math.floor(y);
        w = Math.floor(w);
        h = Math.floor(h);

        for (var iy = y; iy < y + h; iy++) {
            for (var ix = x; ix < x + w; ix++) {
                if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) {
                    continue;
                }
                var p = (ix + iy * this.width) * this.channels;
                this.data[p] = col.r;
                this.data[p + 1] = col.g;
                this.data[p + 2] = col.b;
            }
        }
    };

    Bitmap.prototype.drawLineH = function (x, y, size, col) {
        var right = clamp(Math.floor(x + size), 0, this.width);
        x = clamp(Math.floor(x), 0, this.width);
        y = clamp(Math.floor(y), 0, this.height);

        for (; x < right; x++) {
            var p = (x + y * this.width) * this.channels;
            this.data[p] = col.r;
            this.data[p + 1] = col.g;
            this.data[p + 2] = col.b;
        }
    };

    Bitmap.prototype.drawLineV = function (x, y, size, col) {
        var bottom = clamp(Math.floor(y + size), 0, this.height);
        x = clamp(Math.floor(x), 0, this.width);
        y = clamp(Math.floor(y), 0, this.height);

        for (; y < bottom; y++) {
            var p = (x + y * this.width) * this.channels;
            this.data[p] = col.r;
            this.data[p + 1] = col.g;
            this.data[p + 2] = col.b;
        }
    };

    Bitmap.prototype.drawRect = function (x, y, width, height, col) {
        x = Math.floor(x);
        y = Math.floor(y);
        width = Math.floor(width);
        height = Math.floor(height);

        this.drawLineH(x, y, width, col);
        this.drawLineH(x, y + height - 1, width, col);
        this.drawLineV(x, y, height, col);
        this.drawLineV(x + width - 1, y, height, col);
    };

    Bitmap.prototype.fillCircle = function (x, y, r, col) {
        x = Math.floor(x);
        y = Math.floor(y);
        r = Math.floor(r);

        for (var iy = -r; iy <= r; iy++) {
            for (var ix = -r; ix <= r; ix++) {
                if (x + ix < 0 || y + iy < 0 || x + ix >= this.width || y + iy >= this.height) {
                    continue;
                }
                if (ix * ix + iy * iy <= r * r) {
                    var p = (x + ix + (y + iy) * this.width) * this.channels;
                    this.data[p] = col.r;
                    this.data[p + 1] = col.g;
                    this.data[p + 2] = col.b;
                }
            }
        }
    };

    Bitmap.prototype.drawCircle = function (x, y, r, col) {
        x = Math.floor(x);
        y = Math.floor(y);
        r = Math.floor(r);

        for (var i = 0; i < 360; i++) {
            var cx = Math.round(Math.cos(i * (Math.PI / 180)) * r) + x;
            var cy = Math.round(Math.sin(i * (Math.PI / 180)) * r) + y;

            if (cx < 0 || cy < 0 || cx >= this.width || cy >= this.height) {
                continue;
            }
            var p = (cx + cy * this.width) * this.channels;
            this.data[p] = col.r;
            this.data[p + 1] = col.g;
            this.data[p + 2] = col.b;
        }
    };

    Bitmap.prototype.shader = function (f) {
        var iy;
        var ix;
        var p;
        var col;

        var rgb = new RGBA();

        for (iy = 0; iy < this.height; iy++) {
            for (ix = 0; ix < this.width; ix++) {
                p = (ix + iy * this.width) * this.channels;
                rgb.r = this.data[p];
                rgb.g = this.data[p + 1];
                rgb.b = this.data[p + 2];

                col = f(ix, iy, rgb);

                this.data[p] = col.r;
                this.data[p + 1] = col.g;
                this.data[p + 2] = col.b;
            }
        }
    };

    Bitmap.prototype.text = function (x, y, txt, col) {
        txt = String(txt);

        for (var i = 0; i < txt.length; i++) {
            x += this.drawChar(x, y, txt.charAt(i), col) + 1;
        }
    };

    Bitmap.prototype.drawChar = function (x, y, chr, col) {
        var char = microFont.chars[chr.toUpperCase()];
        if (!char) {
            return 0;
        }

        for (var iy = 0; iy < microFont.height; iy++) {
            for (var ix = 0; ix < char.width; ix++) {
                if (char.map[iy * char.width + ix]) {
                    this.setPixel(x + ix, y + iy, col);
                }
            }
        }
        return char.width;
    };

    Bitmap.prototype.blit = function (sprite, x, y) {
        x = (x ? Math.floor(x) : 0);
        y = (y ? Math.floor(y) : 0);

        var iy;
        var ix;
        var read;
        var write;

        if (x >= this.width || y >= this.height || x + sprite.width < 0 || y + sprite.height < 0) {
            return;
        }

        var left = x;
        var right = x + sprite.width;
        var top = y;
        var bottom = y + sprite.height;

        if (left < 0) {
            left = 0;
        }
        if (top < 0) {
            top = 0;
        }

        if (right >= this.width) {
            right = this.width;
        }
        if (bottom >= this.height) {
            bottom = this.height;
        }

        if (sprite.useAlpha) {
            for (iy = top; iy < bottom; iy++) {
                for (ix = left; ix < right; ix++) {
                    read = (ix - x + (iy - y) * sprite.width) * sprite.channels;
                    write = (ix + iy * this.width) * this.channels;

                    var alpha = sprite.data[read + 3] / 255;
                    var inv = 1 - alpha;
                    this.data[write] = Math.round(this.data[write] * inv + sprite.data[read] * alpha);
                    this.data[write + 1] = Math.round(this.data[write + 1] * inv + sprite.data[read + 1] * alpha);
                    this.data[write + 2] = Math.round(this.data[write + 2] * inv + sprite.data[read + 2] * alpha);
                }
            }
        } else {
            for (iy = top; iy < bottom; iy++) {
                for (ix = left; ix < right; ix++) {
                    read = (ix - x + (iy - y) * sprite.width) * sprite.channels;
                    write = (ix + iy * this.width) * this.channels;

                    this.data[write] = sprite.data[read];
                    this.data[write + 1] = sprite.data[read + 1];
                    this.data[write + 2] = sprite.data[read + 2];
                }
            }
        }
    };

    Bitmap.prototype.clear = function (color) {
        color = color || black;

        var lim;
        var i;

        if (this.useAlpha) {
            lim = this.width * this.height * 4;
            for (i = 0; i < lim; i += 4) {
                this.data[i] = color.r;
                this.data[i + 1] = color.g;
                this.data[i + 2] = color.b;
                this.data[i + 3] = color.a;
            }
        } else {
            lim = this.width * this.height * 3;
            for (i = 0; i < lim; i += 3) {
                this.data[i] = color.r;
                this.data[i + 1] = color.g;
                this.data[i + 2] = color.b;
            }
        }
    };

    Bitmap.prototype.clearAlpha = function (alpha) {
        if (typeof alpha === "undefined") { alpha = 0; }
        if (!this.useAlpha) {
            return;
        }
        var lim = this.width * this.height * 4;
        for (var i = 3; i < lim; i += 4) {
            this.data[i] = alpha;
        }
    };

    Bitmap.clipFromData = function (inputData, inputWidth, inputHeight, inputChannels, x, y, width, height, useAlpha) {
        var channels = useAlpha ? 4 : 3;
        var data = new Uint8Array(height * width * channels);

        var iy;
        var ix;
        var read;
        var write;

        if (useAlpha) {
            for (iy = 0; iy < height; iy++) {
                for (ix = 0; ix < width; ix++) {
                    read = (ix + x + (iy + y) * inputWidth) * inputChannels;
                    write = (ix + iy * width) * channels;

                    data[write] = inputData[read];
                    data[write + 1] = inputData[read + 1];
                    data[write + 2] = inputData[read + 2];
                    data[write + 3] = inputData[read + 3];
                }
            }
        } else {
            for (iy = 0; iy < height; iy++) {
                for (ix = 0; ix < width; ix++) {
                    read = (ix + x + (iy + y) * inputWidth) * inputChannels;
                    write = (ix + iy * width) * channels;

                    data[write] = inputData[read];
                    data[write + 1] = inputData[read + 1];
                    data[write + 2] = inputData[read + 2];
                }
            }
        }

        return new Bitmap(width, height, useAlpha, data);
    };
    return Bitmap;
})();

module.exports = Bitmap;
//# sourceMappingURL=Bitmap.js.map

},{"../font/Micro":15,"./RGBA":6,"./util":13}],2:[function(_dereq_,module,exports){
'use strict';
var Char = (function () {
    function Char(char, map) {
        this.char = char;
        this.width = map[0].length;
        this.map = [];

        for (var i = 0; i < map.length; i++) {
            var line = map[i];
            for (var c = 0; c < line.length; c++) {
                this.map.push((line.charAt(c) === '1'));
            }
        }
    }
    return Char;
})();

module.exports = Char;
//# sourceMappingURL=Char.js.map

},{}],3:[function(_dereq_,module,exports){
'use strict';
var FPS = (function () {
    function FPS(smoothFPS, smoothDelta) {
        if (typeof smoothFPS === "undefined") { smoothFPS = 30; }
        if (typeof smoothDelta === "undefined") { smoothDelta = 2; }
        this.tickHistory = [0];
        this.deltaHistory = [0];
        this.tickI = 0;
        this.deltaI = 0;
        this.smoothFPS = smoothFPS;
        this.smoothDelta = smoothDelta;
        this.previous = performance.now();
    }
    FPS.prototype.begin = function () {
        var now = performance.now();
        var delta = now - this.previous;
        this.tickHistory[this.tickI % this.smoothFPS] = delta;
        this.tickI++;
        this.previous = now;
    };

    FPS.prototype.end = function () {
        var now = performance.now();
        var delta = now - this.previous;
        this.deltaHistory[this.deltaI % this.smoothDelta] = delta;
        this.deltaI++;
    };

    Object.defineProperty(FPS.prototype, "fps", {
        get: function () {
            var tot = 0;
            for (var i = 0; i < this.tickHistory.length; i++) {
                tot += this.tickHistory[i];
            }
            return Math.ceil(1000 / (tot / this.tickHistory.length));
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(FPS.prototype, "redraw", {
        get: function () {
            var tot = 0;
            for (var i = 0; i < this.deltaHistory.length; i++) {
                tot += this.deltaHistory[i];
            }
            return Math.ceil(tot / this.deltaHistory.length);
        },
        enumerable: true,
        configurable: true
    });
    return FPS;
})();

module.exports = FPS;
//# sourceMappingURL=FPS.js.map

},{}],4:[function(_dereq_,module,exports){
'use strict';
var Char = _dereq_('./Char');

var Font = (function () {
    function Font(name, height, data) {
        var _this = this;
        this.name = name;
        this.height = height;
        this.chars = Object.create(null);

        Object.keys(data).forEach(function (char) {
            _this.chars[char] = new Char(char, data[char]);
        });
    }
    return Font;
})();

module.exports = Font;
//# sourceMappingURL=Font.js.map

},{"./Char":2}],5:[function(_dereq_,module,exports){
'use strict';
var HSV = (function () {
    function HSV(h, s, v) {
        if (typeof h === "undefined") { h = 0; }
        if (typeof s === "undefined") { s = 0; }
        if (typeof v === "undefined") { v = 0; }
        this.h = h;
        this.s = s;
        this.v = v;
    }
    return HSV;
})();

module.exports = HSV;
//# sourceMappingURL=HSV.js.map

},{}],6:[function(_dereq_,module,exports){
'use strict';
var RGBA = (function () {
    function RGBA(r, g, b, a) {
        if (typeof r === "undefined") { r = 0; }
        if (typeof g === "undefined") { g = 0; }
        if (typeof b === "undefined") { b = 0; }
        if (typeof a === "undefined") { a = 255; }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    return RGBA;
})();

module.exports = RGBA;
//# sourceMappingURL=RGBA.js.map

},{}],7:[function(_dereq_,module,exports){
'use strict';
var SpriteSheet = (function () {
    function SpriteSheet(width, height) {
        this.sprites = [];
        this.width = width;
        this.height = height;
    }
    SpriteSheet.prototype.getSprite = function (x, y) {
        return this.getSpriteAt(y * this.width + x);
    };

    SpriteSheet.prototype.getSpriteAt = function (index) {
        if (this.sprites.length === 0) {
            throw new Error('sheet has zero images');
        }
        return this.sprites[index % this.sprites.length];
    };

    SpriteSheet.prototype.addSprite = function (bitmap) {
        this.sprites.push(bitmap);
    };
    return SpriteSheet;
})();

module.exports = SpriteSheet;
//# sourceMappingURL=SpriteSheet.js.map

},{}],8:[function(_dereq_,module,exports){
'use strict';
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Bitmap = _dereq_('./Bitmap');

var CanvasRenderer = _dereq_('./../render/CanvasRenderer');
var WebGLRenderer = _dereq_('./../render/WebGLRenderer');

var autosize = _dereq_('./autosize');

var Stage = (function (_super) {
    __extends(Stage, _super);
    function Stage(opts) {
        _super.call(this, (opts.width || 32), (opts.height || 32), false);

        this.canvas = (typeof opts.canvas === 'string' ? document.getElementById(opts.canvas) : opts.canvas);
        if (!this.canvas) {
            throw new Error('cannot locate canvas with id "' + opts.canvas + '"');
        }

        this.clear();

        if (opts.renderer !== 'canvas') {
            try  {
                this.renderer = new WebGLRenderer(this, this.canvas);
            } catch (e) {
                console.log(e);
                console.log('render init error, switching to fallback');
            }
        }

        if (!this.renderer) {
            this.renderer = new CanvasRenderer(this, this.canvas);
        }

        this.autoSize = new autosize.AutoSize(this, {
            center: opts.center,
            scale: opts.scale
        });
    }
    Stage.prototype.resizeTo = function (width, height) {
        if (width === this.width && height === this.height) {
            return;
        }
        _super.prototype.resizeTo.call(this, width, height);
        this.autoSize.update();
    };

    Stage.prototype.render = function () {
        this.renderer.update();
    };

    Stage.prototype.destruct = function () {
        this.autoSize.stop();
        this.autoSize = null;
        this.renderer.destruct();
        this.renderer = null;
        this.canvas = null;
    };
    return Stage;
})(Bitmap);

module.exports = Stage;
//# sourceMappingURL=Stage.js.map

},{"./../render/CanvasRenderer":25,"./../render/WebGLRenderer":26,"./Bitmap":1,"./autosize":9}],9:[function(_dereq_,module,exports){
'use strict';
var browser = _dereq_('./browser');

function assertMode(scaleMode) {
    if ((typeof scaleMode === 'number' && scaleMode > 0) || scaleMode === 'max' || scaleMode === 'fit' || scaleMode === 'none') {
        return;
    }
    var int = parseInt(scaleMode, 10);
    if (!isNaN(int) && int > 0) {
        return;
    }
    throw new Error('bad scaleMode: ' + scaleMode);
}

var AutoSize = (function () {
    function AutoSize(stage, opts) {
        var _this = this;
        this.stage = stage;

        opts = opts || {};
        this.centerView = !!opts.center;
        this.scaleMode = opts.scale || 'none';
        assertMode(this.scaleMode);

        stage.canvas.style.position = 'absolute';

        this.update = function (event) {
            var viewPort = browser.getViewport();
            if (_this.scaleMode === 'fit') {
                _this.scaleFit(viewPort);
            } else if (_this.scaleMode === 'max') {
                _this.scaleAspect(viewPort);
            } else {
                _this.stage.renderer.resize();
            }

            if (_this.centerView || _this.scaleMode === 'max') {
                _this.moveScreenCenter(viewPort);
            } else {
                _this.moveScreenTo(0, 0);
            }
        };

        this.setMode(this.scaleMode, this.centerView);
    }
    AutoSize.prototype.scale = function (mode) {
        this.setMode(mode, this.centerView);
    };

    AutoSize.prototype.center = function (center) {
        if (typeof center === "undefined") { center = true; }
        this.setMode(this.scaleMode, center);
    };

    AutoSize.prototype.resize = function () {
        this.update();
    };

    AutoSize.prototype.stop = function () {
        this.unlisten();
    };

    AutoSize.prototype.scaleTo = function (width, height) {
        this.scaleMode = 'none';
        this.stage.canvas.width = width;
        this.stage.canvas.height = height;
        this.stage.renderer.resize();
    };

    AutoSize.prototype.scaleFit = function (viewPort) {
        this.stage.canvas.width = viewPort.width;
        this.stage.canvas.height = viewPort.height;
        this.stage.renderer.resize();
    };

    AutoSize.prototype.scaleAspect = function (viewPort) {
        var ratio = Math.min(viewPort.width / this.stage.width, viewPort.height / this.stage.height);
        this.stage.canvas.width = Math.floor(this.stage.width * ratio);
        this.stage.canvas.height = Math.floor(this.stage.height * ratio);
        this.stage.renderer.resize();
    };

    AutoSize.prototype.moveScreenTo = function (x, y) {
        this.stage.canvas.style.left = x + 'px';
        this.stage.canvas.style.top = y + 'px';
    };

    AutoSize.prototype.moveScreenCenter = function (viewPort) {
        this.moveScreenTo(Math.floor((viewPort.width - this.stage.canvas.width) / 2), Math.floor((viewPort.height - this.stage.canvas.height) / 2));
    };

    AutoSize.prototype.listen = function () {
        this.unlisten();
        if (this.centerView || this.scaleMode === 'fit') {
            window.addEventListener('resize', this.update);
        }
    };

    AutoSize.prototype.unlisten = function () {
        window.removeEventListener('resize', this.update);
    };

    AutoSize.prototype.setMode = function (mode, center) {
        assertMode(mode);

        this.scaleMode = mode;

        var multi = parseInt(this.scaleMode, 10);
        if (!isNaN(multi)) {
            this.scaleMode = multi;
            this.scaleTo(Math.floor(this.stage.width * multi), Math.floor(this.stage.height * multi));
            this.unlisten();
        }
        if (this.scaleMode === 'fit') {
            this.moveScreenTo(0, 0);
        }
        if (center || this.scaleMode === 'fit' || this.scaleMode === 'max') {
            this.listen();
        }
        this.update();
    };
    return AutoSize;
})();
exports.AutoSize = AutoSize;
//# sourceMappingURL=autosize.js.map

},{"./browser":10}],10:[function(_dereq_,module,exports){
'use strict';
function getViewport() {
    var e = window;
    var a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { width: e[a + 'Width'], height: e[a + 'Height'] };
}
exports.getViewport = getViewport;
//# sourceMappingURL=browser.js.map

},{}],11:[function(_dereq_,module,exports){
'use strict';
var RGBA = _dereq_('./RGBA');
var HSV = _dereq_('./HSV');

function hsv2rgb(hsv) {
    var r, g, b;
    var i;
    var f, p, q, t;
    var h = hsv.h;
    var s = hsv.s;
    var v = hsv.v;

    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    s /= 100;
    v /= 100;

    if (s === 0) {
        r = g = b = v;
        return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    }

    h /= 60;
    i = Math.floor(h);
    f = h - i;
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch (i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;

        case 1:
            r = q;
            g = v;
            b = p;
            break;

        case 2:
            r = p;
            g = v;
            b = t;
            break;

        case 3:
            r = p;
            g = q;
            b = v;
            break;

        case 4:
            r = t;
            g = p;
            b = v;
            break;

        default:
            r = v;
            g = p;
            b = q;
    }

    return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}
exports.hsv2rgb = hsv2rgb;

function rgb2hsv(rgb) {
    var rr, gg, bb, r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255, h, s, v = Math.max(r, g, b), diff = v - Math.min(r, g, b), diffc = function (c) {
        return (v - c) / 6 / diff + 1 / 2;
    };

    if (diff === 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        } else if (g === v) {
            h = (1 / 3) + rr - bb;
        } else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }
    return new HSV(Math.round(h * 360), Math.round(s * 100), Math.round(v * 100));
}
exports.rgb2hsv = rgb2hsv;
//# sourceMappingURL=color.js.map

},{"./HSV":5,"./RGBA":6}],12:[function(_dereq_,module,exports){
'use strict';
function interval(callback, fps) {
    var intervalID = 0;
    var frame = 0;
    var prev = performance.now();

    function step() {
        if (intervalID) {
            frame++;
            var now = performance.now();
            callback(frame, now - prev);
            prev = now;
        }
    }

    var that = {};
    that.start = function () {
        if (intervalID) {
            clearInterval(intervalID);
        }
        intervalID = setInterval(step, 1000 / fps);
    };
    that.step = function () {
        step();
    };
    that.stop = function () {
        if (intervalID) {
            clearInterval(intervalID);
            intervalID = 0;
        }
    };
    that.isRunning = function () {
        return !!intervalID;
    };
    return that;
}
exports.interval = interval;

function request(callback) {
    var running = false;
    var frame = 0;
    var prev = performance.now();

    function step() {
        if (running) {
            frame++;
            var now = performance.now();
            callback(frame, now - prev);
            prev = now;
            requestAnimationFrame(step);
        }
    }

    var requestID;
    var that = {};
    that.start = function () {
        if (!running) {
            running = true;
            requestID = requestAnimationFrame(step);
        }
    };
    that.step = function () {
        step();
    };
    that.stop = function () {
        if (running) {
            running = false;
            cancelAnimationFrame(requestID);
        }
    };
    that.isRunning = function () {
        return running;
    };
    return that;
}
exports.request = request;
//# sourceMappingURL=ticker.js.map

},{}],13:[function(_dereq_,module,exports){
'use strict';
function rand(max) {
    return Math.floor(Math.random() * max);
}
exports.rand = rand;

function clamp(value, min, max) {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}
exports.clamp = clamp;
//# sourceMappingURL=util.js.map

},{}],14:[function(_dereq_,module,exports){
var PerlinNoise = (function () {
    function PerlinNoise() {
        this.permutation = [
            151, 160, 137, 91, 90, 15,
            131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
            190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
            88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
            77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
            102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
            135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
            5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
            223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
            129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
            251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
            49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
            138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
        ];
        this.p = new Array(512);

        for (var i = 0; i < 256; i++) {
            this.p[256 + i] = this.p[i] = this.permutation[i];
        }
    }
    PerlinNoise.prototype.noise = function (x, y, z) {
        var X = Math.floor(x) & 255;
        var Y = Math.floor(y) & 255;
        var Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        var u = this.fade(x);
        var v = this.fade(y);
        var w = this.fade(z);

        var A = this.p[X] + Y;
        var AA = this.p[A] + Z;
        var AB = this.p[A + 1] + Z;

        var B = this.p[X + 1] + Y;
        var BA = this.p[B] + Z;
        var BB = this.p[B + 1] + Z;

        return this.scale(this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)), this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))), this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)), this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1)))));
    };

    PerlinNoise.prototype.fade = function (t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    };

    PerlinNoise.prototype.lerp = function (t, a, b) {
        return a + t * (b - a);
    };

    PerlinNoise.prototype.grad = function (hash, x, y, z) {
        var h = hash & 15;
        var u = h < 8 ? x : y;
        var v = h < 4 ? y : h == 12 || h == 14 ? x : z;
        return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
    };

    PerlinNoise.prototype.scale = function (n) {
        return (1 + n) / 2;
    };
    return PerlinNoise;
})();

module.exports = PerlinNoise;
//# sourceMappingURL=PerlinNoise.js.map

},{}],15:[function(_dereq_,module,exports){
'use strict';
var Font = _dereq_('../core/Font');

var font = new Font('micro', 4, {
    '0': [
        '111',
        '101',
        '101',
        '111'
    ],
    '1': [
        '01',
        '11',
        '01',
        '01'
    ],
    '2': [
        '110',
        '001',
        '010',
        '111'
    ],
    '3': [
        '111',
        '011',
        '001',
        '111'
    ],
    '4': [
        '100',
        '101',
        '111',
        '010'
    ],
    '5': [
        '111',
        '100',
        '111',
        '011'
    ],
    '6': [
        '100',
        '111',
        '101',
        '111'
    ],
    '7': [
        '111',
        '001',
        '010',
        '010'
    ],
    '8': [
        '111',
        '101',
        '111',
        '111'
    ],
    '9': [
        '111',
        '101',
        '111',
        '001'
    ],
    'A': [
        '111',
        '101',
        '111',
        '101'
    ],
    'B': [
        '100',
        '111',
        '101',
        '111'
    ],
    'C': [
        '111',
        '100',
        '100',
        '111'
    ],
    'D': [
        '110',
        '101',
        '101',
        '110'
    ],
    'E': [
        '111',
        '110',
        '100',
        '111'
    ],
    'F': [
        '111',
        '100',
        '110',
        '100'
    ],
    'G': [
        '111',
        '100',
        '101',
        '111'
    ],
    'H': [
        '101',
        '101',
        '111',
        '101'
    ],
    'I': [
        '1',
        '1',
        '1',
        '1'
    ],
    'J': [
        '001',
        '001',
        '101',
        '111'
    ],
    'K': [
        '101',
        '110',
        '101',
        '101'
    ],
    'L': [
        '10',
        '10',
        '10',
        '11'
    ],
    'M': [
        '11011',
        '11011',
        '10101',
        '10001'
    ],
    'N': [
        '1001',
        '1101',
        '1011',
        '1001'
    ],
    'O': [
        '111',
        '101',
        '101',
        '111'
    ],
    'P': [
        '111',
        '101',
        '111',
        '100'
    ],
    'Q': [
        '111',
        '101',
        '111',
        '001'
    ],
    'R': [
        '111',
        '101',
        '100',
        '100'
    ],
    'S': [
        '111',
        '100',
        '111',
        '011'
    ],
    'T': [
        '111',
        '010',
        '010',
        '010'
    ],
    'U': [
        '101',
        '101',
        '101',
        '111'
    ],
    'V': [
        '101',
        '101',
        '101',
        '010'
    ],
    'W': [
        '10001',
        '10001',
        '10101',
        '01110'
    ],
    'X': [
        '101',
        '010',
        '010',
        '101'
    ],
    'Y': [
        '101',
        '101',
        '010',
        '010'
    ],
    'Z': [
        '111',
        '011',
        '100',
        '111'
    ],
    ' ': [
        '0',
        '0',
        '0',
        '0'
    ],
    '!': [
        '1',
        '1',
        '0',
        '1'
    ],
    '?': [
        '111',
        '001',
        '000',
        '010'
    ],
    '.': [
        '0',
        '0',
        '0',
        '1'
    ],
    ',': [
        '0',
        '0',
        '1',
        '1'
    ],
    '+': [
        '000',
        '010',
        '111',
        '010'
    ],
    '-': [
        '00',
        '00',
        '11',
        '00'
    ],
    '=': [
        '000',
        '111',
        '000',
        '111'
    ],
    '*': [
        '000',
        '101',
        '010',
        '101'
    ],
    '_': [
        '000',
        '000',
        '000',
        '111'
    ],
    '[': [
        '11',
        '10',
        '10',
        '11'
    ],
    ']': [
        '11',
        '01',
        '01',
        '11'
    ],
    '(': [
        '01',
        '10',
        '10',
        '01'
    ],
    ')': [
        '10',
        '01',
        '01',
        '10'
    ],
    '<': [
        '00',
        '01',
        '10',
        '01'
    ],
    '>': [
        '00',
        '10',
        '01',
        '10'
    ],
    '\'': [
        '1',
        '1',
        '0',
        '0'
    ],
    '"': [
        '101',
        '101',
        '000',
        '000'
    ],
    '`': [
        '10',
        '01',
        '00',
        '00'
    ],
    '~': [
        '000',
        '110',
        '011',
        '000'
    ],
    '/': [
        '001',
        '010',
        '010',
        '100'
    ],
    '\\': [
        '100',
        '010',
        '010',
        '001'
    ]
});

module.exports = font;
//# sourceMappingURL=Micro.js.map

},{"../core/Font":4}],16:[function(_dereq_,module,exports){
'use strict';
var Stage = _dereq_('./core/Stage');
exports.Stage = Stage;

var Bitmap = _dereq_('./core/Bitmap');
exports.Bitmap = Bitmap;
var FPS = _dereq_('./core/FPS');
exports.FPS = FPS;

var RGBA = _dereq_('./core/RGBA');
var HSV = _dereq_('./core/HSV');

var PerlinNoise = _dereq_('./extra/PerlinNoise');
exports.PerlinNoise = PerlinNoise;

var loader = _dereq_('./loaders/loader');
exports.loader = loader;

var _util = _dereq_('./core/util');
var rand = _util.rand;
exports.rand = rand;

var _color = _dereq_('./core/color');
var rgb2hsv = _color.rgb2hsv;
exports.rgb2hsv = rgb2hsv;
var hsv2rgb = _color.hsv2rgb;
exports.hsv2rgb = hsv2rgb;

var ticker = _dereq_('./core/ticker');
exports.ticker = ticker;

function rgb(r, g, b) {
    return new RGBA(r, g, b);
}
exports.rgb = rgb;

var hsvTmp = new HSV();
function hsv(h, s, v) {
    hsvTmp.h = h;
    hsvTmp.s = s;
    hsvTmp.v = v;
    return exports.hsv2rgb(hsvTmp);
}
exports.hsv = hsv;

[
    exports.loader,
    exports.PerlinNoise,
    _util,
    _color,
    exports.ticker,
    RGBA,
    HSV,
    exports.Bitmap,
    exports.FPS,
    exports.Stage
];
//# sourceMappingURL=index.js.map

},{"./core/Bitmap":1,"./core/FPS":3,"./core/HSV":5,"./core/RGBA":6,"./core/Stage":8,"./core/color":11,"./core/ticker":12,"./core/util":13,"./extra/PerlinNoise":14,"./loaders/loader":24}],17:[function(_dereq_,module,exports){
'use strict';
var Bitmap = _dereq_('../core/Bitmap');

var ImageDataLoader = _dereq_('./ImageDataLoader');

var BitmapLoader = (function () {
    function BitmapLoader(url, useAlpha) {
        if (typeof useAlpha === "undefined") { useAlpha = false; }
        this.url = url;
        this.useAlpha = useAlpha;
    }
    BitmapLoader.prototype.load = function (callback) {
        var _this = this;
        new ImageDataLoader(this.url).load(function (err, image) {
            if (err) {
                callback(err, null);
                return;
            }

            if (_this.useAlpha) {
                callback(null, new Bitmap(image.width, image.height, true, image.data.buffer));
            } else {
                var bitmap = new Bitmap(image.width, image.height, false);
                var data = image.data;
                var width = image.width;

                for (var iy = 0; iy < image.height; iy++) {
                    for (var ix = 0; ix < width; ix++) {
                        var read = (iy * width + ix) * 4;
                        var write = (iy * width + ix) * 3;

                        bitmap.data[write] = data[read];
                        bitmap.data[write + 1] = data[read + 1];
                        bitmap.data[write + 2] = data[read + 2];
                    }
                }
                callback(null, bitmap);
            }
        });
    };
    return BitmapLoader;
})();

module.exports = BitmapLoader;
//# sourceMappingURL=BitmapLoader.js.map

},{"../core/Bitmap":1,"./ImageDataLoader":18}],18:[function(_dereq_,module,exports){
'use strict';
var ImageDataLoader = (function () {
    function ImageDataLoader(url) {
        this.url = url;
    }
    ImageDataLoader.prototype.load = function (callback) {
        var _this = this;
        var image = document.createElement('img');
        image.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            callback(null, ctx.getImageData(0, 0, image.width, image.height));

            image.onload = null;
            image.onerror = null;
        };
        image.onerror = function () {
            callback(new Error('cannot load ' + _this.url), null);

            image.onload = null;
            image.onerror = null;
        };

        image.src = this.url;
    };
    return ImageDataLoader;
})();

module.exports = ImageDataLoader;
//# sourceMappingURL=ImageDataLoader.js.map

},{}],19:[function(_dereq_,module,exports){
'use strict';
var TextLoader = _dereq_('./TextLoader');

var JSONLoader = (function () {
    function JSONLoader(url) {
        this.url = url;
    }
    JSONLoader.prototype.load = function (callback) {
        new TextLoader(this.url).load(function (err, text) {
            if (err) {
                callback(err, null);
                return;
            }
            try  {
                var obj = JSON.parse(text);
            } catch (e) {
                callback(e, null);
            }
            callback(null, obj);
        });
    };
    return JSONLoader;
})();

module.exports = JSONLoader;
//# sourceMappingURL=JSONLoader.js.map

},{"./TextLoader":23}],20:[function(_dereq_,module,exports){
'use strict';
var MultiLoader = (function () {
    function MultiLoader(loaders) {
        var _this = this;
        this.queued = [];
        if (loaders) {
            loaders.forEach(function (loader) {
                _this.queued.push(loader);
            });
        }
    }
    MultiLoader.prototype.load = function (callback) {
        var _this = this;
        var errored = false;
        var results = new Array(this.queued.length);

        this.queued.forEach(function (loader, index) {
            loader.load(function (err, res) {
                if (errored) {
                    return;
                }
                if (err) {
                    console.log(loader.url);
                    console.error(err);
                    callback(err, null);
                    errored = true;
                    return;
                }
                results[index] = res;
                _this.queued[index] = null;

                if (_this.queued.every(function (loader) {
                    return !loader;
                })) {
                    callback(err, results);
                    _this.queued = null;
                }
            });
        });
    };
    return MultiLoader;
})();

module.exports = MultiLoader;
//# sourceMappingURL=MultiLoader.js.map

},{}],21:[function(_dereq_,module,exports){
'use strict';
var JSONLoader = _dereq_('./JSONLoader');
var SpriteSheetLoader = _dereq_('./SpriteSheetLoader');

var urlExp = /^(.*?)(\/?)([^\/]+?)$/;

function getURL(main, append) {
    urlExp.lastIndex = 0;
    var match = urlExp.exec(main);
    return match[1] + match[2] + append;
}

var SpriteSheetJSONLoader = (function () {
    function SpriteSheetJSONLoader(url, useAlpha) {
        if (typeof useAlpha === "undefined") { useAlpha = false; }
        this.url = url;
        this.useAlpha = useAlpha;
    }
    SpriteSheetJSONLoader.prototype.load = function (callback) {
        var _this = this;
        new JSONLoader(this.url).load(function (err, json) {
            if (err) {
                callback(err, null);
                return;
            }
            console.log(json);
            new SpriteSheetLoader(getURL(_this.url, json.image), json, _this.useAlpha).load(callback);
        });
    };
    return SpriteSheetJSONLoader;
})();

module.exports = SpriteSheetJSONLoader;
//# sourceMappingURL=SpriteSheetJSONLoader.js.map

},{"./JSONLoader":19,"./SpriteSheetLoader":22}],22:[function(_dereq_,module,exports){
'use strict';
var Bitmap = _dereq_('../core/Bitmap');
var SpriteSheet = _dereq_('../core/SpriteSheet');

var ImageDataLoader = _dereq_('./ImageDataLoader');

var SpriteSheetLoader = (function () {
    function SpriteSheetLoader(url, opts, useAlpha) {
        if (typeof useAlpha === "undefined") { useAlpha = false; }
        this.url = url;
        this.opts = opts;
        this.useAlpha = useAlpha;
    }
    SpriteSheetLoader.prototype.load = function (callback) {
        var _this = this;
        new ImageDataLoader(this.url).load(function (err, image) {
            if (err) {
                callback(err, null);
                return;
            }

            var outerMargin = (_this.opts.outerMargin || 0);
            var innerMargin = (_this.opts.innerMargin || 0);

            var sheet = new SpriteSheet(_this.opts.spritesX, _this.opts.spritesY);

            for (var iy = 0; iy < _this.opts.spritesY; iy++) {
                for (var ix = 0; ix < _this.opts.spritesX; ix++) {
                    var x = outerMargin + ix * (_this.opts.sizeX + innerMargin);
                    var y = outerMargin + iy * (_this.opts.sizeY + innerMargin);
                    sheet.addSprite(Bitmap.clipFromData(image.data, image.width, image.height, 4, x, y, _this.opts.sizeX, _this.opts.sizeY, _this.useAlpha));
                }
            }
            callback(null, sheet);
        });
    };
    return SpriteSheetLoader;
})();

module.exports = SpriteSheetLoader;
//# sourceMappingURL=SpriteSheetLoader.js.map

},{"../core/Bitmap":1,"../core/SpriteSheet":7,"./ImageDataLoader":18}],23:[function(_dereq_,module,exports){
'use strict';
function getXHR() {
    if (XMLHttpRequest) {
        return new XMLHttpRequest();
    }
    try  {
        return new ActiveXObject('Msxml2.XMLHTTP.6.0');
    } catch (e) {
    }
    try  {
        return new ActiveXObject('Msxml2.XMLHTTP.3.0');
    } catch (e) {
    }
    try  {
        return new ActiveXObject('Microsoft.XMLHTTP');
    } catch (e) {
    }
    throw new Error('This browser does not support XMLHttpRequest.');
}

var TextLoader = (function () {
    function TextLoader(url) {
        this.url = url;
    }
    TextLoader.prototype.load = function (callback) {
        try  {
            var xhr = getXHR();
        } catch (e) {
            callback(e, null);
            return;
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                callback(null, xhr.responseText);
            }
        };

        xhr.open('GET', this.url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send(null);
    };
    return TextLoader;
})();

module.exports = TextLoader;
//# sourceMappingURL=TextLoader.js.map

},{}],24:[function(_dereq_,module,exports){
var ImageDataLoader = _dereq_('./ImageDataLoader');
exports.ImageDataLoader = ImageDataLoader;
var BitmapLoader = _dereq_('./BitmapLoader');
exports.BitmapLoader = BitmapLoader;
var TextLoader = _dereq_('./TextLoader');
exports.TextLoader = TextLoader;
var JSONLoader = _dereq_('./JSONLoader');
exports.JSONLoader = JSONLoader;
var SpriteSheetLoader = _dereq_('./SpriteSheetLoader');
exports.SpriteSheetLoader = SpriteSheetLoader;
var SpriteSheetJSONLoader = _dereq_('./SpriteSheetJSONLoader');
exports.SpriteSheetJSONLoader = SpriteSheetJSONLoader;
var MultiLoader = _dereq_('./MultiLoader');
exports.MultiLoader = MultiLoader;

[
    exports.MultiLoader,
    exports.ImageDataLoader,
    exports.BitmapLoader,
    exports.TextLoader,
    exports.JSONLoader,
    exports.SpriteSheetLoader,
    exports.SpriteSheetJSONLoader
];
//# sourceMappingURL=loader.js.map

},{"./BitmapLoader":17,"./ImageDataLoader":18,"./JSONLoader":19,"./MultiLoader":20,"./SpriteSheetJSONLoader":21,"./SpriteSheetLoader":22,"./TextLoader":23}],25:[function(_dereq_,module,exports){
'use strict';
function clearAlpha(data) {
    var lim = data.length;
    for (var i = 3; i < lim; i++) {
        data[i] = 255;
    }
}

var CanvasRender = (function () {
    function CanvasRender(bitmap, canvas) {
        this.canvas = canvas;

        this.px = bitmap.data;
        this.width = bitmap.width;
        this.height = bitmap.height;
        this.channels = bitmap.useAlpha ? 4 : 3;

        this.ctx = this.canvas.getContext('2d');

        this.output = this.ctx.createImageData(this.canvas.width, this.canvas.height);

        clearAlpha(this.output.data);

        this.ctx.putImageData(this.output, 0, 0);
    }
    CanvasRender.prototype.resize = function () {
        if (this.output.width !== this.canvas.width || this.output.height !== this.canvas.height) {
            this.output = this.ctx.createImageData(this.canvas.width, this.canvas.height);

            clearAlpha(this.output.data);
        }
    };

    CanvasRender.prototype.update = function () {
        var data = this.output.data;
        var width = this.output.width;
        var height = this.output.height;

        var fx = this.width / width;
        var fy = this.height / height;

        for (var iy = 0; iy < height; iy++) {
            for (var ix = 0; ix < width; ix++) {
                var x = Math.floor(ix * fx);
                var y = Math.floor(iy * fy);
                var read = (x + y * this.width) * this.channels;
                var write = (ix + iy * width) * 4;

                data[write] = this.px[read];
                data[write + 1] = this.px[read + 1];
                data[write + 2] = this.px[read + 2];
            }
        }
        this.ctx.putImageData(this.output, 0, 0);
    };

    CanvasRender.prototype.destruct = function () {
        this.px = null;
        this.ctx = null;
        this.canvas = null;
        this.output = null;
    };
    return CanvasRender;
})();

module.exports = CanvasRender;
//# sourceMappingURL=CanvasRenderer.js.map

},{}],26:[function(_dereq_,module,exports){
'use strict';
var vertexShaderSource = [
    'attribute vec2 a_position;',
    'attribute vec2 a_texCoord;',
    'varying vec2 v_texCoord;',
    'void main() {',
    '    gl_Position = vec4(a_position, 0, 1);',
    '    v_texCoord = a_texCoord;',
    '}'
].join('\n');

var fragmentShaderSource = [
    'precision mediump float;',
    'uniform sampler2D u_image;',
    'varying vec2 v_texCoord;',
    'void main() {',
    '    gl_FragColor = texture2D(u_image, v_texCoord);',
    '}'
].join('\n');

function loadShader(gl, shaderSource, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        throw new Error('error compiling shader "' + shader + '":' + gl.getShaderInfoLog(shader));
    }
    return shader;
}

var WebGLRender = (function () {
    function WebGLRender(bitmap, canvas) {
        this.canvas = canvas;
        this.width = bitmap.width;
        this.height = bitmap.height;

        this.px = new Uint8Array(bitmap.buffer);

        if (!window.WebGLRenderingContext) {
            throw new Error('browser does not support WegGL');
        }

        var glOpts = { alpha: false };

        var gl = this.gl = this.canvas.getContext('webgl', glOpts) || this.canvas.getContext('experimental-webgl', glOpts);
        if (!gl) {
            throw new Error('could not create WebGL context');
        }

        var program = gl.createProgram();

        gl.attachShader(program, loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER));
        gl.attachShader(program, loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER));
        gl.linkProgram(program);

        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            throw new Error(('error in program linking:' + gl.getProgramInfoLog(program)));
        }
        gl.useProgram(program);

        this.positionLocation = gl.getAttribLocation(program, 'a_position');
        this.texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0
        ]), gl.STATIC_DRAW);

        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);

        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 1.0,
            1.0, 1.0,
            0.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            1.0, 0.0
        ]), gl.STATIC_DRAW);

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.colorMask(true, true, true, false);

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    WebGLRender.prototype.resize = function () {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    };

    WebGLRender.prototype.update = function () {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.width, this.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.px);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    };

    WebGLRender.prototype.destruct = function () {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl = null;
        this.px = null;
        this.canvas = null;
    };
    return WebGLRender;
})();

module.exports = WebGLRender;
//# sourceMappingURL=WebGLRenderer.js.map

},{}]},{},[16])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS90cmF2aXMvYnVpbGQvQmFydHZkcy9sb3Jlei9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvY29yZS9CaXRtYXAuanMiLCIvaG9tZS90cmF2aXMvYnVpbGQvQmFydHZkcy9sb3Jlei9idWlsZC9jb3JlL0NoYXIuanMiLCIvaG9tZS90cmF2aXMvYnVpbGQvQmFydHZkcy9sb3Jlei9idWlsZC9jb3JlL0ZQUy5qcyIsIi9ob21lL3RyYXZpcy9idWlsZC9CYXJ0dmRzL2xvcmV6L2J1aWxkL2NvcmUvRm9udC5qcyIsIi9ob21lL3RyYXZpcy9idWlsZC9CYXJ0dmRzL2xvcmV6L2J1aWxkL2NvcmUvSFNWLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvY29yZS9SR0JBLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvY29yZS9TcHJpdGVTaGVldC5qcyIsIi9ob21lL3RyYXZpcy9idWlsZC9CYXJ0dmRzL2xvcmV6L2J1aWxkL2NvcmUvU3RhZ2UuanMiLCIvaG9tZS90cmF2aXMvYnVpbGQvQmFydHZkcy9sb3Jlei9idWlsZC9jb3JlL2F1dG9zaXplLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvY29yZS9icm93c2VyLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvY29yZS9jb2xvci5qcyIsIi9ob21lL3RyYXZpcy9idWlsZC9CYXJ0dmRzL2xvcmV6L2J1aWxkL2NvcmUvdGlja2VyLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvY29yZS91dGlsLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvZXh0cmEvUGVybGluTm9pc2UuanMiLCIvaG9tZS90cmF2aXMvYnVpbGQvQmFydHZkcy9sb3Jlei9idWlsZC9mb250L01pY3JvLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvaW5kZXguanMiLCIvaG9tZS90cmF2aXMvYnVpbGQvQmFydHZkcy9sb3Jlei9idWlsZC9sb2FkZXJzL0JpdG1hcExvYWRlci5qcyIsIi9ob21lL3RyYXZpcy9idWlsZC9CYXJ0dmRzL2xvcmV6L2J1aWxkL2xvYWRlcnMvSW1hZ2VEYXRhTG9hZGVyLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvbG9hZGVycy9KU09OTG9hZGVyLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvbG9hZGVycy9NdWx0aUxvYWRlci5qcyIsIi9ob21lL3RyYXZpcy9idWlsZC9CYXJ0dmRzL2xvcmV6L2J1aWxkL2xvYWRlcnMvU3ByaXRlU2hlZXRKU09OTG9hZGVyLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvbG9hZGVycy9TcHJpdGVTaGVldExvYWRlci5qcyIsIi9ob21lL3RyYXZpcy9idWlsZC9CYXJ0dmRzL2xvcmV6L2J1aWxkL2xvYWRlcnMvVGV4dExvYWRlci5qcyIsIi9ob21lL3RyYXZpcy9idWlsZC9CYXJ0dmRzL2xvcmV6L2J1aWxkL2xvYWRlcnMvbG9hZGVyLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvcmVuZGVyL0NhbnZhc1JlbmRlcmVyLmpzIiwiL2hvbWUvdHJhdmlzL2J1aWxkL0JhcnR2ZHMvbG9yZXovYnVpbGQvcmVuZGVyL1dlYkdMUmVuZGVyZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBSR0JBID0gcmVxdWlyZSgnLi9SR0JBJyk7XG5cbnZhciBtaWNyb0ZvbnQgPSByZXF1aXJlKCcuLi9mb250L01pY3JvJyk7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBjbGFtcCA9IHV0aWwuY2xhbXA7XG5cbnZhciBhbHBoYSA9IG5ldyBSR0JBKDAsIDAsIDAsIDApO1xudmFyIGJsYWNrID0gbmV3IFJHQkEoMCwgMCwgMCk7XG52YXIgbWFnZW50YSA9IG5ldyBSR0JBKDI1NSwgMCwgMjU1KTtcblxudmFyIEJpdG1hcCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQml0bWFwKHdpZHRoLCBoZWlnaHQsIHVzZUFscGhhLCBidWZmZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB1c2VBbHBoYSA9PT0gXCJ1bmRlZmluZWRcIikgeyB1c2VBbHBoYSA9IGZhbHNlOyB9XG4gICAgICAgIGlmICh0eXBlb2YgYnVmZmVyID09PSBcInVuZGVmaW5lZFwiKSB7IGJ1ZmZlciA9IG51bGw7IH1cbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy51c2VBbHBoYSA9IHVzZUFscGhhO1xuICAgICAgICB0aGlzLmNoYW5uZWxzID0gKHVzZUFscGhhID8gNCA6IDMpO1xuXG4gICAgICAgIGlmIChidWZmZXIpIHtcbiAgICAgICAgICAgIHZhciB0b3RhbCA9ICh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiB0aGlzLmNoYW5uZWxzKTtcbiAgICAgICAgICAgIGlmIChidWZmZXIuYnl0ZUxlbmd0aCAhPT0gdG90YWwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCByYXcgZGF0YSBkaW1lbnNpb25zOyBleHBlY3RlZCAnICsgdG90YWwgKyAnLCByZWNlaXZlZCAnICsgYnVmZmVyLmJ5dGVMZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkodGhpcy5idWZmZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVzZXREYXRhKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQml0bWFwLnByb3RvdHlwZS5fcmVzZXREYXRhID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcih0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiB0aGlzLmNoYW5uZWxzKTtcblxuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkodGhpcy5idWZmZXIpO1xuICAgIH07XG5cbiAgICBCaXRtYXAucHJvdG90eXBlLnJlc2l6ZVRvID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYgKHdpZHRoID09PSB0aGlzLndpZHRoICYmIGhlaWdodCA9PT0gdGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLl9yZXNldERhdGEoKTtcbiAgICB9O1xuXG4gICAgQml0bWFwLnByb3RvdHlwZS5zZXRQaXhlbCA9IGZ1bmN0aW9uICh4LCB5LCBjb2wpIHtcbiAgICAgICAgeCA9IE1hdGguZmxvb3IoeCk7XG4gICAgICAgIHkgPSBNYXRoLmZsb29yKHkpO1xuXG4gICAgICAgIGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMud2lkdGggfHwgeSA+PSB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwID0gKHggKyB5ICogdGhpcy53aWR0aCkgKiB0aGlzLmNoYW5uZWxzO1xuICAgICAgICB0aGlzLmRhdGFbcF0gPSBjb2wucjtcbiAgICAgICAgdGhpcy5kYXRhW3AgKyAxXSA9IGNvbC5nO1xuICAgICAgICB0aGlzLmRhdGFbcCArIDJdID0gY29sLmI7XG4gICAgfTtcblxuICAgIEJpdG1hcC5wcm90b3R5cGUuZ2V0UGl4ZWwgPSBmdW5jdGlvbiAoeCwgeSwgY29sKSB7XG4gICAgICAgIHggPSBNYXRoLmZsb29yKHgpO1xuICAgICAgICB5ID0gTWF0aC5mbG9vcih5KTtcblxuICAgICAgICBpZiAoeCA8IDAgfHwgeSA8IDAgfHwgeCA+PSB0aGlzLndpZHRoIHx8IHkgPj0gdGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbCA9IChjb2wgfHwgbmV3IFJHQkEoKSk7XG5cbiAgICAgICAgdmFyIHAgPSAoeCArIHkgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XG4gICAgICAgIGNvbC5yID0gdGhpcy5kYXRhW3BdO1xuICAgICAgICBjb2wuZyA9IHRoaXMuZGF0YVtwICsgMV07XG4gICAgICAgIGNvbC5iID0gdGhpcy5kYXRhW3AgKyAyXTtcbiAgICAgICAgcmV0dXJuIGNvbDtcbiAgICB9O1xuXG4gICAgQml0bWFwLnByb3RvdHlwZS5maWxsUmVjdCA9IGZ1bmN0aW9uICh4LCB5LCB3LCBoLCBjb2wpIHtcbiAgICAgICAgeCA9IE1hdGguZmxvb3IoeCk7XG4gICAgICAgIHkgPSBNYXRoLmZsb29yKHkpO1xuICAgICAgICB3ID0gTWF0aC5mbG9vcih3KTtcbiAgICAgICAgaCA9IE1hdGguZmxvb3IoaCk7XG5cbiAgICAgICAgZm9yICh2YXIgaXkgPSB5OyBpeSA8IHkgKyBoOyBpeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpeCA9IHg7IGl4IDwgeCArIHc7IGl4KyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXggPCAwIHx8IGl5IDwgMCB8fCBpeCA+PSB0aGlzLndpZHRoIHx8IGl5ID49IHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcCA9IChpeCArIGl5ICogdGhpcy53aWR0aCkgKiB0aGlzLmNoYW5uZWxzO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtwXSA9IGNvbC5yO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMV0gPSBjb2wuZztcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbcCArIDJdID0gY29sLmI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQml0bWFwLnByb3RvdHlwZS5kcmF3TGluZUggPSBmdW5jdGlvbiAoeCwgeSwgc2l6ZSwgY29sKSB7XG4gICAgICAgIHZhciByaWdodCA9IGNsYW1wKE1hdGguZmxvb3IoeCArIHNpemUpLCAwLCB0aGlzLndpZHRoKTtcbiAgICAgICAgeCA9IGNsYW1wKE1hdGguZmxvb3IoeCksIDAsIHRoaXMud2lkdGgpO1xuICAgICAgICB5ID0gY2xhbXAoTWF0aC5mbG9vcih5KSwgMCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIGZvciAoOyB4IDwgcmlnaHQ7IHgrKykge1xuICAgICAgICAgICAgdmFyIHAgPSAoeCArIHkgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XG4gICAgICAgICAgICB0aGlzLmRhdGFbcF0gPSBjb2wucjtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMV0gPSBjb2wuZztcbiAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMl0gPSBjb2wuYjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBCaXRtYXAucHJvdG90eXBlLmRyYXdMaW5lViA9IGZ1bmN0aW9uICh4LCB5LCBzaXplLCBjb2wpIHtcbiAgICAgICAgdmFyIGJvdHRvbSA9IGNsYW1wKE1hdGguZmxvb3IoeSArIHNpemUpLCAwLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIHggPSBjbGFtcChNYXRoLmZsb29yKHgpLCAwLCB0aGlzLndpZHRoKTtcbiAgICAgICAgeSA9IGNsYW1wKE1hdGguZmxvb3IoeSksIDAsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICBmb3IgKDsgeSA8IGJvdHRvbTsgeSsrKSB7XG4gICAgICAgICAgICB2YXIgcCA9ICh4ICsgeSAqIHRoaXMud2lkdGgpICogdGhpcy5jaGFubmVscztcbiAgICAgICAgICAgIHRoaXMuZGF0YVtwXSA9IGNvbC5yO1xuICAgICAgICAgICAgdGhpcy5kYXRhW3AgKyAxXSA9IGNvbC5nO1xuICAgICAgICAgICAgdGhpcy5kYXRhW3AgKyAyXSA9IGNvbC5iO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEJpdG1hcC5wcm90b3R5cGUuZHJhd1JlY3QgPSBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodCwgY29sKSB7XG4gICAgICAgIHggPSBNYXRoLmZsb29yKHgpO1xuICAgICAgICB5ID0gTWF0aC5mbG9vcih5KTtcbiAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKHdpZHRoKTtcbiAgICAgICAgaGVpZ2h0ID0gTWF0aC5mbG9vcihoZWlnaHQpO1xuXG4gICAgICAgIHRoaXMuZHJhd0xpbmVIKHgsIHksIHdpZHRoLCBjb2wpO1xuICAgICAgICB0aGlzLmRyYXdMaW5lSCh4LCB5ICsgaGVpZ2h0IC0gMSwgd2lkdGgsIGNvbCk7XG4gICAgICAgIHRoaXMuZHJhd0xpbmVWKHgsIHksIGhlaWdodCwgY29sKTtcbiAgICAgICAgdGhpcy5kcmF3TGluZVYoeCArIHdpZHRoIC0gMSwgeSwgaGVpZ2h0LCBjb2wpO1xuICAgIH07XG5cbiAgICBCaXRtYXAucHJvdG90eXBlLmZpbGxDaXJjbGUgPSBmdW5jdGlvbiAoeCwgeSwgciwgY29sKSB7XG4gICAgICAgIHggPSBNYXRoLmZsb29yKHgpO1xuICAgICAgICB5ID0gTWF0aC5mbG9vcih5KTtcbiAgICAgICAgciA9IE1hdGguZmxvb3Iocik7XG5cbiAgICAgICAgZm9yICh2YXIgaXkgPSAtcjsgaXkgPD0gcjsgaXkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgaXggPSAtcjsgaXggPD0gcjsgaXgrKykge1xuICAgICAgICAgICAgICAgIGlmICh4ICsgaXggPCAwIHx8IHkgKyBpeSA8IDAgfHwgeCArIGl4ID49IHRoaXMud2lkdGggfHwgeSArIGl5ID49IHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaXggKiBpeCArIGl5ICogaXkgPD0gciAqIHIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHAgPSAoeCArIGl4ICsgKHkgKyBpeSkgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtwXSA9IGNvbC5yO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFbcCArIDFdID0gY29sLmc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMl0gPSBjb2wuYjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQml0bWFwLnByb3RvdHlwZS5kcmF3Q2lyY2xlID0gZnVuY3Rpb24gKHgsIHksIHIsIGNvbCkge1xuICAgICAgICB4ID0gTWF0aC5mbG9vcih4KTtcbiAgICAgICAgeSA9IE1hdGguZmxvb3IoeSk7XG4gICAgICAgIHIgPSBNYXRoLmZsb29yKHIpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzYwOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjeCA9IE1hdGgucm91bmQoTWF0aC5jb3MoaSAqIChNYXRoLlBJIC8gMTgwKSkgKiByKSArIHg7XG4gICAgICAgICAgICB2YXIgY3kgPSBNYXRoLnJvdW5kKE1hdGguc2luKGkgKiAoTWF0aC5QSSAvIDE4MCkpICogcikgKyB5O1xuXG4gICAgICAgICAgICBpZiAoY3ggPCAwIHx8IGN5IDwgMCB8fCBjeCA+PSB0aGlzLndpZHRoIHx8IGN5ID49IHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcCA9IChjeCArIGN5ICogdGhpcy53aWR0aCkgKiB0aGlzLmNoYW5uZWxzO1xuICAgICAgICAgICAgdGhpcy5kYXRhW3BdID0gY29sLnI7XG4gICAgICAgICAgICB0aGlzLmRhdGFbcCArIDFdID0gY29sLmc7XG4gICAgICAgICAgICB0aGlzLmRhdGFbcCArIDJdID0gY29sLmI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQml0bWFwLnByb3RvdHlwZS5zaGFkZXIgPSBmdW5jdGlvbiAoZikge1xuICAgICAgICB2YXIgaXk7XG4gICAgICAgIHZhciBpeDtcbiAgICAgICAgdmFyIHA7XG4gICAgICAgIHZhciBjb2w7XG5cbiAgICAgICAgdmFyIHJnYiA9IG5ldyBSR0JBKCk7XG5cbiAgICAgICAgZm9yIChpeSA9IDA7IGl5IDwgdGhpcy5oZWlnaHQ7IGl5KyspIHtcbiAgICAgICAgICAgIGZvciAoaXggPSAwOyBpeCA8IHRoaXMud2lkdGg7IGl4KyspIHtcbiAgICAgICAgICAgICAgICBwID0gKGl4ICsgaXkgKiB0aGlzLndpZHRoKSAqIHRoaXMuY2hhbm5lbHM7XG4gICAgICAgICAgICAgICAgcmdiLnIgPSB0aGlzLmRhdGFbcF07XG4gICAgICAgICAgICAgICAgcmdiLmcgPSB0aGlzLmRhdGFbcCArIDFdO1xuICAgICAgICAgICAgICAgIHJnYi5iID0gdGhpcy5kYXRhW3AgKyAyXTtcblxuICAgICAgICAgICAgICAgIGNvbCA9IGYoaXgsIGl5LCByZ2IpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW3BdID0gY29sLnI7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW3AgKyAxXSA9IGNvbC5nO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtwICsgMl0gPSBjb2wuYjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBCaXRtYXAucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbiAoeCwgeSwgdHh0LCBjb2wpIHtcbiAgICAgICAgdHh0ID0gU3RyaW5nKHR4dCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0eHQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHggKz0gdGhpcy5kcmF3Q2hhcih4LCB5LCB0eHQuY2hhckF0KGkpLCBjb2wpICsgMTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBCaXRtYXAucHJvdG90eXBlLmRyYXdDaGFyID0gZnVuY3Rpb24gKHgsIHksIGNociwgY29sKSB7XG4gICAgICAgIHZhciBjaGFyID0gbWljcm9Gb250LmNoYXJzW2Noci50b1VwcGVyQ2FzZSgpXTtcbiAgICAgICAgaWYgKCFjaGFyKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGl5ID0gMDsgaXkgPCBtaWNyb0ZvbnQuaGVpZ2h0OyBpeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpeCA9IDA7IGl4IDwgY2hhci53aWR0aDsgaXgrKykge1xuICAgICAgICAgICAgICAgIGlmIChjaGFyLm1hcFtpeSAqIGNoYXIud2lkdGggKyBpeF0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRQaXhlbCh4ICsgaXgsIHkgKyBpeSwgY29sKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoYXIud2lkdGg7XG4gICAgfTtcblxuICAgIEJpdG1hcC5wcm90b3R5cGUuYmxpdCA9IGZ1bmN0aW9uIChzcHJpdGUsIHgsIHkpIHtcbiAgICAgICAgeCA9ICh4ID8gTWF0aC5mbG9vcih4KSA6IDApO1xuICAgICAgICB5ID0gKHkgPyBNYXRoLmZsb29yKHkpIDogMCk7XG5cbiAgICAgICAgdmFyIGl5O1xuICAgICAgICB2YXIgaXg7XG4gICAgICAgIHZhciByZWFkO1xuICAgICAgICB2YXIgd3JpdGU7XG5cbiAgICAgICAgaWYgKHggPj0gdGhpcy53aWR0aCB8fCB5ID49IHRoaXMuaGVpZ2h0IHx8IHggKyBzcHJpdGUud2lkdGggPCAwIHx8IHkgKyBzcHJpdGUuaGVpZ2h0IDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlZnQgPSB4O1xuICAgICAgICB2YXIgcmlnaHQgPSB4ICsgc3ByaXRlLndpZHRoO1xuICAgICAgICB2YXIgdG9wID0geTtcbiAgICAgICAgdmFyIGJvdHRvbSA9IHkgKyBzcHJpdGUuaGVpZ2h0O1xuXG4gICAgICAgIGlmIChsZWZ0IDwgMCkge1xuICAgICAgICAgICAgbGVmdCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRvcCA8IDApIHtcbiAgICAgICAgICAgIHRvcCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmlnaHQgPj0gdGhpcy53aWR0aCkge1xuICAgICAgICAgICAgcmlnaHQgPSB0aGlzLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib3R0b20gPj0gdGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIGJvdHRvbSA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNwcml0ZS51c2VBbHBoYSkge1xuICAgICAgICAgICAgZm9yIChpeSA9IHRvcDsgaXkgPCBib3R0b207IGl5KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKGl4ID0gbGVmdDsgaXggPCByaWdodDsgaXgrKykge1xuICAgICAgICAgICAgICAgICAgICByZWFkID0gKGl4IC0geCArIChpeSAtIHkpICogc3ByaXRlLndpZHRoKSAqIHNwcml0ZS5jaGFubmVscztcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUgPSAoaXggKyBpeSAqIHRoaXMud2lkdGgpICogdGhpcy5jaGFubmVscztcblxuICAgICAgICAgICAgICAgICAgICB2YXIgYWxwaGEgPSBzcHJpdGUuZGF0YVtyZWFkICsgM10gLyAyNTU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbnYgPSAxIC0gYWxwaGE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YVt3cml0ZV0gPSBNYXRoLnJvdW5kKHRoaXMuZGF0YVt3cml0ZV0gKiBpbnYgKyBzcHJpdGUuZGF0YVtyZWFkXSAqIGFscGhhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhW3dyaXRlICsgMV0gPSBNYXRoLnJvdW5kKHRoaXMuZGF0YVt3cml0ZSArIDFdICogaW52ICsgc3ByaXRlLmRhdGFbcmVhZCArIDFdICogYWxwaGEpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFbd3JpdGUgKyAyXSA9IE1hdGgucm91bmQodGhpcy5kYXRhW3dyaXRlICsgMl0gKiBpbnYgKyBzcHJpdGUuZGF0YVtyZWFkICsgMl0gKiBhbHBoYSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yIChpeSA9IHRvcDsgaXkgPCBib3R0b207IGl5KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKGl4ID0gbGVmdDsgaXggPCByaWdodDsgaXgrKykge1xuICAgICAgICAgICAgICAgICAgICByZWFkID0gKGl4IC0geCArIChpeSAtIHkpICogc3ByaXRlLndpZHRoKSAqIHNwcml0ZS5jaGFubmVscztcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUgPSAoaXggKyBpeSAqIHRoaXMud2lkdGgpICogdGhpcy5jaGFubmVscztcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFbd3JpdGVdID0gc3ByaXRlLmRhdGFbcmVhZF07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YVt3cml0ZSArIDFdID0gc3ByaXRlLmRhdGFbcmVhZCArIDFdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFbd3JpdGUgKyAyXSA9IHNwcml0ZS5kYXRhW3JlYWQgKyAyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQml0bWFwLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICBjb2xvciA9IGNvbG9yIHx8IGJsYWNrO1xuXG4gICAgICAgIHZhciBsaW07XG4gICAgICAgIHZhciBpO1xuXG4gICAgICAgIGlmICh0aGlzLnVzZUFscGhhKSB7XG4gICAgICAgICAgICBsaW0gPSB0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiA0O1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxpbTsgaSArPSA0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW2ldID0gY29sb3IucjtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaSArIDFdID0gY29sb3IuZztcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaSArIDJdID0gY29sb3IuYjtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaSArIDNdID0gY29sb3IuYTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpbSA9IHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqIDM7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGltOyBpICs9IDMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFbaV0gPSBjb2xvci5yO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtpICsgMV0gPSBjb2xvci5nO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YVtpICsgMl0gPSBjb2xvci5iO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIEJpdG1hcC5wcm90b3R5cGUuY2xlYXJBbHBoYSA9IGZ1bmN0aW9uIChhbHBoYSkge1xuICAgICAgICBpZiAodHlwZW9mIGFscGhhID09PSBcInVuZGVmaW5lZFwiKSB7IGFscGhhID0gMDsgfVxuICAgICAgICBpZiAoIXRoaXMudXNlQWxwaGEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGltID0gdGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogNDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDM7IGkgPCBsaW07IGkgKz0gNCkge1xuICAgICAgICAgICAgdGhpcy5kYXRhW2ldID0gYWxwaGE7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQml0bWFwLmNsaXBGcm9tRGF0YSA9IGZ1bmN0aW9uIChpbnB1dERhdGEsIGlucHV0V2lkdGgsIGlucHV0SGVpZ2h0LCBpbnB1dENoYW5uZWxzLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB1c2VBbHBoYSkge1xuICAgICAgICB2YXIgY2hhbm5lbHMgPSB1c2VBbHBoYSA/IDQgOiAzO1xuICAgICAgICB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KGhlaWdodCAqIHdpZHRoICogY2hhbm5lbHMpO1xuXG4gICAgICAgIHZhciBpeTtcbiAgICAgICAgdmFyIGl4O1xuICAgICAgICB2YXIgcmVhZDtcbiAgICAgICAgdmFyIHdyaXRlO1xuXG4gICAgICAgIGlmICh1c2VBbHBoYSkge1xuICAgICAgICAgICAgZm9yIChpeSA9IDA7IGl5IDwgaGVpZ2h0OyBpeSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpeCA9IDA7IGl4IDwgd2lkdGg7IGl4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVhZCA9IChpeCArIHggKyAoaXkgKyB5KSAqIGlucHV0V2lkdGgpICogaW5wdXRDaGFubmVscztcbiAgICAgICAgICAgICAgICAgICAgd3JpdGUgPSAoaXggKyBpeSAqIHdpZHRoKSAqIGNoYW5uZWxzO1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbd3JpdGVdID0gaW5wdXREYXRhW3JlYWRdO1xuICAgICAgICAgICAgICAgICAgICBkYXRhW3dyaXRlICsgMV0gPSBpbnB1dERhdGFbcmVhZCArIDFdO1xuICAgICAgICAgICAgICAgICAgICBkYXRhW3dyaXRlICsgMl0gPSBpbnB1dERhdGFbcmVhZCArIDJdO1xuICAgICAgICAgICAgICAgICAgICBkYXRhW3dyaXRlICsgM10gPSBpbnB1dERhdGFbcmVhZCArIDNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoaXkgPSAwOyBpeSA8IGhlaWdodDsgaXkrKykge1xuICAgICAgICAgICAgICAgIGZvciAoaXggPSAwOyBpeCA8IHdpZHRoOyBpeCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWQgPSAoaXggKyB4ICsgKGl5ICsgeSkgKiBpbnB1dFdpZHRoKSAqIGlucHV0Q2hhbm5lbHM7XG4gICAgICAgICAgICAgICAgICAgIHdyaXRlID0gKGl4ICsgaXkgKiB3aWR0aCkgKiBjaGFubmVscztcblxuICAgICAgICAgICAgICAgICAgICBkYXRhW3dyaXRlXSA9IGlucHV0RGF0YVtyZWFkXTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVt3cml0ZSArIDFdID0gaW5wdXREYXRhW3JlYWQgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVt3cml0ZSArIDJdID0gaW5wdXREYXRhW3JlYWQgKyAyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEJpdG1hcCh3aWR0aCwgaGVpZ2h0LCB1c2VBbHBoYSwgZGF0YSk7XG4gICAgfTtcbiAgICByZXR1cm4gQml0bWFwO1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCaXRtYXA7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1CaXRtYXAuanMubWFwXG4iLCIndXNlIHN0cmljdCc7XG52YXIgQ2hhciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2hhcihjaGFyLCBtYXApIHtcbiAgICAgICAgdGhpcy5jaGFyID0gY2hhcjtcbiAgICAgICAgdGhpcy53aWR0aCA9IG1hcFswXS5sZW5ndGg7XG4gICAgICAgIHRoaXMubWFwID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBsaW5lID0gbWFwW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCBsaW5lLmxlbmd0aDsgYysrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAucHVzaCgobGluZS5jaGFyQXQoYykgPT09ICcxJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBDaGFyO1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2hhci5qcy5tYXBcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBGUFMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEZQUyhzbW9vdGhGUFMsIHNtb290aERlbHRhKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc21vb3RoRlBTID09PSBcInVuZGVmaW5lZFwiKSB7IHNtb290aEZQUyA9IDMwOyB9XG4gICAgICAgIGlmICh0eXBlb2Ygc21vb3RoRGVsdGEgPT09IFwidW5kZWZpbmVkXCIpIHsgc21vb3RoRGVsdGEgPSAyOyB9XG4gICAgICAgIHRoaXMudGlja0hpc3RvcnkgPSBbMF07XG4gICAgICAgIHRoaXMuZGVsdGFIaXN0b3J5ID0gWzBdO1xuICAgICAgICB0aGlzLnRpY2tJID0gMDtcbiAgICAgICAgdGhpcy5kZWx0YUkgPSAwO1xuICAgICAgICB0aGlzLnNtb290aEZQUyA9IHNtb290aEZQUztcbiAgICAgICAgdGhpcy5zbW9vdGhEZWx0YSA9IHNtb290aERlbHRhO1xuICAgICAgICB0aGlzLnByZXZpb3VzID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfVxuICAgIEZQUy5wcm90b3R5cGUuYmVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdmFyIGRlbHRhID0gbm93IC0gdGhpcy5wcmV2aW91cztcbiAgICAgICAgdGhpcy50aWNrSGlzdG9yeVt0aGlzLnRpY2tJICUgdGhpcy5zbW9vdGhGUFNdID0gZGVsdGE7XG4gICAgICAgIHRoaXMudGlja0krKztcbiAgICAgICAgdGhpcy5wcmV2aW91cyA9IG5vdztcbiAgICB9O1xuXG4gICAgRlBTLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdmFyIGRlbHRhID0gbm93IC0gdGhpcy5wcmV2aW91cztcbiAgICAgICAgdGhpcy5kZWx0YUhpc3RvcnlbdGhpcy5kZWx0YUkgJSB0aGlzLnNtb290aERlbHRhXSA9IGRlbHRhO1xuICAgICAgICB0aGlzLmRlbHRhSSsrO1xuICAgIH07XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRlBTLnByb3RvdHlwZSwgXCJmcHNcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0b3QgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnRpY2tIaXN0b3J5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdG90ICs9IHRoaXMudGlja0hpc3RvcnlbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKDEwMDAgLyAodG90IC8gdGhpcy50aWNrSGlzdG9yeS5sZW5ndGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRlBTLnByb3RvdHlwZSwgXCJyZWRyYXdcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0b3QgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRlbHRhSGlzdG9yeS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRvdCArPSB0aGlzLmRlbHRhSGlzdG9yeVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwodG90IC8gdGhpcy5kZWx0YUhpc3RvcnkubGVuZ3RoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIEZQUztcbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gRlBTO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RlBTLmpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIENoYXIgPSByZXF1aXJlKCcuL0NoYXInKTtcblxudmFyIEZvbnQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEZvbnQobmFtZSwgaGVpZ2h0LCBkYXRhKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLmNoYXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKGZ1bmN0aW9uIChjaGFyKSB7XG4gICAgICAgICAgICBfdGhpcy5jaGFyc1tjaGFyXSA9IG5ldyBDaGFyKGNoYXIsIGRhdGFbY2hhcl0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIEZvbnQ7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvbnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Gb250LmpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIEhTViA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSFNWKGgsIHMsIHYpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoID09PSBcInVuZGVmaW5lZFwiKSB7IGggPSAwOyB9XG4gICAgICAgIGlmICh0eXBlb2YgcyA9PT0gXCJ1bmRlZmluZWRcIikgeyBzID0gMDsgfVxuICAgICAgICBpZiAodHlwZW9mIHYgPT09IFwidW5kZWZpbmVkXCIpIHsgdiA9IDA7IH1cbiAgICAgICAgdGhpcy5oID0gaDtcbiAgICAgICAgdGhpcy5zID0gcztcbiAgICAgICAgdGhpcy52ID0gdjtcbiAgICB9XG4gICAgcmV0dXJuIEhTVjtcbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gSFNWO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9SFNWLmpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIFJHQkEgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFJHQkEociwgZywgYiwgYSkge1xuICAgICAgICBpZiAodHlwZW9mIHIgPT09IFwidW5kZWZpbmVkXCIpIHsgciA9IDA7IH1cbiAgICAgICAgaWYgKHR5cGVvZiBnID09PSBcInVuZGVmaW5lZFwiKSB7IGcgPSAwOyB9XG4gICAgICAgIGlmICh0eXBlb2YgYiA9PT0gXCJ1bmRlZmluZWRcIikgeyBiID0gMDsgfVxuICAgICAgICBpZiAodHlwZW9mIGEgPT09IFwidW5kZWZpbmVkXCIpIHsgYSA9IDI1NTsgfVxuICAgICAgICB0aGlzLnIgPSByO1xuICAgICAgICB0aGlzLmcgPSBnO1xuICAgICAgICB0aGlzLmIgPSBiO1xuICAgICAgICB0aGlzLmEgPSBhO1xuICAgIH1cbiAgICByZXR1cm4gUkdCQTtcbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUkdCQTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVJHQkEuanMubWFwXG4iLCIndXNlIHN0cmljdCc7XG52YXIgU3ByaXRlU2hlZXQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNwcml0ZVNoZWV0KHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdGhpcy5zcHJpdGVzID0gW107XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICAgIFNwcml0ZVNoZWV0LnByb3RvdHlwZS5nZXRTcHJpdGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTcHJpdGVBdCh5ICogdGhpcy53aWR0aCArIHgpO1xuICAgIH07XG5cbiAgICBTcHJpdGVTaGVldC5wcm90b3R5cGUuZ2V0U3ByaXRlQXQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3ByaXRlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc2hlZXQgaGFzIHplcm8gaW1hZ2VzJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc3ByaXRlc1tpbmRleCAlIHRoaXMuc3ByaXRlcy5sZW5ndGhdO1xuICAgIH07XG5cbiAgICBTcHJpdGVTaGVldC5wcm90b3R5cGUuYWRkU3ByaXRlID0gZnVuY3Rpb24gKGJpdG1hcCkge1xuICAgICAgICB0aGlzLnNwcml0ZXMucHVzaChiaXRtYXApO1xuICAgIH07XG4gICAgcmV0dXJuIFNwcml0ZVNoZWV0O1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVTaGVldDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVNwcml0ZVNoZWV0LmpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIF9fZXh0ZW5kcyA9IHRoaXMuX19leHRlbmRzIHx8IGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07XG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGU7XG4gICAgZC5wcm90b3R5cGUgPSBuZXcgX18oKTtcbn07XG52YXIgQml0bWFwID0gcmVxdWlyZSgnLi9CaXRtYXAnKTtcblxudmFyIENhbnZhc1JlbmRlcmVyID0gcmVxdWlyZSgnLi8uLi9yZW5kZXIvQ2FudmFzUmVuZGVyZXInKTtcbnZhciBXZWJHTFJlbmRlcmVyID0gcmVxdWlyZSgnLi8uLi9yZW5kZXIvV2ViR0xSZW5kZXJlcicpO1xuXG52YXIgYXV0b3NpemUgPSByZXF1aXJlKCcuL2F1dG9zaXplJyk7XG5cbnZhciBTdGFnZSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFN0YWdlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFN0YWdlKG9wdHMpIHtcbiAgICAgICAgX3N1cGVyLmNhbGwodGhpcywgKG9wdHMud2lkdGggfHwgMzIpLCAob3B0cy5oZWlnaHQgfHwgMzIpLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMgPSAodHlwZW9mIG9wdHMuY2FudmFzID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9wdHMuY2FudmFzKSA6IG9wdHMuY2FudmFzKTtcbiAgICAgICAgaWYgKCF0aGlzLmNhbnZhcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYW5ub3QgbG9jYXRlIGNhbnZhcyB3aXRoIGlkIFwiJyArIG9wdHMuY2FudmFzICsgJ1wiJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsZWFyKCk7XG5cbiAgICAgICAgaWYgKG9wdHMucmVuZGVyZXIgIT09ICdjYW52YXMnKSB7XG4gICAgICAgICAgICB0cnkgIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFdlYkdMUmVuZGVyZXIodGhpcywgdGhpcy5jYW52YXMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZW5kZXIgaW5pdCBlcnJvciwgc3dpdGNoaW5nIHRvIGZhbGxiYWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMucmVuZGVyZXIpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgQ2FudmFzUmVuZGVyZXIodGhpcywgdGhpcy5jYW52YXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hdXRvU2l6ZSA9IG5ldyBhdXRvc2l6ZS5BdXRvU2l6ZSh0aGlzLCB7XG4gICAgICAgICAgICBjZW50ZXI6IG9wdHMuY2VudGVyLFxuICAgICAgICAgICAgc2NhbGU6IG9wdHMuc2NhbGVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFN0YWdlLnByb3RvdHlwZS5yZXNpemVUbyA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGlmICh3aWR0aCA9PT0gdGhpcy53aWR0aCAmJiBoZWlnaHQgPT09IHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5yZXNpemVUby5jYWxsKHRoaXMsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB0aGlzLmF1dG9TaXplLnVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBTdGFnZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBTdGFnZS5wcm90b3R5cGUuZGVzdHJ1Y3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYXV0b1NpemUuc3RvcCgpO1xuICAgICAgICB0aGlzLmF1dG9TaXplID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5kZXN0cnVjdCgpO1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIFN0YWdlO1xufSkoQml0bWFwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFnZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVN0YWdlLmpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGJyb3dzZXIgPSByZXF1aXJlKCcuL2Jyb3dzZXInKTtcblxuZnVuY3Rpb24gYXNzZXJ0TW9kZShzY2FsZU1vZGUpIHtcbiAgICBpZiAoKHR5cGVvZiBzY2FsZU1vZGUgPT09ICdudW1iZXInICYmIHNjYWxlTW9kZSA+IDApIHx8IHNjYWxlTW9kZSA9PT0gJ21heCcgfHwgc2NhbGVNb2RlID09PSAnZml0JyB8fCBzY2FsZU1vZGUgPT09ICdub25lJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpbnQgPSBwYXJzZUludChzY2FsZU1vZGUsIDEwKTtcbiAgICBpZiAoIWlzTmFOKGludCkgJiYgaW50ID4gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignYmFkIHNjYWxlTW9kZTogJyArIHNjYWxlTW9kZSk7XG59XG5cbnZhciBBdXRvU2l6ZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXV0b1NpemUoc3RhZ2UsIG9wdHMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5zdGFnZSA9IHN0YWdlO1xuXG4gICAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgICAgICB0aGlzLmNlbnRlclZpZXcgPSAhIW9wdHMuY2VudGVyO1xuICAgICAgICB0aGlzLnNjYWxlTW9kZSA9IG9wdHMuc2NhbGUgfHwgJ25vbmUnO1xuICAgICAgICBhc3NlcnRNb2RlKHRoaXMuc2NhbGVNb2RlKTtcblxuICAgICAgICBzdGFnZS5jYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXG4gICAgICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgdmlld1BvcnQgPSBicm93c2VyLmdldFZpZXdwb3J0KCk7XG4gICAgICAgICAgICBpZiAoX3RoaXMuc2NhbGVNb2RlID09PSAnZml0Jykge1xuICAgICAgICAgICAgICAgIF90aGlzLnNjYWxlRml0KHZpZXdQb3J0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoX3RoaXMuc2NhbGVNb2RlID09PSAnbWF4Jykge1xuICAgICAgICAgICAgICAgIF90aGlzLnNjYWxlQXNwZWN0KHZpZXdQb3J0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuc3RhZ2UucmVuZGVyZXIucmVzaXplKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfdGhpcy5jZW50ZXJWaWV3IHx8IF90aGlzLnNjYWxlTW9kZSA9PT0gJ21heCcpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5tb3ZlU2NyZWVuQ2VudGVyKHZpZXdQb3J0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3RoaXMubW92ZVNjcmVlblRvKDAsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0TW9kZSh0aGlzLnNjYWxlTW9kZSwgdGhpcy5jZW50ZXJWaWV3KTtcbiAgICB9XG4gICAgQXV0b1NpemUucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24gKG1vZGUpIHtcbiAgICAgICAgdGhpcy5zZXRNb2RlKG1vZGUsIHRoaXMuY2VudGVyVmlldyk7XG4gICAgfTtcblxuICAgIEF1dG9TaXplLnByb3RvdHlwZS5jZW50ZXIgPSBmdW5jdGlvbiAoY2VudGVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2VudGVyID09PSBcInVuZGVmaW5lZFwiKSB7IGNlbnRlciA9IHRydWU7IH1cbiAgICAgICAgdGhpcy5zZXRNb2RlKHRoaXMuc2NhbGVNb2RlLCBjZW50ZXIpO1xuICAgIH07XG5cbiAgICBBdXRvU2l6ZS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBBdXRvU2l6ZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy51bmxpc3RlbigpO1xuICAgIH07XG5cbiAgICBBdXRvU2l6ZS5wcm90b3R5cGUuc2NhbGVUbyA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMuc2NhbGVNb2RlID0gJ25vbmUnO1xuICAgICAgICB0aGlzLnN0YWdlLmNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLnN0YWdlLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuc3RhZ2UucmVuZGVyZXIucmVzaXplKCk7XG4gICAgfTtcblxuICAgIEF1dG9TaXplLnByb3RvdHlwZS5zY2FsZUZpdCA9IGZ1bmN0aW9uICh2aWV3UG9ydCkge1xuICAgICAgICB0aGlzLnN0YWdlLmNhbnZhcy53aWR0aCA9IHZpZXdQb3J0LndpZHRoO1xuICAgICAgICB0aGlzLnN0YWdlLmNhbnZhcy5oZWlnaHQgPSB2aWV3UG9ydC5oZWlnaHQ7XG4gICAgICAgIHRoaXMuc3RhZ2UucmVuZGVyZXIucmVzaXplKCk7XG4gICAgfTtcblxuICAgIEF1dG9TaXplLnByb3RvdHlwZS5zY2FsZUFzcGVjdCA9IGZ1bmN0aW9uICh2aWV3UG9ydCkge1xuICAgICAgICB2YXIgcmF0aW8gPSBNYXRoLm1pbih2aWV3UG9ydC53aWR0aCAvIHRoaXMuc3RhZ2Uud2lkdGgsIHZpZXdQb3J0LmhlaWdodCAvIHRoaXMuc3RhZ2UuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zdGFnZS5jYW52YXMud2lkdGggPSBNYXRoLmZsb29yKHRoaXMuc3RhZ2Uud2lkdGggKiByYXRpbyk7XG4gICAgICAgIHRoaXMuc3RhZ2UuY2FudmFzLmhlaWdodCA9IE1hdGguZmxvb3IodGhpcy5zdGFnZS5oZWlnaHQgKiByYXRpbyk7XG4gICAgICAgIHRoaXMuc3RhZ2UucmVuZGVyZXIucmVzaXplKCk7XG4gICAgfTtcblxuICAgIEF1dG9TaXplLnByb3RvdHlwZS5tb3ZlU2NyZWVuVG8gPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICB0aGlzLnN0YWdlLmNhbnZhcy5zdHlsZS5sZWZ0ID0geCArICdweCc7XG4gICAgICAgIHRoaXMuc3RhZ2UuY2FudmFzLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuICAgIH07XG5cbiAgICBBdXRvU2l6ZS5wcm90b3R5cGUubW92ZVNjcmVlbkNlbnRlciA9IGZ1bmN0aW9uICh2aWV3UG9ydCkge1xuICAgICAgICB0aGlzLm1vdmVTY3JlZW5UbyhNYXRoLmZsb29yKCh2aWV3UG9ydC53aWR0aCAtIHRoaXMuc3RhZ2UuY2FudmFzLndpZHRoKSAvIDIpLCBNYXRoLmZsb29yKCh2aWV3UG9ydC5oZWlnaHQgLSB0aGlzLnN0YWdlLmNhbnZhcy5oZWlnaHQpIC8gMikpO1xuICAgIH07XG5cbiAgICBBdXRvU2l6ZS5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnVubGlzdGVuKCk7XG4gICAgICAgIGlmICh0aGlzLmNlbnRlclZpZXcgfHwgdGhpcy5zY2FsZU1vZGUgPT09ICdmaXQnKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy51cGRhdGUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEF1dG9TaXplLnByb3RvdHlwZS51bmxpc3RlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMudXBkYXRlKTtcbiAgICB9O1xuXG4gICAgQXV0b1NpemUucHJvdG90eXBlLnNldE1vZGUgPSBmdW5jdGlvbiAobW9kZSwgY2VudGVyKSB7XG4gICAgICAgIGFzc2VydE1vZGUobW9kZSk7XG5cbiAgICAgICAgdGhpcy5zY2FsZU1vZGUgPSBtb2RlO1xuXG4gICAgICAgIHZhciBtdWx0aSA9IHBhcnNlSW50KHRoaXMuc2NhbGVNb2RlLCAxMCk7XG4gICAgICAgIGlmICghaXNOYU4obXVsdGkpKSB7XG4gICAgICAgICAgICB0aGlzLnNjYWxlTW9kZSA9IG11bHRpO1xuICAgICAgICAgICAgdGhpcy5zY2FsZVRvKE1hdGguZmxvb3IodGhpcy5zdGFnZS53aWR0aCAqIG11bHRpKSwgTWF0aC5mbG9vcih0aGlzLnN0YWdlLmhlaWdodCAqIG11bHRpKSk7XG4gICAgICAgICAgICB0aGlzLnVubGlzdGVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2NhbGVNb2RlID09PSAnZml0Jykge1xuICAgICAgICAgICAgdGhpcy5tb3ZlU2NyZWVuVG8oMCwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNlbnRlciB8fCB0aGlzLnNjYWxlTW9kZSA9PT0gJ2ZpdCcgfHwgdGhpcy5zY2FsZU1vZGUgPT09ICdtYXgnKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbigpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfTtcbiAgICByZXR1cm4gQXV0b1NpemU7XG59KSgpO1xuZXhwb3J0cy5BdXRvU2l6ZSA9IEF1dG9TaXplO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXV0b3NpemUuanMubWFwXG4iLCIndXNlIHN0cmljdCc7XG5mdW5jdGlvbiBnZXRWaWV3cG9ydCgpIHtcbiAgICB2YXIgZSA9IHdpbmRvdztcbiAgICB2YXIgYSA9ICdpbm5lcic7XG4gICAgaWYgKCEoJ2lubmVyV2lkdGgnIGluIHdpbmRvdykpIHtcbiAgICAgICAgYSA9ICdjbGllbnQnO1xuICAgICAgICBlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50IHx8IGRvY3VtZW50LmJvZHk7XG4gICAgfVxuICAgIHJldHVybiB7IHdpZHRoOiBlW2EgKyAnV2lkdGgnXSwgaGVpZ2h0OiBlW2EgKyAnSGVpZ2h0J10gfTtcbn1cbmV4cG9ydHMuZ2V0Vmlld3BvcnQgPSBnZXRWaWV3cG9ydDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJyb3dzZXIuanMubWFwXG4iLCIndXNlIHN0cmljdCc7XG52YXIgUkdCQSA9IHJlcXVpcmUoJy4vUkdCQScpO1xudmFyIEhTViA9IHJlcXVpcmUoJy4vSFNWJyk7XG5cbmZ1bmN0aW9uIGhzdjJyZ2IoaHN2KSB7XG4gICAgdmFyIHIsIGcsIGI7XG4gICAgdmFyIGk7XG4gICAgdmFyIGYsIHAsIHEsIHQ7XG4gICAgdmFyIGggPSBoc3YuaDtcbiAgICB2YXIgcyA9IGhzdi5zO1xuICAgIHZhciB2ID0gaHN2LnY7XG5cbiAgICBoID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMzYwLCBoKSk7XG4gICAgcyA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgcykpO1xuICAgIHYgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIHYpKTtcblxuICAgIHMgLz0gMTAwO1xuICAgIHYgLz0gMTAwO1xuXG4gICAgaWYgKHMgPT09IDApIHtcbiAgICAgICAgciA9IGcgPSBiID0gdjtcbiAgICAgICAgcmV0dXJuIG5ldyBSR0JBKE1hdGgucm91bmQociAqIDI1NSksIE1hdGgucm91bmQoZyAqIDI1NSksIE1hdGgucm91bmQoYiAqIDI1NSkpO1xuICAgIH1cblxuICAgIGggLz0gNjA7XG4gICAgaSA9IE1hdGguZmxvb3IoaCk7XG4gICAgZiA9IGggLSBpO1xuICAgIHAgPSB2ICogKDEgLSBzKTtcbiAgICBxID0gdiAqICgxIC0gcyAqIGYpO1xuICAgIHQgPSB2ICogKDEgLSBzICogKDEgLSBmKSk7XG5cbiAgICBzd2l0Y2ggKGkpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgciA9IHY7XG4gICAgICAgICAgICBnID0gdDtcbiAgICAgICAgICAgIGIgPSBwO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgciA9IHE7XG4gICAgICAgICAgICBnID0gdjtcbiAgICAgICAgICAgIGIgPSBwO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgciA9IHA7XG4gICAgICAgICAgICBnID0gdjtcbiAgICAgICAgICAgIGIgPSB0O1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgciA9IHA7XG4gICAgICAgICAgICBnID0gcTtcbiAgICAgICAgICAgIGIgPSB2O1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgciA9IHQ7XG4gICAgICAgICAgICBnID0gcDtcbiAgICAgICAgICAgIGIgPSB2O1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHIgPSB2O1xuICAgICAgICAgICAgZyA9IHA7XG4gICAgICAgICAgICBiID0gcTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJHQkEoTWF0aC5yb3VuZChyICogMjU1KSwgTWF0aC5yb3VuZChnICogMjU1KSwgTWF0aC5yb3VuZChiICogMjU1KSk7XG59XG5leHBvcnRzLmhzdjJyZ2IgPSBoc3YycmdiO1xuXG5mdW5jdGlvbiByZ2IyaHN2KHJnYikge1xuICAgIHZhciByciwgZ2csIGJiLCByID0gcmdiLnIgLyAyNTUsIGcgPSByZ2IuZyAvIDI1NSwgYiA9IHJnYi5iIC8gMjU1LCBoLCBzLCB2ID0gTWF0aC5tYXgociwgZywgYiksIGRpZmYgPSB2IC0gTWF0aC5taW4ociwgZywgYiksIGRpZmZjID0gZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgcmV0dXJuICh2IC0gYykgLyA2IC8gZGlmZiArIDEgLyAyO1xuICAgIH07XG5cbiAgICBpZiAoZGlmZiA9PT0gMCkge1xuICAgICAgICBoID0gcyA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcyA9IGRpZmYgLyB2O1xuICAgICAgICByciA9IGRpZmZjKHIpO1xuICAgICAgICBnZyA9IGRpZmZjKGcpO1xuICAgICAgICBiYiA9IGRpZmZjKGIpO1xuXG4gICAgICAgIGlmIChyID09PSB2KSB7XG4gICAgICAgICAgICBoID0gYmIgLSBnZztcbiAgICAgICAgfSBlbHNlIGlmIChnID09PSB2KSB7XG4gICAgICAgICAgICBoID0gKDEgLyAzKSArIHJyIC0gYmI7XG4gICAgICAgIH0gZWxzZSBpZiAoYiA9PT0gdikge1xuICAgICAgICAgICAgaCA9ICgyIC8gMykgKyBnZyAtIHJyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoIDwgMCkge1xuICAgICAgICAgICAgaCArPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKGggPiAxKSB7XG4gICAgICAgICAgICBoIC09IDE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBIU1YoTWF0aC5yb3VuZChoICogMzYwKSwgTWF0aC5yb3VuZChzICogMTAwKSwgTWF0aC5yb3VuZCh2ICogMTAwKSk7XG59XG5leHBvcnRzLnJnYjJoc3YgPSByZ2IyaHN2O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29sb3IuanMubWFwXG4iLCIndXNlIHN0cmljdCc7XG5mdW5jdGlvbiBpbnRlcnZhbChjYWxsYmFjaywgZnBzKSB7XG4gICAgdmFyIGludGVydmFsSUQgPSAwO1xuICAgIHZhciBmcmFtZSA9IDA7XG4gICAgdmFyIHByZXYgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgIGlmIChpbnRlcnZhbElEKSB7XG4gICAgICAgICAgICBmcmFtZSsrO1xuICAgICAgICAgICAgdmFyIG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgICAgY2FsbGJhY2soZnJhbWUsIG5vdyAtIHByZXYpO1xuICAgICAgICAgICAgcHJldiA9IG5vdztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0aGF0ID0ge307XG4gICAgdGhhdC5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGludGVydmFsSUQpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJRCk7XG4gICAgICAgIH1cbiAgICAgICAgaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKHN0ZXAsIDEwMDAgLyBmcHMpO1xuICAgIH07XG4gICAgdGhhdC5zdGVwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzdGVwKCk7XG4gICAgfTtcbiAgICB0aGF0LnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChpbnRlcnZhbElEKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSUQpO1xuICAgICAgICAgICAgaW50ZXJ2YWxJRCA9IDA7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRoYXQuaXNSdW5uaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gISFpbnRlcnZhbElEO1xuICAgIH07XG4gICAgcmV0dXJuIHRoYXQ7XG59XG5leHBvcnRzLmludGVydmFsID0gaW50ZXJ2YWw7XG5cbmZ1bmN0aW9uIHJlcXVlc3QoY2FsbGJhY2spIHtcbiAgICB2YXIgcnVubmluZyA9IGZhbHNlO1xuICAgIHZhciBmcmFtZSA9IDA7XG4gICAgdmFyIHByZXYgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICBmcmFtZSsrO1xuICAgICAgICAgICAgdmFyIG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgICAgY2FsbGJhY2soZnJhbWUsIG5vdyAtIHByZXYpO1xuICAgICAgICAgICAgcHJldiA9IG5vdztcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0SUQ7XG4gICAgdmFyIHRoYXQgPSB7fTtcbiAgICB0aGF0LnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdElEID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aGF0LnN0ZXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0ZXAoKTtcbiAgICB9O1xuICAgIHRoYXQuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJlcXVlc3RJRCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRoYXQuaXNSdW5uaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICB9O1xuICAgIHJldHVybiB0aGF0O1xufVxuZXhwb3J0cy5yZXF1ZXN0ID0gcmVxdWVzdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRpY2tlci5qcy5tYXBcbiIsIid1c2Ugc3RyaWN0JztcbmZ1bmN0aW9uIHJhbmQobWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG1heCk7XG59XG5leHBvcnRzLnJhbmQgPSByYW5kO1xuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZSwgbWluLCBtYXgpIHtcbiAgICBpZiAodmFsdWUgPCBtaW4pIHtcbiAgICAgICAgcmV0dXJuIG1pbjtcbiAgICB9XG4gICAgaWYgKHZhbHVlID4gbWF4KSB7XG4gICAgICAgIHJldHVybiBtYXg7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmV4cG9ydHMuY2xhbXAgPSBjbGFtcDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWwuanMubWFwXG4iLCJ2YXIgUGVybGluTm9pc2UgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFBlcmxpbk5vaXNlKCkge1xuICAgICAgICB0aGlzLnBlcm11dGF0aW9uID0gW1xuICAgICAgICAgICAgMTUxLCAxNjAsIDEzNywgOTEsIDkwLCAxNSxcbiAgICAgICAgICAgIDEzMSwgMTMsIDIwMSwgOTUsIDk2LCA1MywgMTk0LCAyMzMsIDcsIDIyNSwgMTQwLCAzNiwgMTAzLCAzMCwgNjksIDE0MiwgOCwgOTksIDM3LCAyNDAsIDIxLCAxMCwgMjMsXG4gICAgICAgICAgICAxOTAsIDYsIDE0OCwgMjQ3LCAxMjAsIDIzNCwgNzUsIDAsIDI2LCAxOTcsIDYyLCA5NCwgMjUyLCAyMTksIDIwMywgMTE3LCAzNSwgMTEsIDMyLCA1NywgMTc3LCAzMyxcbiAgICAgICAgICAgIDg4LCAyMzcsIDE0OSwgNTYsIDg3LCAxNzQsIDIwLCAxMjUsIDEzNiwgMTcxLCAxNjgsIDY4LCAxNzUsIDc0LCAxNjUsIDcxLCAxMzQsIDEzOSwgNDgsIDI3LCAxNjYsXG4gICAgICAgICAgICA3NywgMTQ2LCAxNTgsIDIzMSwgODMsIDExMSwgMjI5LCAxMjIsIDYwLCAyMTEsIDEzMywgMjMwLCAyMjAsIDEwNSwgOTIsIDQxLCA1NSwgNDYsIDI0NSwgNDAsIDI0NCxcbiAgICAgICAgICAgIDEwMiwgMTQzLCA1NCwgNjUsIDI1LCA2MywgMTYxLCAxLCAyMTYsIDgwLCA3MywgMjA5LCA3NiwgMTMyLCAxODcsIDIwOCwgODksIDE4LCAxNjksIDIwMCwgMTk2LFxuICAgICAgICAgICAgMTM1LCAxMzAsIDExNiwgMTg4LCAxNTksIDg2LCAxNjQsIDEwMCwgMTA5LCAxOTgsIDE3MywgMTg2LCAzLCA2NCwgNTIsIDIxNywgMjI2LCAyNTAsIDEyNCwgMTIzLFxuICAgICAgICAgICAgNSwgMjAyLCAzOCwgMTQ3LCAxMTgsIDEyNiwgMjU1LCA4MiwgODUsIDIxMiwgMjA3LCAyMDYsIDU5LCAyMjcsIDQ3LCAxNiwgNTgsIDE3LCAxODIsIDE4OSwgMjgsIDQyLFxuICAgICAgICAgICAgMjIzLCAxODMsIDE3MCwgMjEzLCAxMTksIDI0OCwgMTUyLCAyLCA0NCwgMTU0LCAxNjMsIDcwLCAyMjEsIDE1MywgMTAxLCAxNTUsIDE2NywgNDMsIDE3MiwgOSxcbiAgICAgICAgICAgIDEyOSwgMjIsIDM5LCAyNTMsIDE5LCA5OCwgMTA4LCAxMTAsIDc5LCAxMTMsIDIyNCwgMjMyLCAxNzgsIDE4NSwgMTEyLCAxMDQsIDIxOCwgMjQ2LCA5NywgMjI4LFxuICAgICAgICAgICAgMjUxLCAzNCwgMjQyLCAxOTMsIDIzOCwgMjEwLCAxNDQsIDEyLCAxOTEsIDE3OSwgMTYyLCAyNDEsIDgxLCA1MSwgMTQ1LCAyMzUsIDI0OSwgMTQsIDIzOSwgMTA3LFxuICAgICAgICAgICAgNDksIDE5MiwgMjE0LCAzMSwgMTgxLCAxOTksIDEwNiwgMTU3LCAxODQsIDg0LCAyMDQsIDE3NiwgMTE1LCAxMjEsIDUwLCA0NSwgMTI3LCA0LCAxNTAsIDI1NCxcbiAgICAgICAgICAgIDEzOCwgMjM2LCAyMDUsIDkzLCAyMjIsIDExNCwgNjcsIDI5LCAyNCwgNzIsIDI0MywgMTQxLCAxMjgsIDE5NSwgNzgsIDY2LCAyMTUsIDYxLCAxNTYsIDE4MFxuICAgICAgICBdO1xuICAgICAgICB0aGlzLnAgPSBuZXcgQXJyYXkoNTEyKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnBbMjU2ICsgaV0gPSB0aGlzLnBbaV0gPSB0aGlzLnBlcm11dGF0aW9uW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIFBlcmxpbk5vaXNlLnByb3RvdHlwZS5ub2lzZSA9IGZ1bmN0aW9uICh4LCB5LCB6KSB7XG4gICAgICAgIHZhciBYID0gTWF0aC5mbG9vcih4KSAmIDI1NTtcbiAgICAgICAgdmFyIFkgPSBNYXRoLmZsb29yKHkpICYgMjU1O1xuICAgICAgICB2YXIgWiA9IE1hdGguZmxvb3IoeikgJiAyNTU7XG5cbiAgICAgICAgeCAtPSBNYXRoLmZsb29yKHgpO1xuICAgICAgICB5IC09IE1hdGguZmxvb3IoeSk7XG4gICAgICAgIHogLT0gTWF0aC5mbG9vcih6KTtcblxuICAgICAgICB2YXIgdSA9IHRoaXMuZmFkZSh4KTtcbiAgICAgICAgdmFyIHYgPSB0aGlzLmZhZGUoeSk7XG4gICAgICAgIHZhciB3ID0gdGhpcy5mYWRlKHopO1xuXG4gICAgICAgIHZhciBBID0gdGhpcy5wW1hdICsgWTtcbiAgICAgICAgdmFyIEFBID0gdGhpcy5wW0FdICsgWjtcbiAgICAgICAgdmFyIEFCID0gdGhpcy5wW0EgKyAxXSArIFo7XG5cbiAgICAgICAgdmFyIEIgPSB0aGlzLnBbWCArIDFdICsgWTtcbiAgICAgICAgdmFyIEJBID0gdGhpcy5wW0JdICsgWjtcbiAgICAgICAgdmFyIEJCID0gdGhpcy5wW0IgKyAxXSArIFo7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2NhbGUodGhpcy5sZXJwKHcsIHRoaXMubGVycCh2LCB0aGlzLmxlcnAodSwgdGhpcy5ncmFkKHRoaXMucFtBQV0sIHgsIHksIHopLCB0aGlzLmdyYWQodGhpcy5wW0JBXSwgeCAtIDEsIHksIHopKSwgdGhpcy5sZXJwKHUsIHRoaXMuZ3JhZCh0aGlzLnBbQUJdLCB4LCB5IC0gMSwgeiksIHRoaXMuZ3JhZCh0aGlzLnBbQkJdLCB4IC0gMSwgeSAtIDEsIHopKSksIHRoaXMubGVycCh2LCB0aGlzLmxlcnAodSwgdGhpcy5ncmFkKHRoaXMucFtBQSArIDFdLCB4LCB5LCB6IC0gMSksIHRoaXMuZ3JhZCh0aGlzLnBbQkEgKyAxXSwgeCAtIDEsIHksIHogLSAxKSksIHRoaXMubGVycCh1LCB0aGlzLmdyYWQodGhpcy5wW0FCICsgMV0sIHgsIHkgLSAxLCB6IC0gMSksIHRoaXMuZ3JhZCh0aGlzLnBbQkIgKyAxXSwgeCAtIDEsIHkgLSAxLCB6IC0gMSkpKSkpO1xuICAgIH07XG5cbiAgICBQZXJsaW5Ob2lzZS5wcm90b3R5cGUuZmFkZSA9IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiB0ICogdCAqIHQgKiAodCAqICh0ICogNiAtIDE1KSArIDEwKTtcbiAgICB9O1xuXG4gICAgUGVybGluTm9pc2UucHJvdG90eXBlLmxlcnAgPSBmdW5jdGlvbiAodCwgYSwgYikge1xuICAgICAgICByZXR1cm4gYSArIHQgKiAoYiAtIGEpO1xuICAgIH07XG5cbiAgICBQZXJsaW5Ob2lzZS5wcm90b3R5cGUuZ3JhZCA9IGZ1bmN0aW9uIChoYXNoLCB4LCB5LCB6KSB7XG4gICAgICAgIHZhciBoID0gaGFzaCAmIDE1O1xuICAgICAgICB2YXIgdSA9IGggPCA4ID8geCA6IHk7XG4gICAgICAgIHZhciB2ID0gaCA8IDQgPyB5IDogaCA9PSAxMiB8fCBoID09IDE0ID8geCA6IHo7XG4gICAgICAgIHJldHVybiAoKGggJiAxKSA9PSAwID8gdSA6IC11KSArICgoaCAmIDIpID09IDAgPyB2IDogLXYpO1xuICAgIH07XG5cbiAgICBQZXJsaW5Ob2lzZS5wcm90b3R5cGUuc2NhbGUgPSBmdW5jdGlvbiAobikge1xuICAgICAgICByZXR1cm4gKDEgKyBuKSAvIDI7XG4gICAgfTtcbiAgICByZXR1cm4gUGVybGluTm9pc2U7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBlcmxpbk5vaXNlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UGVybGluTm9pc2UuanMubWFwXG4iLCIndXNlIHN0cmljdCc7XG52YXIgRm9udCA9IHJlcXVpcmUoJy4uL2NvcmUvRm9udCcpO1xuXG52YXIgZm9udCA9IG5ldyBGb250KCdtaWNybycsIDQsIHtcbiAgICAnMCc6IFtcbiAgICAgICAgJzExMScsXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMTAxJyxcbiAgICAgICAgJzExMSdcbiAgICBdLFxuICAgICcxJzogW1xuICAgICAgICAnMDEnLFxuICAgICAgICAnMTEnLFxuICAgICAgICAnMDEnLFxuICAgICAgICAnMDEnXG4gICAgXSxcbiAgICAnMic6IFtcbiAgICAgICAgJzExMCcsXG4gICAgICAgICcwMDEnLFxuICAgICAgICAnMDEwJyxcbiAgICAgICAgJzExMSdcbiAgICBdLFxuICAgICczJzogW1xuICAgICAgICAnMTExJyxcbiAgICAgICAgJzAxMScsXG4gICAgICAgICcwMDEnLFxuICAgICAgICAnMTExJ1xuICAgIF0sXG4gICAgJzQnOiBbXG4gICAgICAgICcxMDAnLFxuICAgICAgICAnMTAxJyxcbiAgICAgICAgJzExMScsXG4gICAgICAgICcwMTAnXG4gICAgXSxcbiAgICAnNSc6IFtcbiAgICAgICAgJzExMScsXG4gICAgICAgICcxMDAnLFxuICAgICAgICAnMTExJyxcbiAgICAgICAgJzAxMSdcbiAgICBdLFxuICAgICc2JzogW1xuICAgICAgICAnMTAwJyxcbiAgICAgICAgJzExMScsXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMTExJ1xuICAgIF0sXG4gICAgJzcnOiBbXG4gICAgICAgICcxMTEnLFxuICAgICAgICAnMDAxJyxcbiAgICAgICAgJzAxMCcsXG4gICAgICAgICcwMTAnXG4gICAgXSxcbiAgICAnOCc6IFtcbiAgICAgICAgJzExMScsXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMTExJyxcbiAgICAgICAgJzExMSdcbiAgICBdLFxuICAgICc5JzogW1xuICAgICAgICAnMTExJyxcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcxMTEnLFxuICAgICAgICAnMDAxJ1xuICAgIF0sXG4gICAgJ0EnOiBbXG4gICAgICAgICcxMTEnLFxuICAgICAgICAnMTAxJyxcbiAgICAgICAgJzExMScsXG4gICAgICAgICcxMDEnXG4gICAgXSxcbiAgICAnQic6IFtcbiAgICAgICAgJzEwMCcsXG4gICAgICAgICcxMTEnLFxuICAgICAgICAnMTAxJyxcbiAgICAgICAgJzExMSdcbiAgICBdLFxuICAgICdDJzogW1xuICAgICAgICAnMTExJyxcbiAgICAgICAgJzEwMCcsXG4gICAgICAgICcxMDAnLFxuICAgICAgICAnMTExJ1xuICAgIF0sXG4gICAgJ0QnOiBbXG4gICAgICAgICcxMTAnLFxuICAgICAgICAnMTAxJyxcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcxMTAnXG4gICAgXSxcbiAgICAnRSc6IFtcbiAgICAgICAgJzExMScsXG4gICAgICAgICcxMTAnLFxuICAgICAgICAnMTAwJyxcbiAgICAgICAgJzExMSdcbiAgICBdLFxuICAgICdGJzogW1xuICAgICAgICAnMTExJyxcbiAgICAgICAgJzEwMCcsXG4gICAgICAgICcxMTAnLFxuICAgICAgICAnMTAwJ1xuICAgIF0sXG4gICAgJ0cnOiBbXG4gICAgICAgICcxMTEnLFxuICAgICAgICAnMTAwJyxcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcxMTEnXG4gICAgXSxcbiAgICAnSCc6IFtcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMTExJyxcbiAgICAgICAgJzEwMSdcbiAgICBdLFxuICAgICdJJzogW1xuICAgICAgICAnMScsXG4gICAgICAgICcxJyxcbiAgICAgICAgJzEnLFxuICAgICAgICAnMSdcbiAgICBdLFxuICAgICdKJzogW1xuICAgICAgICAnMDAxJyxcbiAgICAgICAgJzAwMScsXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMTExJ1xuICAgIF0sXG4gICAgJ0snOiBbXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMTEwJyxcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcxMDEnXG4gICAgXSxcbiAgICAnTCc6IFtcbiAgICAgICAgJzEwJyxcbiAgICAgICAgJzEwJyxcbiAgICAgICAgJzEwJyxcbiAgICAgICAgJzExJ1xuICAgIF0sXG4gICAgJ00nOiBbXG4gICAgICAgICcxMTAxMScsXG4gICAgICAgICcxMTAxMScsXG4gICAgICAgICcxMDEwMScsXG4gICAgICAgICcxMDAwMSdcbiAgICBdLFxuICAgICdOJzogW1xuICAgICAgICAnMTAwMScsXG4gICAgICAgICcxMTAxJyxcbiAgICAgICAgJzEwMTEnLFxuICAgICAgICAnMTAwMSdcbiAgICBdLFxuICAgICdPJzogW1xuICAgICAgICAnMTExJyxcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMTExJ1xuICAgIF0sXG4gICAgJ1AnOiBbXG4gICAgICAgICcxMTEnLFxuICAgICAgICAnMTAxJyxcbiAgICAgICAgJzExMScsXG4gICAgICAgICcxMDAnXG4gICAgXSxcbiAgICAnUSc6IFtcbiAgICAgICAgJzExMScsXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMTExJyxcbiAgICAgICAgJzAwMSdcbiAgICBdLFxuICAgICdSJzogW1xuICAgICAgICAnMTExJyxcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcxMDAnLFxuICAgICAgICAnMTAwJ1xuICAgIF0sXG4gICAgJ1MnOiBbXG4gICAgICAgICcxMTEnLFxuICAgICAgICAnMTAwJyxcbiAgICAgICAgJzExMScsXG4gICAgICAgICcwMTEnXG4gICAgXSxcbiAgICAnVCc6IFtcbiAgICAgICAgJzExMScsXG4gICAgICAgICcwMTAnLFxuICAgICAgICAnMDEwJyxcbiAgICAgICAgJzAxMCdcbiAgICBdLFxuICAgICdVJzogW1xuICAgICAgICAnMTAxJyxcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMTExJ1xuICAgIF0sXG4gICAgJ1YnOiBbXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMTAxJyxcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcwMTAnXG4gICAgXSxcbiAgICAnVyc6IFtcbiAgICAgICAgJzEwMDAxJyxcbiAgICAgICAgJzEwMDAxJyxcbiAgICAgICAgJzEwMTAxJyxcbiAgICAgICAgJzAxMTEwJ1xuICAgIF0sXG4gICAgJ1gnOiBbXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMDEwJyxcbiAgICAgICAgJzAxMCcsXG4gICAgICAgICcxMDEnXG4gICAgXSxcbiAgICAnWSc6IFtcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMDEwJyxcbiAgICAgICAgJzAxMCdcbiAgICBdLFxuICAgICdaJzogW1xuICAgICAgICAnMTExJyxcbiAgICAgICAgJzAxMScsXG4gICAgICAgICcxMDAnLFxuICAgICAgICAnMTExJ1xuICAgIF0sXG4gICAgJyAnOiBbXG4gICAgICAgICcwJyxcbiAgICAgICAgJzAnLFxuICAgICAgICAnMCcsXG4gICAgICAgICcwJ1xuICAgIF0sXG4gICAgJyEnOiBbXG4gICAgICAgICcxJyxcbiAgICAgICAgJzEnLFxuICAgICAgICAnMCcsXG4gICAgICAgICcxJ1xuICAgIF0sXG4gICAgJz8nOiBbXG4gICAgICAgICcxMTEnLFxuICAgICAgICAnMDAxJyxcbiAgICAgICAgJzAwMCcsXG4gICAgICAgICcwMTAnXG4gICAgXSxcbiAgICAnLic6IFtcbiAgICAgICAgJzAnLFxuICAgICAgICAnMCcsXG4gICAgICAgICcwJyxcbiAgICAgICAgJzEnXG4gICAgXSxcbiAgICAnLCc6IFtcbiAgICAgICAgJzAnLFxuICAgICAgICAnMCcsXG4gICAgICAgICcxJyxcbiAgICAgICAgJzEnXG4gICAgXSxcbiAgICAnKyc6IFtcbiAgICAgICAgJzAwMCcsXG4gICAgICAgICcwMTAnLFxuICAgICAgICAnMTExJyxcbiAgICAgICAgJzAxMCdcbiAgICBdLFxuICAgICctJzogW1xuICAgICAgICAnMDAnLFxuICAgICAgICAnMDAnLFxuICAgICAgICAnMTEnLFxuICAgICAgICAnMDAnXG4gICAgXSxcbiAgICAnPSc6IFtcbiAgICAgICAgJzAwMCcsXG4gICAgICAgICcxMTEnLFxuICAgICAgICAnMDAwJyxcbiAgICAgICAgJzExMSdcbiAgICBdLFxuICAgICcqJzogW1xuICAgICAgICAnMDAwJyxcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcwMTAnLFxuICAgICAgICAnMTAxJ1xuICAgIF0sXG4gICAgJ18nOiBbXG4gICAgICAgICcwMDAnLFxuICAgICAgICAnMDAwJyxcbiAgICAgICAgJzAwMCcsXG4gICAgICAgICcxMTEnXG4gICAgXSxcbiAgICAnWyc6IFtcbiAgICAgICAgJzExJyxcbiAgICAgICAgJzEwJyxcbiAgICAgICAgJzEwJyxcbiAgICAgICAgJzExJ1xuICAgIF0sXG4gICAgJ10nOiBbXG4gICAgICAgICcxMScsXG4gICAgICAgICcwMScsXG4gICAgICAgICcwMScsXG4gICAgICAgICcxMSdcbiAgICBdLFxuICAgICcoJzogW1xuICAgICAgICAnMDEnLFxuICAgICAgICAnMTAnLFxuICAgICAgICAnMTAnLFxuICAgICAgICAnMDEnXG4gICAgXSxcbiAgICAnKSc6IFtcbiAgICAgICAgJzEwJyxcbiAgICAgICAgJzAxJyxcbiAgICAgICAgJzAxJyxcbiAgICAgICAgJzEwJ1xuICAgIF0sXG4gICAgJzwnOiBbXG4gICAgICAgICcwMCcsXG4gICAgICAgICcwMScsXG4gICAgICAgICcxMCcsXG4gICAgICAgICcwMSdcbiAgICBdLFxuICAgICc+JzogW1xuICAgICAgICAnMDAnLFxuICAgICAgICAnMTAnLFxuICAgICAgICAnMDEnLFxuICAgICAgICAnMTAnXG4gICAgXSxcbiAgICAnXFwnJzogW1xuICAgICAgICAnMScsXG4gICAgICAgICcxJyxcbiAgICAgICAgJzAnLFxuICAgICAgICAnMCdcbiAgICBdLFxuICAgICdcIic6IFtcbiAgICAgICAgJzEwMScsXG4gICAgICAgICcxMDEnLFxuICAgICAgICAnMDAwJyxcbiAgICAgICAgJzAwMCdcbiAgICBdLFxuICAgICdgJzogW1xuICAgICAgICAnMTAnLFxuICAgICAgICAnMDEnLFxuICAgICAgICAnMDAnLFxuICAgICAgICAnMDAnXG4gICAgXSxcbiAgICAnfic6IFtcbiAgICAgICAgJzAwMCcsXG4gICAgICAgICcxMTAnLFxuICAgICAgICAnMDExJyxcbiAgICAgICAgJzAwMCdcbiAgICBdLFxuICAgICcvJzogW1xuICAgICAgICAnMDAxJyxcbiAgICAgICAgJzAxMCcsXG4gICAgICAgICcwMTAnLFxuICAgICAgICAnMTAwJ1xuICAgIF0sXG4gICAgJ1xcXFwnOiBbXG4gICAgICAgICcxMDAnLFxuICAgICAgICAnMDEwJyxcbiAgICAgICAgJzAxMCcsXG4gICAgICAgICcwMDEnXG4gICAgXVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZm9udDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU1pY3JvLmpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIFN0YWdlID0gcmVxdWlyZSgnLi9jb3JlL1N0YWdlJyk7XG5leHBvcnRzLlN0YWdlID0gU3RhZ2U7XG5cbnZhciBCaXRtYXAgPSByZXF1aXJlKCcuL2NvcmUvQml0bWFwJyk7XG5leHBvcnRzLkJpdG1hcCA9IEJpdG1hcDtcbnZhciBGUFMgPSByZXF1aXJlKCcuL2NvcmUvRlBTJyk7XG5leHBvcnRzLkZQUyA9IEZQUztcblxudmFyIFJHQkEgPSByZXF1aXJlKCcuL2NvcmUvUkdCQScpO1xudmFyIEhTViA9IHJlcXVpcmUoJy4vY29yZS9IU1YnKTtcblxudmFyIFBlcmxpbk5vaXNlID0gcmVxdWlyZSgnLi9leHRyYS9QZXJsaW5Ob2lzZScpO1xuZXhwb3J0cy5QZXJsaW5Ob2lzZSA9IFBlcmxpbk5vaXNlO1xuXG52YXIgbG9hZGVyID0gcmVxdWlyZSgnLi9sb2FkZXJzL2xvYWRlcicpO1xuZXhwb3J0cy5sb2FkZXIgPSBsb2FkZXI7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vY29yZS91dGlsJyk7XG52YXIgcmFuZCA9IF91dGlsLnJhbmQ7XG5leHBvcnRzLnJhbmQgPSByYW5kO1xuXG52YXIgX2NvbG9yID0gcmVxdWlyZSgnLi9jb3JlL2NvbG9yJyk7XG52YXIgcmdiMmhzdiA9IF9jb2xvci5yZ2IyaHN2O1xuZXhwb3J0cy5yZ2IyaHN2ID0gcmdiMmhzdjtcbnZhciBoc3YycmdiID0gX2NvbG9yLmhzdjJyZ2I7XG5leHBvcnRzLmhzdjJyZ2IgPSBoc3YycmdiO1xuXG52YXIgdGlja2VyID0gcmVxdWlyZSgnLi9jb3JlL3RpY2tlcicpO1xuZXhwb3J0cy50aWNrZXIgPSB0aWNrZXI7XG5cbmZ1bmN0aW9uIHJnYihyLCBnLCBiKSB7XG4gICAgcmV0dXJuIG5ldyBSR0JBKHIsIGcsIGIpO1xufVxuZXhwb3J0cy5yZ2IgPSByZ2I7XG5cbnZhciBoc3ZUbXAgPSBuZXcgSFNWKCk7XG5mdW5jdGlvbiBoc3YoaCwgcywgdikge1xuICAgIGhzdlRtcC5oID0gaDtcbiAgICBoc3ZUbXAucyA9IHM7XG4gICAgaHN2VG1wLnYgPSB2O1xuICAgIHJldHVybiBleHBvcnRzLmhzdjJyZ2IoaHN2VG1wKTtcbn1cbmV4cG9ydHMuaHN2ID0gaHN2O1xuXG5bXG4gICAgZXhwb3J0cy5sb2FkZXIsXG4gICAgZXhwb3J0cy5QZXJsaW5Ob2lzZSxcbiAgICBfdXRpbCxcbiAgICBfY29sb3IsXG4gICAgZXhwb3J0cy50aWNrZXIsXG4gICAgUkdCQSxcbiAgICBIU1YsXG4gICAgZXhwb3J0cy5CaXRtYXAsXG4gICAgZXhwb3J0cy5GUFMsXG4gICAgZXhwb3J0cy5TdGFnZVxuXTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIEJpdG1hcCA9IHJlcXVpcmUoJy4uL2NvcmUvQml0bWFwJyk7XG5cbnZhciBJbWFnZURhdGFMb2FkZXIgPSByZXF1aXJlKCcuL0ltYWdlRGF0YUxvYWRlcicpO1xuXG52YXIgQml0bWFwTG9hZGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCaXRtYXBMb2FkZXIodXJsLCB1c2VBbHBoYSkge1xuICAgICAgICBpZiAodHlwZW9mIHVzZUFscGhhID09PSBcInVuZGVmaW5lZFwiKSB7IHVzZUFscGhhID0gZmFsc2U7IH1cbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG4gICAgICAgIHRoaXMudXNlQWxwaGEgPSB1c2VBbHBoYTtcbiAgICB9XG4gICAgQml0bWFwTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIG5ldyBJbWFnZURhdGFMb2FkZXIodGhpcy51cmwpLmxvYWQoZnVuY3Rpb24gKGVyciwgaW1hZ2UpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF90aGlzLnVzZUFscGhhKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgbmV3IEJpdG1hcChpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LCB0cnVlLCBpbWFnZS5kYXRhLmJ1ZmZlcikpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgYml0bWFwID0gbmV3IEJpdG1hcChpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBpbWFnZS5kYXRhO1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IGltYWdlLndpZHRoO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXkgPSAwOyBpeSA8IGltYWdlLmhlaWdodDsgaXkrKykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpeCA9IDA7IGl4IDwgd2lkdGg7IGl4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWFkID0gKGl5ICogd2lkdGggKyBpeCkgKiA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHdyaXRlID0gKGl5ICogd2lkdGggKyBpeCkgKiAzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBiaXRtYXAuZGF0YVt3cml0ZV0gPSBkYXRhW3JlYWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYml0bWFwLmRhdGFbd3JpdGUgKyAxXSA9IGRhdGFbcmVhZCArIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYml0bWFwLmRhdGFbd3JpdGUgKyAyXSA9IGRhdGFbcmVhZCArIDJdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGJpdG1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIEJpdG1hcExvYWRlcjtcbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQml0bWFwTG9hZGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Qml0bWFwTG9hZGVyLmpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIEltYWdlRGF0YUxvYWRlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSW1hZ2VEYXRhTG9hZGVyKHVybCkge1xuICAgICAgICB0aGlzLnVybCA9IHVybDtcbiAgICB9XG4gICAgSW1hZ2VEYXRhTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG5cbiAgICAgICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xuXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQpKTtcblxuICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gbnVsbDtcbiAgICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKCdjYW5ub3QgbG9hZCAnICsgX3RoaXMudXJsKSwgbnVsbCk7XG5cbiAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9IG51bGw7XG4gICAgICAgICAgICBpbWFnZS5vbmVycm9yID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLnVybDtcbiAgICB9O1xuICAgIHJldHVybiBJbWFnZURhdGFMb2FkZXI7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlRGF0YUxvYWRlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUltYWdlRGF0YUxvYWRlci5qcy5tYXBcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBUZXh0TG9hZGVyID0gcmVxdWlyZSgnLi9UZXh0TG9hZGVyJyk7XG5cbnZhciBKU09OTG9hZGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBKU09OTG9hZGVyKHVybCkge1xuICAgICAgICB0aGlzLnVybCA9IHVybDtcbiAgICB9XG4gICAgSlNPTkxvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICBuZXcgVGV4dExvYWRlcih0aGlzLnVybCkubG9hZChmdW5jdGlvbiAoZXJyLCB0ZXh0KSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkgIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIG9iaik7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIEpTT05Mb2FkZXI7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEpTT05Mb2FkZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1KU09OTG9hZGVyLmpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIE11bHRpTG9hZGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNdWx0aUxvYWRlcihsb2FkZXJzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMucXVldWVkID0gW107XG4gICAgICAgIGlmIChsb2FkZXJzKSB7XG4gICAgICAgICAgICBsb2FkZXJzLmZvckVhY2goZnVuY3Rpb24gKGxvYWRlcikge1xuICAgICAgICAgICAgICAgIF90aGlzLnF1ZXVlZC5wdXNoKGxvYWRlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBNdWx0aUxvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgZXJyb3JlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheSh0aGlzLnF1ZXVlZC5sZW5ndGgpO1xuXG4gICAgICAgIHRoaXMucXVldWVkLmZvckVhY2goZnVuY3Rpb24gKGxvYWRlciwgaW5kZXgpIHtcbiAgICAgICAgICAgIGxvYWRlci5sb2FkKGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhsb2FkZXIudXJsKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHJlcztcbiAgICAgICAgICAgICAgICBfdGhpcy5xdWV1ZWRbaW5kZXhdID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5xdWV1ZWQuZXZlcnkoZnVuY3Rpb24gKGxvYWRlcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIWxvYWRlcjtcbiAgICAgICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5xdWV1ZWQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBNdWx0aUxvYWRlcjtcbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTXVsdGlMb2FkZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1NdWx0aUxvYWRlci5qcy5tYXBcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBKU09OTG9hZGVyID0gcmVxdWlyZSgnLi9KU09OTG9hZGVyJyk7XG52YXIgU3ByaXRlU2hlZXRMb2FkZXIgPSByZXF1aXJlKCcuL1Nwcml0ZVNoZWV0TG9hZGVyJyk7XG5cbnZhciB1cmxFeHAgPSAvXiguKj8pKFxcLz8pKFteXFwvXSs/KSQvO1xuXG5mdW5jdGlvbiBnZXRVUkwobWFpbiwgYXBwZW5kKSB7XG4gICAgdXJsRXhwLmxhc3RJbmRleCA9IDA7XG4gICAgdmFyIG1hdGNoID0gdXJsRXhwLmV4ZWMobWFpbik7XG4gICAgcmV0dXJuIG1hdGNoWzFdICsgbWF0Y2hbMl0gKyBhcHBlbmQ7XG59XG5cbnZhciBTcHJpdGVTaGVldEpTT05Mb2FkZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNwcml0ZVNoZWV0SlNPTkxvYWRlcih1cmwsIHVzZUFscGhhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdXNlQWxwaGEgPT09IFwidW5kZWZpbmVkXCIpIHsgdXNlQWxwaGEgPSBmYWxzZTsgfVxuICAgICAgICB0aGlzLnVybCA9IHVybDtcbiAgICAgICAgdGhpcy51c2VBbHBoYSA9IHVzZUFscGhhO1xuICAgIH1cbiAgICBTcHJpdGVTaGVldEpTT05Mb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgbmV3IEpTT05Mb2FkZXIodGhpcy51cmwpLmxvYWQoZnVuY3Rpb24gKGVyciwganNvbikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coanNvbik7XG4gICAgICAgICAgICBuZXcgU3ByaXRlU2hlZXRMb2FkZXIoZ2V0VVJMKF90aGlzLnVybCwganNvbi5pbWFnZSksIGpzb24sIF90aGlzLnVzZUFscGhhKS5sb2FkKGNhbGxiYWNrKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gU3ByaXRlU2hlZXRKU09OTG9hZGVyO1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVTaGVldEpTT05Mb2FkZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1TcHJpdGVTaGVldEpTT05Mb2FkZXIuanMubWFwXG4iLCIndXNlIHN0cmljdCc7XG52YXIgQml0bWFwID0gcmVxdWlyZSgnLi4vY29yZS9CaXRtYXAnKTtcbnZhciBTcHJpdGVTaGVldCA9IHJlcXVpcmUoJy4uL2NvcmUvU3ByaXRlU2hlZXQnKTtcblxudmFyIEltYWdlRGF0YUxvYWRlciA9IHJlcXVpcmUoJy4vSW1hZ2VEYXRhTG9hZGVyJyk7XG5cbnZhciBTcHJpdGVTaGVldExvYWRlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3ByaXRlU2hlZXRMb2FkZXIodXJsLCBvcHRzLCB1c2VBbHBoYSkge1xuICAgICAgICBpZiAodHlwZW9mIHVzZUFscGhhID09PSBcInVuZGVmaW5lZFwiKSB7IHVzZUFscGhhID0gZmFsc2U7IH1cbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG4gICAgICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgICAgIHRoaXMudXNlQWxwaGEgPSB1c2VBbHBoYTtcbiAgICB9XG4gICAgU3ByaXRlU2hlZXRMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgbmV3IEltYWdlRGF0YUxvYWRlcih0aGlzLnVybCkubG9hZChmdW5jdGlvbiAoZXJyLCBpbWFnZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb3V0ZXJNYXJnaW4gPSAoX3RoaXMub3B0cy5vdXRlck1hcmdpbiB8fCAwKTtcbiAgICAgICAgICAgIHZhciBpbm5lck1hcmdpbiA9IChfdGhpcy5vcHRzLmlubmVyTWFyZ2luIHx8IDApO1xuXG4gICAgICAgICAgICB2YXIgc2hlZXQgPSBuZXcgU3ByaXRlU2hlZXQoX3RoaXMub3B0cy5zcHJpdGVzWCwgX3RoaXMub3B0cy5zcHJpdGVzWSk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGl5ID0gMDsgaXkgPCBfdGhpcy5vcHRzLnNwcml0ZXNZOyBpeSsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXggPSAwOyBpeCA8IF90aGlzLm9wdHMuc3ByaXRlc1g7IGl4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHggPSBvdXRlck1hcmdpbiArIGl4ICogKF90aGlzLm9wdHMuc2l6ZVggKyBpbm5lck1hcmdpbik7XG4gICAgICAgICAgICAgICAgICAgIHZhciB5ID0gb3V0ZXJNYXJnaW4gKyBpeSAqIChfdGhpcy5vcHRzLnNpemVZICsgaW5uZXJNYXJnaW4pO1xuICAgICAgICAgICAgICAgICAgICBzaGVldC5hZGRTcHJpdGUoQml0bWFwLmNsaXBGcm9tRGF0YShpbWFnZS5kYXRhLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LCA0LCB4LCB5LCBfdGhpcy5vcHRzLnNpemVYLCBfdGhpcy5vcHRzLnNpemVZLCBfdGhpcy51c2VBbHBoYSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHNoZWV0KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gU3ByaXRlU2hlZXRMb2FkZXI7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZVNoZWV0TG9hZGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U3ByaXRlU2hlZXRMb2FkZXIuanMubWFwXG4iLCIndXNlIHN0cmljdCc7XG5mdW5jdGlvbiBnZXRYSFIoKSB7XG4gICAgaWYgKFhNTEh0dHBSZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB9XG4gICAgdHJ5ICB7XG4gICAgICAgIHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgIH1cbiAgICB0cnkgIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC4zLjAnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgfVxuICAgIHRyeSAge1xuICAgICAgICByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LicpO1xufVxuXG52YXIgVGV4dExvYWRlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVGV4dExvYWRlcih1cmwpIHtcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG4gICAgfVxuICAgIFRleHRMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdHJ5ICB7XG4gICAgICAgICAgICB2YXIgeGhyID0gZ2V0WEhSKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGUsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB4aHIub3BlbignR0VUJywgdGhpcy51cmwsIHRydWUpO1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1SZXF1ZXN0ZWQtV2l0aCcsICdYTUxIdHRwUmVxdWVzdCcpO1xuICAgICAgICB4aHIuc2VuZChudWxsKTtcbiAgICB9O1xuICAgIHJldHVybiBUZXh0TG9hZGVyO1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZXh0TG9hZGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9VGV4dExvYWRlci5qcy5tYXBcbiIsInZhciBJbWFnZURhdGFMb2FkZXIgPSByZXF1aXJlKCcuL0ltYWdlRGF0YUxvYWRlcicpO1xuZXhwb3J0cy5JbWFnZURhdGFMb2FkZXIgPSBJbWFnZURhdGFMb2FkZXI7XG52YXIgQml0bWFwTG9hZGVyID0gcmVxdWlyZSgnLi9CaXRtYXBMb2FkZXInKTtcbmV4cG9ydHMuQml0bWFwTG9hZGVyID0gQml0bWFwTG9hZGVyO1xudmFyIFRleHRMb2FkZXIgPSByZXF1aXJlKCcuL1RleHRMb2FkZXInKTtcbmV4cG9ydHMuVGV4dExvYWRlciA9IFRleHRMb2FkZXI7XG52YXIgSlNPTkxvYWRlciA9IHJlcXVpcmUoJy4vSlNPTkxvYWRlcicpO1xuZXhwb3J0cy5KU09OTG9hZGVyID0gSlNPTkxvYWRlcjtcbnZhciBTcHJpdGVTaGVldExvYWRlciA9IHJlcXVpcmUoJy4vU3ByaXRlU2hlZXRMb2FkZXInKTtcbmV4cG9ydHMuU3ByaXRlU2hlZXRMb2FkZXIgPSBTcHJpdGVTaGVldExvYWRlcjtcbnZhciBTcHJpdGVTaGVldEpTT05Mb2FkZXIgPSByZXF1aXJlKCcuL1Nwcml0ZVNoZWV0SlNPTkxvYWRlcicpO1xuZXhwb3J0cy5TcHJpdGVTaGVldEpTT05Mb2FkZXIgPSBTcHJpdGVTaGVldEpTT05Mb2FkZXI7XG52YXIgTXVsdGlMb2FkZXIgPSByZXF1aXJlKCcuL011bHRpTG9hZGVyJyk7XG5leHBvcnRzLk11bHRpTG9hZGVyID0gTXVsdGlMb2FkZXI7XG5cbltcbiAgICBleHBvcnRzLk11bHRpTG9hZGVyLFxuICAgIGV4cG9ydHMuSW1hZ2VEYXRhTG9hZGVyLFxuICAgIGV4cG9ydHMuQml0bWFwTG9hZGVyLFxuICAgIGV4cG9ydHMuVGV4dExvYWRlcixcbiAgICBleHBvcnRzLkpTT05Mb2FkZXIsXG4gICAgZXhwb3J0cy5TcHJpdGVTaGVldExvYWRlcixcbiAgICBleHBvcnRzLlNwcml0ZVNoZWV0SlNPTkxvYWRlclxuXTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvYWRlci5qcy5tYXBcbiIsIid1c2Ugc3RyaWN0JztcbmZ1bmN0aW9uIGNsZWFyQWxwaGEoZGF0YSkge1xuICAgIHZhciBsaW0gPSBkYXRhLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMzsgaSA8IGxpbTsgaSsrKSB7XG4gICAgICAgIGRhdGFbaV0gPSAyNTU7XG4gICAgfVxufVxuXG52YXIgQ2FudmFzUmVuZGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYW52YXNSZW5kZXIoYml0bWFwLCBjYW52YXMpIHtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG5cbiAgICAgICAgdGhpcy5weCA9IGJpdG1hcC5kYXRhO1xuICAgICAgICB0aGlzLndpZHRoID0gYml0bWFwLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGJpdG1hcC5oZWlnaHQ7XG4gICAgICAgIHRoaXMuY2hhbm5lbHMgPSBiaXRtYXAudXNlQWxwaGEgPyA0IDogMztcblxuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdGhpcy5vdXRwdXQgPSB0aGlzLmN0eC5jcmVhdGVJbWFnZURhdGEodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgY2xlYXJBbHBoYSh0aGlzLm91dHB1dC5kYXRhKTtcblxuICAgICAgICB0aGlzLmN0eC5wdXRJbWFnZURhdGEodGhpcy5vdXRwdXQsIDAsIDApO1xuICAgIH1cbiAgICBDYW52YXNSZW5kZXIucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMub3V0cHV0LndpZHRoICE9PSB0aGlzLmNhbnZhcy53aWR0aCB8fCB0aGlzLm91dHB1dC5oZWlnaHQgIT09IHRoaXMuY2FudmFzLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5vdXRwdXQgPSB0aGlzLmN0eC5jcmVhdGVJbWFnZURhdGEodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgICAgIGNsZWFyQWxwaGEodGhpcy5vdXRwdXQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ2FudmFzUmVuZGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5vdXRwdXQuZGF0YTtcbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy5vdXRwdXQud2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLm91dHB1dC5oZWlnaHQ7XG5cbiAgICAgICAgdmFyIGZ4ID0gdGhpcy53aWR0aCAvIHdpZHRoO1xuICAgICAgICB2YXIgZnkgPSB0aGlzLmhlaWdodCAvIGhlaWdodDtcblxuICAgICAgICBmb3IgKHZhciBpeSA9IDA7IGl5IDwgaGVpZ2h0OyBpeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpeCA9IDA7IGl4IDwgd2lkdGg7IGl4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoaXggKiBmeCk7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKGl5ICogZnkpO1xuICAgICAgICAgICAgICAgIHZhciByZWFkID0gKHggKyB5ICogdGhpcy53aWR0aCkgKiB0aGlzLmNoYW5uZWxzO1xuICAgICAgICAgICAgICAgIHZhciB3cml0ZSA9IChpeCArIGl5ICogd2lkdGgpICogNDtcblxuICAgICAgICAgICAgICAgIGRhdGFbd3JpdGVdID0gdGhpcy5weFtyZWFkXTtcbiAgICAgICAgICAgICAgICBkYXRhW3dyaXRlICsgMV0gPSB0aGlzLnB4W3JlYWQgKyAxXTtcbiAgICAgICAgICAgICAgICBkYXRhW3dyaXRlICsgMl0gPSB0aGlzLnB4W3JlYWQgKyAyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN0eC5wdXRJbWFnZURhdGEodGhpcy5vdXRwdXQsIDAsIDApO1xuICAgIH07XG5cbiAgICBDYW52YXNSZW5kZXIucHJvdG90eXBlLmRlc3RydWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnB4ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jdHggPSBudWxsO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IG51bGw7XG4gICAgICAgIHRoaXMub3V0cHV0ID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBDYW52YXNSZW5kZXI7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1JlbmRlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUNhbnZhc1JlbmRlcmVyLmpzLm1hcFxuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHZlcnRleFNoYWRlclNvdXJjZSA9IFtcbiAgICAnYXR0cmlidXRlIHZlYzIgYV9wb3NpdGlvbjsnLFxuICAgICdhdHRyaWJ1dGUgdmVjMiBhX3RleENvb3JkOycsXG4gICAgJ3ZhcnlpbmcgdmVjMiB2X3RleENvb3JkOycsXG4gICAgJ3ZvaWQgbWFpbigpIHsnLFxuICAgICcgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KGFfcG9zaXRpb24sIDAsIDEpOycsXG4gICAgJyAgICB2X3RleENvb3JkID0gYV90ZXhDb29yZDsnLFxuICAgICd9J1xuXS5qb2luKCdcXG4nKTtcblxudmFyIGZyYWdtZW50U2hhZGVyU291cmNlID0gW1xuICAgICdwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsnLFxuICAgICd1bmlmb3JtIHNhbXBsZXIyRCB1X2ltYWdlOycsXG4gICAgJ3ZhcnlpbmcgdmVjMiB2X3RleENvb3JkOycsXG4gICAgJ3ZvaWQgbWFpbigpIHsnLFxuICAgICcgICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVfaW1hZ2UsIHZfdGV4Q29vcmQpOycsXG4gICAgJ30nXG5dLmpvaW4oJ1xcbicpO1xuXG5mdW5jdGlvbiBsb2FkU2hhZGVyKGdsLCBzaGFkZXJTb3VyY2UsIHNoYWRlclR5cGUpIHtcbiAgICB2YXIgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKHNoYWRlclR5cGUpO1xuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNoYWRlclNvdXJjZSk7XG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuXG4gICAgdmFyIGNvbXBpbGVkID0gZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpO1xuICAgIGlmICghY29tcGlsZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdlcnJvciBjb21waWxpbmcgc2hhZGVyIFwiJyArIHNoYWRlciArICdcIjonICsgZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpKTtcbiAgICB9XG4gICAgcmV0dXJuIHNoYWRlcjtcbn1cblxudmFyIFdlYkdMUmVuZGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBXZWJHTFJlbmRlcihiaXRtYXAsIGNhbnZhcykge1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgdGhpcy53aWR0aCA9IGJpdG1hcC53aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBiaXRtYXAuaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMucHggPSBuZXcgVWludDhBcnJheShiaXRtYXAuYnVmZmVyKTtcblxuICAgICAgICBpZiAoIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IFdlZ0dMJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZ2xPcHRzID0geyBhbHBoYTogZmFsc2UgfTtcblxuICAgICAgICB2YXIgZ2wgPSB0aGlzLmdsID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wnLCBnbE9wdHMpIHx8IHRoaXMuY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIGdsT3B0cyk7XG4gICAgICAgIGlmICghZ2wpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IGNyZWF0ZSBXZWJHTCBjb250ZXh0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcblxuICAgICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgbG9hZFNoYWRlcihnbCwgdmVydGV4U2hhZGVyU291cmNlLCBnbC5WRVJURVhfU0hBREVSKSk7XG4gICAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBsb2FkU2hhZGVyKGdsLCBmcmFnbWVudFNoYWRlclNvdXJjZSwgZ2wuRlJBR01FTlRfU0hBREVSKSk7XG4gICAgICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuXG4gICAgICAgIHZhciBsaW5rZWQgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKTtcbiAgICAgICAgaWYgKCFsaW5rZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigoJ2Vycm9yIGluIHByb2dyYW0gbGlua2luZzonICsgZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSkpKTtcbiAgICAgICAgfVxuICAgICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb25Mb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICdhX3Bvc2l0aW9uJyk7XG4gICAgICAgIHRoaXMudGV4Q29vcmRMb2NhdGlvbiA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICdhX3RleENvb3JkJyk7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbkJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5wb3NpdGlvbkJ1ZmZlcik7XG5cbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5wb3NpdGlvbkxvY2F0aW9uKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnBvc2l0aW9uTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG5cbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgICAgICAgICAgLTEuMCwgLTEuMCxcbiAgICAgICAgICAgIDEuMCwgLTEuMCxcbiAgICAgICAgICAgIC0xLjAsIDEuMCxcbiAgICAgICAgICAgIC0xLjAsIDEuMCxcbiAgICAgICAgICAgIDEuMCwgLTEuMCxcbiAgICAgICAgICAgIDEuMCwgMS4wXG4gICAgICAgIF0pLCBnbC5TVEFUSUNfRFJBVyk7XG5cbiAgICAgICAgdGhpcy50ZXhDb29yZEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy50ZXhDb29yZEJ1ZmZlcik7XG5cbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy50ZXhDb29yZExvY2F0aW9uKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnRleENvb3JkTG9jYXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG5cbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgICAgICAgICAgMC4wLCAxLjAsXG4gICAgICAgICAgICAxLjAsIDEuMCxcbiAgICAgICAgICAgIDAuMCwgMC4wLFxuICAgICAgICAgICAgMC4wLCAwLjAsXG4gICAgICAgICAgICAxLjAsIDEuMCxcbiAgICAgICAgICAgIDEuMCwgMC4wXG4gICAgICAgIF0pLCBnbC5TVEFUSUNfRFJBVyk7XG5cbiAgICAgICAgdGhpcy50ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmUpO1xuXG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG5cbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLCAwLCAwLCAxKTtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XG5cbiAgICAgICAgZ2wuY29sb3JNYXNrKHRydWUsIHRydWUsIHRydWUsIGZhbHNlKTtcblxuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICB9XG4gICAgV2ViR0xSZW5kZXIucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5nbC5jbGVhcih0aGlzLmdsLkNPTE9SX0JVRkZFUl9CSVQpO1xuICAgIH07XG5cbiAgICBXZWJHTFJlbmRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy5nbC5URVhUVVJFXzJELCAwLCB0aGlzLmdsLlJHQiwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDAsIHRoaXMuZ2wuUkdCLCB0aGlzLmdsLlVOU0lHTkVEX0JZVEUsIHRoaXMucHgpO1xuXG4gICAgICAgIHRoaXMuZ2wuZHJhd0FycmF5cyh0aGlzLmdsLlRSSUFOR0xFUywgMCwgNik7XG4gICAgfTtcblxuICAgIFdlYkdMUmVuZGVyLnByb3RvdHlwZS5kZXN0cnVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5nbC5jbGVhcih0aGlzLmdsLkNPTE9SX0JVRkZFUl9CSVQpO1xuXG4gICAgICAgIHRoaXMuZ2wgPSBudWxsO1xuICAgICAgICB0aGlzLnB4ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIFdlYkdMUmVuZGVyO1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBXZWJHTFJlbmRlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdlYkdMUmVuZGVyZXIuanMubWFwXG4iXX0=
(16)
});
