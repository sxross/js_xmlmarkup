function XmlMarkup(xmlTag, containedText, callback, options) {
  this.xml = '';
  this.xmlTag = xmlTag;
  this.containedText = containedText;
  this.callback = callback;
  this.options = options;
  this.stateArray = [];
}

XmlMarkup.prototype = {
  // XmlMarkup -- Javascript object
  //
  // tag can be called in a variety of ways:
  //
  // Simple tag
  // xml.tag('personlist') => <personlist/>
  //
  // Content tag
  // xml.tag('person', 'bob') => <person>bob</person>
  //
  // Nested tags
  // xml.tag('personlist', function() { xml.tag('person', 'bob')}) => <personlist><person>bob</person></personlist>
  //
  // Tag with attributes
  // xml.tag('person', {name: 'bob'}) => <person name="bob">
  //
  // Warning: You cannot use reserved words like "class" unless you stringify them. E.g.,
  //          xml.tag('ul', {'class': 'menu'}, function() { etc. });
  //
  // Arbitrary text anyplace
  // xml.tag('th', function() {
  //   xml.text('column sorting ');
  //   xml.tag('img', {src: 'images/spacer.gif', 'class': 'sortdown'});
  // });
  //
  // Result:
  //
  // <th>
  //   column sorting <img src="images/spacer.gif" class="sortdown"/>
  // </th>
  //
  // Tag with multiple contained things (complicted example)
  //
  // xml.tag('table', function() {
  //   xml.tag('thead', function() {
  //     xml.tag('tr', function() {
  //       xml.tag('th', 'earth');
  //       xml.tag('th', 'wind');
  //       xml.tag('th', 'fire');
  //     });
  //   });
  //   xml.tag('tbody', function() {
  //     elements = Element.all();
  //     for(element in elements) {
  //       xml.tag('td', elements[element].earth);
  //       xml.tag('td', elements[element].wind);
  //       xml.tag('td', elements[element].fire);
  //     }
  //   });
  // });
  //
  // Result:
  //
  // <table>
  //   <thead>
  //     <tr>
  //       <td>earth</td>
  //       <td>wind</td>
  //       <td>fire</td>
  //     </tr>
  //   </thead>
  //   <tbody>
  //     <tr>
  //       <td>earth 1</td>
  //       <td>wind 1</td>
  //       <td>fire 1</td>
  //     </tr>
  //     <tr>
  //       ...etc...
  //     </tr>
  //   </tbody>
  // </table>
  //
  // Extracting the generated markup is as easy as: xml.target().
  // You are encouraged to read the tests for a pretty good overview
  // of what this package does.
  //
  // This code is inspired by the Builder::XmlMarkup code (originally
  // by Jim Weirich). Because Javascript cannot create magic methods,
  // one method steps in to take the place of many. That is "tag".
  // Here is a comparison from the last example between the Ruby
  // implementation and this one:
  //
  // xml = Builder::XmlMarkup.new
  // xml.table {
  //   xml.thead {
  //     xml.tr {
  //       xml.th 'earth'
  //       xml.th 'wind'
  //       xml.th 'fire'
  //     }
  //   }
  //   xml.tbody {
  //     elements = Element.all # assume ActiveRecord or Datamapper or whatever model "Element"
  //     elements.each |element| {
  //       xml.tr {
  //         xml.td element.earch
  //         xml.td element.wind
  //         xml.td element.fire
  //       }
  //     }
  //   }
  // }
  //
  // Some attempts have been made to protect you from youself (like HTML-escaping strings)
  // and attributes. However, you are still free to shoot yourself in the foot, and it is
  // easy to generate invalid markup. You still need to think before coding. Sorry.
  //
  // License: MIT (www.opensource.org/licenses/mit-license.html)
  //
  parseArgs: function(args) {
    this.xmlTag = args.shift();
    for(i = 0; i < args.length; i++) {
      argument = args[i];
      switch(typeof(argument)) {
        case 'function':
          this.callback = argument;
          break;
        case 'object':
          this.options = argument;
          break;
        case 'string':
        case 'number':
          this.containedText = argument;
          break;
      }
    }
  },
  
  tag: function() {
    var args = [].slice.call(arguments);
    this.parseArgs(args);
    
    var attributeArray = [];
    for(attribute in this.options) {
      attributeArray.push(attribute + '="' + escapeHTML(this.options[attribute]) + '"');
    }
    this.xml += '<' + this.xmlTag;
    if(attributeArray.length > 0) {
      this.xml += ' ' + attributeArray.join(' ');
    }
    
    if(this.containedText !== null && this.containedText !== undefined) {
      this.xml += '>' + escapeHTML(this.containedText) + '</' + this.xmlTag + '>';
    }
    else {
      if(this.callback) {
        if(typeof(this.callback) !== 'function')
          throw("function expected here.");
        this.xml += '>';
        var toCall = this.pushState();
        toCall();
        this.popState();
        this.xml += '</' + this.xmlTag + '>';
      }
      else {
        this.xml += '/>';
      }
    }
    this.clearState();
    return this;
  },
  
  text: function(str) {
    this.xml += escapeHTML(str);
  },
  
  clearState: function() {
    this.xmlTag = null;
    this.containedText = null;
    this.options = {};
    this.callback = null;
  },
  
  pushState: function() {
    this.stateArray.push(new XmlMarkup(this.xmlTag, this.containedText, this.callback, this.options));
    toCall = this.callback;
    this.clearState();
    return toCall;
  },
  
  popState: function() {
    t = this.stateArray.pop();
    this.xmlTag = t.xmlTag; this.containedText = t.containedText; this.callback = t.callback; this.options = t.options;
  },
  
  target: function() {
    return this.xml;
  }
}

// Prototyp'ey way to hack HTML escapes.
function escapeHTML(str)
{
  // a string line !_&copy;_! should pass through. The bang-underscore means caveat programmer.
  m = str.toString().match(/^!_(.*)_!/);
  if(m)
    return m[1];
    
   var div = document.createElement('div');
   var containedText = document.createTextNode(str);
   div.appendChild(containedText);
   return div.innerHTML;
}; 
