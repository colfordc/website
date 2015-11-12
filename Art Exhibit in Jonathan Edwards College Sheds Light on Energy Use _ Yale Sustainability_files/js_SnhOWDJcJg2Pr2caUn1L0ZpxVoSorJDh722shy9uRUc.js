/*
  Formalize - version 1.1

  Note: This file depends on the jQuery library.
*/

// Module pattern:
// http://yuiblog.com/blog/2007/06/12/module-pattern
var FORMALIZE = (function($, window, document, undefined) {
  // Private constants.
  var PLACEHOLDER_SUPPORTED = 'placeholder' in document.createElement('input');
  var AUTOFOCUS_SUPPORTED = 'autofocus' in document.createElement('input');
  var IE6 = !!($.browser.msie && parseInt($.browser.version, 10) === 6);
  var IE7 = !!($.browser.msie && parseInt($.browser.version, 10) === 7);

  // Expose innards of FORMALIZE.
  return {
    // FORMALIZE.go
    go: function() {
      for (var i in FORMALIZE.init) {
        FORMALIZE.init[i]();
      }
    },
    // FORMALIZE.init
    init: {
      // FORMALIZE.init.ie6_skin_inputs
      ie6_skin_inputs: function() {
        // Test for Internet Explorer 6.
        if (!IE6 || !$('input, select, textarea').length) {
          // Exit if the browser is not IE6,
          // or if no form elements exist.
          return;
        }

        // For <input type="submit" />, etc.
        var button_regex = /button|submit|reset/;

        // For <input type="text" />, etc.
        var type_regex = /date|datetime|datetime-local|email|month|number|password|range|search|tel|text|time|url|week/;

        $('input').each(function() {
          var el = $(this);

          // Is it a button?
          if (this.getAttribute('type').match(button_regex)) {
            el.addClass('ie6-button');

            /* Is it disabled? */
            if (this.disabled) {
              el.addClass('ie6-button-disabled');
            }
          }
          // Or is it a textual input?
          else if (this.getAttribute('type').match(type_regex)) {
            el.addClass('ie6-input');

            /* Is it disabled? */
            if (this.disabled) {
              el.addClass('ie6-input-disabled');
            }
          }
        });

        $('textarea, select').each(function() {
          /* Is it disabled? */
          if (this.disabled) {
            $(this).addClass('ie6-input-disabled');
          }
        });
      },
      // FORMALIZE.init.autofocus
      autofocus: function() {
        if (AUTOFOCUS_SUPPORTED || !$(':input[autofocus]').length) {
          return;
        }

        $(':input[autofocus]:visible:first').focus();
      },
      // FORMALIZE.init.placeholder
      placeholder: function() {
        if (PLACEHOLDER_SUPPORTED || !$(':input[placeholder]').length) {
          // Exit if placeholder is supported natively,
          // or if page does not have any placeholder.
          return;
        }

        FORMALIZE.misc.add_placeholder();

        $(':input[placeholder]').each(function() {
          var el = $(this);
          var text = el.attr('placeholder');

          el.focus(function() {
            if (el.val() === text) {
              el.val('').removeClass('placeholder-text');
            }
          }).blur(function() {
            FORMALIZE.misc.add_placeholder();
          });

          // Prevent <form> from accidentally
          // submitting the placeholder text.
          el.closest('form').submit(function() {
            if (el.val() === text) {
              el.val('').removeClass('placeholder-text');
            }
          }).bind('reset', function() {
            setTimeout(FORMALIZE.misc.add_placeholder, 50);
          });
        });
      }
    },
    // FORMALIZE.misc
    misc: {
      // FORMALIZE.misc.add_placeholder
      add_placeholder: function() {
        if (PLACEHOLDER_SUPPORTED || !$(':input[placeholder]').length) {
          // Exit if placeholder is supported natively,
          // or if page does not have any placeholder.
          return;
        }

        $(':input[placeholder]').each(function() {
          var el = $(this);
          var text = el.attr('placeholder');

          if (!el.val() || el.val() === text) {
            el.val(text).addClass('placeholder-text');
          }
        });
      }
    }
  };
// Alias jQuery, window, document.
})(jQuery, this, this.document);

// Automatically calls all functions in FORMALIZE.init
jQuery(document).ready(function() {
  FORMALIZE.go();
});
;
/**
 * @todo
 */

