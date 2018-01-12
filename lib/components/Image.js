var React = require('react');
var PropTypes = require('prop-types');
var BaseImage = require('./BaseImage');
var createClass = require('create-react-class');

/** Equivalent to html <img> element
  *
  * <img alt src srcset sizes crossorigin usemap ismap width height>
  */
var ImageComponent = module.exports = createClass({


    propTypes: {
        srcSet: PropTypes.string.isRequired,
        alt: PropTypes.string.isRequired,
        extra: PropTypes.object,
        nativeSupport: PropTypes.string
    },


    getDefaultProps: function () {
        // Calculate nativeSupport in getDefaultProps so we don't
        // check this everytime the component is mounted despite
        // making it much harder for testing
        var nativeSupport = 'full';
        if (typeof document !== 'undefined') {
            var img = document.createElement('img');
            ('srcset' in img) ? nativeSupport = 'partial' : nativeSupport = 'none';
            (nativeSupport === 'partial' && 'sizes' in img) ? nativeSupport = 'full' : nativeSupport = 'partial';
        }

        return {
            extra: {},
            nativeSupport: nativeSupport
        };
    },


    render: function () {

        return <BaseImage {...this.props}/>;
    }
});
