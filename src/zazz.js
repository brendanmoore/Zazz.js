(function(global){

    var Zazz = {},
        modules = {};

    Zazz.define = function(module, fn) {
      modules[module] = fn.call(Zazz);
    };

    Zazz.require = function(module) {
      return modules[module];
    };

    global.Zazz = Zazz;

})(window);

Zazz.define('Util', function(){


    var rdashAlpha = /-([a-z])/ig,
        vendorString,
        prefixedVendorString,
        n = navigator,
        ua = n.userAgent,
        appVer = n.appVersion,
        ObjProto = Object.prototype,
        ArrProto = Array.prototype;


    function toStr(o) {
      return ObjProto.toString.call(o);
    }

    function hasProp(obj, prop) {
      return ObjProto.hasOwnProperty.call(obj, prop);
    }

    function _type (obj) {
        var type = toStr(obj).match(/\s(\w+)\]$/);
        return type && type[1].toLowerCase();
    }

    function isStr(o) {
      return _type(o) === 'string';
    }

    function isNum(object) {
      return !isNaN(+object);
    }

    function isArr(o) {
      return _type(o) ==='array';
    }

    function isObj(o) {
      return _type(o) === 'object';
    }

    function isCollection(o) {
      return _type(o) === 'nodeList' ||
             _type(o) === 'htmlcollection';
    }

    function isElement(element) {
      return element && (element.nodeType === 1 || element.nodeType === 9);
    }

    function isFnc(o) {
      return _type(o) === 'function';
    }

    function isBottomValue(o) {
      return o === false || o === null ||!isDefined(o) || o === 0;
    }

    function isEmptyObject(obj) {
      if(!isObj(obj)) return false;
      var prop;
      for(prop in obj) {
        if(hasProp(obj, prop)){
          return false;
        }
      }
      return true;
    }

    function isComplex(object) {
      if(!isObj) return false;
      var prop;
      for(prop in object) {
        if(isObj(object[prop])) return true;
      }
    }


    function isEmpty(o) {
      return  isBottomValue(o) ||
              o === '' ||
              o.length === 0 ||
              isEmptyObject(o);
    }

    function toArray(object) {

      //Array or null
      if(!object || isArr(object)) {
        return object;
      }
      //Array like object.
      if(+object.length === object.length) {
        return ArrProto.slice.call(object);
      }

      if(isObj(object) && !isEmpty(object)){
        var arr = [];
        forEach(object, function(value){
          arr[arr.length] = value;
        });
        return arr;
      }


    }

    function forEach(o, cb, ctx) {

      var i, l, prop;
      ctx = ctx || window;
      if(isArr(o)){
        l=o.length;
        for(i=0; i<l; i++) if(cb.call(ctx, o[i], i) === false) break;

      } else if(isObj(o)) {

        for(prop in o) if(cb.call(ctx, o[prop], prop) === false) break;

      } else {

        return false;

      }
    }

    function isDefined(object) {
      return object !== void(0);
    }

    function matchToCamelCase(all, l) {
      return l.toUpperCase();
    }

    function camelCase(string) {
      return string.replace(rdashAlpha, matchToCamelCase);
    }

    function vendorPrefix() {
      if(!isDefined(prefixedVendorString)) {
        prefixedVendorString = '-' + vendor().toLowerCase() +'-';
      }
      return prefixedVendorString;
    }

    function vendor() {
      if(!isDefined(vendorString)) {
        vendorString = (/webkit/i).test(appVer) ? 'webkit' :
                       (/firefox/i).test(ua) ? 'Moz' :
                       (/trident/i).test(ua) ? 'ms' :
                       'opera' in window ? 'O' : '';
      }
      return vendorString;
    }

    function extend(/* polymorphic */) {
      var args = toArray(arguments),
          newObj = {};
      forEach(args, function(arg){
        forEach(arg, function(value, key){
          newObj[key] = value;
        });
      });
      return newObj;
    }

    return {
      isDefined: isDefined,
      isStr: isStr,
      isNum: isNum,
      isArr: isArr,
      isObj: isObj,
      isEmptyObject: isEmptyObject,
      isCollection: isCollection,
      isElement: isElement,
      isComplex: isComplex,
      toArray: toArray,
      camelCase: camelCase,
      vendor: vendor,
      vendorPrefix: vendorPrefix,
      forEach: forEach,
      extend: extend
    };

});

