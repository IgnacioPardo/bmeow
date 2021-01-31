const url = new URL(
  window.location.href
);

var usr_txt;
var pas_txt;
var search_txt;

function addScript(src, async = false) {
  var s = document.createElement('script');
  s.setAttribute('src', src);
	if (async){
  	s.setAttribute('async', 'false');
  	s.setAttribute('defer', 'false');
	}
  document.body.appendChild(s);
}

function main_app(){
	show_navbar()
	addScript("/static/swipe.js");
	if(url.searchParams.get("n") == 0){
		//Scan page
		scan_page();
	}
	else if(url.searchParams.get("n") == 1){
		//Search page
		search_page();
	}
	else if(url.searchParams.get("n") == 2 || url.searchParams.get("n") == null){
		//Me Page
		me_page();
	}
	else if(url.searchParams.get("n") == 3){
		//More page
		more_page();
	}
}

function clear_main(){

	window.history.pushState("", "", '/');

	if (document.getElementsByClassName("search_div")[0]){
		document.body.removeChild(document.getElementsByClassName("search_div")[0])
	}

	//document.getElementsByClassName("header")[0].style.backgroundColor = "black";

	document.getElementsByClassName("main")[0].innerHTML = "";
	document.getElementsByClassName("scan")[0].src = "/static/icons/navbar_icon_scan.svg";
	document.getElementsByClassName("search")[0].src = "/static/icons/navbar_icon_search.svg";
	document.getElementsByClassName("me")[0].src = "/static/icons/navbar_icon_me.svg";
	document.getElementsByClassName("more")[0].src = "/static/icons/navbar_icon_more.svg";

	document.removeEventListener('swiped-right', increase_me_bmeow_count);
	document.removeEventListener('swiped-left', decrease_me_bmeow_count);
}

function scan_page(){
	addScript("/static/jsQR.js", true);
	addScript("/static/scanner.js", true);
	clear_main();

	document.getElementsByClassName("scan")[0].src = "/static/icons/navbar_icon_scan_active.svg";
	start_scanning();
}

function start_scanning(){
  document.getElementsByClassName("header")[0].style.backgroundColor = "transparent";
	
  main = document.getElementsByClassName("main")[0];
  main.innerHTML += '<canvas id="canvas" style="overflow: hidden;" height="'+window.innerHeight+'" width="'+window.innerWidth+'"></canvas>';

  canvasElement = document.getElementById("canvas");
  canvas = canvasElement.getContext("2d");

	navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "environment", width: window.innerWidth*2, height: window.innerHeight*2, focusMode: "continuous" } }).then(function(stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    video.play();
    requestAnimationFrame(tick);
  });
}

function search_page(){
	clear_main();

	document.getElementsByClassName("search")[0].src = "/static/icons/navbar_icon_search_active.svg";

	if (url.searchParams.get("p")){
		load_user_page(url.searchParams.get("p"));
		document.addEventListener('swiped-right', increase_me_bmeow_count);
		document.addEventListener('swiped-left', decrease_me_bmeow_count);
	}
	else{
		document.body.innerHTML += '<div class="search_div" style=""><img class="search_icon" alt="Search" src="static/icons/search.svg"><div><center><input id="search_input" class="search_bar" placeholder="" onchange="search()" type="text"><button class="cancelar">Cancelar</button></center></div></div>';
		document.getElementsByClassName("main")[0].innerHTML =' <div class="results"></div>';
		document.getElementById("search_input").addEventListener('keyup', search);
	}
}

function search(){
	search_txt = document.getElementById("search_input").value;
	if (search_txt != ""){
		fetch('search_user/'+search_txt)
		.then(response => response.json())
		.then(
			data => update_search_list(data)
		);
	}
	else{
		document.getElementsByClassName("main")[0].innerHTML =' <div class="results"></div>';
	}
}

function update_search_list(data){
	document.getElementsByClassName("results")[0].innerHTML = "";
	if (data.response == "success"){	
		data.results.forEach(add_to_list);
	}
}
function add_to_list(element, index, array){
	if (element.username != localStorage.getItem("usr")){
		document.getElementsByClassName("results")[0].innerHTML += '<a href="/?n=1&p='+element.username+'"><div class="search_result"><div class="search_result_img_container"><img class="search_result_profile_pic "alt="'+element.username+'" src="'+element.profile_pic+'"></div><div class="search_result_text_container"><div class="search_result_username">'+element.username+'</div><img class="search_result__small_bmeows" alt="_small_bmeows count" src="static/icons/'+element.status+'_small_bmeows.svg"></div></div></a>';
	}
}

function increase_me_bmeow_count(){
	friend = url.searchParams.get("p");
	usr = localStorage.getItem("usr");
	pas = localStorage.getItem("pas");
	fetch('increase_user_rate/'+usr+"/"+pas+"/"+friend)
	.then(response => response.json())
	.then(
		data => update_profile_page(data)
	);
}

