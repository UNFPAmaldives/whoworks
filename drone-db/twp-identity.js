(function() {	
	var isSSL = (window.location.protocol.indexOf('https')) < 0?false:true;
	var wpostServerSsl = 'https://js.washingtonpost.com/wpost';
	TWP = window.TWP || {};
	TWP.base = TWP.base || 'https://js.washingtonpost.com';
	TWP.wpostCssBase = TWP.wpostCssBase || 'https://css.washingtonpost.com';
	TWP.wpostJsBase = TWP.wpostJsBase || 'https://js.washingtonpost.com';
	TWP.wpostJsBaseSsl = TWP.wpostJsBaseSsl || 'https://js.washingtonpost.com';	
	TWP.jsCacheBuster = TWP.jsCacheBuster || '20160101112600';
	TWP.cssCacheBuster = TWP.cssCacheBuster || '2015110350805';
	TWP.ScriptLoader = TWP.ScriptLoader || {};
	TWP.ScriptLoader.scriptArray = TWP.ScriptLoader.scriptArray || [];
	var inlineJsScriptArray = [];
		
	TWP.ScriptLoader.loadjscssfile = function(filename, filetype){
		var inlineArray = [];
		if (filename.length == 0) return;
		if (isSSL) {
			filename = ((filetype == "js" || filetype == "cjs")?filename.replace(TWP.wpostJsBase,TWP.wpostJsBaseSsl):filename);
			filename = ((filetype == "css")?filename.replace(TWP.wpostCssBase,TWP.wpostJsBaseSsl):filename);
		}
		 if (filetype=="js"){ //if filename is a JavaScript file
			  var fileref=document.createElement('script');
  		  	  fileref.setAttribute("type","text/javascript");
			  fileref.setAttribute("src", filename);
			  inlineJsScriptArray.push(fileref);
		 }	else if (filetype=="cjs"){ //if filename is a JavaScript file
			  var fileref=document.createElement('script');
  		  	  fileref.setAttribute("type","text/cjs");
			  fileref.setAttribute("data-cjssrc", filename);
			  TWP.ScriptLoader.scriptArray.push(fileref);
		 }	else if (filetype == "inline"){ //if filename is inline javascript file
			  var fileref=document.createElement('script');
			  fileref.setAttribute("type","text/cjs");
			  fileref.text = filename;
	  		  TWP.ScriptLoader.scriptArray.push(fileref);
		 } else if (filetype=="css"){ //if filename is an external CSS file
			  var fileref=document.createElement("link");
			  fileref.setAttribute("rel", "stylesheet");
			  fileref.setAttribute("type", "text/css");
			  fileref.setAttribute("href", filename);
			  if (typeof fileref != "undefined")
		  			document.getElementsByTagName("head")[0].appendChild(fileref);
		 }

	}
	 
	
	TWP.ScriptLoader.processScriptArray = function() { 
		if ( TWP.ScriptLoader.scriptArray.length ) {
			var script = TWP.ScriptLoader.scriptArray[0];			
			var src = CJS.getAttribute(script, "data-cjssrc"); 
			if ( src ) {
				// External Script 
				if(!CJS.hExec[src]) {				
					CJS.processExternalScript(script, TWP.ScriptLoader.processScriptArray); 
					CJS.hExec[src] = true;
					TWP.ScriptLoader.scriptArray.splice(0, 1);   // remove leading script
				}
				else {
					TWP.ScriptLoader.scriptArray.splice(0, 1);   // remove leading script
					setTimeout(TWP.ScriptLoader.processScriptArray,0);
				}
			} else {
				// Inline Script
				if (0 === CJS.aExecs.length) { //make sure previous scripts loaded before executing inline script
					CJS.processInlineScript(script);
					TWP.ScriptLoader.scriptArray.splice(0, 1); // remove leading script
				}	
				setTimeout(TWP.ScriptLoader.processScriptArray, 0);
			}
			
			return; 
		}
	}

	
	TWP.ScriptLoader.loadCJS = function () {
		if (typeof CJS == 'undefined') {
			  		
			jsControlJs = '|<script type="text/cjs" data-cjssrc="https://js.washingtonpost.com/wpost/js/combo?token=20160101112600&c=true&m=true&context=eidos&r=/controljs/control-mod.js"></script>';		
			var cjsscript = document.createElement('script');
			cjsscript.onload = cjsscript.onreadystatechange = 
				function(){
					if ( this.readyState && this.readyState != "complete" && this.readyState != "loaded" ) {
						return; 
					}			
					TWP.ScriptLoader.processScriptArray();
				}
			cjsscript.src = jsControlJs.substring(jsControlJs.indexOf('src="')+5,jsControlJs.indexOf('"></script>'));
			if (isSSL) {
				cjsscript.src = cjsscript.src.replace(TWP.wpostJsBase,TWP.wpostJsBaseSsl);
			}
			var cjssib = document.getElementsByTagName('script')[0];
			cjssib.parentNode.insertBefore(cjsscript, cjssib);
		} else {
			TWP.ScriptLoader.processScriptArray();
		}	
	}	
	 
	
	if (typeof jQuery == 'undefined'){
		
		var jsJQuery = '|<script type="text/javascript" src="https://js.washingtonpost.com/wpost/js/combo?token=20160101112600&c=true&m=true&context=eidos&r=/jquery-1.7.1.js"></script>';				
		TWP.ScriptLoader.loadjscssfile(jsJQuery.substring(jsJQuery.indexOf('src="')+5,jsJQuery.indexOf('"></script>')), "js");
	}		
		
			
	var jsList = '';
	
				jsList = jsList + '|<script type="text/javascript" src="https://js.washingtonpost.com/wpost/js/combo?token=20160101112600&c=true&m=true&context=eidos&r=/conf.js&r=/actmgmt/acctmgmt_common.js&r=/plugin/plugin.jquery.cookie-1.0.0.js"></script>';			
	
				jsList = jsList + '|<script type="text/javascript" src="https://js.washingtonpost.com/wpost/js/combo?token=20160101112600&c=true&m=true&context=eidos&r=/util/util-user-2.0.0.js&r=/util/util.identity-management-1.1.0.js"></script>';			
	
				jsList = jsList + '|<script type="text/cjs" data-cjssrc="https://js.washingtonpost.com/wpost/js/combo?token=20160101112600&c=true&m=true&context=eidos&r=/marketing/identity-retargeting.js"></script>';			
	
				jsList = jsList + '|<script type="text/javascript" src="https://js.washingtonpost.com/wpost/js/combo?token=20160101112600&c=true&m=true&context=eidos&r=/wapo/wapo_sites.js&r=/wapo/wapolabs.nojq.full.js&r=/wapo/prod/wapo_identity_full.js"></script>';			
	
				jsList = jsList + '|<script type="text/javascript" src="https://js.washingtonpost.com/wpost/js/combo?token=20160101112600&c=true&m=true&context=eidos&r=/plugin/plugin.jquery.tools.overlay.1.2.7mod.js&r=/plugin/plugin.jquery.tools.overlay.apple.js&r=/plugin/plugin.jquery.tools.toolbox.expose.js"></script>';			
	;

	jsList = jsList + '|if (TWP.jsConfig && TWP.jsConfig.initFunctions){for(var a=0; a<TWP.jsConfig.initFunctions.length; a++) {TWP.jsConfig.initFunctions[a]($("body"));}}';
	
	var cssList = '';
	
				cssList = cssList + '|<link rel="stylesheet" type="text/css" href="https://css.washingtonpost.com/wpost/css/combo?token=2015110350805&inttoken=2015110330605&c=true&m=true&context=eidos&r=/2.0.0/modal.css" />';
	
	var tmpArray = cssList.split('|');
	for (i=0;i<tmpArray.length;i++){
		var tmpFile = tmpArray[i].substring(tmpArray[i].indexOf('href="')+6,tmpArray[i].lastIndexOf('/>')).replace(/[" >]/g,'');
		if (tmpFile != ''){TWP.ScriptLoader.loadjscssfile(tmpFile, "css");};
	}	

	
	tmpArray = jsList.split('|');
	for (i=0;i<tmpArray.length;i++){
		var scriptSrc = tmpArray[i].substring(tmpArray[i].indexOf('src="')+5,tmpArray[i].indexOf('"></script>'));
		if (tmpArray[i].indexOf('data-cjssrc="') > -1){		
			TWP.ScriptLoader.loadjscssfile(scriptSrc, "cjs");
		} else if (tmpArray[i].indexOf('src="') > -1){		
			TWP.ScriptLoader.loadjscssfile(scriptSrc, "js");			
		} else {
			TWP.ScriptLoader.loadjscssfile(tmpArray[i], "inline");
		}	
	}

	
	for (i=0;i<inlineJsScriptArray.length;i++){
				
		document.write('<script type="text/javascript" src="' + inlineJsScriptArray[i].attributes["src"].value +'"></script>');
	}

	if (!TWP.ScriptLoader.listener) {
		if (document.addEventListener ) {
			document.addEventListener("DOMContentLoaded", 				
				function(){
	        		//if ( document.readyState === "complete" || document.readyState === "interactive" ) {
	                        document.removeEventListener( "load", arguments.callee, false );
	                        TWP.ScriptLoader.loadCJS();
	                        if (typeof triggerJS != "undefined" && typeof triggerJS == "function") {triggerJS()};
	                //}	
				}
			,false);
			TWP.ScriptLoader.listener = true;
		} else if ( document.attachEvent ) {			
	        document.attachEvent("onreadystatechange", function(){
	        		if ( document.readyState === "complete" || document.readyState === "interactive" ) {
	                        document.detachEvent( "onreadystatechange", arguments.callee );
	                        TWP.ScriptLoader.loadCJS();
	                        if (typeof triggerJS != "undefined" && typeof triggerJS == "function") {triggerJS()};
	                }	  	                    
	        });
	        TWP.ScriptLoader.listener = true; 

		} 	
	}

})();