Drupal.omega = Drupal.omega || {};

(function($) {
  /**
   * @todo
   */
  var current;
  var previous;

  /**
   * @todo
   */
  var setCurrentLayout = function (index) {
    index = parseInt(index);
    previous = current;
    current = Drupal.settings.omega.layouts.order.hasOwnProperty(index) ? Drupal.settings.omega.layouts.order[index] : 'mobile';

    if (previous != current) {
      $('body').removeClass('responsive-layout-' + previous).addClass('responsive-layout-' + current);
      $.event.trigger('responsivelayout', {from: previous, to: current});
    }
  };

  /**
   * @todo
   */
  Drupal.omega.getCurrentLayout = function () {
    return current;
  };

  /**
   * @todo
   */
  Drupal.omega.getPreviousLayout = function () {
    return previous;
  };

  /**
   * @todo
   */
  Drupal.omega.crappyBrowser = function () {
    return $.browser.msie && parseInt($.browser.version, 10) < 9;
  };

  /**
   * @todo
   */
  Drupal.omega.checkLayout = function (layout) {
    if (Drupal.settings.omega.layouts.queries.hasOwnProperty(layout) && Drupal.settings.omega.layouts.queries[layout]) {
      var output = Drupal.omega.checkQuery(Drupal.settings.omega.layouts.queries[layout]);

      if (!output && layout == Drupal.settings.omega.layouts.primary) {
        var dummy = $('<div id="omega-check-query"></div>').prependTo('body');

        dummy.append('<style media="all">#omega-check-query { position: relative; z-index: -1; }</style>');
        dummy.append('<!--[if (lt IE 9)&(!IEMobile)]><style media="all">#omega-check-query { z-index: 100; }</style><![endif]-->');

        output = parseInt(dummy.css('z-index')) == 100;

        dummy.remove();
      }

      return output;
    }

    return false;
  };

  /**
   * @todo
   */
  Drupal.omega.checkQuery = function (query) {
    var dummy = $('<div id="omega-check-query"></div>').prependTo('body');

    dummy.append('<style media="all">#omega-check-query { position: relative; z-index: -1; }</style>');
    dummy.append('<style media="' + query + '">#omega-check-query { z-index: 100; }</style>');

    var output = parseInt(dummy.css('z-index')) == 100;

    dummy.remove();

    return output;
  };

  /**
   * @todo
   */
  Drupal.behaviors.omegaMediaQueries = {
    attach: function (context) {
      $('body', context).once('omega-mediaqueries', function () {
        var primary = $.inArray(Drupal.settings.omega.layouts.primary, Drupal.settings.omega.layouts.order);
        var dummy = $('<div id="omega-media-query-dummy"></div>').prependTo('body');

        dummy.append('<style media="all">#omega-media-query-dummy { position: relative; z-index: -1; }</style>');
        dummy.append('<!--[if (lt IE 9)&(!IEMobile)]><style media="all">#omega-media-query-dummy { z-index: ' + primary + '; }</style><![endif]-->');

        for (var i in Drupal.settings.omega.layouts.order) {
          dummy.append('<style media="' + Drupal.settings.omega.layouts.queries[Drupal.settings.omega.layouts.order[i]] + '">#omega-media-query-dummy { z-index: ' + i + '; }</style>');
        }

        $(window).bind('resize.omegamediaqueries', function () {
          setCurrentLayout(dummy.css('z-index'));
        }).load(function () {
          $(this).trigger('resize.omegamediaqueries');
        });
      });
    }
  };
})(jQuery);
;
/* Modernizr 2.6.1 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-touch-printshiv-mq-cssclasses-teststyles-prefixes
 */
