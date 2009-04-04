describe("XML Markup", {
  before: function() {
    xml = new XmlMarkup();
  },
  "An XML document should be created": function() {
      value_of(xml).should_not_be(null);
  },
  "A simple self closing tag should be created": function() {
     xml.tag('simple');
     value_of(xml.target()).should_be("<simple/>");
  },
  "A tag with a value should produce a content tag set enclosing that value": function() {
    xml.tag('value', "hi");
    value_of(xml.target()).should_be("<value>hi</value>");
  },
  "A nested set of tags should generate correct markup": function() {
    xml.tag('outer', function() {
      xml.tag('inner', "x");
    });
    value_of(xml.target()).should_be("<outer><inner>x</inner></outer>");
  },
  "Multiple levels of nested tags should be supported": function() {
    xml.tag('outer', function() {
      xml.tag('inner', {name: 'bob'}, function() {
        xml.tag('td', 'this is some text');
      })
    });
    value_of(xml.target()).should_be('<outer><inner name="bob"><td>this is some text</td></inner></outer>');
  },
  "Syntax tag(tagname, attributes, function) should work": function() {
    xml.tag('outer', {'class': 'dropdown'}, function() {
      xml.tag('inner', "x");
    });
    value_of(xml.target()).should_be('<outer class="dropdown"><inner>x</inner></outer>');
  },
  "Syntax tag(tagname, function, attributes) should work": function() {
    xml.tag('outer', function() {
      xml.tag('inner', "x");
    },
    {'class': 'dropdown'});
    value_of(xml.target()).should_be('<outer class="dropdown"><inner>x</inner></outer>');
  },
  "Nested tags should be able to contain multiple tags": function() {
    xml.tag('tr', function(){
      xml.tag('td', 'one');
      xml.tag('td', 'two');
    });
    value_of(xml.target()).should_be('<tr><td>one</td><td>two</td></tr>');
  },
  "A nested tag with multiple different texts should show those correctly": function() {
    xml.tag('tr', function(){
      xml.tag('td', function() {
        xml.tag('div', {'class': 'img-container'}, function() {
          xml.tag('img', {src: 'http://www.somewhere.com/image.jpg', width: 30});
        });
      });
      xml.tag('td', 'text-a');
      xml.tag('td', 'text-b');
      xml.tag('td', 'text-c');
    });
    value_of(xml.target()).should_be('<tr><td><div class="img-container"><img src="http://www.somewhere.com/image.jpg" width="30"/></div></td><td>text-a</td><td>text-b</td><td>text-c</td></tr>');
  },
  "An XML stream should be able to contain user-defined text": function() {
    xml.tag('th', function(){
      xml.text('whatsup ');
      xml.text('doc');      
    });
    value_of(xml.target()).should_be('<th>whatsup doc</th>');
  },
  "An XML stream with arbitrary text should be able to contain tags": function() {
    xml.tag('th', function(){
      xml.text('whatsup ');
      xml.tag('img', {src: 'images/bugsbunny.gif'})
    });
    value_of(xml.target()).should_be('<th>whatsup <img src="images/bugsbunny.gif"/></th>');
  },
  "A tag should be able to contain attributes": function() {
    xml.tag('ref', {id: 12})
    value_of(xml.target()).should_be('<ref id="12"/>');
  },
  "Contained text strings should be quoted by default": function() {
    xml.tag('quoting', 'H&R Block');
    value_of(xml.target()).should_be('<quoting>H&amp;R Block</quoting>');
  },
  "Attributes should be quoted by default": function() {
    xml.tag('ref', {id: '<li>'})
    value_of(xml.target()).should_be('<ref id="&lt;li&gt;"/>');
  },
  "Bang-underscore text should pass through unescaped": function() {
    xml.tag('value', "!_&copy;_!");
    value_of(xml.target()).should_be("<value>&copy;</value>");
  },
  "Bang-underscore attributes should pass through unescaped": function() {
    xml.tag('ref', {id: '!_<li>_!'})
    value_of(xml.target()).should_be('<ref id="<li>"/>');
  }
});

