if(!_sf_async_config&&!window._sf_async_config&&document.location.href.indexOf("template=iframe")===-1){try{var _sf_async_config={uid:19624,domain:"washingtonpost.com"};
_sf_async_config.sections=wp_channel;_sf_async_config.path=document.location.pathname;_sf_async_config.useCanonical=true;_sf_async_config.title=document.title.replace(" - The Washington Post","");
$(document).ready(function(){$.getScript("http://static.chartbeat.com/js/chartbeat.js");});}catch(e){}}TWP.Util.toTitleCase=function(d){var a="";var c=d.split(" ");
for(var b=0;b<c.length;b++){a+=c[b].substr(0,1).toUpperCase()+c[b].substr(1);a+=b<c.length-1?" ":"";}return a;};function getParameters(f){var d=[],h={},c,g;
f=(typeof f==="undefined"||f==="")?document.URL:f;if(f){if(f.indexOf("?")!==-1){d=f.split("?")[1];if(d){if(d.indexOf("&")){c=d.split("&");}else{c=[d];}for(var b=0;
b<c.length;b++){if(c[b].indexOf("=")!==-1){g=c[b].split("=");h[g[0]]=unescape(g[1]);}}}}}return(h)?h:null;}(function(d){var b;var c;d(document).ready(function(){b=d("#nav");
c=d("#main-container");a();b.find("li.share").on("mouseenter",function(){d(this).find(".dropdown-menu").addClass("show-dd-menu");d(this).find(".dropdown-menu").show();
}).on("mouseleave",function(){d(this).find(".dropdown-menu").removeClass("show-dd-menu");d(this).find(".dropdown-menu").hide();}).on("click",function(g){if(d(this).hasClass("show-dd-menu")){d(this).removeClass("show-dd-menu");
d(this).find(".dropdown-menu").hide();}else{if(mobile_browser===1||ipad_browser===1){d(this).addClass("show-dd-menu");d(this).find(".dropdown-menu").show();
}}});b.find("li.share").children("a").on("click",function(g){g.preventDefault();});var f=getParameters(document.URL);if(f.template&&f.template==="iframe"){d("body").addClass("iframe").show().css("display","block");
d("#main-container .main-content").siblings().hide();}});function a(){var k=d("link[rel=canonical]").attr("href"),g=d("link[rel=shorturl]").attr("href"),h=d('meta[name="twitter:title"]').attr("content"),f=d('meta[name="twitter:site"]').attr("content");
var j="mailto:?subject="+h+" "+k;d("#dd-share-em a").attr("href",j);var l="https://facebook.com/dialog/feed?app_id=1203881719652746&link="+k+"&name="+h+"&redirect_uri="+k;
d("#dd-share-fb a").attr("href",l);var i="http://twitter.com/intent/tweet?text="+encodeURI(h+" "+g+" via "+f);d("#dd-share-tw a").attr("href",i);}})(jQuery);
