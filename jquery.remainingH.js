/*
 * jQuery remainingH
 * Version 1.0
 *
 * jQuery Javascript plugin that automatically calculates the height dom elements content based on its parent and occupied previous all siblings size.
 *
 * author: Srinath Janakiraman
 *
 * Copyright (c) 2014 (vjsrinath.com)
 * Licensed under MIT license.
 */
(function (global, factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function (jQuery) {
            return factory(global, jQuery);
        });
        // CommonJS/Browserify
    } else if (typeof exports === 'object') {
        factory(global, require('jquery'));
        // Global
    } else {
        factory(global, global.jQuery);
    }
}(typeof window !== 'undefined' ? window : this, function (window, $) {
    // Convenience vars for accessing elements
    var $body = $('body'),
        key = 'remainingH',
        instances = {},
        $window = $(window),
        nextTick = window.setImmediate || function (cb) {
            return window.setTimeout(cb, 0);
        },
        eachAsync = function (array, iterator, done) {
            var i = -1,
                total = array.length,
                next = function () {
                    ++i;
                    if (i >= total) {
                        done && done();
                        return;
                    }
                    iterator(array[i], next, i);
                };
            next();
        },
        _id = 0,
        _generateId = function () {
            return _id++;
        };

    $window.on('resize', function () {
        for (var key in instances) {
            var instance = instances[key];
            instance._onResize();
        }
    });

    var controller = function ($container, options) {
        this.id = _generateId();

        var getOccupiedHeight = function ($elt) {
                var height = 0;
                $elt.prevAll().each(function () {
                    height += $(this).outerHeight();
                });
                return height;
            },
            //perform calculation of all matching element within current container
            calcAll = function () {
                eachAsync($container.find(options.sel), function (elt, next) {
                    calc($(elt), function () {
                        nextTick(next);
                    });
                });
            },
            _timer = null,
            active = true,
            //This method is throttle to make sure the logic is not execute too often
            //while the window is being resized
            _onResize = function () {
                _timer && clearTimeout(_timer);
                _timer = setTimeout(calcAll, options.delay);
            },
            __onNodeInserted = function (e) {
                calc($(e.target));
            },
            start = function () {
                if (active) return;
                active = true;
                $container.on('DOMNodeInserted', options.sel, __onNodeInserted);
            },
            stop = function () {
                active = false;
                $container.off('DOMNodeInserted', options.sel, __onNodeInserted);
            },
            calcSync = function ($elt) {
                var totalHeight = $elt.parent().height();
                if (!totalHeight) return;
                $elt.height(totalHeight - getOccupiedHeight($elt));
            },
            calc = function ($elt, callback) {
                if (!$elt.is(options.sel)) return;
                $elt.css({
                    height: 'auto'
                });
                if (options.asyncCalc) {
                    //perform layout operation once the callstack is cleared to keep the UI responsive
                    //this approach is highly helpful when the container contains has so many matching elements for the provided selector
                    nextTick(function () {
                        calcSync($elt);
                        callback && callback();
                    });
                } else {
                    calcSync($elt);
                    callback && callback();
                }
            };

        _onResize();
        start();

        /*Exposed APIs*/
        this.calc = calc;
        this.start = start;
        this.stop = stop;
        this._onResize = _onResize;
        this.destroy = $.proxy(function () {
            if (instances.hasOwnProperty(this.id)) {
                instances[this.id].stop();
                delete instances[this.id];
            }
        }, this);
    };


    /*
     * Declaration
     */
    $.fn.remainingH = function (options) {
        var opts = $.extend({}, $.fn.remainingH.defaults, options);
        var instance = instances[instance.id] = this.data(key) || new controller(this, opts);
        this.data(key, instance);
        return this;
    };

    /*
     * Default settings
     */
    $.fn.remainingH.defaults = {
        delay: 250, //how long to wait before calculating height of elements
        asyncCalc: true, //if set to false all the layout operation would be run during call stack itself
        sel: '.remaining-height' //jQuery selector to pick the elements which one height to be calculated based on its parent and previous siblings
    };

    return $;
}));