Zazz.define('Log', function(){

  var Log = console.log.bind(console);

  return Log;

});

Zazz.define('CSS', function(){

    var util = Zazz.require('Util'),
        vendorPrefix = util.vendorPrefix(),
        props = "animation animation-delay animation-direction animation-duration animation-fill-mode animation-iteration-count animation-name animation-timing-function backface-visibility background-clip background-origin background-size border-bottom-left-radius border-bottom-right-radius border-radius border-top-left-radius border-top-right-radius box-shadow box-sizing column-count column-gap column-rule column-rule-color column-rule-style column-rule-width column-span column-width columns filter flex flex-basis flex-direction perspective perspective-origin tab-size transform transform-origin transform-style transition transition-delay transition-duration transition-property transition-timing-function user-select".split(' '),
        propMap = {},
        detachedElement = document.createElement('div');

        function prefixWith(props, prefix) {
          var map = {};
          util.forEach(props, function(prop) {
            map[prop] = prefix + prop;
          });
          return map;
        }

        propMap = prefixWith(props, vendorPrefix);

        //_populatePropMap();

        function prefixCSS(cssObj) {

          var propLc,
              retCSS = {};

          if(util.isStr(cssObj)) {
            return prefix(cssObj);
          }

          util.forEach(cssObj, function(value, prop){
              retCSS[prefix(prop)] = value;
          });

          return retCSS;

        }

        function prefix(property) {
          property = property.toLowerCase();
          return propMap[property] || property;
        }

        function stringify(cssObj) {
          var str = '';
          util.forEach(cssObj, function(value, prop){
            str += prop+':'+value+';' + "\n";
          });
          return str;
        }


        function detectSupport(prop) {

          return (util.camelCase(prop) in detachedElement.style) ||
                 (util.camelCase(propMap[prop]) in detachedElement.style);

        }

        function applyCSS(element, css) {
          util.forEach(css, function(value, prop){
            try {
              element.style[util.camelCase(prop)] = value;
            } catch(e) { console.log(e); }
          });
        }

    //Export Method
    Zazz.prefixCSS = prefixCSS;

    return {
      prefix: prefixCSS,
      stringify: stringify,
      detectSupport: detectSupport,
      applyCSS: applyCSS
    };

});

Zazz.define('Transition', function(){

    var util = Zazz.require('Util'),
        Log = Zazz.require('Log'),
        vendor = util.vendor(),
        css = Zazz.require('CSS'),
        hasSupport = css.detectSupport('transition'),
        transProps = "property timing-function duration delay".split(' '),
        listener = (vendor !=='Moz')? vendor+'TransitionEnd' : 'transitionend',
        baseOpts = {
          css: {},
          delay: 0,
          property: 'all',
          timingFunction: 'linear',
          duration: 1,
          callback: null
        },
        reqSuffix = ['delay', 'duration'];


    function Transition(element, options) {

      var self = this;

      self.opts = util.extend(baseOpts, options);
      self.transProps = {};

      self.baseProps();
      self.css = css.prefix(util.extend(
          self.opts.css,
          self.transProps
        ));
      if(self.opts.callback) {
        var callback = function(){
            self.opts.callback.apply(this, util.toArray(arguments));
            element.removeEventListener(listener, callback);
        };
        element.addEventListener(listener, callback);
      }
      setTimeout(function(){
        css.applyCSS(element, self.css);
      },0);

    }

    Transition.prototype = {

      baseProps: function(){
        var self = this,
          camelised,
          optionValue;

        util.forEach(transProps, function(value){
          camelised = util.camelCase(value);
          optionValue = self.opts[camelised];
          if(util.isNum(optionValue) && !!~reqSuffix.indexOf(camelised)) {
            optionValue += 's';
          }
          self.transProps['transition-'+value] = optionValue;
        });
      }

    };

    function factory(element, options) {

      if(!hasSupport) {
        //Log('CSS Transitions are not supported by this browser');
        return;
      }

      if(util.isStr(element)){
        element = document.querySelector(element);
      }
      //Log('CSS Transitions Supported!', element);
      if(!util.isElement(element)) {
        throw new Error('Cannot transition non-element');
      }
      try{
        return new Transition(element, options);
      }catch(e){console.log(e.stack);}
    }

    Zazz.transition = factory;

    return {};

});