;window.Modernizr=function(a,b,c){function x(a){j.cssText=a}function y(a,b){return x(m.join(a+";")+(b||""))}function z(a,b){return typeof a===b}function A(a,b){return!!~(""+a).indexOf(b)}function B(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:z(f,"function")?f.bind(d||b):f}return!1}var d="2.6.1",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n={},o={},p={},q=[],r=q.slice,s,t=function(a,c,d,e){var f,i,j,k=b.createElement("div"),l=b.body,m=l?l:b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),k.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),k.id=h,(l?k:m).innerHTML+=f,m.appendChild(k),l||(m.style.background="",g.appendChild(m)),i=c(k,a),l?k.parentNode.removeChild(k):m.parentNode.removeChild(m),!!i},u=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b).matches;var d;return t("@media "+b+" { #"+h+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},v={}.hasOwnProperty,w;!z(v,"undefined")&&!z(v.call,"undefined")?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=r.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(r.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(r.call(arguments)))};return e}),n.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:t(["@media (",m.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c};for(var C in n)w(n,C)&&(s=C.toLowerCase(),e[s]=n[C](),q.push((e[s]?"":"no-")+s));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)w(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},x(""),i=k=null,e._version=d,e._prefixes=m,e.mq=u,e.testStyles=t,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+q.join(" "):""),e}(this,this.document),function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}function v(a){var b,c=a.getElementsByTagName("*"),d=c.length,e=RegExp("^(?:"+l().join("|")+")$","i"),f=[];while(d--)b=c[d],e.test(b.nodeName)&&f.push(b.applyElement(w(b)));return f}function w(a){var b,c=a.attributes,d=c.length,e=a.ownerDocument.createElement(t+":"+a.nodeName);while(d--)b=c[d],b.specified&&e.setAttribute(b.nodeName,b.nodeValue);return e.style.cssText=a.style.cssText,e}function x(a){var b,c=a.split("{"),d=c.length,e=RegExp("(^|[\\s,>+~])("+l().join("|")+")(?=[[\\s,>+~#.:]|$)","gi"),f="$1"+t+"\\:$2";while(d--)b=c[d]=c[d].split("}"),b[b.length-1]=b[b.length-1].replace(e,f),c[d]=b.join("}");return c.join("{")}function y(a){var b=a.length;while(b--)a[b].removeNode()}function z(a){function g(){clearTimeout(d._removeSheetTimer),b&&b.removeNode(!0),b=null}var b,c,d=m(a),e=a.namespaces,f=a.parentWindow;return!u||a.printShived?a:(typeof e[t]=="undefined"&&e.add(t),f.attachEvent("onbeforeprint",function(){g();var d,e,f,h=a.styleSheets,i=[],j=h.length,l=Array(j);while(j--)l[j]=h[j];while(f=l.pop())if(!f.disabled&&s.test(f.media)){try{d=f.imports,e=d.length}catch(m){e=0}for(j=0;j<e;j++)l.push(d[j]);try{i.push(f.cssText)}catch(m){}}i=x(i.reverse().join("")),c=v(a),b=k(a,i)}),f.attachEvent("onafterprint",function(){y(c),clearTimeout(d._removeSheetTimer),d._removeSheetTimer=setTimeout(g,500)}),a.printShived=!0,a)}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^<|^(?:a|b|button|code|div|fieldset|form|h1|h2|h3|h4|h5|h6|i|iframe|img|input|label|li|link|ol|option|p|param|q|script|select|span|strong|style|table|tbody|td|textarea|tfoot|th|thead|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b);var s=/^$|\b(?:all|print)\b/,t="html5shiv",u=!j&&function(){var c=b.documentElement;return typeof b.namespaces!="undefined"&&typeof b.parentWindow!="undefined"&&typeof c.applyElement!="undefined"&&typeof c.removeNode!="undefined"&&typeof a.attachEvent!="undefined"}();r.type+=" print",r.shivPrint=z,z(b)}(this,document);;
/**
* Fitted: a jQuery Plugin
* @author: Trevor Morris (trovster)
* @url: http://www.trovster.com/lab/code/plugins/jquery.fitted.js
* @documentation: http://www.trovster.com/lab/plugins/fitted/
* @published: 11/09/2008
* @updated: 29/09/2008
* @license Creative Commons Attribution Non-Commercial Share Alike 3.0 Licence
*		   http://creativecommons.org/licenses/by-nc-sa/3.0/
* @notes: 
* Also see BigTarget by Leevi Graham - http://newism.com.au/blog/post/58/bigtarget-js-increasing-the-size-of-clickable-targets/ 
*
*/
if(typeof jQuery != 'undefined') {
	jQuery(function($) {
		$.fn.extend({
			fitted: function(options) {
				var settings = $.extend({}, $.fn.fitted.defaults, options);
							
				return this.each(
					function() {
						
						var $t = $(this);
						var o = $.metadata ? $.extend({}, settings, $t.metadata()) : settings;
						
						if($t.find(':has(a)')) {
							/**
							* Find the first Anchor
							* @var object $a
							*/
							var $a = $t.find('a:first');
							
							/**
							* Get the Anchor Attributes
							*/
							var href = $a.attr('href');
							var title = $a.attr('title');
							
							/**
							* Setup the Container
							* Add the 'container' class defined in settings
							* @event hover
							* @event click
							*/
							$t.addClass(o['class']['container']).hover(
								function(){
									/**
									* Hovered Element
									*/
									$h = $(this);
									
									/**
									* Add the 'hover' class defined in settings
									*/
									$h.addClass(o['class']['hover']);
									
									/**
									* Add the Title Attribute if the option is set, and it's not empty
									*/
									if(typeof o['title'] != 'undefined' && o['title']===true && title != '') {
										$h.attr('title',title);
									}
																		
									/**
									* Set the Status bar string if the option is set
									*/
									if(typeof o['status'] != 'undefined' && o['status']===true) {
										if($.browser.safari) {
											/**
											* Safari Formatted Status bar string
											*/
											window.status = 'Go to "' + href + '"';
										}
										else {
											/**
											* Default Formatted Status bar string
											*/
											window.status = href;
										}
									}
								},
								function(){
									/**
									* "un"-hovered Element
									*/
									$h = $(this);
									
									/**
									* Remove the Title Attribute if it was set by the Plugin
									*/
									if(typeof o['title'] != 'undefined' && o['title']===true && title != '') {
										$h.removeAttr('title');
									}
									
									/**
									* Remove the 'hover' class defined in settings
									*/
									$h.removeClass(o['class']['hover']);
									
									/**
									* Remove the Status bar string
									*/
									window.status = '';
								}
							).click(
								function(){
									/**
									* Clicked!
									* The Container has been Clicked
									* Trigger the Anchor / Follow the Link
									*/
									if($a.is('[rel*=external]')){
										window.open($href);
										return false;
									}
									else {
										//$a.click(); $a.trigger('click');
										window.location = href;
									}
								}
							);
						}
					}
				);
			}
		});
		
		/**
		* Plugin Defaults
		*/
		$.fn.fitted.defaults = {
			'class' : {
				'container' : 'fitted',
				'hover' : 'hovered'
			},
			'title' : true,
			'status' : false
		};
	});
};
/* 
* TYPEBUTTER v1.0
* Developed by David Hudson  (@_davidhudson)
* Website design and default font kerning by Joel Richardson (@richardson_joel)
* This work is licensed under a Creative Commons Attribution-ShareAlike 3.0 Unported License: http://creativecommons.org/licenses/by-sa/3.0/
 */