function decrease_me_bmeow_count(){
	friend = url.searchParams.get("p");
	usr = localStorage.getItem("usr");
	pas = localStorage.getItem("pas");
	fetch('decrease_user_rate/'+usr+"/"+pas+"/"+friend)
	.then(response => response.json())
	.then(
		data => update_profile_page(data)
	);
}

function rate_friend(friend, rate){
	usr = localStorage.getItem("usr");
	pas = localStorage.getItem("pas");
	fetch('rate_user/'+usr+"/"+pas+"/"+friend+"/"+rate)
	.then(response => response.json())
	.then(
		data => update_profile_page(data)
	);
}

function me_page(){
	clear_main();
	document.getElementsByClassName("me")[0].src = "/static/icons/navbar_icon_me_active.svg";

	load_user_page(localStorage.getItem('usr'));

	document.getElementsByClassName("main")[0].innerHTML = '<input id="profile_pic_input" type="file" style="visibility:hidden">' + document.getElementsByClassName("main")[0].innerHTML
	var pPicture = document.getElementsByClassName('profile_picture')[0];
	pPicture.addEventListener('click', upload_image);

	var fileInput = document.getElementById("profile_pic_input");
	fileInput.onchange = e => { 
		usr = localStorage.getItem("usr");
		pas = localStorage.getItem("pas");

		var formdata = new FormData();
		formdata.append("file1", fileInput.files[0], usr+".jpg");

		var requestOptions = {
			method: 'POST',
			body: formdata,
			redirect: 'follow'
		};
		loading();
		fetch('change_image/'+usr+'/'+pas, requestOptions)
			.then(response => response.text())
			.then(data => change_profile_image(data));
	}
}

function upload_image(){
	document.getElementById("profile_pic_input").click();
}

function change_profile_image(data){
	document.getElementsByClassName("profile_picture")[0].src = data;
	localStorage.setItem("profile_pic", data);
	stop_loading();
}

function more_page(){
	clear_main();
	document.getElementsByClassName("more")[0].src = "/static/icons/navbar_icon_more_active.svg";
	//sign_out();
	
	load_user_page(localStorage.getItem('usr'));

	document.getElementsByClassName("profile_picture")[0].setAttribute("class", " profile_picture pp_medium");
	document.getElementsByClassName("me_username")[0].setAttribute("class", " me_username mu_medium");
	document.getElementsByClassName("me_bmeow_count")[0].setAttribute("class", " me_bmeow_count mbc_medium");

	document.getElementsByClassName("main")[0].innerHTML += '<div class="subtilte">Perfil</div><div id="get_qr" class="long_button"><div class="lb_icon_container"><img class="s_icon" alt="qr icon" src="static/icons/qr_icon.svg"></div><div class="lb_text_container"><div class="long_button_text">Guardar codigo bmeow</div></div></div><div id="share_url" class="long_button"><div class="lb_icon_container"><img class="s_icon" alt="url icon" src="static/icons/url_icon.svg"></div><div class="lb_text_container"><div class="long_button_text">Compartir url del perfil</div></div></div><div id="signout_btn" class="long_button"><div class="lb_icon_container"><img class="s_icon" alt="signout icon" src="static/icons/signout_icon.svg"></div><div class="lb_text_container"><div class="long_button_text">Cerrar sesion</div></div></div>';

	document.getElementById("get_qr").addEventListener('click', get_qr);
	//document.getElementById("share_url").addEventListener('click', share_url);
	document.getElementById("share_url").addEventListener('click', async () => {
		try {
			await navigator.share({
				title: 'bmeow',
				text: localStorage.getItem("usr"),
				url: url.origin+"/?n=1&p="+localStorage.getItem("usr"),
			})
		} catch(err) {
		}
	});
	document.getElementById("signout_btn").addEventListener('click', sign_out);	
}

function load_user_page(name){
	loading()

	var image = "static/icons/none.svg";

	if (localStorage.getItem("status") != null){
		image = "static/icons/"+ localStorage.getItem("status") + "_bmeow.svg";
	}

	document.getElementsByClassName("main")[0].innerHTML = '<center><img class="profile_picture" alt="Profile Picture" src="static/images/empty.jpg"><div class="me_username">'+name+'</div><img class="me_bmeow_count" alt="bmeow count" src="'+image+'"></center>';

	fetch('get_user/'+name)
	.then(response => response.json())
	.catch(error => force_redirect())
	.then(
		data => update_profile_page(data)
	);
}

function force_redirect(){
	window.location.href = url.origin;
}

function update_profile_page(data){
	if (data.response == "success"){
		if (data.profile_pic){
			document.getElementsByClassName("profile_picture")[0].src = data.profile_pic;
		}

		status = data.status;

		if (localStorage.getItem("signed") == "true" && url.searchParams.get("p") && data.rates[localStorage.getItem("usr")]){
			status = data.rates[localStorage.getItem("usr")]
		}
		status = Math.round(status);
		if (status == 0){
			status = 1;
		}

		document.getElementsByClassName("me_username")[0].innerHTML = data.username;document.getElementsByClassName("me_bmeow_count")[0].src = "static/icons/" + status + "_bmeow.svg";
	}

	stop_loading()
}

