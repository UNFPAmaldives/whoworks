var dateFormat=function(){var token=/d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,timezone=/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,timezoneClip=/[^-+\dA-Z]/g,pad=function(val,len){val=String(val);len=len||2;while(val.length<len)val="0"+val;return val};return function(date,mask,utc){var dF=dateFormat;if(arguments.length==1&&Object.prototype.toString.call(date)=="[object String]"&&!/\d/.test(date)){mask=
date;date=undefined}date=date?new Date(date):new Date;if(isNaN(date))throw SyntaxError("invalid date");mask=String(dF.masks[mask]||mask||dF.masks["default"]);if(mask.slice(0,4)=="UTC:"){mask=mask.slice(4);utc=true}var _=utc?"getUTC":"get",d=date[_+"Date"](),D=date[_+"Day"](),m=date[_+"Month"](),y=date[_+"FullYear"](),H=date[_+"Hours"](),M=date[_+"Minutes"](),s=date[_+"Seconds"](),L=date[_+"Milliseconds"](),o=utc?0:date.getTimezoneOffset(),flags={d:d,dd:pad(d),ddd:dF.i18n.dayNames[D],dddd:dF.i18n.dayNames[D+
7],m:m+1,mm:pad(m+1),mmm:dF.i18n.monthNames[m],mmmm:dF.i18n.monthNames[m+12],yy:String(y).slice(2),yyyy:y,h:H%12||12,hh:pad(H%12||12),H:H,HH:pad(H),M:M,MM:pad(M),s:s,ss:pad(s),l:pad(L,3),L:pad(L>99?Math.round(L/10):L),t:H<12?"a":"p",tt:H<12?"am":"pm",T:H<12?"A":"P",TT:H<12?"AM":"PM",Z:utc?"UTC":(String(date).match(timezone)||[""]).pop().replace(timezoneClip,""),o:(o>0?"-":"+")+pad(Math.floor(Math.abs(o)/60)*100+Math.abs(o)%60,4),S:["th","st","nd","rd"][d%10>3?0:(d%100-d%10!=10)*d%10]};return mask.replace(token,
function($0){return $0 in flags?flags[$0]:$0.slice(1,$0.length-1)})}}();dateFormat.masks={"default":"ddd mmm dd yyyy HH:MM:ss",shortDate:"m/d/yy",mediumDate:"mmm d, yyyy",longDate:"mmmm d, yyyy",fullDate:"dddd, mmmm d, yyyy",shortTime:"h:MM TT",mediumTime:"h:MM:ss TT",longTime:"h:MM:ss TT Z",isoDate:"yyyy-mm-dd",isoTime:"HH:MM:ss",isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",isoUtcDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"};
dateFormat.i18n={dayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],monthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","January","February","March","April","May","June","July","August","September","October","November","December"]};Date.prototype.format=function(mask,utc){return dateFormat(this,mask,utc)};
(function($){var escapeable=/["\\\x00-\x1f\x7f-\x9f]/g,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};$.toJSON=typeof JSON==="object"&&JSON.stringify?JSON.stringify:function(o){if(o===null)return"null";var type=typeof o;if(type==="undefined")return undefined;if(type==="number"||type==="boolean")return""+o;if(type==="string")return $.quoteString(o);if(type==="object"){if(typeof o.toJSON==="function")return $.toJSON(o.toJSON());if(o.constructor===Date){var month=
o.getUTCMonth()+1,day=o.getUTCDate(),year=o.getUTCFullYear(),hours=o.getUTCHours(),minutes=o.getUTCMinutes(),seconds=o.getUTCSeconds(),milli=o.getUTCMilliseconds();if(month<10)month="0"+month;if(day<10)day="0"+day;if(hours<10)hours="0"+hours;if(minutes<10)minutes="0"+minutes;if(seconds<10)seconds="0"+seconds;if(milli<100)milli="0"+milli;if(milli<10)milli="0"+milli;return'"'+year+"-"+month+"-"+day+"T"+hours+":"+minutes+":"+seconds+"."+milli+'Z"'}if(o.constructor===Array){var ret=[];for(var i=0;i<o.length;i++)ret.push($.toJSON(o[i])||
"null");return"["+ret.join(",")+"]"}var name,val,pairs=[];for(var k in o){type=typeof k;if(type==="number")name='"'+k+'"';else if(type==="string")name=$.quoteString(k);else continue;type=typeof o[k];if(type==="function"||type==="undefined")continue;val=$.toJSON(o[k]);pairs.push(name+":"+val)}return"{"+pairs.join(",")+"}"}};$.evalJSON=typeof JSON==="object"&&JSON.parse?JSON.parse:function(src){return eval("("+src+")")};$.secureEvalJSON=typeof JSON==="object"&&JSON.parse?JSON.parse:function(src){var filtered=
src.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"");if(/^[\],:{}\s]*$/.test(filtered))return eval("("+src+")");else throw new SyntaxError("Error parsing JSON, source is not valid.");};$.quoteString=function(string){if(string.match(escapeable))return'"'+string.replace(escapeable,function(a){var c=meta[a];if(typeof c==="string")return c;c=a.charCodeAt();return"\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16)})+
'"';return'"'+string+'"'}})(jQuery);
(function($,undefined){$.extend({"lockfixed":function(el,options){var defaults={scrollElm:window,fixedClass:"lockfixed"};var config=$.extend(defaults,options);if(config&&config.offset){config.offset.bottom=parseInt(config.offset.bottom,10);config.offset.top=parseInt(config.offset.top,10)}else config.offset={bottom:100,top:0};var el=$(el);if(el&&el.offset()){var el_position=el.css("position"),el_margin_top=parseInt(el.css("marginTop"),10),el_position_top=el.css("top"),el_top=el.offset().top,pos_not_fixed=
false;if(config.forcemargin===true||navigator.userAgent.match(/\bMSIE (4|5|6)\./)||navigator.userAgent.match(/\bOS ([0-9])_/)||navigator.userAgent.match(/\bAndroid ([0-9])\./i));$(config.scrollElm).bind("scroll resize orientationchange load lockfixed:pageupdate",el,function(e){if(pos_not_fixed&&document.activeElement&&document.activeElement.nodeName==="INPUT")return;var top=0,el_height=el.outerHeight(),el_width=el.parent().outerWidth(),max_height=$(document).height()-config.offset.bottom,scroll_top=
$(config.scrollElm).scrollTop();if(el_width==0)return;if(el.css("position")!=="fixed"&&!pos_not_fixed){el_top=el.offset().top;el_position_top=el.css("top")}if(scroll_top>=el_top-(el_margin_top?el_margin_top:0)-config.offset.top){if(max_height<scroll_top+el_height+el_margin_top+config.offset.top)top=scroll_top+el_height+el_margin_top+config.offset.top-max_height;else top=0;if(pos_not_fixed)el.css({"marginTop":parseInt(scroll_top-el_top-top,10)+2*config.offset.top+"px"});else{el.css({"position":"fixed",
"top":config.offset.top-top+"px","width":el_width+"px"});el.addClass(config.fixClass)}}else{el.css({"position":el_position,"top":el_position_top,"width":el_width+"px","marginTop":(el_margin_top&&!pos_not_fixed?el_margin_top:0)+"px"});el.removeClass(config.fixClass)}})}}})})(jQuery);
(function($){$.fn.buildecho=function(options){return this.each(function(){new $.buildecho(this,options)})};var dserv=window.TWP&&TWP.Data&&TWP.Data.environment=="dev"?"//pb-dev.digitalink.com":"//js.washingtonpost.com";var defaults={config:{dserv:dserv,badgeTextUrl:dserv+"/pb/resources/js/echo2/twp/util/html-utils.jsp",echoContainer:"echo_container",badgeTextContainer:"echo-tip-text-container",echoVars:"comment-vars"},commentHeaderTemplate:"\x3c!-- comment header --\x3e"+'\x3cdiv class\x3d"echo-header-container"\x3e'+
'\x3cp class\x3d"comment-count-label"\x3e Comments\x3c/p\x3e'+'\x3cdiv id\x3d"comment-info-links"\x3e'+'\x3cspan class\x3d"discussion-policy"\x3e\x3ca  href\x3d"http://www.washingtonpost.com/blogs/ask-the-post/discussion-and-submission-guidelines/" target\x3d"_policy"\x3eDiscussion Policy\x3c/a\x3e\x3c/span\x3e'+"\x3c/div\x3e"+"\x3c/div\x3e",titleElementTemplate:'\x3cp class\x3d"echo-header-title"\x3e{elementTitle}\x3c/p\x3e',descriptionElementTemplate:'\x3cp class\x3d"echo-header-description"\x3e{elementDescription}\x3c/p\x3e',
counterElement:'\x3cspan class\x3d"echo-counter"\x3e\x3c/span\x3e',submitboxTemplate:"\x3c!--comment stream  --\x3e"+'\x3cdiv id\x3d"echo_stream_container{elementIndex}" class\x3d"echo-stream-container echo-stream"\x3e \x3c/div\x3e'+"\x3c!-- /comment stream --\x3e",streamTemplate:"\x3c!--comment stream  --\x3e"+'\x3cdiv id\x3d"echo_stream_container{elementIndex}" class\x3d"echo-stream-container echo-stream"\x3e \x3c/div\x3e'+"\x3c!-- /comment stream --\x3e",overlayConfig:{mask:{color:"#000000",loadSpeed:200,
opacity:.7},top:"20%",left:"center",closeOnClick:true,closeOnEsc:true,onBeforeLoad:function(){$(this.getTrigger().attr("rel")).find("iframe").attr("src",this.getTrigger().attr("href"))}}};$.buildecho=function(el,options){this.options=$.extend(defaults,options);this.props={};this.init(el)};$.buildecho.fn=$.buildecho.prototype={};$.buildecho.fn.extend=$.buildecho.extend=jQuery.extend;$.buildecho.fn.extend({createDataObject:function(elm){var data={};if(typeof elm.attr("data")!=="undefined"&&elm.attr("data").length>
0){var attrbs=elm.attr("data").split("\x26");for(var i=0;i<attrbs.length;i++)if(attrbs[i]!=""){var valArry=attrbs[i].split("\x3d");data[valArry[0].toLowerCase()]=valArry[1]=="true"?true:valArry[1]=="false"?false:valArry[1]}}else{var attrbs;attrbs=elm[0].attributes;for(var i=0;i<attrbs.length;i++){var thisVal=attrbs[i].nodeValue;data[attrbs[i].nodeName.toLowerCase()]=thisVal=="true"?true:thisVal=="false"?false:thisVal}}return data},init:function(el){var self=this,commentContainers=$(el);if(commentContainers.length==
0)return;commentContainers.each(function(i,echoObj){var echoContainer=$(echoObj);var curDate="";var elementKey="";if(echoContainer.attr("id")==self.options.config.echoContainer){curDate=new Date;elementKey="_"+curDate.getTime()+"_"+Math.floor(Math.random()*1E3);echoContainer.attr("id",self.options.config.echoContainer+elementKey)}else elementKey=echoContainer.attr("id").slice(echoContainer.attr("id").indexOf(self.options.config.echoContainer)+self.options.config.echoContainer.length);if($("#echo-tip-text-container").length==
0)echoContainer.after('\x3cdiv id\x3d"'+self.options.config.badgeTextContainer+'"\x3e\x3c/div\x3e');if($(".badgetext").length==0){var url=self.options.config.badgeTextUrl+"?id\x3d"+(typeof wp_section!="undefined"?wp_section:"")+(typeof wp_subsection!="undefined"?"\x26sectionid\x3d"+wp_subsection:"")+(typeof wp_content_type!="undefined"?"\x26contenttype\x3d"+wp_content_type:"")+(typeof wp_meta_data!="undefined"&&wp_meta_data.contentName&&wp_meta_data.contentName[0]?"\x26columnname\x3d"+wp_meta_data.contentName[0]:
"");self.loadTextFile(url,$("#"+self.options.config.badgeTextContainer))}if(echoContainer.children().length==0){var classList=echoContainer.attr("class").replace(/\s+/g," ").split(" ");var data=self.createDataObject(echoContainer);if(classList.indexOf("stream")>0||classList.indexOf("submitbox")>0){if(data.includeheader!==false)echoContainer.html($(self.options.commentHeaderTemplate));var overlay=$("#comment_policy_overlay");overlay.hide();$("body").prepend(overlay);try{echoContainer.find("a.iframe-overlay").overlay(self.options.overlayConfig)}catch(e){}}$.each(classList,
function(index,value){if(value!=self.options.config.echoContainer&&value!=self.options.config.echoVars){value=value.replace("-","");var thisEcho="";var thisStream="";try{thisStream=self.options[value+"Template"]}catch(e){}if(value=="count")echoContainer.find(".comment-count-label").prepend(self.options["counterElement"]);if(value=="submitbox");if(value=="stream"||value=="submitbox"){if($("#"+"echo_stream_container"+elementKey).length==0){thisEcho=$(thisStream.replace(/{elementIndex}/gi,elementKey));
thisEcho.addClass("echo-canvas")}echoContainer.addClass("canvas");$(echoContainer).append(thisEcho)}}});echoContainer.addClass("comments processed").removeClass("unprocessed")}else echoContainer.addClass("processed").removeClass("unprocessed")})},loadTextFile:function(fileName,thisNode){var request="";request=$.ajax({url:fileName,async:false});thisNode.append($(request.responseText))}})})(jQuery);
Date.prototype.setISO8601=function(dString){var regexp=/(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;if(dString.toString().match(new RegExp(regexp))){var d=dString.match(new RegExp(regexp));var offset=0;this.setUTCDate(1);this.setUTCFullYear(parseInt(d[1],10));this.setUTCMonth(parseInt(d[3],10)-1);this.setUTCDate(parseInt(d[5],10));this.setUTCHours(parseInt(d[7],10));this.setUTCMinutes(parseInt(d[9],10));this.setUTCSeconds(parseInt(d[11],10));if(d[12])this.setUTCMilliseconds(parseFloat(d[12])*
1E3);else this.setUTCMilliseconds(0);if(d[13]!="Z"){offset=d[15]*60+parseInt(d[17],10);offset*=d[14]=="-"?-1:1;this.setTime(this.getTime()-offset*60*1E3)}}else this.setTime(Date.parse(dString));return this};
(function($){TWP=window.TWP||{};TWP.Util=TWP.Util||{};TWP.Comments=TWP.Comments||{};TWP.Util.updateMongoDb=function(mData){updateAction=mData.config.action||"get";if($.browser.msie&&window.XDomainRequest){var xdrAction=new XDomainRequest;xdrAction.open(updateAction,mData.config.remoteUrl);xdrAction.onload=mData.config.onSuccess||null;xdrAction.onerror=mData.config.onError||null;xdrAction.send(JSON.stringify(mData.config.data))}else if($.browser.msie&&!window.XDomainRequest)$.getScript("/rw/sites/twpweb/js/plugin/xhr/flXHR.js",
function(data,textStatus,jqxhr){window.flensed.base_path="/rw/sites/twpweb/js/plugin/xhr/";var flproxy=new flensed.flXHR({autoUpdatePlayer:true});flproxy.xmlResponseText=false;flproxy.onreadystatechange=handleLoading;flproxy.onerror=mData.config.onError;flproxy.open(updateAction.toUpperCase(),mData.config.remoteUrl);flproxy.send(JSON.stringify(mData.config.data));function handleLoading(xdrGet){if(xdrGet.readyState==4)mData.onSuccess}});else if(updateAction=="post")thisPost=$.post(mData.config.remoteUrl,
JSON.stringify(mData.config.data),mData.config.onSuccess).error(mData.config.onError);else thisPost=$.get(mData.config.remoteUrl,JSON.stringify(mData.config.data),mData.config.onSuccess).error(mData.config.onError)};TWP.Comments.addSorts=function(data,sortList){if(typeof sortList=="undefined"||sortList.length<=0)sortList=['\x3coption value\x3d"reverseChronological"\x3eNewest First\x3c/option\x3e','\x3coption value\x3d"chronological"\x3eOldest First\x3c/option\x3e','\x3coption value\x3d"likesDescending"\x3eMost Liked\x3c/option\x3e'];
var thisContainer=$(data.target).closest(".echo_container").attr("id");if(wp_e2[thisContainer].includesorts!=false){var thisCommentTarget=$("#"+thisContainer+" .comment-header").attr("rel");var thisSelectTarget=$(".comment-header",$("#"+thisContainer));if(thisSelectTarget.children().length==0)thisSelectTarget=$($(".echo-stream-header",$("#"+thisContainer)).children()[0]);var tab=$("#"+thisContainer+" .tab.active a").length>0?$("#"+thisContainer+" .tab.active a").attr("rel"):wp_e2[thisContainer].defaulttab;
if(thisSelectTarget.length>0&&typeof thisCommentTarget!="undefined"&&$(".comment-sortorder",$("#"+thisContainer)).length==0){var sortElm=$('\x3cdiv class\x3d"comment-sortorder"\x3e'+"Sort:\x26nbsp;\x26nbsp;"+'\x3cselect  class\x3d"comment-sortorder-select"\x3e'+sortList.join("")+"\x3c/select\x3e\x3c/div\x3e");if(thisSelectTarget.hasClass("comment-header"))thisSelectTarget.append(sortElm);else thisSelectTarget.after(sortElm);if(wp_e2[thisContainer][thisCommentTarget].streamSettings[tab].displaysort==
"false")sortElm.hide();else $('.comment-sortorder-select option[value\x3d"'+wp_e2[thisContainer][thisCommentTarget].streamSettings[tab].sortorder+'"]').attr("selected","selected");$(".comment-sortorder-select",$("#"+thisContainer)).change(function(){var thisContainer=$(data.target).closest(".echo_container").attr("id");var thisCommentTarget=$("#"+thisContainer+" .comment-header").attr("rel");var tab=$("#"+thisContainer+" .tab.active a").length>0?$("#"+thisContainer+" .tab.active a").attr("rel"):wp_e2[thisContainer].defaulttab;
wp_e2[thisContainer][thisCommentTarget].streamSettings[tab].sortorder=$(this).attr("value");wp_e2.renderCommentStream(tab,thisContainer,thisCommentTarget)})}}}})(jQuery);TWP=window.TWP||{};TWP.Util=TWP.Util||{};
TWP.Util.Url={getParameters:function(url){var paramList=[],params={},kvPairs,tmp;url=url!==""&&typeof url==="string"?url:document.URL;if(url)if(url.indexOf("?")!==-1){paramList=url.split("?")[1];if(paramList){if(paramList.indexOf("\x26"))kvPairs=paramList.split("\x26");else kvPairs=[paramList];for(var a=0;a<kvPairs.length;a++)if(kvPairs[a].indexOf("\x3d")!==-1){tmp=kvPairs[a].split("\x3d");params[tmp[0]]=unescape(tmp[1])}}}return params?params:null},getUrl:function(){return window.location.href||
document.url},getRootPath:function(){return this.getProtocol()+"//"+this.getHost()+this.getPathName()},getSubDomain:function(){},getTopLevelDomain:function(){return window.document.domain},getHost:function(){return window.location.host},getHostName:function(){return window.location.hostname},getProtocol:function(){return window.location.protocol||window.document.protocol},getPort:function(){return window.location.port},getHash:function(){return window.location.hash},getPathName:function(){return window.location.pathname},
getFileName:function(){},getFileNameExtension:function(){},isSSL:function(){var isSSL=false;if(this.getProtocol().indexOf("https://")!==-1)isSSL=true;return isSSL}};