(function(a){var b;a.fn.typeButterReset=function(){b=null};a.fn.typeButterExtend=function(c){b=a.extend(c,b)};a.fn.typeButter=function(c){var d=a.extend({"default-spacing":"0em"},c);recurseThroughNodes=function(c,e){a(e).contents().each(function(){var e,f=a(this),g=f.text(),h=[""];if(this.nodeType==3){var j=c.css("fontWeight").toLowerCase(),k=c.css("fontStyle").toLowerCase(),l=c.css("font-family").toLowerCase();var m=new Array("normal","bold","bolder","lighter","100","200","300","400","500","600","700","800","900"),n=new Array("normal","italic","oblique");l=l.split(",");l=l[0].replace(/[^\w\s]/gi,"").replace(/ /g,"-");if(!a.inArray(j,m)||j=="400")j="normal";if(!a.inArray(k,n))k="normal";if(j=="700")j="bold";if(b[l]!=undefined&&b[l][j+"-"+k]!=undefined){for(i=0;i<g.length;i++){if(b[l][j+"-"+k][g.substring(i,i+2)]!=undefined){var o=b[l][j+"-"+k][g.substring(i,i+2)];o=parseFloat(o)+parseFloat(d["default-spacing"])+"em";h.push('<kern style="letter-spacing:'+o+'">'+g.substring(i,i+1)+"</kern>")}else{h.push(g.substring(i,i+1))}}a(c).append(h.join(""))}else{a(c).append(f);console.log("library not found for "+l)}}else{e=a(this).clone().empty().appendTo(c);recurseThroughNodes(e,this)}})};return this.each(function(){var b=a(this),c=b.clone();b.empty();b.css("letter-spacing",d["default-spacing"]);recurseThroughNodes(b,c)})}})(jQuery);
jQuery.fn.typeButterExtend({
'yaledesign': {
	'normal-normal': {
		
		'AT' 	: '-0.05em',
		'AV' 	: '-0.13em',
		'AW' 	: '-0.11em',
		'AY' 	: '-0.1em',

		'FA' 	: '-0.09em',
		'PA' 	: '-0.09em', 
		'TA' 	: '-0.07em',
		'VA' 	: '-0.13em',
		'WA' 	: '-0.11em',
		'YA' 	: '-0.08em',

		'LT' 	: '-0.1em', 
		'LV' 	: '-0.06em',
		'LW' 	: '-0.07em',
		'LY' 	: '-0.08em',

		'Ja' 	: '-0.03em',
		'Je' 	: '-0.04em',
		'Jo' 	: '-0.03em',
		'Ju' 	: '-0.04em',

		'Na' 	: '-0.03em',
		'Ne' 	: '-0.03em',
		'No' 	: '-0.03em',
		'Nu' 	: '-0.03em',

		'Pa' 	: '-0.03em',
		'Pe' 	: '-0.04em',
		'Po' 	: '-0.03em',

		'Ta' 	: '-0.07em',
		'Te' 	: '-0.08em',
		'Ti' 	: '0.01em',
		'To' 	: '-0.1em',
		'Tr' 	: '-0.05em', 
		'Tu' 	: '-0.05em',
		'Ty' 	: '-0.03em',
		'Tw' 	: '-0.06em',

		'Va' 	: '-0.08em',
		'Ve' 	: '-0.1em',
		'Vo' 	: '-0.08em',
		'Vu' 	: '-0.04em', 
		'Vy' 	: '-0.02em', 

		'Wa' 	: '-0.09em',
		'We' 	: '-0.08em',
		'Wu' 	: '-0.04em',

		'Ya' 	: '-0.09em',
		'Ye' 	: '-0.1em',
		'Yi' 	: '-0.02em',
		'Yo' 	: '-0.11em', 
		'Yu' 	: '-0.07em', 

		'wa' 	: '-0.01em',
		'we' 	: '-0.02em',
		'wo' 	: '-0.01em',
		'va' 	: '-0.02em',
		've' 	: '-0.02em',
		'vo' 	: '-0.01em'
		
		}
	}
});

