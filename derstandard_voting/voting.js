function replaceLink() {
	$$('.thread').each(function(e) {
		var b = e.down('.b');
		var tid = e.id.substring(1);
		b.update();
		b.insert(new Element('a', {'class':'onclick', 'style' : 'color: rgb(207, 0, 0);'}).update(' - ').observe('click', function() { vote(tid, 0); } ));
		b.insert(new Element('a', {'class':'onclick', 'style' : 'color: blue;'}).update(' 0 ').observe('click', function() { vote(tid, 1); } ));
		b.insert(new Element('a', {'class':'onclick', 'style' : 'color: rgb(0, 154, 48);'}).update(' + ').observe('click', function() { vote(tid, 2); } ));
		b.setStyle({'fontWeight' : 'bold'});
	});
}

// this is just for debugging
function log (function_name, obj_name, obj_value) {
  console.log("function ["+function_name+"] object ["+obj_name+"] value ["+obj_value+"]\n");
}

// this function gets called when you click a vote link
function vote(postID, bewertung) {
	log("vote", "postID", postID);
	log("vote", "bewertung", bewertung);

// get the article reference number from the document.URL
  var arrayOfStrings = document.URL.split('/');
	log("vote", "ref", arrayOfStrings[3]);
	var ref = arrayOfStrings[3];

// construct the URL we will use to POST our vote
	var url = "http://"+window.location.host+"/?page=postbewerten&postID="+postID+"&ref="+ref+"&act=send";
	log("vote", "url", url);

        var req = new XMLHttpRequest();  

// votingComplete will be called, when we get our result (html-page, which closes the window).
        req.addEventListener("load", function() {votingComplete(req,postID);}, false);

        req.open("POST", url, true)
	req.setRequestHeader("Content-Length", "11");
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	req.send("bewertung="+bewertung)

}

// this function will check if we got our window.close() html-page
// and in that case calls query_vote().
function votingComplete(req, postID) {  

	log("votingComplete", "postID", postID);  
	log("votingComplete", "req.responseText", req.responseText);
	log("votingComplete","document.URL", document.URL);

	if (req.responseText.match(/.*derStandard\.at.*window\.close/)) {
		log("votingComplete","req.responseText.match", "true");
		query_vote(postID);
	} else {
		alert("Please login before voting.");
	}
}

// this gets the voting popup form, which should show our vote
function query_vote(postID) {

        var arrayOfStrings = document.URL.split(/[\#\?]/);
	log("query_vote", "url_base", arrayOfStrings[0]);

	log("query_vote","url", arrayOfStrings[0] + "?page=postbewerten&postID=" + postID);

        var req = new XMLHttpRequest();  

        req.addEventListener("load", function() {queryComplete(req,postID);}, false);  

        req.open("GET", arrayOfStrings[0] + "?page=postbewerten&postID=" + postID, true);
	req.send(null);

}


function queryComplete(req, postID) {  

  if ((req.readyState == 4) && (req.status == 200)) {

	log("queryComplete", "req.status", req.status);

// here we create a hidden <div> element
// <div id="voting_result" style="display:none;"> </div>
	var voting_result = document.createElement('div');
	voting_result.setAttribute('id', 'voting_result');
	voting_result.setAttribute('style', 'display:none;');

	document.body.appendChild(voting_result);

	log("queryComplete", "document.body", document.body);

// this line loads the voting popup form into the div element
// so we can later use the XPath DOM parser
	voting_result.innerHTML = getBody(req.responseText);

	log("queryComplete", "voting_result", voting_result);

// here we filter our vote ("unnötig" resp "brilliant") from the hidden <div> element
	var result = document.evaluate(
		'/html/body/div[@id="voting_result"]/table/tbody/tr[2]/td/p/b',
		voting_result, null,XPathResult.STRING_TYPE,null).stringValue;


	log("queryComplete", "result", result);

// we don't need our <div> element anymore, therefore we remove it
	voting_result.parentNode.removeChild(voting_result);

	paint(postID, result);

   }
}

// this function changes the background-color of the voting link
// so we can see, what our vote was

function paint(postID, voted) {

	log ("paint", "postID", postID);
	var vote;
	
	if (voted == 'unnötig') {
		vote = 0;
	} else if (voted == 'brillant') {
		vote = 2;
	} else if (voted == 'interessant') {
		vote = 1;
	}
	
	var e = $('t'+postID).down('.b').childNodes[vote];
	e.setStyle({'backgroundColor':e.getStyle('color')});
}

// this one just dumps the DOM tree of any html node (i.e. HTMLDivElement)
// which is useful for debugging
function nodeToXML(node, indentation, out) {
   out += indentation+"<"+node.nodeName.toLowerCase();
   if (node.attributes!=null) {
      for (var i=0; i<node.attributes.length; i++) {
         var item = node.attributes.item(i);
         var value = item.nodeValue;
         if (value==null) value = "";
         out += " "+item.nodeName+"=\""+value+"\"";
      }
   }
   out += ">\n";
   for (var i=0; i<node.childNodes.length; i++) {
      var item = node.childNodes.item(i);
      out = nodeToXML(item, indentation+"   ", out);
   }
   if (node.nodeValue!=null) 
      out += indentation+"   "+node.nodeValue+"\n";
   out += indentation+"</"+node.nodeName.toLowerCase()+">\n";
   return out;
}

// extracts the <body> from a full <html> document
function getBody(content) 
{
   test = content.toLowerCase();    // to eliminate case sensitivity
   var x = test.indexOf("<body");
   if(x == -1) return "";

   x = test.indexOf(">", x);
   if(x == -1) return "";

   var y = test.lastIndexOf("</body>");
   if(y == -1) y = test.lastIndexOf("</html>");
   if(y == -1) y = content.length;    // If no HTML then just grab everything till end

   return content.slice(x + 1, y);   
}

document.observe('dom:loaded', replaceLink);
replaceLink();