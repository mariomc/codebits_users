// Avoid `console` errors in browsers that lack a console.
//Copy pasta from HTML5 Boilerplate.

(function () {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});
	while (length--) {
		method = methods[length];
		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}
	());
var cookie = SAPO.Utility.Cookie.get();
var user_token = cookie.token ? cookie.token : false;
//This is here to help me debug the modal, which I'm still learning how to use it properly.
var mod, t1, original_model, filtered_model;

function detalhes_callback(data) {
	//TODO: Better Error Handling
	if (data.error) {
		console.log(data, data.error, "erro");
		return false;
	}
	//Update the cache for the user. Print it out in a modal box
	SAPO.Utility.Cache.upsert(data.id, SAPO.Utility.Serialize.get(data), 600);
	var modal = SAPO.Dom.Selector.select('#xpto')[0];
	modal.innerHTML = generate_popup(data);
	//console.log(modal.innerHTML, "Inner HTML");
	//Define Max Width
	var modal_width = 940;
	//Define custom width for smaller screens
	if (document.documentElement.clientWidth < 940)
		modal_width = document.documentElement.clientWidth - 20;
	mod = new SAPO.Ink.Modal('#xpto', {
			//closeOnClick : true
			resize : true,
			width : modal_width
		});
}
function detalhes(user_id) {
	//Check if we have the item cached
	var user = SAPO.Utility.Cache.get(user_id);
	//If so, print the details
	if (user) {
		//transform the string into a json object
		user = JSON.parse(user);
		detalhes_callback(user);
		console.log("cached");
	} else {
		//If not, get the data from the endpoint
		new SAPO.Communication.JsonP(
			"https://services.sapo.pt/Codebits/user/" + user_id + "?callback=detalhes_callback&token=" + user_token, {
			onComplete : function (data) {
				console.log("completed ajax call");
			}
		});
		console.log("not in cache");
	}
}
//Helper function to draw the badge
function draw_badge(id) {
	//@SAPO pls fix the "not-available" images :P
	//83: It's a trap!!
	//95 too!
	var exceptions = ["20", "43", "51", "83", "95"];
	var img;
	//check if it's one of the exceptions
	if (SAPO.Utility.Array.inArray(id, exceptions))
		id = 0;
	img = id ? 'https://codebits.eu/imgs/b/2012/' : 'https://codebits.eu/imgs/b/';
	return '<a href="https://codebits.eu/s/badges/' + id + '" target="_blank"><img width="32" height="32" alt="Codebits Badge" src="' + img + id + '_normal.png"/></a>';
}
function draw_avatar(id, nick) {
	return '<a href="https://codebits.eu/' + nick + '" target="_blank"><img width="100" height="100" alt="User" src="https://codebits.eu/avatars/' + id + '?s=100" class="ink-space" /></a>';
}
function draw_skill(skill) {
	return '<a href="https://codebits.eu/intra/s/skill/' + skill + '" target="_blank">' + skill + '</a>';
}
function draw_twitter(username) {
	var link = '<a href="http://twitter.com/' + username + '" target="_blank">' + username + '</a>';
	return link;
}
//Generic url formatting function. I'm sure you guys have this somewhere in the SAPO.Utility package. Time was short to search for it.
function draw_url(url) {
	return '<a href="' + url + '" target="_blank">' + url + '</a>';
}
function generate_popup(data) {
	var sidebar = '';
	for (var property in data) {
		//Add values here to hide these
		var hide = ['name', 'md5mail', 'avatar', 'id', 'nick', 'checkin_date', 'status', 'badges', 'bio'];
		if ((data[property] != "") && !SAPO.Utility.Array.inArray(property, hide)) {
			//Sorry for the ugly switch. Will improve this.
			switch (property) {
			case 'md5mail':
				sidebar += draw_avatar(data[property], data['nick']);
				break;
			case 'skills':
				var skills = data[property];
				skills.toString = function () {
					var skill = '<nav class="ink-navigation"><ul class="pills">';
					SAPO.Utility.Array.each(this, function (value, array) {
						skill += "<li>" + draw_skill(value) + "</li>";
					});
					skill += '</ul></nav>';
					return skill;
				};
				sidebar += '<div class="ink-row"><h5 class="ink-l100 ink-m30 ink-s30 user-' + property + '">' + property + '</h5><div class="ink-l100 ink-m100 ink-s100">' + data[property].toString().replace(/\n/g, '<br />') + '</div></div>';
				break;
			case 'coderep':
			case 'blog':
				sidebar += '<div class="ink-row"><h5 class="ink-l100 ink-m30 ink-s30 user-' + property + '">' + property + '</h5><div class="ink-l100 ink-m70 ink-s70"><p>' + data[property].toString().replace(/\n/g, '<br />') + '</p></div></div>';
				break;
			case 'twitter':
				sidebar += '<div class="ink-row"><h5 class="ink-l100 ink-m30 ink-s30 user-' + property + '">' + property + '</h5><div class="ink-l100 ink-m70 ink-s70"><p>' + data[property].toString().replace(/\n/g, '<br />') + '</p></div></div>';
				break;
			case 'badges':
				//console.log(badges);
			default:
				sidebar += '<div class="ink-row"><h5 class="ink-l100 ink-m30 ink-s30 user-' + property + '">' + property + '</h5><div class="ink-l100 ink-m70 ink-s70"><p>' + data[property].toString().replace(/\n/g, '<br />') + '</p></div></div>';
			}
		}
	}
	var badges = data['badges'];
	//Just change the toString property for the badge and it's all ok.
	badges.toString = function () {
		var images = "";
		SAPO.Utility.Array.each(this, function (value, array) {
			images += draw_badge(value);
		});
		return images;
	};
	var html = '<div class="ink-container" style="max-width: 100%; box-sizing: border-box; height: auto;">';
	html += '<div class="ink-l100"><div class="ink-l100"><h2>' + data["name"] + '</h2></div><div class="ink-l20 ink-m100 ink-s100">' + draw_avatar(data["md5mail"], data["nick"]) + sidebar + '</div><div class="ink-l80 ink-m100 ink-s100"><p>' + data["bio"].replace(/\n/g, '<br />') + '</p><p>' + badges.toString().replace(/\n/g, '<br />') + '</p></div></div>';
	html += '</div>';
	return html;
}
//Callback to build the user table
function build_user_table(data) {
	//Loop the data
	SAPO.Utility.Array.each(data, function(obj,index){
		//console.log("runned this", obj, index);
		for(var prop in obj) {
			//Add a string property to search for the records
			data[index]["text"] = data[index]["text"] ? data[index]["text"] + " "  +data[index][prop] : " ";
		}
	});

	t1 = new SAPO.Ink.Table(
			'#t2', {
			model : data,
			fields : ['md5mail', 'name', 'twitter'],
			sortableFields : '*',
			fieldNames : {
				md5mail : 'Imagem',
				name : 'Nome',
				twitter : 'Twitter'
			},
			formatters : {
				md5mail : function (fieldValue, item, tdEl) {
					if (!fieldValue)
						return;
					//console.log(fieldValue,item,tdEl);
					tdEl.innerHTML = '<img width="50" height="50" class="user_image" onclick="detalhes(' + item.id + ')" data-id="' + item.id + '" data-lazyload="https://codebits.eu/avatars/' + fieldValue + '?s=50" />';
				}
			},
			pageSize : 100
		});
	original_model = data;
	//Animate it. Just for the kicks.
	SAPO.Effects.Slide.up('login', {
		dur : 500,
		after: function(){
			SAPO.Dom.Css.removeClassName("search", "hidden");
			SAPO.Dom.Css.removeClassName("logout", "hidden");
		}
	});
}
function lazyload(offset) {
	//TODO: For the throbber, instead of changing source, I'm adding a background image of the animated gif. This, however, has some problems with the dreaded IE in some versions as well as transparent pngs.
	console.log("Lazy Sunday!");
	offset = offset ? offset : 0;
	var images = SAPO.Dom.Selector.select("img[data-lazyload]");
	SAPO.Utility.Array.each(images, function (value, array) {
		//GTFO if we have a source set already
		if (value.src != "")
			return;
		if (visible(value, offset))
			value.src = value.dataset.lazyload;
		//	if(visible(value, offset)) console.log("on the fold", value);
	});
}
//if it's not above the fold or below
function visible(element, offset) {
	offset = offset ? offset : 0;
	if (!below_viewport(element, offset) && !above_viewport(element, offset)) {
		return true;
	} else {
		return false;
	}
}
//Is the element above the fold with a certain offset?
function above_viewport(element, offset) {
	return (SAPO.Dom.Element.offsetTop(element) - SAPO.Utility.Dimensions.scrollHeight() + offset) <= 0 ? true : false;
}
//Is the element below the fold with a certain offset?
function below_viewport(element, offset) {
	return ((SAPO.Utility.Dimensions.viewportHeight() + SAPO.Utility.Dimensions.scrollHeight() + offset) <= SAPO.Dom.Element.offsetTop(element)) ? true : false;
}
//Authenticate function
function authenticate(data) {
	//If we receive a response and a token
	if (data && data.token) {
		//Set cookies so we don't have to run the ajax call again
		if (data.token)
			SAPO.Utility.Cookie.set("token", data.token, 6000);
		//TODO: I'll use this somewhere in the near future. "Stay tooned"
		if (data.uid)
			SAPO.Utility.Cookie.set("uid", data.uid, 6000);
		user_token = data.token;
		show_user_table();
	} else {
		//If we don't have a token or a data, we'll show an error message
		//console.log(data);
		console.log("Login Failed");
		var message_string = "Ocorreu um erro";
		if (data.error.msg)
			message_string = data.error.msg;
		var message = '<button class="ink-close">×</button><p><b>Erro:</b> ' + message_string + '</p>';
		var error_alert = SAPO.Dom.Element.create('div', {
				className : 'ink-alert error',
				innerHTML : message
			});
		SAPO.Dom.Element.insertAfter(error_alert, SAPO.Dom.Selector.select('#messages')[0]);
	}
}
//TODO: Use this in the near future. Add a button to bind this function probably.
function logout() {
	SAPO.Utility.Cookie.remove("uid");
	SAPO.Utility.Cookie.remove("token");
	window.location.reload();
}
//Initial function to show user table
function show_user_table() {
	if (user_token == false) {
		console.log("No user Token");
		return false;
	}
	//TODO: Error Handling
	var table = new SAPO.Communication.JsonP(
			"https://services.sapo.pt/Codebits/users?callback=build_user_table&token=" + user_token, {
			evalJS : 'force',
			onComplete : function (data) {
				
				//console.log(data);
			},
		});
}
//Blatant copy from the examples. Sorry!
function validateFormGeneric(target) {
	//console.log(target);
	var options = {
		onSuccess : function (a, b) {}
	};
	
	var result = SAPO.Ink.FormValidator.validate(target, options);
	//console.log(result);
	if (result) {
		var values = SAPO.Utility.FormSerialize.serialize(SAPO.Dom.Selector.select("#login")[0]);
		//console.log(values);
		new SAPO.Communication.JsonP(
			SAPO.Utility.Url.genQueryString("https://services.sapo.pt/Codebits/gettoken?callback=authenticate", values), {
			evalJS : 'force',
			onComplete : function (data) {
				//console.log("completed ajax call");
			},
		});
	}
	return result;
}
//$(document).ready equivalent?
SAPO.Dom.Loaded.run(function () {
	var interval = false;
	//check if we have application cache available. No test on your API?
	if (Modernizr.applicationcache)
		SAPO.Utility.Cache.setMode("localstorage");
	var loginform = SAPO.Dom.Selector.select('#login');
	SAPO.Dom.Event.observe(loginform[0], 'submit', function (e) {
		var target = SAPO.Dom.Event.element(e);
		SAPO.Dom.Event.stop(e);
		validateFormGeneric(target);
	});
	SAPO.Dom.Event.observe(SAPO.Dom.Selector.select('#text-input')[0], 'keyup', function (e) {
		//console.log("teste", e);
		filtered_model = [];
		SAPO.Utility.Array.each(original_model, function(value,index){
			if(value["text"].toLowerCase().indexOf(e.srcElement.value.toLowerCase()) > -1) filtered_model.push(value);
		});
		//Guys you need to correct your SAPO.Ink.Table _localQuery method to validate the model length. When you set an empty model, it blows up. Just comment this line below and see for yourself
		if(filtered_model.length == 0) filtered_model = [{}];
		//console.log("modelo filtrado", filtered_model);
		t1.setModel(filtered_model);
		
	});
	//I'm only testing with an Android and Chrome touch events emulator. Need a lab or iphone sdk to emulate better.
	SAPO.Dom.Event.observe(window, "touchstart", function (e) {
		//Proof of concept. Usually this event is called twice while dragging - when starting and when ending. I might be wrong. Uncharted territory here...
		if (interval) {
		//if we've set this already, clear it
			interval = window.clearInterval(interval);
				console.log("cleared", interval);
		} else {
			//if not, set a timeout for while dragging.
			interval = self.setInterval(lazyload(SAPO.Utility.Dimensions.viewportHeight()), 1000);
			console.log("started", interval);
		}
	});
	// SAPO.Dom.Event.observe(window, "touchmove", function(e){
	// console.log("this is a drag (no pun intended)", e);
	// });
	//Copy-pasta from your website. Let me reverse engineer the logic behind it
	//I've got to optimize this... A simple scroll to the bottom of the page calls the event 40 to 60 times...
	SAPO.Dom.Event.observe(window, 'scroll', function () {
	//Call the Viewport height as the offset to cover some threshold and page down events properly
		lazyload(SAPO.Utility.Dimensions.viewportHeight());
	});
	//Observe the event the pagination clicks. Can't do it like this... Will try to modify the prototype below. This is hacky!
	// SAPO.Dom.Event.observe(".pagination a", 'click', function (e) {
	// lazyload(SAPO.Utility.Dimensions.viewportHeight());
	// console.log(e);
	// });
	SAPO.Ink.Table.prototype.refresh = function () {
		this._query(function (err, items) {
			var tbodyEl = document.createElement('tbody');
			var i,
			I,
			j,
			J,
			trEl,
			tdEl,
			item,
			field,
			value,
			formatter;
			J = this._options.fields.length;
			for (i = 0, I = items.length; i < I; ++i) {
				item = items[i];
				trEl = document.createElement('tr');
				for (j = 0; j < J; ++j) {
					field = this._options.fields[j];
					value = item[field];
					formatter = this._options.formatters[field];
					tdEl = document.createElement('td');
					if (formatter) {
						formatter(value, item, tdEl);
					} else {
						tdEl.innerHTML = value || '';
					}
					trEl.appendChild(tdEl);
				}
				tbodyEl.appendChild(trEl);
			}
			this._element.replaceChild(tbodyEl, this._tbodyEl);
			this._tbodyEl = tbodyEl;
			SAPO.Dom.Event.observe(this._tbodyEl, 'click', this._handlers.cellclick);
		}
			.bindObj(this));
		SAPO.Dom.Event.fire(window, 'scroll');
	};
	show_user_table();
	//Hacky but works, fire the scroll and unify it
	//I could set an alias event for the scroll but I'm not yet quite sure how to do this with your library
	SAPO.Dom.Event.fire(window, 'scroll');
});