// TypeButter init, better browsers get TypeButter while IE gets nada
jQuery.noConflict();
  jQuery(document).ready(function($) {
  if (navigator.userAgent.match(/MSIE\s(?!9.0)/)) {
    return false;
 	} else {
      $('#region-branding h1, #region-branding h2, #region-content h1, #region-content h2, .roman aside h2').typeButter();
	} 
});
;
/*
 * Replaced jcaption with a modified version this script:
 * http://darineko.com/2570/automatic-image-captions-with-jquery
 */

(function($) {
  $(function() {
    $('article img[title], .region-sidebar-second .block-block img[title], .homepage-caption img[title]').each(function() {
      // Exception so it doesn't get applied to flexslider.
      if (!$(this).parents('div').hasClass('flexslider')) {
        var image = $(this);
        var caption = image.attr('title');
        var imagealign = image.css('float');
        var imageclass = image.attr('class');

        switch (imageclass) {
          case "floatleft":
          imageclass = "left";
          break;

          case "floatright":
          imageclass = "right";
          break;

          case "center":
          imageclass = "center"
          break;

          default:
          imageclass = "none";
        }

        image.after('<span class="caption">' + caption + '</span>');
        image.next('span.caption').andSelf().wrapAll('<div>');
        image.parent('div').addClass('caption-wrapper ' + imageclass).css({'width': image.outerWidth(false), 'height': 'auto', 'float': imagealign});
      }
    });
  });
})(jQuery);
;
/*
* Scripts for Yale Drupal 7
*
* The only way I could get all of these scripts to work without errors was to use the noConflict mode.
* 
* There may be better ways to handle this:
* http://drupal.org/node/857094
* http://drupal.org/project/jquery_dollar
* http://drupal.org/node/171213
*/