Zazz.define('Animation', function(){

    var d = document,
        util = Zazz.require('Util'),
        Log = Zazz.require('Log'),
        css = Zazz.require('CSS'),
        hasSupport = css.detectSupport('animation-name'),
        uid = 0,
        baseName = 'zazzAnimation',
        dataAttr = 'data-zazz-anim-id',
        rKeyFrame = /^[0-9]+%/,
        vendor = util.vendor(),
        isMoz = vendor=='Moz',
        animProps = "name iteration-count timing-function direction duration delay fill-mode".split(' '),
        iterationListener = (!isMoz)? vendor+'AnimationIteration' : 'animationiteration',
        startListener     = (!isMoz)? vendor+'AnimationStart' : 'animationstart',
        endListener       = (!isMoz)? vendor+'AnimationEnd' : 'animationend',
        baseOpts = {
            duration: 1,
            delay: 0,

            // Configures the number of times the animation
            // should repeat; you can specify infinite to
            // repeat the animation indefinitely.
            iterationCount: 'infinite',

            // Configures the timing of the animation; that is,
            // how the animation transitions through keyframes,
            // by establishing acceleration curves.
            timingFunction: 'linear',

            // Configures whether or not the animation should
            // alternate direction on each run through
            // sequence or reset to the start point and repeat
            // itself.
            //
            // (string):
            //  - normal
            //      The animation should play forward each cycle. In other words,
            //      each time the animation cycles, the animation will reset to the
            //      beginning state and start over again. This is the default
            //      animation direction setting.
            //  - alternate
            //      The animation should reverse direction each cycle. When playing in
            //      reverse, the animation steps are performed backward. In addition,
            //      timing functions are also reversed; for example, an ease-in
            //      animation is replaced with an ease-out animation when played in
            //      reverse. The count to determinate if it is an even or an odd
            //      iteration starts at one.
            //  - reverse
            //      The animation plays backward each cycle. Each time the animation
            //      cycles, the animation resets to the end state and start over
            //      again.
            //  - alternate-reverse
            //      The animation plays backward on the first play-through, then
            //      forward on the next, then continues to alternate. The count to
            //      determinate if it is an even or an odd iteration starts at one.
            direction: 'normal',

            // Configures what values are applied by the
            // animation before and after it is executing.
            fillMode: 'forwards',

            // Specifies the name of the @keyframes at-rule
            // describing the animation's keyframes.
            // This will be auto generated if not set.
            name: baseName,

            pauseOnHover: false,

            //array/object of steps
            steps: null,

            // When set to false allows for chaining
            // of .step();
            preventImmediateStart: false,

            // Callback function fired after every iteration.
            iterationCallback: null,

            // Callback function fired on start of the
            // animation, triggered after the inital delay has
            // elapsed
            startCallback: null,

            // Callback function fired on completion of final
            // interation.
            // Will not fire if interationCount = 'infinite'
            endCallback: null,

            selfDestruct: false

          },
        reqSuffix = ['delay', 'duration'];

    function _addStyleBlock(id, animation) {

      var s = d.createElement('style'),
          rules = d.createTextNode(animation);
      s.type = 'text/css';
      s.id = id;
      s.className = baseName,
      s.appendChild(rules);
      d.getElementsByTagName("head")[0].appendChild(s);

    }

    function _removeStyleBlock(id) {

      var s = d.getElementById(id);
      if(util.isDefined(s)) {
        s.parentNode.removeChild(s);
      }

    }

    function Animation(element, options) {

      var self = this;

      self.id = baseName + (++uid);

      self.opts = util.extend(
          baseOpts,
          {name: baseName+(new Date()).getTime()},
          options
        );
      self.elementId = element.id || null;

      self.addStep(self.opts.steps);

      self.setRef(element);

      self.setProps();

      self.bind(element);

      setTimeout(function(){
        _addStyleBlock(self.id, self.toString());
        css.applyCSS(element, self.props);
      },0);

    }

    Animation.prototype = {

      setRef: function(element) {
        element.setAttribute(dataAttr, this.id);
      },

      step: function(keyframe, css) {

        if(util.isObj(keyframe)) {
          this.addStep(keyframe);
        }else{
          var step = {};
          step[keyframe] = css;
          this.addStep(step);
        }
        return this;
      },

      addStep: function(step) {
        var self = this;
        if(!util.isComplex(step)){
          step = {100: step}; //assume last step;
        }
        self.steps = self.steps || {};
        util.forEach(step, function(params, step){
          if(!rKeyFrame.test(step) && util.isNum(step)) {
            step += '%';
          }
          self.steps[step] = css.prefix(params);
        });
        if(!self.steps['0%']) {
          self.steps['0%'] = {};
        }
        if(!self.steps['100%']) {
          self.steps['100%'] = {};
        }
      },

      setProps: function() {
        var self = this,
            camelised,
            optionValue;
        this.props = {};
        util.forEach(animProps, function(prop) {
          camelised = util.camelCase(prop);
          optionValue = self.opts[camelised];
          if(util.isNum(optionValue) && !!~reqSuffix.indexOf(camelised)) {
            optionValue += 's';
          }
          self.props['animation-'+prop] = optionValue;
        });
        this.props = css.prefix(this.props);
      },

      toString: function() {
        var string = '';
        string += '@' + util.vendorPrefix() + 'keyframes '+ this.opts.name +' {';
        util.forEach(this.steps, function(params, step){
          string += step + '{' + css.stringify(params) + '}';
        });
        return string;
      },

      bind: function(element) {
        var self = this,
            opts = self.opts,
            Bind = d.addEventListener.bind(element),
            unBind = d.removeEventListener.bind(element),
            startFn = opts.startCallback,
            iterationFn = opts.iterationCallback,
            endFn = function(e) {
              if(opts.endCallback) {
                opts.endCallback.call(this, e);
              }
              unBind(startListener, startFn);
              unBind(iterationListener, iterationFn);
              unBind(endListener, endFn);
              if(opts.selfDestruct) {
                _removeStyleBlock(self.id);
              }
            };
        if(startFn) {
          Bind(startListener, startFn);
        }
        if(iterationFn) {
          Bind(iterationListener, iterationFn);
        }
        Bind(endListener, endFn);
        //Log(Bind, self);
      }

    };

    function factory(element, options) {

      if(!hasSupport){
        //Log('CSS Animations are not supported by this browser');
        return;
      }

      //Log('CSS Animations Supported!', element);
      if(util.isStr(element)) {
        element = d.querySelector(element);
      }

      return new Animation(element, options);
    }

    Zazz.animation = factory;

    return {
      animation: Animation
    };

});

