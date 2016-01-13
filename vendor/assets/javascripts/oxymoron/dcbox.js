/*
  dcbox.js simple lightbox module, write on native js (no dependents). Support touch (mobile) devices, full responsive, support keyboard control and support multi gallery. 
  author: Vasily Versus - @dcversus
  dcversus.ru
  
  13/04/15
*/
function dcboxInit() {
  if(typeof dcboxConfig==='undefined') dcboxConfig = {};
  var dConfig = {
    controls: (typeof dcboxConfig.controls==='undefined')? true : dcboxConfig.controls,
    close: (typeof dcboxConfig.close==='undefined')? false : dcboxConfig.close,
    boxed: (typeof dcboxConfig.boxed==='undefined')? false : dcboxConfig.boxed,
    zoom: (typeof dcboxConfig.zoom==='undefined')? true : dcboxConfig.zoom,
    iframe: (typeof dcboxConfig.iframe==='undefined')? false : dcboxConfig.iframe,
    gal: (typeof dcboxConfig.gal==='undefined')? 'dcbox' : dcboxConfig.gal
  };
  
  var dcbox = document.getElementsByClassName(dConfig.gal);
  var galleries = [];
  var drag = {};
  var alones = [];
  var scopes = [];
  
  for( var i = 0; i < dcbox.length; i++ )
    if(dcbox[i].tagName=='A') alones.push(dcbox[i]);
    else scopes.push(dcbox[i]);
    
  for( var i = 0; i < alones.length; i++ ) {
    var a = [];
    a.push(alones[i]);
    galleries.push(a);
  }
    
  for( var i = 0; i < scopes.length; i++ ) {
    var alones = scopes[i].getElementsByTagName('a');
    galleries.push(alones);
  }
  
  for( var i = 0; i < galleries.length; i++ )
    for( var j = 0; j < galleries[i].length; j++ ) {
      galleries[i][j].gallery = i;
      galleries[i][j].index = j;
      galleries[i][j].onclick = function() {
        var el = document.getElementById('dcbox');
        if(!el) open(this);
        else {
          close();
          open(this);
        }
        return false;
      }
    }
  
  !function() {
    var css = 'data:text/css;base64,LmRjYm94LW92ZXJsYXkgaWZyYW1lew0KICB3aWR0aDogMTAwJTsNCiAgaGVpZ2h0OiAxMDAlOw0KICBib3gtc2l6aW5nOiBib3JkZXItYm94Ow0KICBwYWRkaW5nOiAwIDUzcHg7DQp9DQouZGNib3gtb3ZlcmxheSAudGl0bGV7DQogIHBvc2l0aW9uOiBhYnNvbHV0ZTsNCiAgdG9wOiAwOw0KICBjb2xvcjogI2ZmZjsNCiAgbGVmdDogMDsNCiAgcmlnaHQ6IDA7DQogIHRleHQtYWxpZ246IGNlbnRlcjsNCiAgcGFkZGluZzogMTZweDsNCiAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjMpOw0KICBmb250LXNpemU6IDE2cHg7DQp9DQouZGNib3gtb3ZlcmxheSB7DQogIHBvc2l0aW9uOiBmaXhlZDsNCiAgdG9wOiAwOw0KICBsZWZ0OiAwOw0KICByaWdodDogMDsNCiAgYm90dG9tOiAwOw0KICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuNik7DQogIHRyYW5zaXRpb246IC40czsNCiAgb3ZlcmZsb3c6IGhpZGRlbjsNCiAgei1pbmRleDogOTk5OTsNCn0NCi5kY2JveC1vdmVybGF5LmFsdCB7DQogIHRvcDogMjAlOw0KICBsZWZ0OiAyMCU7DQogIHJpZ2h0OiAyMCU7DQogIGJvdHRvbTogMjAlOw0KfQ0KLmRjYm94LWJ1dHRvbiB7DQogIHBvc2l0aW9uOiBhYnNvbHV0ZTsNCiAgd2lkdGg6IDUzcHg7DQogIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50Ow0KICBib3JkZXI6IDA7DQogIG91dGxpbmU6IDA7DQogIGN1cnNvcjogcG9pbnRlcjsNCiAgb3BhY2l0eTouNTsNCn0NCi5kY2JveC1idXR0b246aG92ZXIgew0KICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuNik7DQp9DQojZGNib3hQcmV2aW91cyB7DQogIGxlZnQ6IDA7DQogIHRvcDogNTBweDsNCiAgYm90dG9tOiAwOw0KfQ0KI2RjYm94TmV4dCB7DQogIHJpZ2h0OiAwOw0KICB0b3A6IDUwcHg7DQogIGJvdHRvbTogMDsNCn0NCiNkY2JveEltYWdlcyB7DQogIHBvc2l0aW9uOiBhYnNvbHV0ZTsNCiAgbGVmdDogMDsNCiAgdG9wOiAwOw0KICBoZWlnaHQ6IDEwMCU7DQogIHdpZHRoOiAxMDAlOw0KICB3aGl0ZS1zcGFjZTogbm93cmFwOw0KICB0cmFuc2l0aW9uOiAuNHM7DQp9DQojZGNib3hJbWFnZXMgLmltYWdlIHsNCiAgZGlzcGxheTogaW5saW5lLWJsb2NrOw0KICBwb3NpdGlvbjogcmVsYXRpdmU7DQogIHdpZHRoOiAxMDAlOw0KICBoZWlnaHQ6IDEwMCU7DQogIHRleHQtYWxpZ246IGNlbnRlcjsNCiAgb3ZlcmZsb3c6IGhpZGRlbjsNCn0NCiNkY2JveEltYWdlcyAuaW1hZ2U6YmVmb3JlIHsNCiAgY29udGVudDogIiI7DQogIGRpc3BsYXk6IGlubGluZS1ibG9jazsNCiAgaGVpZ2h0OiA1MCU7DQogIHdpZHRoOiAxcHg7DQogIG1hcmdpbi1yaWdodDogLTFweDsNCn0NCiNkY2JveEltYWdlcyBpbWcgew0KICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7DQogIHdpZHRoOiBhdXRvOw0KICBoZWlnaHQ6IGF1dG87DQogIG1heC1oZWlnaHQ6IDEwMCU7DQogIG1heC13aWR0aDogMTAwJTsNCiAgdmVydGljYWwtYWxpZ246IG1pZGRsZTsNCn0NCiNkY2JveENsb3NlIHsNCiAgcmlnaHQ6IDA7DQogIGhlaWdodDogNTBweDsNCn0NCiNkY2JveEZ1bGwgew0KICBoZWlnaHQ6IDUwcHg7DQp9DQojZGNib3hJbWFnZXMuYm91bmNlLWxlZnQgew0KICAtd2Via2l0LWFuaW1hdGlvbjogYm91bmNlTGVmdCAuNXM7DQogIGFuaW1hdGlvbjogYm91bmNlTGVmdCAuNXM7DQp9DQojZGNib3hJbWFnZXMuYm91bmNlLXJpZ2h0IHsNCiAgLXdlYmtpdC1hbmltYXRpb246IGJvdW5jZVJpZ2h0IDAuNXMgZWFzZS1vdXQ7DQogIGFuaW1hdGlvbjogYm91bmNlUmlnaHQgMC41cyBlYXNlLW91dDsNCn0NCkAtd2Via2l0LWtleWZyYW1lcyBib3VuY2VSaWdodCB7DQowJSB7DQoJdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOw0KfQ0KNTAlIHsNCgl0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwcHgpOw0KfQ0KMTAwJSB7DQoJdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOw0KfQ0KfQ0KDQpAa2V5ZnJhbWVzIGJvdW5jZVJpZ2h0IHsNCjAlIHsNCgl0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7DQp9DQo1MCUgew0KCXRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTBweCk7DQp9DQoxMDAlIHsNCgl0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7DQp9DQp9DQpALXdlYmtpdC1rZXlmcmFtZXMgYm91bmNlTGVmdCB7DQowJSB7DQoJdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOw0KfQ0KNTAlIHsNCgl0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoNTBweCk7DQp9DQoxMDAlIHsNCgl0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7DQp9DQp9DQoNCkBrZXlmcmFtZXMgYm91bmNlTGVmdCB7DQowJSB7DQoJdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOw0KfQ0KNTAlIHsNCgl0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoNTBweCk7DQp9DQoxMDAlIHsNCgl0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7DQp9DQp9DQ==';
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type= 'text/css';
    style.href = css;
    head.appendChild(style);
  }();
  
  function open(item) {
    eval('var inConfig='+item.parentNode.dataset.dcbox+'|| '+item.dataset.dcbox+' || {}');
    dConfig = {
      controls: (typeof inConfig.controls==='undefined')? dConfig.controls : inConfig.controls,
      close: (typeof inConfig.close==='undefined')? dConfig.close : inConfig.close,
      boxed: (typeof inConfig.boxed==='undefined')? dConfig.boxed : inConfig.boxed,
      zoom: (typeof inConfig.zoom==='undefined')? dConfig.zoom : inConfig.zoom,
      iframe: (typeof inConfig.iframe==='undefined')? dConfig.iframe : inConfig.iframe
    };
    var g = item.gallery;
    var index = item.index;
    var html = '<div id="dcboxImages"></div><button id="dcboxClose" class="dcbox-button"><svg width="30" height="30"><g stroke="rgb(255, 255, 255)" stroke-width="4"><line x1="5" y1="5" x2="25" y2="25"></line><line x1="5" y1="25" x2="25" y2="5"></line></g></svg></button><button id="dcboxPrevious" class="dcbox-button"><svg width="44" height="60"><polyline points="30 10 10 30 30 50" stroke="rgb(255,255,255)" stroke-width="4" stroke-linecap="butt" fill="none" stroke-linejoin="round"></polyline></svg></button><button id="dcboxNext" class="dcbox-button"><svg width="44" height="60"><polyline points="14 10 34 30 14 50" stroke="rgb(255,255,255)" stroke-width="4" stroke-linecap="butt" fill="none" stroke-linejoin="round"></polyline></svg></button><button id="dcboxFull" class="dcbox-button"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 -256 1792 1792"><g transform="matrix(1,0,0,-1,121.49153,1270.2373)" id="g2991"><path d="M 1283,995 928,640 1283,285 1427,429 q 29,31 70,14 39,-17 39,-59 V -64 q 0,-26 -19,-45 -19,-19 -45,-19 h -448 q -42,0 -59,40 -17,39 14,69 L 1123,125 768,480 413,125 557,-19 q 31,-30 14,-69 -17,-40 -59,-40 H 64 q -26,0 -45,19 -19,19 -19,45 v 448 q 0,42 40,59 39,17 69,-14 L 253,285 608,640 253,995 109,851 Q 90,832 64,832 52,832 40,837 0,854 0,896 v 448 q 0,26 19,45 19,19 45,19 h 448 q 42,0 59,-40 17,-39 -14,-69 l -144,-144 355,-355 355,355 -144,144 q -31,30 -14,69 17,40 59,40 h 448 q 26,0 45,-19 19,-19 19,-45 V 896 q 0,-42 -39,-59 -13,-5 -25,-5 -26,0 -45,19 z" id="path2993" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:connector-curvature="0" style="fill:rgb(255, 255, 255)"/></g></svg></button>'
    var body = document.body || document.getElementsByTagName('body')[0];
    var dcbox = document.createElement('div'); 
    dcbox.id = 'dcbox';
    dcbox.classList.add('dcbox-overlay');
    if(dConfig.boxed) dcbox.classList.add('alt');
    dcbox.innerHTML = html;
    body.appendChild(dcbox);
    var prevB = document.getElementById('dcboxPrevious');
    var nextB = document.getElementById('dcboxNext');
    if(galleries[g].length > 1) {
      prevB.onclick = function(e) {
        prev();
        e.stopPropagation();
      }
      nextB.onclick = function(e) {
        next();
        e.stopPropagation();
      }
    } else {
      prevB.parentNode.removeChild(prevB);
      nextB.parentNode.removeChild(nextB);
    }
    window.onkeydown = function(e) {
      var ex = false;
      if(e.keyCode==37) prev(); 
      else if(e.keyCode==39) next(); 
      else if(e.keyCode==27) close();
      else if(e.keyCode==13) toggle();
      //else if(e.keyCode==32) toggle();
      else ex = true;
      return ex;
    }

    var closeB = document.getElementById('dcboxClose');
    closeB.onclick = function(e) {
      close();
      e.stopPropagation();
    }
    dcbox.onclick = function(e) {
      if(dConfig.close) close();
    }
    var dcboxFull = document.getElementById('dcboxFull');
    dcboxFull.onclick = function(e) {
      toggle();
      e.stopPropagation();
    }
    if(!dConfig.controls) {
      prevB.parentNode.removeChild(prevB);
      nextB.parentNode.removeChild(nextB);
      closeB.parentNode.removeChild(closeB);
      dcboxFull.parentNode.removeChild(dcboxFull);
    }
    
    var con = document.getElementById('dcboxImages');
    con.style.marginLeft = -index*100+"%";
    for( var i = 0; i < galleries[g].length; i++ ) {
      var child = galleries[g][i];
      var div = document.createElement('div');
      div.classList.add('image');
      if(child.href.indexOf('youtube') + 1 || dConfig.iframe) {
        var element = document.createElement('iframe');
        element.setAttribute('frameborder', '0')
        div.classList.add('video');
        child.href = child.href.replace("watch?v=","embed/");
      } else {
        var element = document.createElement('img');
        element.onwheel = function(e) {
          var delta = ( e.wheelDelta<0 )? -1 : 1;
          zoom(delta,this);
          return false;
        }
        
        element.onmousedown = dragStart;
        element.addEventListener('touchstart', dragStart, false);
        element.addEventListener('touchmove', function(e) { e.preventDefault(); dragMove(e); }, false);
        element.addEventListener('touchend', dragOver, false);      
        element.onclick = onl;
      }
      
      div.appendChild(element);
      if(child.title) {
        var title = document.createElement('span');
        title.innerHTML = child.title
        title.classList.add('title');
        div.appendChild(title);
      }
      if(i==index) {
        element.src = child.href;
      }
      element.asrc = child.href;
      
      con.appendChild(div);
    }
  }  
  function prev() {
    var con = document.getElementById('dcboxImages');
    var div = con.getElementsByTagName('div');
    var index = -parseInt(con.style.marginLeft)/100;
    index--;
    if(index<0) {
      index = 0;
      con.classList.add('bounce-left');
      setTimeout( function() { 
        con.classList.remove('bounce-left');
      } , 500)
    }
    
    var el = div[index].querySelector('*');
    if(el && el.src != el.asrc) el.src = el.asrc;
    
    con.style.marginLeft = -index*100+"%";
  }
  
  function next() {
    var con = document.getElementById('dcboxImages');
    var div = con.getElementsByTagName('div');
    var l = div.length;
    var index = -parseInt(con.style.marginLeft)/100;
    index++;
    if(index>l-1) {
      index = l-1;
      con.classList.add('bounce-right');
      setTimeout( function() { 
        con.classList.remove('bounce-right');
      } , 500)
    }
    
    var el = div[index].querySelector('*');
    if(el && el.src != el.asrc) el.src = el.asrc;
    
    con.style.marginLeft = -index*100+"%";
  }
  
  function close() {
    var el = document.getElementById('dcbox');
    el.parentNode.removeChild(el);
    window.onkeydown = function(){};
    dConfig = {
      controls: (typeof dcboxConfig.controls==='undefined')? true : dcboxConfig.controls,
      close: (typeof dcboxConfig.close==='undefined')? false : dcboxConfig.close,
      boxed: (typeof dcboxConfig.boxed==='undefined')? false : dcboxConfig.boxed,
      zoom: (typeof dcboxConfig.zoom==='undefined')? true : dcboxConfig.zoom,
      iframe: (typeof dcboxConfig.iframe==='undefined')? false : dcboxConfig.iframe,
    };
  }
  
  function toggle() {
    var dcbox = document.getElementById('dcbox');
    if(dcbox.className=='dcbox-overlay') dcbox.className = 'dcbox-overlay alt';
    else dcbox.className = 'dcbox-overlay';
  }
  
  function zoom(delta,elm) {
    if(dConfig.zoom) {
      var index = parseFloat(elm.style.transform.substr(6)) || 1;
      index+=delta/10;
      if(index<1) {
        index = 1;
        elm.style.marginLeft = '0px';
        elm.style.marginTop = '0px';
      };
      elm.style.transform = 'scale('+index+')';
    }
  }
  
  function dbClick(el) {
    if(dConfig.zoom) {
      var index = parseFloat(el.style.transform.substr(6)) || 1;
      if(index==1) el.style.transform = 'scale(2)';
      else {
        el.style.transform = 'scale(1)';
        el.style.marginLeft = '0px';
        el.style.marginTop = '0px';
      }
    }
  }
  
  function dbl(e) {
    e.stopPropagation();
    dbClick(this);
    this.onclick = onl;
  }
  
  function onl(e) {
    e.stopPropagation();
    this.onclick = dbl;
  }
  
  function dragStart(e) {
    if (e.which != 1 && e.which != 0) {
      return;
    }
    drag.elem = this;
    drag.downX = e.pageX || e.touches[0].pageX;
    drag.downY = e.pageY || e.touches[0].pageY;
    drag.left = parseInt(drag.elem.style.marginLeft) || 0;
    drag.top = parseInt(drag.elem.style.marginTop) || 0;
    
    document.onmousemove = dragMove;
    document.onmouseup = dragOver;
  }
  
  function dragMove(e) {
    if (!drag.elem) return false;
    drag.elem.onclick = onl;
    var moveX = (e.pageX || e.touches[0].pageX ) - drag.downX;
    var moveY = (e.pageY || e.touches[0].pageY ) - drag.downY;
    if ( Math.abs(moveX) < 5 && Math.abs(moveY) < 5 ) {
      return;
    }
    
    var index = parseFloat(drag.elem.style.transform.substr(6)) || 1;
    var zommed = (index==1)? true : false ;
    if(zommed) {
      if ( Math.abs( moveX ) > Math.abs( moveY ) ) {
        if ( moveX < 0 ) {
            next();
        } else {
            prev();
        }    
        drag.elem = null;
      }
    } else {
      drag.elem.style.marginLeft = drag.left+moveX+'px';
      drag.elem.style.marginTop = drag.top+moveY+'px';
    }
    return false;
  }
  
  function dragOver(e) {
      drag = {};
      document.onmousemove = function() {};
  }
}
dcboxInit();