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
var mod;
function detalhes_callback(data) {
	//TODO: Better Error Handling
	if (data.error) {
		console.log(data, data.error, "erro");
		return false;
	}
	//Update the cache for the user. Print it out in a modal box
	SAPO.Utility.Cache.upsert(data.id, data, 600);
	var modal = SAPO.Dom.Selector.select('#xpto')[0];
	modal.innerHTML = generate_popup(data);
	//console.log(modal.innerHTML, "Inner HTML");
	//Define Max Width
	var modal_width = 940;
	//Define custom width for smaller screens
	if (document.documentElement.clientWidth < 940)	modal_width = document.documentElement.clientWidth - 20;
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
		detalhes_callback(user);
		console.log("cached");
	} else {
		//If not, get the data from the endpoint
		user = new SAPO.Communication.JsonP(
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
	var exceptions = [20, 43, 51, 83, 95];
	if(SAPO.Utility.Array.inArray(id, exceptions)) id = 0;
	return '<a href="https://codebits.eu/s/badges/'+id+'" target="_blank"><img width="32" height="32" alt="Codebits Badge" src="https://codebits.eu/imgs/b/2012/' + id + '_normal.png"/></a>';
}
function draw_avatar(id, nick) {
	return '<a href="https://codebits.eu/'+ nick +'" target="_blank"><img width="100" height="100" alt="User" src="https://codebits.eu/avatars/' + id + '?s=100" class="ink-space" /></a>';
}
function draw_skill(skill){
	return '<a href="https://codebits.eu/intra/s/skill/'+ skill +'" target="_blank">' + skill + '</a>';
}
function draw_twitter(username){
	var link = '<a href="http://twitter.com/'+ username +'" target="_blank">' + username + '</a>';
	return link;
}
//Generic url formatting function. I'm sure you guys have this somewhere in the SAPO.Utility package. Time was short to search for it.
function draw_url(url){
	return '<a href="'+ url +'" target="_blank">' + url + '</a>';
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
			 data[property] = draw_url(data[property]);
			 sidebar += '<div class="ink-row"><h5 class="ink-l100 ink-m30 ink-s30 user-' + property + '">' + property + '</h5><div class="ink-l100 ink-m70 ink-s70"><p>' + data[property].toString().replace(/\n/g, '<br />') + '</p></div></div>';
			 break;
			 case 'twitter':
			 data[property] = draw_twitter(data[property]);
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
			var t1 = new SAPO.Ink.Table(
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
							tdEl.innerHTML = '<img width="50" height="50" class="user_image" onclick="detalhes(' + item.id + ')" data-id="' + item.id + '" src="https://codebits.eu/avatars/' + fieldValue + '?s=50" />';
						}
					},
					pageSize : 50
				});
			//Animate it. Just for the kicks. 
			SAPO.Effects.Slide.up('login', {
				dur : 500
			});
		}
		//Authenticate function
		function authenticate(data) {
		//If we receive a response and a token
			if (data && data.token) {
				//Set cookies so we don't have to run the ajax call again
				if (data.token)
					SAPO.Utility.Cookie.set("token", data.token, 600);
				//TODO: I'll use this somewhere in the near future. "Stay tooned"
				if (data.uid)
					SAPO.Utility.Cookie.set("uid", data.uid, 600);
				
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
			};
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
			var loginform = SAPO.Dom.Selector.select('#login');
			SAPO.Dom.Event.observe(loginform[0], 'submit', function (e) {
				var target = SAPO.Dom.Event.element(e);
				SAPO.Dom.Event.stop(e);
				validateFormGeneric(target);
			});
			show_user_table();
		});