Zazz.define('AnimationPolyFill', function(){

  var util = Zazz.require('Util');

  function Animation(){

  }

  function Transition(){

  }

  function _animate( element, cssProps, config ) {
    var interpolations = {},
        startTime = new Date().getTime();

    // Find the start value and unit of each cssProps
    for( var p in cssProps ) {
        interpolations[p] = {
            start: parseFloat( element.style[p] ) || 0,
            end: parseFloat( cssProps[p] ),
            unit: ( typeof cssProps[p] === 'string' && cssProps[p].match( /px|em|%/gi ) ) ? cssProps[p].match( /px|em|%/gi )[0] : ''
        };
    }

    // Takes one step forward in the animation
    function step() {
        // Ease out equation over the specified duration
        var progress = 1 - Math.pow( 1 - ( ( new Date().getTime() - startTime ) / config.duration ), 5 );

        // Update styles to match current interpolated values
        for( var p in interpolations ) {
            var property = interpolations[p];
            element.style[p] = property.start + ( ( property.end - property.start ) * progress ) + property.unit;
        }

        // Repeat the above if we're not done
        if( progress < 1 ) {
            setTimeout( step, 1000 / 60 );
        }
        else if( config.complete ) {
            config.complete();
        }
    }

    // Start the animation
    step();
}

  return {
    animation: Animation,
    transition: Transition
  };
});
