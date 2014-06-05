var buttons = require('sdk/ui/button/action');
var { Toolbar } = require('sdk/ui/toolbar');
var tabs = require('sdk/tabs');
var { Frame } = require('sdk/ui/frame');
var chrome = require("chrome");

var headers = {};
var idCounter = 1;

chrome.Cc["@mozilla.org/observer-service;1"].getService(chrome.Ci.nsIObserverService).addObserver({
    observe : function(subject, topic, data) {
        var channel = subject.QueryInterface(chrome.Ci.nsIHttpChannel);
        for(var id in headers) {
            var header = headers[id];
            channel.setRequestHeader(header.name, header.value, false);
        }
    }
},"http-on-modify-request",false);

function Header(spec) {
    var parts = spec.split(':');
    this.name = parts[0].trim();
    this.value = parts[1].trim();
    this.id = idCounter++;
}

var frame = Frame({
    url: './headerbar-frame.html',
    onMessage: (e) => {
        if(e.data.action == 'addingHeader') {
            var h = new Header(e.data.spec);
            headers[h.id] = h;
            frame.postMessage({action: 'addHeader', header: h});
        } else if(e.data.action == 'removingHeader') {
            delete headers[e.data.id];
            frame.postMessage({action: 'removeHeader', id: e.data.id});
        }
    }
})

var toolbar = Toolbar({
    title: 'Header Bar',
    items: [frame]
})