// ligature.js v1.0
// http://code.google.com/p/ligature-js/
ligature = function(extended, node) {
  if (!node) {
    ligature(extended, document.body);
  }
  else {
    if (node.nodeType == 3 && node.parentNode.nodeName != 'SCRIPT') {
      node.nodeValue = node.nodeValue
        .replace(/ffl/g, 'ﬄ')
        .replace(/ffi/g, 'ﬃ')
        .replace(/fl/g, 'ﬂ')
        .replace(/fi/g, 'ﬁ')
        .replace(/ff/g, 'ﬀ')

      if (extended) {
        node.nodeValue = node.nodeValue.replace(/ae/g, 'æ')
          .replace(/A[Ee]/g, 'Æ')
          .replace(/oe/g, 'œ')
          .replace(/O[Ee]/g, 'Œ')
          .replace(/ue/g, 'ᵫ')
          .replace(/st/g, 'ﬆ');
      }
    }
    if (node.childNodes) {
      for (var i = 0; i < node.childNodes.length; i++) {
        ligature(extended, node.childNodes.item(i));
      }
    }
  }
};

// Main jQuery scripts
jQuery.noConflict();
  jQuery(document).ready(function($) {
	
	// Fitted, a jQuery Plugin by Trevor Morris
	// http://www.trovster.com/lab/plugins/fitted/    
	$('.clickable').fitted();
	
	// Slideshow fade controls
	$('.flex-direction-nav').hide();
	$('.flex-nav-container').hover(function() {
		$('.flex-direction-nav').fadeToggle(200);
	});
    
	// Mobile Nav Hide
	if (window.innerWidth && window.innerWidth <= 740) {
		$('#zone-menu ul.menu').hide(); 
	}

  // Load ligatures
  $.each($('h1, h2.site-name, .node-page h2, .node-book h2, .node-page h3, .node-book h3, .node-page h4, .node-book h4, .roman aside h2.block-title'), function(index, element) {
    ligature(false, element);
  });
    
  // Widon't, http://justinhileman.info/article/a-jquery-widont-snippet/
  $('h1, #region-content h2, h3, h4, h5, h6').each(function() {
    // $(this).html($(this).html().replace(/\s([^\s<]+)\s*$/,'&nbsp;$1'));
    // $(this).html($(this).html().replace(/\s([^\s<]{0,10})\s*$/,'&nbsp;$1')); only words up to 10 characters are wrapped
    $(this).html($(this).html().replace(/\s((?=(([^\s<>]|<[^>]*>)+))\2)\s*$/,'&nbsp;$1'));  // Mod by David Bennett
  });

	// jScrollPane, add responsive resizing & direction arrows that are absent from the module
	if(jQuery().jScrollPane) { 	// load only if the jScrollPane plugin is loaded
		$(window).resize(function() { 
	  		$('.scroll-pane').jScrollPane();
		});
		$('.scroll-pane').jScrollPane({showArrows: true});
	}

}); // End jQuery no-conflict


// FastClick, enables native-like tapping for touch devices
if (window.addEventListener) {
	window.addEventListener('load', function() {
		new FastClick(document.body);
	}, false);
}

// Mobile Nav Interaction
if (window.innerWidth && window.innerWidth <= 740) {
  jQuery.noConflict();
    jQuery(document).ready(function($) {
    $('#zone-menu .main').click(function() {
      $('#zone-menu ul.menu').slideToggle(300);
        $('.mobile-nav').toggleClass('expanded');
      return false;
    });
  });
}

// HideMobileAddressBar.js, https://gist.github.com/1190492
function hideAddressBar() {
  if(!window.location.hash) {
      if(document.height < window.outerHeight) {
          document.body.style.height = (window.outerHeight + 50) + 'px';
      }
      setTimeout( function(){ window.scrollTo(0, 1); }, 50 );
  }
}
if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)){
window.addEventListener("load", function(){ if(!window.pageYOffset){ hideAddressBar(); } } );
window.addEventListener("orientationchange", hideAddressBar );
}
;
// Additional ligatures on first sidebar headings for Sustainability
jQuery.noConflict();
  jQuery(document).ready(function($) {
  
  $.each($('#region-sidebar-first h2.block-title'), function(index, element) {
    ligature(false, element);
  });

}); // End jQuery no-conflict;
