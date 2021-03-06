'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var PropTypes = require('prop-types');
var createClass = require('create-react-class');

var Utils = require('../utils');

/** Equivalent to html <img> element
  *
  * <img alt src srcset sizes crossorigin usemap ismap width height>
  */
var BaseImageComponent = module.exports = createClass({

    propTypes: {
        srcSet: PropTypes.string.isRequired,
        alt: PropTypes.string.isRequired,
        extra: PropTypes.object,
        nativeSupport: PropTypes.string
    },

    getDefaultProps: function getDefaultProps() {

        return {
            extra: {},
            nativeSupport: 'none'
        };
    },

    getInitialState: function getInitialState() {

        return {
            w: Utils.getWidth(),
            x: Utils.getDensity()
        };
    },

    componentDidMount: function componentDidMount() {

        if (this.props.nativeSupport !== 'full') {
            window.addEventListener('resize', this.resizeThrottler, false);
        }
    },

    componentWillUnmount: function componentWillUnmount() {

        if (!this.props.nativeSupport !== 'full') {
            window.removeEventListener('resize', this.resizeThrottler, false);
        }
    },

    render: function render() {

        if (!this.props.srcSet) {
            return null;
        }

        var candidates = BaseImageComponent._buildCandidates(this.props.srcSet);

        if (this.props.nativeSupport === 'full') {
            return this.renderNative(candidates);
        }

        return React.createElement('img', _extends({ alt: this.props.alt, src: BaseImageComponent._matchImage(candidates, Utils.getWidth(), Utils.getDensity()) }, this.props.extra));
    },

    renderNative: function renderNative(candidates) {

        return React.createElement('img', _extends({ alt: this.props.alt, src: candidates[0].url, srcSet: this.props.srcSet }, this.props.extra));
    },

    // Taken from https://developer.mozilla.org/en-US/docs/Web/Events/resize
    resizing: false,
    resizeThrottler: function resizeThrottler() {

        if (!this.resizing) {
            this.resizing = true;

            if (window && window.requestAnimationFrame) {
                window.requestAnimationFrame(this.onResize);
            } else {
                setTimeout(this.onResize, 66);
            }
        }
    },

    onResize: function onResize() {

        this.setState({ w: Utils.getWidth(), x: Utils.getDensity() });
        this.resizing = false;
    },

    statics: {

        _buildCandidates: function _buildCandidates(srcset) {

            return srcset.split(',').map(function (srcImg) {

                var stringComponents = srcImg.trim().split(' ');
                var candidate = {
                    url: stringComponents[0].trim(),
                    w: 0,
                    x: 1.0
                };

                for (var i = 1; i < stringComponents.length; i++) {
                    var str = stringComponents[i].trim();
                    if (str.indexOf('w', str.length - 1) !== -1) {
                        candidate.w = parseInt(str.substring(0, str.length - 1));
                    } else if (str.indexOf('x', str.length - 1) !== -1) {
                        candidate.x = parseFloat(str.substring(0, str.length - 1));
                    } else {
                        console.warn('Invalid parameter passed to Image srcSet: [' + str + '] in ' + srcImg);
                    }
                }

                return candidate;
            });
        },

        __compare: function __compare(a, b, state, accessorFn) {

            var aDt = accessorFn(a) - state;
            var bDt = accessorFn(b) - state;

            if (aDt === 0 && bDt !== 0 || // a perfectly matches target but b does not
            bDt < 0 && aDt >= 0) // b is less than target but a is the same or better
                {
                    return a;
                }

            if (bDt === 0 && aDt !== 0 || // b perfectly matches target but a does not
            aDt < 0 && bDt >= 0) // a is less than target but b is the same or better
                {
                    return b;
                }

            if (Math.abs(aDt) < Math.abs(bDt)) {
                return a;
            }

            if (Math.abs(bDt) < Math.abs(aDt)) {
                return b;
            }

            return a;
        },

        _matchImage: function _matchImage(candidates, width, density) {

            if (!candidates || candidates.length === 0) {
                return null;
            }

            var image = candidates.reduce(function (a, b) {

                if (a.x === b.x) {
                    // Both have the same density so attempt to find a better one using width
                    if (a.w === b.w) {
                        return a; // hey, it came first!
                    }

                    return BaseImageComponent.__compare(a, b, width, function (img) {
                        return img.w;
                    });
                }

                return BaseImageComponent.__compare(a, b, density, function (img) {
                    return img.x;
                });
            }).url;

            return image;
        }
    }
});