function hide_navbar(){
	document.getElementsByClassName("navbar")[0].style.display = "none";
}
function show_navbar(){
	document.getElementsByClassName("navbar")[0].style.display = "block";
}

function sing_page(){
	clear_main();
	hide_navbar();

	document.getElementsByClassName("main")[0].innerHTML = '<div class="login"><input class="log usr_txt" id="usernameInput" placeholder="JohnnyAppleseed" type="text"><input id="passwordInput" class="log pas_txt" type="password" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"><div class="buttons"><button onclick="sign_up()" type="button" class="log_btn signup_btn">Sign Up</button><button onclick="sign_in()" type="button" class="log_btn signin_btn">Sign In</button></div><label for="usernameInput">⠀</label><label for="passwordInput">⠀</label></div>';
}

var sha256=function a(b){function c(a,b){return a>>>b|a<<32-b}for(var d,e,f=Math.pow,g=f(2,32),h="length",i="",j=[],k=8*b[h],l=a.h=a.h||[],m=a.k=a.k||[],n=m[h],o={},p=2;64>n;p++)if(!o[p]){for(d=0;313>d;d+=p)o[d]=p;l[n]=f(p,.5)*g|0,m[n++]=f(p,1/3)*g|0}for(b+="\x80";b[h]%64-56;)b+="\x00";for(d=0;d<b[h];d++){if(e=b.charCodeAt(d),e>>8)return;j[d>>2]|=e<<(3-d)%4*8}for(j[j[h]]=k/g|0,j[j[h]]=k,e=0;e<j[h];){var q=j.slice(e,e+=16),r=l;for(l=l.slice(0,8),d=0;64>d;d++){var s=q[d-15],t=q[d-2],u=l[0],v=l[4],w=l[7]+(c(v,6)^c(v,11)^c(v,25))+(v&l[5]^~v&l[6])+m[d]+(q[d]=16>d?q[d]:q[d-16]+(c(s,7)^c(s,18)^s>>>3)+q[d-7]+(c(t,17)^c(t,19)^t>>>10)|0),x=(c(u,2)^c(u,13)^c(u,22))+(u&l[1]^u&l[2]^l[1]&l[2]);l=[w+x|0].concat(l),l[4]=l[4]+w|0}for(d=0;8>d;d++)l[d]=l[d]+r[d]|0}for(d=0;8>d;d++)for(e=3;e+1;e--){var y=l[d]>>8*e&255;i+=(16>y?0:"")+y.toString(16)}return i};

/* forge implementation
function sha256(pas){
	return forge.md.sha256.create().update(pas).digest().toHex()
}*/

function get_sign_info(){
	usr_txt = document.getElementsByClassName('usr_txt')[0];
	pas_txt = document.getElementsByClassName('pas_txt')[0];
	usr = usr_txt.value;
	pas = pas_txt.value;

	pas = encodeURIComponent(sha256(pas));
	pas_txt.value = "";

	localStorage.setItem("usr", usr);
	localStorage.setItem("pas", pas);
}

function sign_in(){
	get_sign_info();
	
	fetch('sign_in/'+usr+'/'+pas)
			.then(response => response.json())
			.then(data => sign_in_response(data));
}

function sign_in_response(data){
	if (data.status){
		localStorage.setItem("signed", true);
		localStorage.setItem("usr", data.username);
		localStorage.setItem("friends", data.friends);
		main_app();
	}
}

function sign_up(){
	get_sign_info();
	
	fetch('sign_up/'+usr+'/'+pas)
			.then(response => response.json())
			.then(data => sign_up_response(data));
}

function sign_up_response(data){
	if (data.status){
		localStorage.setItem("signed", true);
		localStorage.setItem("usr", data.username);
		localStorage.setItem("friends", data.friends);
		localStorage.setItem("status", data.status);
		localStorage.setItem("profile_pic", data.profile_pic);
		main_app();
	}
}

function sign_out(){
	localStorage.setItem("signed", false);
	localStorage.removeItem("usr");
	localStorage.removeItem("friends");
	localStorage.removeItem("status");
	localStorage.removeItem("profile_pic");

	clear_main();
	hide_navbar();
	sing_page();
}

function loading(){
	document.body.innerHTML += '<div class="loading"><center><img alt="Loading" class="loading_part" src="static/icons/loading.svg"></center></div>';
}

function stop_loading(){
	document.body.removeChild(document.getElementsByClassName("loading")[0])
}

var file;
var filesArray;
function get_qr(){
	u = localStorage.getItem("usr");
	f_l = "/qr/"+u;
	download(f_l, "bmeow_"+u+".jpg");
}

function download(dataurl, filename) {
  var a = document.createElement("a");
  a.href = dataurl;
  a.setAttribute("download", filename);
  a.click();
}

//addScript("/static/forge.js");
if (localStorage.getItem("signed") == "true"){
	main_app();
}
else{
	sing_page();
}