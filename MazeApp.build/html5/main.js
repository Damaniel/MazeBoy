
//Change this to true for a stretchy canvas!
//
var RESIZEABLE_CANVAS=false;

//Start us up!
//
window.onload=function( e ){

	if( RESIZEABLE_CANVAS ){
		window.onresize=function( e ){
			var canvas=document.getElementById( "GameCanvas" );

			//This vs window.innerWidth, which apparently doesn't account for scrollbar?
			var width=document.body.clientWidth;
			
			//This vs document.body.clientHeight, which does weird things - document seems to 'grow'...perhaps canvas resize pushing page down?
			var height=window.innerHeight;			

			canvas.width=width;
			canvas.height=height;
		}
		window.onresize( null );
	}
	
	game_canvas=document.getElementById( "GameCanvas" );
	
	game_console=document.getElementById( "GameConsole" );

	try{
	
		bbInit();
		bbMain();
		
		if( game_runner!=null ) game_runner();
		
	}catch( err ){
	
		alertError( err );
	}
}

var game_canvas;
var game_console;
var game_runner;

//${CONFIG_BEGIN}
CFG_BINARY_FILES="*.bin|*.dat";
CFG_CD="";
CFG_CONFIG="debug";
CFG_HOST="winnt";
CFG_IMAGE_FILES="*.png|*.jpg";
CFG_LANG="js";
CFG_MODPATH=".;E:/dropbox/Dropbox/MazeApp;F:/Monkey/MonkeyPro66/modules";
CFG_MOJO_AUTO_SUSPEND_ENABLED="0";
CFG_MUSIC_FILES="*.wav|*.ogg|*.mp3|*.m4a";
CFG_OPENGL_GLES20_ENABLED="0";
CFG_SAFEMODE="0";
CFG_SOUND_FILES="*.wav|*.ogg|*.mp3|*.m4a";
CFG_TARGET="html5";
CFG_TEXT_FILES="*.txt|*.xml|*.json";
CFG_TRANSDIR="";
//${CONFIG_END}

//${METADATA_BEGIN}
var META_DATA="[black.png];type=image/png;width=640;height=480;\n[blackskull.png];type=image/png;width=384;height=48;\n[blocks.png];type=image/png;width=384;height=48;\n[blueslime.png];type=image/png;width=384;height=48;\n[boy.png];type=image/png;width=196;height=196;\n[boymini.png];type=image/png;width=64;height=16;\n[consumables.png];type=image/png;width=576;height=48;\n[difficulties.png];type=image/png;width=86;height=60;\n[difficultiesyellow.png];type=image/png;width=86;height=60;\n[difficultybox.png];type=image/png;width=224;height=224;\n[digits.png];type=image/png;width=110;height=12;\n[digitsyellow.png];type=image/png;width=110;height=12;\n[easy.png];type=image/png;width=192;height=48;\n[enemies.png];type=image/png;width=384;height=768;\n[flyingthinga.png];type=image/png;width=384;height=48;\n[flyingthingb.png];type=image/png;width=384;height=48;\n[gameoverdied.png];type=image/png;width=256;height=112;\n[gameovertime.png];type=image/png;width=256;height=112;\n[glowingeye.png];type=image/png;width=128;height=16;\n[hard.png];type=image/png;width=192;height=48;\n[highscore.png];type=image/png;width=640;height=480;\n[hitanim.png];type=image/png;width=192;height=144;\n[holygoat.png];type=image/png;width=640;height=480;\n[howtoplay.png];type=image/png;width=368;height=416;\n[itemicons.png];type=image/png;width=64;height=16;\n[normal.png];type=image/png;width=192;height=48;\n[pinwheel.png];type=image/png;width=384;height=48;\n[redskull.png];type=image/png;width=384;height=48;\n[redslime.png];type=image/png;width=384;height=48;\n[rockthingy.png];type=image/png;width=128;height=16;\n[selecticon.png];type=image/png;width=16;height=16;\n[title.png];type=image/png;width=640;height=480;\n[treasure.png];type=image/png;width=1536;height=48;\n[ui.png];type=image/png;width=608;height=32;\n[veryeasy.png];type=image/png;width=192;height=48;\n[veryhard.png];type=image/png;width=192;height=48;\n[whiteskull.png];type=image/png;width=128;height=16;\n[winner.png];type=image/png;width=640;height=480;\n[winnerboy.png];type=image/png;width=192;height=192;\n[yellowslime.png];type=image/png;width=128;height=16;\n[mojo_font.png];type=image/png;width=864;height=13;\n";
//${METADATA_END}

function getMetaData( path,key ){

	if( path.toLowerCase().indexOf("monkey://data/")!=0 ) return "";
	path=path.slice(14);

	var i=META_DATA.indexOf( "["+path+"]" );
	if( i==-1 ) return "";
	i+=path.length+2;

	var e=META_DATA.indexOf( "\n",i );
	if( e==-1 ) e=META_DATA.length;

	i=META_DATA.indexOf( ";"+key+"=",i )
	if( i==-1 || i>=e ) return "";
	i+=key.length+2;

	e=META_DATA.indexOf( ";",i );
	if( e==-1 ) return "";

	return META_DATA.slice( i,e );
}

function fixDataPath( path ){
	if( path.toLowerCase().indexOf("monkey://data/")==0 ) return "data/"+path.slice(14);
	return path;
}

function openXMLHttpRequest( req,path,async ){

	path=fixDataPath( path );
	
	var xhr=new XMLHttpRequest;
	xhr.open( req,path,async );
	return xhr;
}

function loadArrayBuffer( path ){

	var xhr=openXMLHttpRequest( "GET",path,false );

	if( xhr.overrideMimeType ) xhr.overrideMimeType( "text/plain; charset=x-user-defined" );

	xhr.send( null );
	
	if( xhr.status!=200 && xhr.status!=0 ) return null;

	var r=xhr.responseText;
	var buf=new ArrayBuffer( r.length );

	for( var i=0;i<r.length;++i ){
		this.dataView.setInt8( i,r.charCodeAt(i) );
	}
	return buf;
}

function loadString( path ){
	path=fixDataPath( path );
	var xhr=new XMLHttpRequest();
	xhr.open( "GET",path,false );
	xhr.send( null );
	if( (xhr.status==200) || (xhr.status==0) ) return xhr.responseText;
	return "";
}

function loadImage( path,onloadfun ){

	var ty=getMetaData( path,"type" );
	if( ty.indexOf( "image/" )!=0 ) return null;

	var image=new Image();
	
	image.meta_width=parseInt( getMetaData( path,"width" ) );
	image.meta_height=parseInt( getMetaData( path,"height" ) );
	image.onload=onloadfun;
	image.src="data/"+path.slice(14);
	
	return image;
}

function loadAudio( path ){

	path=fixDataPath( path );
	
	var audio=new Audio( path );
	return audio;
}

//${TRANSCODE_BEGIN}

// Javascript Monkey runtime.
//
// Placed into the public domain 24/02/2011.
// No warranty implied; use at your own risk.

//***** JavaScript Runtime *****

var D2R=0.017453292519943295;
var R2D=57.29577951308232;

var err_info="";
var err_stack=[];

var dbg_index=0;

function push_err(){
	err_stack.push( err_info );
}

function pop_err(){
	err_info=err_stack.pop();
}

function stackTrace(){
	if( !err_info.length ) return "";
	var str=err_info+"\n";
	for( var i=err_stack.length-1;i>0;--i ){
		str+=err_stack[i]+"\n";
	}
	return str;
}

function print( str ){
	if( game_console ){
		game_console.value+=str+"\n";
		game_console.scrollTop = game_console.scrollHeight - game_console.clientHeight;
	}
	if( window.console!=undefined ){
		window.console.log( str );
	}
	return 0;
}

function alertError( err ){
	if( typeof(err)=="string" && err=="" ) return;
	alert( "Monkey Runtime Error : "+err.toString()+"\n\n"+stackTrace() );
}

function error( err ){
	throw err;
}

function debugLog( str ){
	print( str );
}

function debugStop(){
	error( "STOP" );
}

function dbg_object( obj ){
	if( obj ) return obj;
	error( "Null object access" );
}

function dbg_array( arr,index ){
	if( index<0 || index>=arr.length ) error( "Array index out of range" );
	dbg_index=index;
	return arr;
}

function new_bool_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=false;
	return arr;
}

function new_number_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=0;
	return arr;
}

function new_string_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]='';
	return arr;
}

function new_array_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=[];
	return arr;
}

function new_object_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=null;
	return arr;
}

function resize_bool_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=false;
	return arr;
}

function resize_number_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=0;
	return arr;
}

function resize_string_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]="";
	return arr;
}

function resize_array_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=[];
	return arr;
}

function resize_object_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=null;
	return arr;
}

function string_compare( lhs,rhs ){
	var n=Math.min( lhs.length,rhs.length ),i,t;
	for( i=0;i<n;++i ){
		t=lhs.charCodeAt(i)-rhs.charCodeAt(i);
		if( t ) return t;
	}
	return lhs.length-rhs.length;
}

function string_replace( str,find,rep ){	//no unregex replace all?!?
	var i=0;
	for(;;){
		i=str.indexOf( find,i );
		if( i==-1 ) return str;
		str=str.substring( 0,i )+rep+str.substring( i+find.length );
		i+=rep.length;
	}
}

function string_trim( str ){
	var i=0,i2=str.length;
	while( i<i2 && str.charCodeAt(i)<=32 ) i+=1;
	while( i2>i && str.charCodeAt(i2-1)<=32 ) i2-=1;
	return str.slice( i,i2 );
}

function string_startswith( str,substr ){
	return substr.length<=str.length && str.slice(0,substr.length)==substr;
}

function string_endswith( str,substr ){
	return substr.length<=str.length && str.slice(str.length-substr.length,str.length)==substr;
}

function string_tochars( str ){
	var arr=new Array( str.length );
	for( var i=0;i<str.length;++i ) arr[i]=str.charCodeAt(i);
	return arr;
}

function string_fromchars( chars ){
	var str="",i;
	for( i=0;i<chars.length;++i ){
		str+=String.fromCharCode( chars[i] );
	}
	return str;
}

function object_downcast( obj,clas ){
	if( obj instanceof clas ) return obj;
	return null;
}

function object_implements( obj,iface ){
	if( obj && obj.implments && obj.implments[iface] ) return obj;
	return null;
}

function extend_class( clas ){
	var tmp=function(){};
	tmp.prototype=clas.prototype;
	return new tmp;
}

function ThrowableObject(){
}

ThrowableObject.prototype.toString=function(){ 
	return "Uncaught Monkey Exception"; 
}

// Note: Firefox doesn't support DataView, so we have to kludge...
//
// This means pokes/peeks must be naturally aligned, but data has to be in WebGL anyway so that's OK for now.
//
function BBDataBuffer(){
	this.arrayBuffer=null;
	this.dataView=null;
	this.length=0;
}

BBDataBuffer.prototype._Init=function( buffer ){
	this.arrayBuffer=buffer;
	this.dataView=new DataView( buffer );
	this.length=buffer.byteLength;
}

BBDataBuffer.prototype._New=function( length ){
	if( this.arrayBuffer ) return false;
	
	var buf=new ArrayBuffer( length );
	if( !buf ) return false;
	
	this._Init( buf );
	return true;
}

BBDataBuffer.prototype._Load=function( path ){
	if( this.arrayBuffer ) return false;
	
	var buf=loadArrayBuffer( path );
	if( !buf ) return false;
	
	_Init( buf );
	return true;
}

BBDataBuffer.prototype.Length=function(){
	return this.length;
}

BBDataBuffer.prototype.Discard=function(){
	if( this.arrayBuffer ){
		this.arrayBuffer=null;
		this.dataView=null;
		this.length=0;
	}
}

BBDataBuffer.prototype.PokeByte=function( addr,value ){
	this.dataView.setInt8( addr,value );
}

BBDataBuffer.prototype.PokeShort=function( addr,value ){
	this.dataView.setInt16( addr,value );	
}

BBDataBuffer.prototype.PokeInt=function( addr,value ){
	this.dataView.setInt32( addr,value );	
}

BBDataBuffer.prototype.PokeFloat=function( addr,value ){
	this.dataView.setFloat32( addr,value );	
}

BBDataBuffer.prototype.PeekByte=function( addr ){
	return this.dataView.getInt8( addr );
}

BBDataBuffer.prototype.PeekShort=function( addr ){
	return this.dataView.getInt16( addr );
}

BBDataBuffer.prototype.PeekInt=function( addr ){
	return this.dataView.getInt32( addr );
}

BBDataBuffer.prototype.PeekFloat=function( addr ){
	return this.dataView.getFloat32( addr );
}

// HTML5 mojo runtime.
//
// Copyright 2011 Mark Sibly, all rights reserved.
// No warranty implied; use at your own risk.

var gl=null;	//global WebGL context - a bit rude!

KEY_LMB=1;
KEY_RMB=2;
KEY_MMB=3;
KEY_TOUCH0=0x180;

function eatEvent( e ){
	if( e.stopPropagation ){
		e.stopPropagation();
		e.preventDefault();
	}else{
		e.cancelBubble=true;
		e.returnValue=false;
	}
}

function keyToChar( key ){
	switch( key ){
	case 8:
	case 9:
	case 13:
	case 27:
	case 32:
		return key;
	case 33:
	case 34:
	case 35:
	case 36:
	case 37:
	case 38:
	case 39:
	case 40:
	case 45:
		return key | 0x10000;
	case 46:
		return 127;
	}
	return 0;
}

//***** gxtkApp class *****

function gxtkApp(){

	if( CFG_OPENGL_GLES20_ENABLED=="1" ){
		this.gl=game_canvas.getContext( "webgl" );
		if( !this.gl ) this.gl=game_canvas.getContext( "experimental-webgl" );
	}else{
		this.gl=null;
	}

	this.graphics=new gxtkGraphics( this,game_canvas );
	this.input=new gxtkInput( this );
	this.audio=new gxtkAudio( this );

	this.loading=0;
	this.maxloading=0;

	this.updateRate=0;
	this.startMillis=(new Date).getTime();
	
	this.dead=false;
	this.suspended=false;
	
	var app=this;
	var canvas=game_canvas;
	
	function gxtkMain(){
	
		var input=app.input;
	
		canvas.onkeydown=function( e ){
			input.OnKeyDown( e.keyCode );
			var chr=keyToChar( e.keyCode );
			if( chr ) input.PutChar( chr );
			if( e.keyCode<48 || (e.keyCode>111 && e.keyCode<122) ) eatEvent( e );
		}

		canvas.onkeyup=function( e ){
			input.OnKeyUp( e.keyCode );
		}

		canvas.onkeypress=function( e ){
			if( e.charCode ){
				input.PutChar( e.charCode );
			}else if( e.which ){
				input.PutChar( e.which );
			}
		}

		canvas.onmousedown=function( e ){
			switch( e.button ){
			case 0:input.OnKeyDown( KEY_LMB );break;
			case 1:input.OnKeyDown( KEY_MMB );break;
			case 2:input.OnKeyDown( KEY_RMB );break;
			}
			eatEvent( e );
		}
		
		canvas.onmouseup=function( e ){
			switch( e.button ){
			case 0:input.OnKeyUp( KEY_LMB );break;
			case 1:input.OnKeyUp( KEY_MMB );break;
			case 2:input.OnKeyUp( KEY_RMB );break;
			}
			eatEvent( e );
		}
		
		canvas.onmouseout=function( e ){
			input.OnKeyUp( KEY_LMB );
			input.OnKeyUp( KEY_MMB );
			input.OnKeyUp( KEY_RMB );
			eatEvent( e );
		}

		canvas.onmousemove=function( e ){
			var x=e.clientX+document.body.scrollLeft;
			var y=e.clientY+document.body.scrollTop;
			var c=canvas;
			while( c ){
				x-=c.offsetLeft;
				y-=c.offsetTop;
				c=c.offsetParent;
			}
			input.OnMouseMove( x,y );
			eatEvent( e );
		}

		canvas.onfocus=function( e ){
			if( CFG_MOJO_AUTO_SUSPEND_ENABLED=="1" ){
				app.InvokeOnResume();
			}
		}
		
		canvas.onblur=function( e ){
			if( CFG_MOJO_AUTO_SUSPEND_ENABLED=="1" ){
				app.InvokeOnSuspend();
			}
		}
		
		canvas.ontouchstart=function( e ){
			for( var i=0;i<e.changedTouches.length;++i ){
				var touch=e.changedTouches[i];
				var x=touch.pageX;
				var y=touch.pageY;
				var c=canvas;
				while( c ){
					x-=c.offsetLeft;
					y-=c.offsetTop;
					c=c.offsetParent;
				}
				input.OnTouchStart( touch.identifier,x,y );
			}
			eatEvent( e );
		}
		
		canvas.ontouchmove=function( e ){
			for( var i=0;i<e.changedTouches.length;++i ){
				var touch=e.changedTouches[i];
				var x=touch.pageX;
				var y=touch.pageY;
				var c=canvas;
				while( c ){
					x-=c.offsetLeft;
					y-=c.offsetTop;
					c=c.offsetParent;
				}
				input.OnTouchMove( touch.identifier,x,y );
			}
			eatEvent( e );
		}
		
		canvas.ontouchend=function( e ){
			for( var i=0;i<e.changedTouches.length;++i ){
				input.OnTouchEnd( e.changedTouches[i].identifier );
			}
			eatEvent( e );
		}
		
		window.ondevicemotion=function( e ){
			var tx=e.accelerationIncludingGravity.x/9.81;
			var ty=e.accelerationIncludingGravity.y/9.81;
			var tz=e.accelerationIncludingGravity.z/9.81;
			var x,y;
			switch( window.orientation ){
			case   0:x=+tx;y=-ty;break;
			case 180:x=-tx;y=+ty;break;
			case  90:x=-ty;y=-tx;break;
			case -90:x=+ty;y=+tx;break;
			}
			input.OnDeviceMotion( x,y,tz );
			eatEvent( e );
		}

		canvas.focus();

		app.InvokeOnCreate();
		app.InvokeOnRender();
	}

	game_runner=gxtkMain;
}

var timerSeq=0;

gxtkApp.prototype.SetFrameRate=function( fps ){

	var seq=++timerSeq;
	
	if( !fps ) return;
	
	var app=this;
	var updatePeriod=1000.0/fps;
	var nextUpdate=(new Date).getTime()+updatePeriod;
	
	function timeElapsed(){
		if( seq!=timerSeq ) return;

		var time;		
		var updates=0;

		for(;;){
			nextUpdate+=updatePeriod;

			app.InvokeOnUpdate();
			if( seq!=timerSeq ) return;
			
			if( nextUpdate>(new Date).getTime() ) break;
			
			if( ++updates==7 ){
				nextUpdate=(new Date).getTime();
				break;
			}
		}
		app.InvokeOnRender();
		if( seq!=timerSeq ) return;
			
		var delay=nextUpdate-(new Date).getTime();
		setTimeout( timeElapsed,delay>0 ? delay : 0 );
	}
	
	setTimeout( timeElapsed,updatePeriod );
}

gxtkApp.prototype.IncLoading=function(){
	++this.loading;
	if( this.loading>this.maxloading ) this.maxloading=this.loading;
	if( this.loading==1 ) this.SetFrameRate( 0 );
}

gxtkApp.prototype.DecLoading=function(){
	--this.loading;
	if( this.loading!=0 ) return;
	this.maxloading=0;
	this.SetFrameRate( this.updateRate );
}

gxtkApp.prototype.GetMetaData=function( path,key ){
	return getMetaData( path,key );
}

gxtkApp.prototype.Die=function( err ){
	this.dead=true;
	this.audio.OnSuspend();
	alertError( err );
}

gxtkApp.prototype.InvokeOnCreate=function(){
	if( this.dead ) return;
	
	try{
		gl=this.gl;
		this.OnCreate();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnUpdate=function(){
	if( this.dead || this.suspended || !this.updateRate || this.loading ) return;
	
	try{
		gl=this.gl;
		this.input.BeginUpdate();
		this.OnUpdate();		
		this.input.EndUpdate();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnSuspend=function(){
	if( this.dead || this.suspended ) return;
	
	try{
		gl=this.gl;
		this.suspended=true;
		this.OnSuspend();
		this.audio.OnSuspend();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnResume=function(){
	if( this.dead || !this.suspended ) return;
	
	try{
		gl=this.gl;
		this.audio.OnResume();
		this.OnResume();
		this.suspended=false;
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnRender=function(){
	if( this.dead || this.suspended ) return;
	
	try{
		gl=this.gl;
		this.graphics.BeginRender();
		if( this.loading ){
			this.OnLoading();
		}else{
			this.OnRender();
		}
		this.graphics.EndRender();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

//***** GXTK API *****

gxtkApp.prototype.GraphicsDevice=function(){
	return this.graphics;
}

gxtkApp.prototype.InputDevice=function(){
	return this.input;
}

gxtkApp.prototype.AudioDevice=function(){
	return this.audio;
}

gxtkApp.prototype.AppTitle=function(){
	return document.URL;
}

gxtkApp.prototype.LoadState=function(){
	var state=localStorage.getItem( ".mojostate@"+document.URL );
	if( state ) return state;
	return "";
}

gxtkApp.prototype.SaveState=function( state ){
	localStorage.setItem( ".mojostate@"+document.URL,state );
}

gxtkApp.prototype.LoadString=function( path ){
	return loadString( path );
}

gxtkApp.prototype.SetUpdateRate=function( fps ){
	this.updateRate=fps;
	
	if( !this.loading ) this.SetFrameRate( fps );
}

gxtkApp.prototype.MilliSecs=function(){
	return ((new Date).getTime()-this.startMillis)|0;
}

gxtkApp.prototype.Loading=function(){
	return this.loading;
}

gxtkApp.prototype.OnCreate=function(){
}

gxtkApp.prototype.OnUpdate=function(){
}

gxtkApp.prototype.OnSuspend=function(){
}

gxtkApp.prototype.OnResume=function(){
}

gxtkApp.prototype.OnRender=function(){
}

gxtkApp.prototype.OnLoading=function(){
}

//***** gxtkGraphics class *****

function gxtkGraphics( app,canvas ){
	this.app=app;
	this.canvas=canvas;
	this.gc=canvas.getContext( '2d' );
	this.tmpCanvas=null;
	this.r=255;
	this.b=255;
	this.g=255;
	this.white=true;
	this.color="rgb(255,255,255)"
	this.alpha=1;
	this.blend="source-over";
	this.ix=1;this.iy=0;
	this.jx=0;this.jy=1;
	this.tx=0;this.ty=0;
	this.tformed=false;
	this.scissorX=0;
	this.scissorY=0;
	this.scissorWidth=0;
	this.scissorHeight=0;
	this.clipped=false;
}

gxtkGraphics.prototype.BeginRender=function(){
	if( this.gc ) this.gc.save();
}

gxtkGraphics.prototype.EndRender=function(){
	if( this.gc ) this.gc.restore();
}

gxtkGraphics.prototype.Mode=function(){
	if( this.gc ) return 1;
	return 0;
}

gxtkGraphics.prototype.Width=function(){
	return this.canvas.width;
}

gxtkGraphics.prototype.Height=function(){
	return this.canvas.height;
}

gxtkGraphics.prototype.LoadSurface=function( path ){
	var app=this.app;
	
	function onloadfun(){
		app.DecLoading();
	}

	app.IncLoading();

	var image=loadImage( path,onloadfun );
	if( image ) return new gxtkSurface( image,this );

	app.DecLoading();
	return null;
}

gxtkGraphics.prototype.CreateSurface=function( width,height ){

	var canvas=document.createElement( 'canvas' );
	
	canvas.width=width;
	canvas.height=height;
	canvas.meta_width=width;
	canvas.meta_height=height;
	canvas.complete=true;
	
	var surface=new gxtkSurface( canvas,this );
	
	surface.gc=canvas.getContext( '2d' );
	
	return surface;
}

gxtkGraphics.prototype.SetAlpha=function( alpha ){
	this.alpha=alpha;
	this.gc.globalAlpha=alpha;
}

gxtkGraphics.prototype.SetColor=function( r,g,b ){
	this.r=r;
	this.g=g;
	this.b=b;
	this.white=(r==255 && g==255 && b==255);
	this.color="rgb("+(r|0)+","+(g|0)+","+(b|0)+")";
	this.gc.fillStyle=this.color;
	this.gc.strokeStyle=this.color;
}

gxtkGraphics.prototype.SetBlend=function( blend ){
	switch( blend ){
	case 1:
		this.blend="lighter";
		break;
	default:
		this.blend="source-over";
	}
	this.gc.globalCompositeOperation=this.blend;
}

gxtkGraphics.prototype.SetScissor=function( x,y,w,h ){
	this.scissorX=x;
	this.scissorY=y;
	this.scissorWidth=w;
	this.scissorHeight=h;
	this.clipped=(x!=0 || y!=0 || w!=this.canvas.width || h!=this.canvas.height);
	this.gc.restore();
	this.gc.save();
	if( this.clipped ){
		this.gc.beginPath();
		this.gc.rect( x,y,w,h );
		this.gc.clip();
		this.gc.closePath();
	}
	this.gc.fillStyle=this.color;
	this.gc.strokeStyle=this.color;
	if( this.tformed ) this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
}

gxtkGraphics.prototype.SetMatrix=function( ix,iy,jx,jy,tx,ty ){
	this.ix=ix;this.iy=iy;
	this.jx=jx;this.jy=jy;
	this.tx=tx;this.ty=ty;
	this.gc.setTransform( ix,iy,jx,jy,tx,ty );
	this.tformed=(ix!=1 || iy!=0 || jx!=0 || jy!=1 || tx!=0 || ty!=0);
}

gxtkGraphics.prototype.Cls=function( r,g,b ){
	if( this.tformed ) this.gc.setTransform( 1,0,0,1,0,0 );
	this.gc.fillStyle="rgb("+(r|0)+","+(g|0)+","+(b|0)+")";
	this.gc.globalAlpha=1;
	this.gc.globalCompositeOperation="source-over";
	this.gc.fillRect( 0,0,this.canvas.width,this.canvas.height );
	this.gc.fillStyle=this.color;
	this.gc.globalAlpha=this.alpha;
	this.gc.globalCompositeOperation=this.blend;
	if( this.tformed ) this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
}

gxtkGraphics.prototype.DrawPoint=function( x,y ){
	if( this.tformed ){
		var px=x;
		x=px * this.ix + y * this.jx + this.tx;
		y=px * this.iy + y * this.jy + this.ty;
		this.gc.setTransform( 1,0,0,1,0,0 );
		this.gc.fillRect( x,y,1,1 );
		this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
	}else{
		this.gc.fillRect( x,y,1,1 );
	}
}

gxtkGraphics.prototype.DrawRect=function( x,y,w,h ){
	if( w<0 ){ x+=w;w=-w; }
	if( h<0 ){ y+=h;h=-h; }
	if( w<=0 || h<=0 ) return;
	//
	this.gc.fillRect( x,y,w,h );
}

gxtkGraphics.prototype.DrawLine=function( x1,y1,x2,y2 ){
	if( this.tformed ){
		var x1_t=x1 * this.ix + y1 * this.jx + this.tx;
		var y1_t=x1 * this.iy + y1 * this.jy + this.ty;
		var x2_t=x2 * this.ix + y2 * this.jx + this.tx;
		var y2_t=x2 * this.iy + y2 * this.jy + this.ty;
		this.gc.setTransform( 1,0,0,1,0,0 );
	  	this.gc.beginPath();
	  	this.gc.moveTo( x1_t,y1_t );
	  	this.gc.lineTo( x2_t,y2_t );
	  	this.gc.stroke();
	  	this.gc.closePath();
		this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
	}else{
	  	this.gc.beginPath();
	  	this.gc.moveTo( x1,y1 );
	  	this.gc.lineTo( x2,y2 );
	  	this.gc.stroke();
	  	this.gc.closePath();
	}
}

gxtkGraphics.prototype.DrawOval=function( x,y,w,h ){
	if( w<0 ){ x+=w;w=-w; }
	if( h<0 ){ y+=h;h=-h; }
	if( w<=0 || h<=0 ) return;
	//
  	var w2=w/2,h2=h/2;
	this.gc.save();
	this.gc.translate( x+w2,y+h2 );
	this.gc.scale( w2,h2 );
  	this.gc.beginPath();
	this.gc.arc( 0,0,1,0,Math.PI*2,false );
	this.gc.fill();
  	this.gc.closePath();
	this.gc.restore();
}

gxtkGraphics.prototype.DrawPoly=function( verts ){
	if( verts.length<6 ) return;
	this.gc.beginPath();
	this.gc.moveTo( verts[0],verts[1] );
	for( var i=2;i<verts.length;i+=2 ){
		this.gc.lineTo( verts[i],verts[i+1] );
	}
	this.gc.fill();
	this.gc.closePath();
}

gxtkGraphics.prototype.DrawSurface=function( surface,x,y ){
	if( !surface.image.complete ) return;
	
	if( this.white ){
		this.gc.drawImage( surface.image,x,y );
		return;
	}
	
	this.DrawImageTinted( surface.image,x,y,0,0,surface.swidth,surface.sheight );
}

gxtkGraphics.prototype.DrawSurface2=function( surface,x,y,srcx,srcy,srcw,srch ){
	if( !surface.image.complete ) return;

	if( srcw<0 ){ srcx+=srcw;srcw=-srcw; }
	if( srch<0 ){ srcy+=srch;srch=-srch; }
	if( srcw<=0 || srch<=0 ) return;

	if( this.white ){
		this.gc.drawImage( surface.image,srcx,srcy,srcw,srch,x,y,srcw,srch );
		return;
	}
	
	this.DrawImageTinted( surface.image,x,y,srcx,srcy,srcw,srch  );
}

gxtkGraphics.prototype.DrawImageTinted=function( image,dx,dy,sx,sy,sw,sh ){

	if( !this.tmpCanvas ){
		this.tmpCanvas=document.createElement( "canvas" );
	}

	if( sw>this.tmpCanvas.width || sh>this.tmpCanvas.height ){
		this.tmpCanvas.width=Math.max( sw,this.tmpCanvas.width );
		this.tmpCanvas.height=Math.max( sh,this.tmpCanvas.height );
	}
	
	var tmpGC=this.tmpCanvas.getContext( "2d" );
	tmpGC.globalCompositeOperation="copy";
	
	tmpGC.drawImage( image,sx,sy,sw,sh,0,0,sw,sh );
	
	var imgData=tmpGC.getImageData( 0,0,sw,sh );
	
	var p=imgData.data,sz=sw*sh*4,i;
	
	for( i=0;i<sz;i+=4 ){
		p[i]=p[i]*this.r/255;
		p[i+1]=p[i+1]*this.g/255;
		p[i+2]=p[i+2]*this.b/255;
	}
	
	tmpGC.putImageData( imgData,0,0 );
	
	this.gc.drawImage( this.tmpCanvas,0,0,sw,sh,dx,dy,sw,sh );
}

gxtkGraphics.prototype.ReadPixels=function( pixels,x,y,width,height,offset,pitch ){

	var imgData=this.gc.getImageData( x,y,width,height );
	
	var p=imgData.data,i=0,j=offset,px,py;
	
	for( py=0;py<height;++py ){
		for( px=0;px<width;++px ){
			pixels[j++]=(p[i+3]<<24)|(p[i]<<16)|(p[i+1]<<8)|p[i+2];
			i+=4;
		}
		j+=pitch-width;
	}
}

gxtkGraphics.prototype.WritePixels2=function( surface,pixels,x,y,width,height,offset,pitch ){

	if( !surface.gc ){
		if( !surface.image.complete ) return;
		var canvas=document.createElement( "canvas" );
		canvas.width=surface.swidth;
		canvas.height=surface.sheight;
		surface.gc=canvas.getContext( "2d" );
		surface.gc.globalCompositeOperation="copy";
		surface.gc.drawImage( surface.image,0,0 );
		surface.image=canvas;
	}

	var imgData=surface.gc.createImageData( width,height );

	var p=imgData.data,i=0,j=offset,px,py,argb;
	
	for( py=0;py<height;++py ){
		for( px=0;px<width;++px ){
			argb=pixels[j++];
			p[i]=(argb>>16) & 0xff;
			p[i+1]=(argb>>8) & 0xff;
			p[i+2]=argb & 0xff;
			p[i+3]=(argb>>24) & 0xff;
			i+=4;
		}
		j+=pitch-width;
	}
	
	surface.gc.putImageData( imgData,x,y );
}

//***** gxtkSurface class *****

function gxtkSurface( image,graphics ){
	this.image=image;
	this.graphics=graphics;
	this.swidth=image.meta_width;
	this.sheight=image.meta_height;
}

//***** GXTK API *****

gxtkSurface.prototype.Discard=function(){
	if( this.image ){
		this.image=null;
	}
}

gxtkSurface.prototype.Width=function(){
	return this.swidth;
}

gxtkSurface.prototype.Height=function(){
	return this.sheight;
}

gxtkSurface.prototype.Loaded=function(){
	return this.image.complete;
}

gxtkSurface.prototype.OnUnsafeLoadComplete=function(){
	return true;
}

//***** Class gxtkInput *****

function gxtkInput( app ){
	this.app=app;
	this.keyStates=new Array( 512 );
	this.charQueue=new Array( 32 );
	this.charPut=0;
	this.charGet=0;
	this.mouseX=0;
	this.mouseY=0;
	this.joyX=0;
	this.joyY=0;
	this.joyZ=0;
	this.touchIds=new Array( 32 );
	this.touchXs=new Array( 32 );
	this.touchYs=new Array( 32 );
	this.accelX=0;
	this.accelY=0;
	this.accelZ=0;
	
	var i;
	
	for( i=0;i<512;++i ){
		this.keyStates[i]=0;
	}
	
	for( i=0;i<32;++i ){
		this.touchIds[i]=-1;
		this.touchXs[i]=0;
		this.touchYs[i]=0;
	}
}

gxtkInput.prototype.BeginUpdate=function(){
}

gxtkInput.prototype.EndUpdate=function(){
	for( var i=0;i<512;++i ){
		this.keyStates[i]&=0x100;
	}
	this.charGet=0;
	this.charPut=0;
}

gxtkInput.prototype.OnKeyDown=function( key ){
	if( (this.keyStates[key]&0x100)==0 ){
		this.keyStates[key]|=0x100;
		++this.keyStates[key];
		//
		if( key==KEY_LMB ){
			this.keyStates[KEY_TOUCH0]|=0x100;
			++this.keyStates[KEY_TOUCH0];
		}else if( key==KEY_TOUCH0 ){
			this.keyStates[KEY_LMB]|=0x100;
			++this.keyStates[KEY_LMB];
		}
		//
	}
}

gxtkInput.prototype.OnKeyUp=function( key ){
	this.keyStates[key]&=0xff;
	//
	if( key==KEY_LMB ){
		this.keyStates[KEY_TOUCH0]&=0xff;
	}else if( key==KEY_TOUCH0 ){
		this.keyStates[KEY_LMB]&=0xff;
	}
	//
}

gxtkInput.prototype.PutChar=function( chr ){
	if( this.charPut-this.charGet<32 ){
		this.charQueue[this.charPut & 31]=chr;
		this.charPut+=1;
	}
}

gxtkInput.prototype.OnMouseMove=function( x,y ){
	this.mouseX=x;
	this.mouseY=y;
	this.touchXs[0]=x;
	this.touchYs[0]=y;
}

gxtkInput.prototype.OnTouchStart=function( id,x,y ){
	for( var i=0;i<32;++i ){
		if( this.touchIds[i]==-1 ){
			this.touchIds[i]=id;
			this.touchXs[i]=x;
			this.touchYs[i]=y;
			this.OnKeyDown( KEY_TOUCH0+i );
			return;
		} 
	}
}

gxtkInput.prototype.OnTouchMove=function( id,x,y ){
	for( var i=0;i<32;++i ){
		if( this.touchIds[i]==id ){
			this.touchXs[i]=x;
			this.touchYs[i]=y;
			if( i==0 ){
				this.mouseX=x;
				this.mouseY=y;
			}
			return;
		}
	}
}

gxtkInput.prototype.OnTouchEnd=function( id ){
	for( var i=0;i<32;++i ){
		if( this.touchIds[i]==id ){
			this.touchIds[i]=-1;
			this.OnKeyUp( KEY_TOUCH0+i );
			return;
		}
	}
}

gxtkInput.prototype.OnDeviceMotion=function( x,y,z ){
	this.accelX=x;
	this.accelY=y;
	this.accelZ=z;
}

//***** GXTK API *****

gxtkInput.prototype.SetKeyboardEnabled=function( enabled ){
	return 0;
}

gxtkInput.prototype.KeyDown=function( key ){
	if( key>0 && key<512 ){
		return this.keyStates[key] >> 8;
	}
	return 0;
}

gxtkInput.prototype.KeyHit=function( key ){
	if( key>0 && key<512 ){
		return this.keyStates[key] & 0xff;
	}
	return 0;
}

gxtkInput.prototype.GetChar=function(){
	if( this.charPut!=this.charGet ){
		var chr=this.charQueue[this.charGet & 31];
		this.charGet+=1;
		return chr;
	}
	return 0;
}

gxtkInput.prototype.MouseX=function(){
	return this.mouseX;
}

gxtkInput.prototype.MouseY=function(){
	return this.mouseY;
}

gxtkInput.prototype.JoyX=function( index ){
	return this.joyX;
}

gxtkInput.prototype.JoyY=function( index ){
	return this.joyY;
}

gxtkInput.prototype.JoyZ=function( index ){
	return this.joyZ;
}

gxtkInput.prototype.TouchX=function( index ){
	return this.touchXs[index];
}

gxtkInput.prototype.TouchY=function( index ){
	return this.touchYs[index];
}

gxtkInput.prototype.AccelX=function(){
	return this.accelX;
}

gxtkInput.prototype.AccelY=function(){
	return this.accelY;
}

gxtkInput.prototype.AccelZ=function(){
	return this.accelZ;
}


//***** gxtkChannel class *****
function gxtkChannel(){
	this.sample=null;
	this.audio=null;
	this.volume=1;
	this.pan=0;
	this.rate=1;
	this.flags=0;
	this.state=0;
}

//***** gxtkAudio class *****
function gxtkAudio( app ){
	this.app=app;
	this.okay=typeof(Audio)!="undefined";
	this.nextchan=0;
	this.music=null;
	this.channels=new Array(33);
	for( var i=0;i<33;++i ){
		this.channels[i]=new gxtkChannel();
	}
}

gxtkAudio.prototype.OnSuspend=function(){
	var i;
	for( i=0;i<33;++i ){
		var chan=this.channels[i];
		if( chan.state==1 ) chan.audio.pause();
	}
}

gxtkAudio.prototype.OnResume=function(){
	var i;
	for( i=0;i<33;++i ){
		var chan=this.channels[i];
		if( chan.state==1 ) chan.audio.play();
	}
}

gxtkAudio.prototype.LoadSample=function( path ){
	var audio=loadAudio( path );
	if( !audio ) return null;
	return new gxtkSample( audio );
}

gxtkAudio.prototype.PlaySample=function( sample,channel,flags ){
	if( !this.okay ) return;

	var chan=this.channels[channel];

	if( chan.state!=0 ){
		chan.audio.pause();
		chan.state=0;
	}
	
	for( var i=0;i<33;++i ){
		var chan2=this.channels[i];
		if( chan2.state==1 && chan2.audio.ended && !chan2.audio.loop ) chan.state=0;
		if( chan2.state==0 && chan2.sample ){
			chan2.sample.FreeAudio( chan2.audio );
			chan2.sample=null;
			chan2.audio=null;
		}
	}

	var audio=sample.AllocAudio();
	if( !audio ) return;
	
	audio.loop=(flags&1)!=0;
	audio.volume=chan.volume;
	audio.play();

	chan.sample=sample;
	chan.audio=audio;
	chan.flags=flags;
	chan.state=1;
}

gxtkAudio.prototype.StopChannel=function( channel ){
	var chan=this.channels[channel];
	
	if( chan.state!=0 ){
		chan.audio.pause();
		chan.state=0;
	}
}

gxtkAudio.prototype.PauseChannel=function( channel ){
	var chan=this.channels[channel];
	
	if( chan.state==1 ){
		if( chan.audio.ended && !chan.audio.loop ){
			chan.state=0;
		}else{
			chan.audio.pause();
			chan.state=2;
		}
	}
}

gxtkAudio.prototype.ResumeChannel=function( channel ){
	var chan=this.channels[channel];
	
	if( chan.state==2 ){
		chan.audio.play();
		chan.state=1;
	}
}

gxtkAudio.prototype.ChannelState=function( channel ){
	var chan=this.channels[channel];
	if( chan.state==1 && chan.audio.ended && !chan.audio.loop ) chan.state=0;
	return chan.state;
}

gxtkAudio.prototype.SetVolume=function( channel,volume ){
	var chan=this.channels[channel];
	if( chan.state!=0 ) chan.audio.volume=volume;
	chan.volume=volume;
}

gxtkAudio.prototype.SetPan=function( channel,pan ){
	var chan=this.channels[channel];
	chan.pan=pan;
}

gxtkAudio.prototype.SetRate=function( channel,rate ){
	var chan=this.channels[channel];
	chan.rate=rate;
}

gxtkAudio.prototype.PlayMusic=function( path,flags ){
	this.StopMusic();
	
	this.music=this.LoadSample( path );
	if( !this.music ) return;
	
	this.PlaySample( this.music,32,flags );
}

gxtkAudio.prototype.StopMusic=function(){
	this.StopChannel( 32 );

	if( this.music ){
		this.music.Discard();
		this.music=null;
	}
}

gxtkAudio.prototype.PauseMusic=function(){
	this.PauseChannel( 32 );
}

gxtkAudio.prototype.ResumeMusic=function(){
	this.ResumeChannel( 32 );
}

gxtkAudio.prototype.MusicState=function(){
	return this.ChannelState( 32 );
}

gxtkAudio.prototype.SetMusicVolume=function( volume ){
	this.SetVolume( 32,volume );
}

//***** gxtkSample class *****

function gxtkSample( audio ){
	this.audio=audio;
	this.free=new Array();
	this.insts=new Array();
}

gxtkSample.prototype.FreeAudio=function( audio ){
	this.free.push( audio );
}

gxtkSample.prototype.AllocAudio=function(){
	var audio;
	while( this.free.length ){
		audio=this.free.pop();
		try{
			audio.currentTime=0;
			return audio;
		}catch( ex ){
			print( "AUDIO ERROR1!" );
		}
	}
	
	//Max out?
	if( this.insts.length==8 ) return null;
	
	audio=new Audio( this.audio.src );
	
	//yucky loop handler for firefox!
	//
	audio.addEventListener( 'ended',function(){
		if( this.loop ){
			try{
				this.currentTime=0;
				this.play();
			}catch( ex ){
				print( "AUDIO ERROR2!" );
			}
		}
	},false );

	this.insts.push( audio );
	return audio;
}

gxtkSample.prototype.Discard=function(){
}


function BBThread(){
	this.running=false;
}

BBThread.prototype.Start=function(){
	this.Run__UNSAFE__();
}

BBThread.prototype.IsRunning=function(){
	return this.running;
}

BBThread.prototype.Run__UNSAFE__=function(){
}

function BBAsyncImageLoaderThread(){
	BBThread.call(this);
}

BBAsyncImageLoaderThread.prototype=extend_class( BBThread );

BBAsyncImageLoaderThread.prototype.Start=function(){

	var thread=this;

	var image=new Image();
	
	image.onload=function( e ){
		image.meta_width=image.width;
		image.meta_height=image.height;
		thread._surface=new gxtkSurface( image,thread._device )
		thread.running=false;
	}
	
	image.onerror=function( e ){
		thread._surface=null;
		thread.running=false;
	}
	
	thread.running=true;
	
	image.src=fixDataPath( thread._path );
}


function BBAsyncSoundLoaderThread(){
	BBThread.call(this);
}

BBAsyncSoundLoaderThread.prototype=extend_class( BBThread );

BBAsyncSoundLoaderThread.prototype.Start=function(){
	this._sample=this._device.LoadSample( this._path );
}
function bb_app_App(){
	Object.call(this);
}
function bb_app_App_new(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<109>";
	bb_app_device=bb_app_AppDevice_new.call(new bb_app_AppDevice,this);
	pop_err();
	return this;
}
bb_app_App.prototype.m_OnCreate=function(){
	push_err();
	pop_err();
	return 0;
}
bb_app_App.prototype.m_OnUpdate=function(){
	push_err();
	pop_err();
	return 0;
}
bb_app_App.prototype.m_OnSuspend=function(){
	push_err();
	pop_err();
	return 0;
}
bb_app_App.prototype.m_OnResume=function(){
	push_err();
	pop_err();
	return 0;
}
bb_app_App.prototype.m_OnRender=function(){
	push_err();
	pop_err();
	return 0;
}
bb_app_App.prototype.m_OnLoading=function(){
	push_err();
	pop_err();
	return 0;
}
function bb_MazeApp_MazeApp(){
	bb_app_App.call(this);
	this.f_sr=null;
	this.f_tmm=null;
	this.f_smm=null;
	this.f_dsm=null;
	this.f_allowKeyRepeat=false;
	this.f_keyRepeatTimer=0;
	this.f_repeatedKey=0;
	this.f_isTransitioning=false;
	this.f_isTransitioningIn=false;
	this.f_stopTransitioning=false;
	this.f_transitionWidth=0;
	this.f_transitionSpeed=0;
	this.f_targetState=0;
	this.f_isFloorTransitioning=false;
	this.f_floorDoneTransitioning=false;
	this.f_finishTransitionUp=false;
	this.f_finishTransitionDown=false;
	this.f_boyPosition=0;
	this.f_boyDirection=0;
	this.f_boyFrame=0;
	this.f_boyFrameTimer=0;
	this.f_isBoyShown=false;
	this.f_boySpeed=0;
	this.f_currentRank=0;
	this.f_difficulties=[];
	this.f_depths=[];
	this.f_items=[];
	this.f_scores=[];
	this.f_p=null;
	this.f_mazeExists=new_bool_array(6);
	this.f_howToPlayShown=false;
	this.f_state=0;
	this.f_timerRate=0;
	this.f_MAZE_FLOORS=[3,4,4,5,6];
	this.f_difficulty=0;
	this.f_MAZE_SIZES=[14,20,22,24,28];
	this.f_MAZE_STAIRS=[3,3,3,2,1];
	this.f_m=new_object_array(6);
	this.f_NUM_GENERATED_ITEMS=[25,40,50,60,60];
	this.f_currentFloor=1;
	this.f_GAME_TIMES=[300,480,600,900,1200];
	this.f_timeRemaining=0;
	this.f_secondCounter=0;
	this.f_tmpDir=0;
}
bb_MazeApp_MazeApp.prototype=extend_class(bb_app_App);
function bb_MazeApp_MazeApp_new(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<932>";
	bb_app_App_new.call(this);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<933>";
	this.f_sr=bb_screenrender_ScreenRender_new.call(new bb_screenrender_ScreenRender);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<934>";
	this.f_tmm=bb_titlemazemanager_TitleMazeManager_new.call(new bb_titlemazemanager_TitleMazeManager);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<935>";
	this.f_smm=bb_splashscreenmanager_SplashScreenManager_new.call(new bb_splashscreenmanager_SplashScreenManager);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<936>";
	this.f_dsm=bb_difficultyselectmanager_DifficultySelectManager_new.call(new bb_difficultyselectmanager_DifficultySelectManager);
	pop_err();
	return this;
}
bb_MazeApp_MazeApp.prototype.m_prepHighScoreTable=function(t_scoreTable){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<248>";
	var t_splitTable=t_scoreTable.split("#");
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<249>";
	var t_counter=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<252>";
	t_counter=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<253>";
	for(var t_i=0;t_i<=9;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<254>";
		dbg_array(this.f_difficulties,t_i)[dbg_index]=parseInt((dbg_array(t_splitTable,t_counter)[dbg_index]),10)
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<255>";
		t_counter=t_counter+1;
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<256>";
		dbg_array(this.f_depths,t_i)[dbg_index]=parseInt((dbg_array(t_splitTable,t_counter)[dbg_index]),10)
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<257>";
		t_counter=t_counter+1;
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<258>";
		dbg_array(this.f_items,t_i)[dbg_index]=parseInt((dbg_array(t_splitTable,t_counter)[dbg_index]),10)
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<259>";
		t_counter=t_counter+1;
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<260>";
		dbg_array(this.f_scores,t_i)[dbg_index]=parseInt((dbg_array(t_splitTable,t_counter)[dbg_index]),10)
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<261>";
		t_counter=t_counter+1;
	}
	pop_err();
	return;
}
bb_MazeApp_MazeApp.prototype.m_makeMazeAtFloor=function(t_floor){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<313>";
	if(t_floor==dbg_array(this.f_MAZE_FLOORS,this.f_difficulty)[dbg_index]){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<318>";
		dbg_array(this.f_m,t_floor-1)[dbg_index]=bb_maze_Maze_new.call(new bb_maze_Maze,dbg_array(this.f_MAZE_SIZES,this.f_difficulty)[dbg_index],dbg_array(this.f_MAZE_SIZES,this.f_difficulty)[dbg_index],((dbg_array(this.f_MAZE_SIZES,this.f_difficulty)[dbg_index]/2)|0),dbg_array(this.f_MAZE_STAIRS,this.f_difficulty)[dbg_index],0)
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<324>";
		dbg_array(this.f_m,t_floor-1)[dbg_index]=bb_maze_Maze_new.call(new bb_maze_Maze,dbg_array(this.f_MAZE_SIZES,this.f_difficulty)[dbg_index],dbg_array(this.f_MAZE_SIZES,this.f_difficulty)[dbg_index],((dbg_array(this.f_MAZE_SIZES,this.f_difficulty)[dbg_index]/2)|0),dbg_array(this.f_MAZE_STAIRS,this.f_difficulty)[dbg_index],dbg_array(this.f_MAZE_STAIRS,this.f_difficulty)[dbg_index])
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<326>";
	dbg_array(this.f_mazeExists,t_floor-1)[dbg_index]=true
	pop_err();
}
bb_MazeApp_MazeApp.prototype.m_findStairs=function(t_stairType){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<467>";
	var t_x=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<468>";
	var t_y=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<469>";
	var t_stairsFound=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<471>";
	t_stairsFound=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<472>";
	while(t_stairsFound==false){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<473>";
		t_x=((bb_random_Rnd2(0.0,(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getWidth())))|0);
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<474>";
		t_y=((bb_random_Rnd2(0.0,(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getHeight())))|0);
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<475>";
		if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getType(t_x,t_y)==t_stairType){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<476>";
			t_stairsFound=true;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<477>";
			this.f_p.m_setPosition(t_x,t_y);
		}
	}
	pop_err();
	return;
}
bb_MazeApp_MazeApp.prototype.m_updateHighScoreTable=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<270>";
	var t_counter=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<271>";
	var t_finished=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<272>";
	var t_stringList=new_string_array(40);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<273>";
	var t_resultString="";
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<275>";
	while(t_finished==false && t_counter<10){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<276>";
		if(dbg_array(this.f_scores,t_counter)[dbg_index]<this.f_p.m_getScore()){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<277>";
			this.f_currentRank=t_counter;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<278>";
			t_finished=true;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<280>";
			t_counter=t_counter+1;
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<284>";
	for(var t_i=8;t_i>=t_counter;t_i=t_i+-1){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<285>";
		dbg_array(this.f_difficulties,t_i+1)[dbg_index]=dbg_array(this.f_difficulties,t_i)[dbg_index]
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<286>";
		dbg_array(this.f_depths,t_i+1)[dbg_index]=dbg_array(this.f_depths,t_i)[dbg_index]
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<287>";
		dbg_array(this.f_items,t_i+1)[dbg_index]=dbg_array(this.f_items,t_i)[dbg_index]
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<288>";
		dbg_array(this.f_scores,t_i+1)[dbg_index]=dbg_array(this.f_scores,t_i)[dbg_index]
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<291>";
	dbg_array(this.f_difficulties,t_counter)[dbg_index]=this.f_difficulty
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<292>";
	dbg_array(this.f_depths,t_counter)[dbg_index]=this.f_p.m_getMaxDepth()
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<293>";
	dbg_array(this.f_items,t_counter)[dbg_index]=this.f_p.m_getItemsCollected()
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<294>";
	dbg_array(this.f_scores,t_counter)[dbg_index]=this.f_p.m_getScore()
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<296>";
	for(var t_i2=0;t_i2<=9;t_i2=t_i2+1){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<297>";
		dbg_array(t_stringList,t_i2*4)[dbg_index]=String(dbg_array(this.f_difficulties,t_i2)[dbg_index])
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<298>";
		dbg_array(t_stringList,t_i2*4+1)[dbg_index]=String(dbg_array(this.f_depths,t_i2)[dbg_index])
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<299>";
		dbg_array(t_stringList,t_i2*4+2)[dbg_index]=String(dbg_array(this.f_items,t_i2)[dbg_index])
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<300>";
		dbg_array(t_stringList,t_i2*4+3)[dbg_index]=String(dbg_array(this.f_scores,t_i2)[dbg_index])
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<303>";
	t_resultString=t_stringList.join("#");
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<304>";
	bb_app_SaveState(t_resultString);
	pop_err();
	return;
}
bb_MazeApp_MazeApp.prototype.m_setState=function(t_newState){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<424>";
	this.f_state=t_newState;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<427>";
	var t_=this.f_state;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<428>";
	if(t_==0){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<429>";
		this.f_smm.m_init();
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<430>";
		this.f_timerRate=bb_app_Millisecs()+5000;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<431>";
		if(t_==1){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<432>";
			this.f_tmm.m_init();
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<433>";
			if(t_==2){
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<434>";
				this.f_dsm.m_init();
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<435>";
				if(t_==4){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<436>";
					bb_random_Seed=bb_app_Millisecs();
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<437>";
					this.f_p.m_init();
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<438>";
					for(var t_i=1;t_i<=6;t_i=t_i+1){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<439>";
						this.m_makeMazeAtFloor(t_i);
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<440>";
						dbg_array(this.f_m,t_i-1)[dbg_index].m_initItemStruct();
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<441>";
						dbg_array(this.f_m,t_i-1)[dbg_index].m_generateItems(t_i-1,dbg_array(this.f_NUM_GENERATED_ITEMS,this.f_difficulty)[dbg_index],false);
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<442>";
						dbg_array(this.f_m,t_i-1)[dbg_index].m_generateItems(t_i-1,((dbg_array(this.f_NUM_GENERATED_ITEMS,this.f_difficulty)[dbg_index]/2)|0),true);
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<443>";
						dbg_array(this.f_m,t_i-1)[dbg_index].m_generateEnemies(this.f_difficulty,t_i-1);
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<445>";
					this.m_findStairs(6);
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<446>";
					this.f_p.m_setDirection(2);
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<447>";
					this.f_p.m_exposeMazePieces2(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index]);
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<448>";
					this.f_timeRemaining=dbg_array(this.f_GAME_TIMES,this.f_difficulty)[dbg_index];
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<449>";
					this.f_secondCounter=bb_app_Millisecs()+1000;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<450>";
					if(t_==5){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<451>";
						this.f_boyPosition=-32;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<452>";
						this.f_boyDirection=1;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<453>";
						this.f_boyFrame=0;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<454>";
						this.f_boySpeed=4;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<455>";
						this.f_boyFrameTimer=bb_app_Millisecs()+250;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<456>";
						this.f_isBoyShown=false;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<457>";
						this.m_updateHighScoreTable();
					}
				}
			}
		}
	}
	pop_err();
	return;
}
bb_MazeApp_MazeApp.prototype.m_OnCreate=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<134>";
	this.f_allowKeyRepeat=true;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<135>";
	this.f_keyRepeatTimer=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<136>";
	this.f_repeatedKey=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<138>";
	this.f_isTransitioning=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<139>";
	this.f_isTransitioningIn=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<140>";
	this.f_stopTransitioning=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<141>";
	this.f_transitionWidth=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<142>";
	this.f_transitionSpeed=8;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<143>";
	this.f_targetState=4;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<145>";
	this.f_isFloorTransitioning=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<146>";
	this.f_floorDoneTransitioning=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<147>";
	this.f_finishTransitionUp=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<148>";
	this.f_finishTransitionDown=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<150>";
	this.f_boyPosition=-32;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<151>";
	this.f_boyDirection=1;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<152>";
	this.f_boyFrame=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<153>";
	this.f_boyFrameTimer=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<154>";
	this.f_isBoyShown=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<155>";
	this.f_boySpeed=4;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<157>";
	this.f_currentRank=99;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<159>";
	var t_highScoreState="";
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<161>";
	this.f_difficulties=new_number_array(10);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<162>";
	this.f_depths=new_number_array(10);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<163>";
	this.f_items=new_number_array(10);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<164>";
	this.f_scores=new_number_array(10);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<167>";
	t_highScoreState=bb_app_LoadState();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<168>";
	if((t_highScoreState).length!=0){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<169>";
		this.m_prepHighScoreTable(t_highScoreState);
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<172>";
		for(var t_i=0;t_i<=9;t_i=t_i+1){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<173>";
			dbg_array(this.f_difficulties,t_i)[dbg_index]=-1
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<174>";
			dbg_array(this.f_depths,t_i)[dbg_index]=-1
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<175>";
			dbg_array(this.f_items,t_i)[dbg_index]=-1
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<176>";
			dbg_array(this.f_scores,t_i)[dbg_index]=-1
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<180>";
	this.f_p=bb_player_Player_new.call(new bb_player_Player);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<181>";
	for(var t_i2=0;t_i2<=5;t_i2=t_i2+1){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<182>";
		dbg_array(this.f_mazeExists,t_i2)[dbg_index]=false
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<184>";
	this.f_howToPlayShown=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<185>";
	bb_app_SetUpdateRate(60);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<186>";
	this.m_setState(0);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<187>";
	pop_err();
	return 0;
}
bb_MazeApp_MazeApp.prototype.m_stopTransition=function(t_changeState,t_s){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<238>";
	this.f_isTransitioning=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<239>";
	this.f_isTransitioningIn=false;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<240>";
	this.f_transitionWidth=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<241>";
	if(t_changeState==true && t_s!=-1){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<242>";
		this.m_setState(t_s);
	}
	pop_err();
}
bb_MazeApp_MazeApp.prototype.m_completeUpStairsAction=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<584>";
	var t_stPos=[];
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<585>";
	var t_stairIndex=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<586>";
	var t_pa=this.f_p.m_getPosition();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<588>";
	t_stairIndex=dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getStairLink(dbg_array(t_pa,0)[dbg_index],dbg_array(t_pa,1)[dbg_index],6);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<590>";
	if(this.f_difficulty==4){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<591>";
		dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_markAllAsHidden();
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<593>";
	this.f_currentFloor=this.f_currentFloor-1;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<594>";
	t_stPos=dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getStairLinkPos(t_stairIndex,5);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<595>";
	this.f_p.m_setPosition(dbg_array(t_stPos,0)[dbg_index],dbg_array(t_stPos,1)[dbg_index]);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<596>";
	this.f_p.m_setDirection(2);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<597>";
	this.f_p.m_exposeMazePieces2(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index]);
	pop_err();
}
bb_MazeApp_MazeApp.prototype.m_completeDownStairsAction=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<601>";
	var t_stPos=[];
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<602>";
	var t_stairIndex=0;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<603>";
	var t_pa=this.f_p.m_getPosition();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<605>";
	t_stairIndex=dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getStairLink(dbg_array(t_pa,0)[dbg_index],dbg_array(t_pa,1)[dbg_index],5);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<606>";
	if(this.f_currentFloor<dbg_array(this.f_MAZE_FLOORS,this.f_difficulty)[dbg_index]){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<608>";
		if(this.f_difficulty==4){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<609>";
			dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_markAllAsHidden();
		}
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<611>";
		this.f_currentFloor=this.f_currentFloor+1;
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<612>";
		if(this.f_currentFloor>this.f_p.m_getMaxDepth()){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<613>";
			this.f_p.m_setMaxDepth(this.f_currentFloor);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<616>";
	t_stPos=dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getStairLinkPos(t_stairIndex,6);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<617>";
	this.f_p.m_setPosition(dbg_array(t_stPos,0)[dbg_index],dbg_array(t_stPos,1)[dbg_index]);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<618>";
	this.f_p.m_setDirection(2);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<619>";
	this.f_p.m_exposeMazePieces2(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index]);
	pop_err();
}
bb_MazeApp_MazeApp.prototype.m_processTransition=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<191>";
	if(this.f_isTransitioning==true){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<192>";
		if(this.f_isTransitioningIn==true){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<193>";
			this.f_transitionWidth=this.f_transitionWidth-this.f_transitionSpeed;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<194>";
			if(this.f_transitionWidth<=0){
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<195>";
				if(this.f_isFloorTransitioning==true){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<196>";
					this.f_floorDoneTransitioning=true;
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<197>";
					this.f_isFloorTransitioning=false;
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<198>";
					this.f_isTransitioning=false;
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<199>";
					this.f_isTransitioningIn=false;
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<200>";
					this.f_stopTransitioning=true;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<202>";
					this.m_stopTransition(false,this.f_targetState);
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<203>";
					this.f_stopTransitioning=true;
				}
			}
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<207>";
			this.f_transitionWidth=this.f_transitionWidth+this.f_transitionSpeed;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<208>";
			if(this.f_transitionWidth>=320+10*this.f_transitionSpeed){
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<209>";
				if(this.f_isFloorTransitioning==true){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<210>";
					this.f_isTransitioningIn=true;
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<211>";
					if(this.f_finishTransitionUp==true){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<212>";
						this.m_completeUpStairsAction();
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<213>";
						this.f_finishTransitionUp=false;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<214>";
						this.f_finishTransitionDown=true;
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<216>";
						this.m_completeDownStairsAction();
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<217>";
						this.f_finishTransitionDown=false;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<218>";
						this.f_finishTransitionUp=true;
					}
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<221>";
					this.m_stopTransition(true,this.f_targetState);
				}
			}
		}
	}
	pop_err();
}
bb_MazeApp_MazeApp.prototype.m_startTransition=function(t_transitionIn){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<230>";
	this.f_isTransitioning=true;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<231>";
	this.f_isTransitioningIn=t_transitionIn;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<232>";
	if(this.f_isTransitioningIn==true){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<233>";
		this.f_transitionWidth=320;
	}
	pop_err();
}
bb_MazeApp_MazeApp.prototype.m_checkStateTimers=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<490>";
	var t_=this.f_state;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<491>";
	if(t_==0){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<492>";
		this.f_smm.m_processAnimation();
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<493>";
		if(bb_app_Millisecs()>=this.f_timerRate){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<494>";
			this.f_targetState=1;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<495>";
			this.f_stopTransitioning=false;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<496>";
			this.f_transitionSpeed=8;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<497>";
			this.m_startTransition(false);
		}
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<499>";
		if(t_==1){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<500>";
			if(this.f_stopTransitioning==false && this.f_isTransitioning==false){
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<501>";
				this.f_transitionSpeed=8;
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<502>";
				this.m_startTransition(true);
			}
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<504>";
			this.f_tmm.m_processAnimation();
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<505>";
			if(t_==2){
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<506>";
				this.f_tmm.m_processAnimation();
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<507>";
				this.f_dsm.m_processAnimation();
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<508>";
				if(t_==4){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<510>";
					if(bb_app_Millisecs()>=this.f_keyRepeatTimer){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<511>";
						this.f_allowKeyRepeat=true;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<512>";
						this.f_keyRepeatTimer=bb_app_Millisecs()+200;
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<515>";
					if(this.f_stopTransitioning==false && this.f_isTransitioning==false){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<516>";
						this.f_transitionSpeed=8;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<517>";
						this.m_startTransition(true);
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<519>";
					dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_processEnemyAnimation();
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<520>";
					if(this.f_howToPlayShown==true && this.f_stopTransitioning==true && this.f_isTransitioning==false){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<521>";
						dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_processEnemyMovement(this.f_p,this.f_difficulty);
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<523>";
					dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_processEnemyDeath(this.f_p,this.f_difficulty+1,this.f_currentFloor);
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<524>";
					if(bb_app_Millisecs()>=this.f_secondCounter){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<525>";
						if(this.f_howToPlayShown==true && this.f_stopTransitioning==true && this.f_isTransitioning==false){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<526>";
							this.f_timeRemaining=this.f_timeRemaining-1;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<527>";
							if(this.f_timeRemaining<0){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<528>";
								this.f_timeRemaining=0;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<529>";
								this.m_setState(7);
							}
						}
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<532>";
						this.f_secondCounter=bb_app_Millisecs()+1000;
					}
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<534>";
					if(t_==5){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<535>";
						if(this.f_stopTransitioning==false && this.f_isTransitioning==false){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<536>";
							this.f_transitionSpeed=8;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<537>";
							this.m_startTransition(true);
						}
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<539>";
						if(this.f_boyDirection==3){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<540>";
							this.f_boyPosition=this.f_boyPosition-this.f_boySpeed;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<541>";
							if(this.f_boyPosition<-80){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<542>";
								this.f_boyDirection=1;
							}
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<545>";
							this.f_boyPosition=this.f_boyPosition+this.f_boySpeed;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<546>";
							if(this.f_boyPosition>672){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<547>";
								this.f_boyDirection=3;
							}
						}
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<550>";
						if(bb_app_Millisecs()>this.f_boyFrameTimer){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<551>";
							this.f_boyFrame=this.f_boyFrame+1;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<552>";
							if(this.f_boyFrame>=4){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<553>";
								this.f_boyFrame=0;
							}
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<555>";
							this.f_boyFrameTimer=bb_app_Millisecs()+250;
						}
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<557>";
						if(t_==6){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<558>";
							if(this.f_stopTransitioning==false && this.f_isTransitioning==false){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<559>";
								this.f_transitionSpeed=8;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<560>";
								this.m_startTransition(true);
							}
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<562>";
							if(this.f_boyDirection==3){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<563>";
								this.f_boyPosition=this.f_boyPosition-this.f_boySpeed;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<564>";
								if(this.f_boyPosition<-80){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<565>";
									this.f_boyDirection=1;
								}
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<568>";
								this.f_boyPosition=this.f_boyPosition+this.f_boySpeed;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<569>";
								if(this.f_boyPosition>672){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<570>";
									this.f_boyDirection=3;
								}
							}
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<573>";
							if(bb_app_Millisecs()>this.f_boyFrameTimer){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<574>";
								this.f_boyFrame=this.f_boyFrame+1;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<575>";
								if(this.f_boyFrame>=4){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<576>";
									this.f_boyFrame=0;
								}
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<578>";
								this.f_boyFrameTimer=bb_app_Millisecs()+250;
							}
						}
					}
				}
			}
		}
	}
	pop_err();
}
bb_MazeApp_MazeApp.prototype.m_anyKeyPressed=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<918>";
	if(bb_input_GetChar()!=0 || ((bb_input_MouseHit(0))!=0) || ((bb_input_TouchHit(0))!=0)){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<920>";
		while(bb_input_GetChar()!=0){
		}
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<922>";
		pop_err();
		return true;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<924>";
	pop_err();
	return false;
}
bb_MazeApp_MazeApp.prototype.m_processInputs=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<627>";
	var t_=this.f_state;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<628>";
	if(t_==0){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<629>";
		if(this.m_anyKeyPressed()){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<630>";
			this.f_targetState=1;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<631>";
			this.f_stopTransitioning=false;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<632>";
			this.f_transitionSpeed=8;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<633>";
			this.m_startTransition(false);
		}
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<635>";
		if(t_==1){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<636>";
			if(this.m_anyKeyPressed()){
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<637>";
				this.m_setState(2);
			}
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<639>";
			if(t_==2){
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<640>";
				if((bb_input_KeyHit(27))!=0){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<641>";
					this.m_setState(1);
				}
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<643>";
				if((bb_input_KeyHit(38))!=0){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<644>";
					this.f_difficulty=this.f_difficulty-1;
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<645>";
					if(this.f_difficulty<0){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<646>";
						this.f_difficulty=4;
					}
				}
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<649>";
				if((bb_input_KeyHit(40))!=0){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<650>";
					this.f_difficulty=this.f_difficulty+1;
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<651>";
					if(this.f_difficulty>=5){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<652>";
						this.f_difficulty=0;
					}
				}
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<655>";
				if(((bb_input_KeyHit(13))!=0) || ((bb_input_KeyHit(32))!=0)){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<656>";
					this.f_targetState=4;
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<657>";
					this.f_stopTransitioning=false;
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<658>";
					this.f_transitionSpeed=8;
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<659>";
					this.m_startTransition(false);
				}
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<661>";
				if(t_==4){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<662>";
					if(this.f_howToPlayShown==false && this.m_anyKeyPressed()){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<663>";
						this.f_howToPlayShown=true;
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<665>";
					if((bb_input_KeyHit(27))!=0){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<666>";
						this.m_setState(1);
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<668>";
					if((bb_input_KeyHit(65))!=0){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<669>";
						var t_pa=this.f_p.m_getPosition();
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<670>";
						var t_en=null;
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<671>";
						if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_isEnemyHere(dbg_array(t_pa,0)[dbg_index],dbg_array(t_pa,1)[dbg_index]-1)!=-1 && dbg_array(t_pa,2)[dbg_index]==0 && this.f_p.m_hasSwords()==true){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<672>";
							t_en=dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getEnemy(dbg_array(t_pa,0)[dbg_index],dbg_array(t_pa,1)[dbg_index]-1);
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<673>";
							if(t_en.m_getDeadState()==false){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<674>";
								t_en.m_damage();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<675>";
								t_en.m_stun();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<676>";
								this.f_p.m_removeSword();
							}
						}
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<679>";
						if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_isEnemyHere(dbg_array(t_pa,0)[dbg_index],dbg_array(t_pa,1)[dbg_index]+1)!=-1 && dbg_array(t_pa,2)[dbg_index]==2 && this.f_p.m_hasSwords()==true){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<680>";
							t_en=dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getEnemy(dbg_array(t_pa,0)[dbg_index],dbg_array(t_pa,1)[dbg_index]+1);
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<681>";
							if(t_en.m_getDeadState()==false){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<682>";
								t_en.m_damage();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<683>";
								t_en.m_stun();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<684>";
								this.f_p.m_removeSword();
							}
						}
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<687>";
						if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_isEnemyHere(dbg_array(t_pa,0)[dbg_index]+1,dbg_array(t_pa,1)[dbg_index])!=-1 && dbg_array(t_pa,2)[dbg_index]==1 && this.f_p.m_hasSwords()==true){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<688>";
							t_en=dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getEnemy(dbg_array(t_pa,0)[dbg_index]+1,dbg_array(t_pa,1)[dbg_index]);
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<689>";
							if(t_en.m_getDeadState()==false){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<690>";
								t_en.m_damage();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<691>";
								t_en.m_stun();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<692>";
								this.f_p.m_removeSword();
							}
						}
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<695>";
						if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_isEnemyHere(dbg_array(t_pa,0)[dbg_index]-1,dbg_array(t_pa,1)[dbg_index])!=-1 && dbg_array(t_pa,2)[dbg_index]==3 && this.f_p.m_hasSwords()==true){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<696>";
							t_en=dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getEnemy(dbg_array(t_pa,0)[dbg_index]-1,dbg_array(t_pa,1)[dbg_index]);
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<697>";
							if(t_en.m_getDeadState()==false){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<698>";
								t_en.m_damage();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<699>";
								t_en.m_stun();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<700>";
								this.f_p.m_removeSword();
							}
						}
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<705>";
					if(bb_input_KeyDown(39)==0 && this.f_repeatedKey==39 && this.f_allowKeyRepeat==false){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<706>";
						this.f_allowKeyRepeat=true;
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<707>";
						if(bb_input_KeyDown(39)==1 && this.f_allowKeyRepeat==true){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<708>";
							if((bb_input_KeyDown(16))!=0){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<709>";
								this.f_p.m_setDirection(1);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<714>";
								var t_pa2=this.f_p.m_getPosition();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<715>";
								if(dbg_array(t_pa2,0)[dbg_index]<dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getWidth()-1 && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_canMoveHere(dbg_array(t_pa2,0)[dbg_index]+1,dbg_array(t_pa2,1)[dbg_index])==true && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getIsScrolling()==false){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<716>";
									dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_startScroll(1);
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<717>";
									this.f_tmpDir=1;
								}
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<720>";
								if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_isEnemyHere(dbg_array(t_pa2,0)[dbg_index]+1,dbg_array(t_pa2,1)[dbg_index])!=-1){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<721>";
									this.f_p.m_injure(1);
								}
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<725>";
								this.f_p.m_setDirection(1);
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<726>";
								this.f_p.m_turnOnAnimation();
							}
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<728>";
							this.f_allowKeyRepeat=false;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<729>";
							this.f_keyRepeatTimer=bb_app_Millisecs()+200;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<730>";
							this.f_repeatedKey=39;
						}
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<733>";
					if(bb_input_KeyDown(37)==0 && this.f_repeatedKey==37 && this.f_allowKeyRepeat==false){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<734>";
						this.f_allowKeyRepeat=true;
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<735>";
						if(bb_input_KeyDown(37)==1 && this.f_allowKeyRepeat==true){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<736>";
							if((bb_input_KeyDown(16))!=0){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<737>";
								this.f_p.m_setDirection(3);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<742>";
								var t_pa3=this.f_p.m_getPosition();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<743>";
								if(dbg_array(t_pa3,0)[dbg_index]>0 && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_canMoveHere(dbg_array(t_pa3,0)[dbg_index]-1,dbg_array(t_pa3,1)[dbg_index])==true && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getIsScrolling()==false){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<744>";
									dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_startScroll(3);
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<745>";
									this.f_tmpDir=3;
								}
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<748>";
								if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_isEnemyHere(dbg_array(t_pa3,0)[dbg_index]-1,dbg_array(t_pa3,1)[dbg_index])!=-1){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<749>";
									this.f_p.m_injure(1);
								}
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<753>";
								this.f_p.m_setDirection(3);
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<754>";
								this.f_p.m_turnOnAnimation();
							}
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<756>";
							this.f_allowKeyRepeat=false;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<757>";
							this.f_keyRepeatTimer=bb_app_Millisecs()+200;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<758>";
							this.f_repeatedKey=37;
						}
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<761>";
					if(bb_input_KeyDown(38)==0 && this.f_repeatedKey==38 && this.f_allowKeyRepeat==false){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<762>";
						this.f_allowKeyRepeat=true;
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<763>";
						if(bb_input_KeyDown(38)==1 && this.f_allowKeyRepeat==true){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<764>";
							if((bb_input_KeyDown(16))!=0){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<765>";
								this.f_p.m_setDirection(0);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<770>";
								var t_pa4=this.f_p.m_getPosition();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<771>";
								if(dbg_array(t_pa4,1)[dbg_index]>0 && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_canMoveHere(dbg_array(t_pa4,0)[dbg_index],dbg_array(t_pa4,1)[dbg_index]-1)==true && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getIsScrolling()==false){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<772>";
									dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_startScroll(0);
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<773>";
									this.f_tmpDir=0;
								}
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<776>";
								if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_isEnemyHere(dbg_array(t_pa4,0)[dbg_index],dbg_array(t_pa4,1)[dbg_index]-1)!=-1){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<777>";
									this.f_p.m_injure(1);
								}
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<781>";
								this.f_p.m_setDirection(0);
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<782>";
								this.f_p.m_turnOnAnimation();
							}
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<784>";
							this.f_allowKeyRepeat=false;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<785>";
							this.f_keyRepeatTimer=bb_app_Millisecs()+200;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<786>";
							this.f_repeatedKey=38;
						}
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<789>";
					if(bb_input_KeyDown(40)==0 && this.f_repeatedKey==40 && this.f_allowKeyRepeat==false){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<790>";
						this.f_allowKeyRepeat=true;
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<791>";
						if(bb_input_KeyDown(40)==1 && this.f_allowKeyRepeat==true){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<792>";
							if((bb_input_KeyDown(16))!=0){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<793>";
								this.f_p.m_setDirection(2);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<798>";
								var t_pa5=this.f_p.m_getPosition();
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<799>";
								if(dbg_array(t_pa5,1)[dbg_index]<dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getHeight()-1 && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_canMoveHere(dbg_array(t_pa5,0)[dbg_index],dbg_array(t_pa5,1)[dbg_index]+1)==true && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getIsScrolling()==false){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<800>";
									dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_startScroll(2);
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<801>";
									this.f_tmpDir=2;
								}
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<804>";
								if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_isEnemyHere(dbg_array(t_pa5,0)[dbg_index],dbg_array(t_pa5,1)[dbg_index]+1)!=-1){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<805>";
									this.f_p.m_injure(1);
								}
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<809>";
								this.f_p.m_setDirection(2);
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<810>";
								this.f_p.m_turnOnAnimation();
							}
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<812>";
							this.f_allowKeyRepeat=false;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<813>";
							this.f_keyRepeatTimer=bb_app_Millisecs()+200;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<814>";
							this.f_repeatedKey=40;
						}
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<817>";
					if((bb_input_KeyHit(32))!=0){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<818>";
						var t_pa6=this.f_p.m_getPosition();
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<822>";
						if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getType(dbg_array(t_pa6,0)[dbg_index],dbg_array(t_pa6,1)[dbg_index])==6){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<823>";
							if(this.f_currentFloor==1){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<825>";
								this.f_targetState=5;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<826>";
								this.f_stopTransitioning=false;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<827>";
								this.f_transitionSpeed=8;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<828>";
								this.m_startTransition(false);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<830>";
								this.f_isFloorTransitioning=true;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<831>";
								this.f_floorDoneTransitioning=false;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<832>";
								this.f_finishTransitionUp=true;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<833>";
								this.f_finishTransitionDown=false;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<834>";
								this.f_stopTransitioning=false;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<835>";
								this.f_transitionSpeed=16;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<836>";
								this.m_startTransition(false);
							}
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<840>";
							if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getType(dbg_array(t_pa6,0)[dbg_index],dbg_array(t_pa6,1)[dbg_index])==5){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<841>";
								this.f_isFloorTransitioning=true;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<842>";
								this.f_floorDoneTransitioning=false;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<843>";
								this.f_finishTransitionUp=false;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<844>";
								this.f_finishTransitionDown=true;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<845>";
								this.f_stopTransitioning=false;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<846>";
								this.f_transitionSpeed=16;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<847>";
								this.m_startTransition(false);
							}
						}
					}
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<850>";
					if((bb_input_KeyHit(66))!=0){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<851>";
						if(this.f_p.m_getBombs()>0){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<852>";
							var t_pa7=this.f_p.m_getPosition();
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<855>";
							var t_2=dbg_array(t_pa7,2)[dbg_index];
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<856>";
							if(t_2==0){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<857>";
								if(dbg_array(t_pa7,1)[dbg_index]>1 && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getType(dbg_array(t_pa7,0)[dbg_index],dbg_array(t_pa7,1)[dbg_index]-1)==1){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<858>";
									dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_setType(dbg_array(t_pa7,0)[dbg_index],dbg_array(t_pa7,1)[dbg_index]-1,3);
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<859>";
									this.f_p.m_removeBomb();
								}
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<861>";
								if(t_2==2){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<862>";
									if(dbg_array(t_pa7,1)[dbg_index]<dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getHeight()-1 && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getType(dbg_array(t_pa7,0)[dbg_index],dbg_array(t_pa7,1)[dbg_index]+1)==1){
										err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<863>";
										dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_setType(dbg_array(t_pa7,0)[dbg_index],dbg_array(t_pa7,1)[dbg_index]+1,3);
										err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<864>";
										this.f_p.m_removeBomb();
									}
								}else{
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<866>";
									if(t_2==1){
										err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<867>";
										if(dbg_array(t_pa7,0)[dbg_index]<dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getWidth()-1 && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getType(dbg_array(t_pa7,0)[dbg_index]+1,dbg_array(t_pa7,1)[dbg_index])==1){
											err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<868>";
											dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_setType(dbg_array(t_pa7,0)[dbg_index]+1,dbg_array(t_pa7,1)[dbg_index],3);
											err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<869>";
											this.f_p.m_removeBomb();
										}
									}else{
										err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<871>";
										if(t_2==3){
											err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<872>";
											if(dbg_array(t_pa7,0)[dbg_index]>1 && dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getType(dbg_array(t_pa7,0)[dbg_index]-1,dbg_array(t_pa7,1)[dbg_index])==1){
												err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<873>";
												dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_setType(dbg_array(t_pa7,0)[dbg_index]-1,dbg_array(t_pa7,1)[dbg_index],3);
												err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<874>";
												this.f_p.m_removeBomb();
											}
										}
									}
								}
							}
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<878>";
							this.f_p.m_exposeMazePieces2(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index]);
						}
					}
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<881>";
					if(t_==7){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<882>";
						if((bb_input_KeyHit(13))!=0){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<883>";
							this.f_targetState=1;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<884>";
							this.f_stopTransitioning=false;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<885>";
							this.f_transitionSpeed=8;
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<886>";
							this.m_startTransition(false);
						}
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<888>";
						if(t_==8){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<889>";
							if((bb_input_KeyHit(13))!=0){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<890>";
								this.f_targetState=1;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<891>";
								this.f_stopTransitioning=false;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<892>";
								this.f_transitionSpeed=8;
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<893>";
								this.m_startTransition(false);
							}
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<895>";
							if(t_==5){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<896>";
								if((bb_input_KeyHit(13))!=0){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<897>";
									this.m_setState(6);
								}
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<899>";
								if(t_==6){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<900>";
									if(this.m_anyKeyPressed()){
										err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<901>";
										this.f_targetState=1;
										err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<902>";
										this.f_stopTransitioning=false;
										err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<903>";
										this.f_transitionSpeed=8;
										err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<904>";
										this.m_startTransition(false);
									}
								}
							}
						}
					}
				}
			}
		}
	}
	pop_err();
}
bb_MazeApp_MazeApp.prototype.m_OnUpdate=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<336>";
	this.m_processTransition();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<338>";
	this.m_checkStateTimers();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<341>";
	if(this.f_p.m_isDead()==true && this.f_state==4){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<342>";
		this.m_setState(8);
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<345>";
	this.m_processInputs();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<346>";
	this.f_p.m_processAnimation();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<351>";
	if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index]!=null){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<352>";
		dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_incrementScroll();
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<353>";
		if(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_getDoneScrolling()==true){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<354>";
			var t_pa=this.f_p.m_getPosition();
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<355>";
			var t_=this.f_tmpDir;
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<356>";
			if(t_==0){
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<357>";
				this.f_p.m_setPosition(dbg_array(t_pa,0)[dbg_index],dbg_array(t_pa,1)[dbg_index]-1);
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<358>";
				dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_setDoneScrolling(false);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<359>";
				if(t_==2){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<360>";
					this.f_p.m_setPosition(dbg_array(t_pa,0)[dbg_index],dbg_array(t_pa,1)[dbg_index]+1);
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<361>";
					dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_setDoneScrolling(false);
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<362>";
					if(t_==1){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<363>";
						this.f_p.m_setPosition(dbg_array(t_pa,0)[dbg_index]+1,dbg_array(t_pa,1)[dbg_index]);
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<364>";
						dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_setDoneScrolling(false);
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<365>";
						if(t_==3){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<366>";
							this.f_p.m_setPosition(dbg_array(t_pa,0)[dbg_index]-1,dbg_array(t_pa,1)[dbg_index]);
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<367>";
							dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_setDoneScrolling(false);
						}
					}
				}
			}
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<369>";
			this.f_p.m_exposeMazePieces2(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index]);
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<370>";
			dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index].m_checkForItem(this.f_p,this.f_currentFloor,this.f_difficulty+1);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<373>";
	pop_err();
	return 0;
}
bb_MazeApp_MazeApp.prototype.m_OnRender=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<383>";
	bb_graphics_Cls(5.0,5.0,54.0);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<384>";
	var t_=this.f_state;
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<385>";
	if(t_==0){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<386>";
		this.f_sr.m_renderSplashScreen(this.f_smm);
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<387>";
		if(t_==1){
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<388>";
			this.f_sr.m_renderTitleScreen(this.f_tmm);
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<389>";
			if(t_==2){
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<390>";
				this.f_sr.m_renderDifficultySelect(this.f_tmm,this.f_dsm,this.f_difficulty);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<391>";
				if(t_==4){
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<392>";
					this.f_sr.m_renderMazeViewport(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index],this.f_p);
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<393>";
					this.f_sr.m_renderUi(this.f_p,this.f_currentFloor,this.f_timeRemaining);
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<394>";
					if(this.f_howToPlayShown==false){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<395>";
						this.f_sr.m_renderDialog(1);
					}
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<397>";
					if(t_==7){
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<398>";
						this.f_sr.m_renderMazeViewport(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index],this.f_p);
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<399>";
						this.f_sr.m_renderUi(this.f_p,this.f_currentFloor,this.f_timeRemaining);
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<400>";
						this.f_sr.m_renderDialog(0);
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<401>";
						if(t_==8){
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<402>";
							this.f_sr.m_renderMazeViewport(dbg_array(this.f_m,this.f_currentFloor-1)[dbg_index],this.f_p);
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<403>";
							this.f_sr.m_renderUi(this.f_p,this.f_currentFloor,this.f_timeRemaining);
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<404>";
							this.f_sr.m_renderDialog(2);
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<405>";
							if(t_==5){
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<406>";
								this.f_sr.m_renderWinnerScreen(this.f_boyFrame,this.f_boyPosition,this.f_boyDirection);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<407>";
								if(t_==6){
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<408>";
									this.f_sr.m_renderWinnerScreen(this.f_boyFrame,this.f_boyPosition,this.f_boyDirection);
									err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<409>";
									this.f_sr.m_renderHighScoreScreen(this.f_difficulties,this.f_depths,this.f_items,this.f_scores,this.f_currentRank);
								}
							}
						}
					}
				}
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<411>";
	if(this.f_isTransitioning==true){
		err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<412>";
		this.f_sr.m_renderTransitionBars(this.f_transitionWidth);
	}
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<414>";
	pop_err();
	return 0;
}
function bb_app_AppDevice(){
	gxtkApp.call(this);
	this.f_app=null;
	this.f_updateRate=0;
}
bb_app_AppDevice.prototype=extend_class(gxtkApp);
function bb_app_AppDevice_new(t_app){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<49>";
	dbg_object(this).f_app=t_app;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<50>";
	bb_graphics_SetGraphicsDevice(this.GraphicsDevice());
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<51>";
	bb_input_SetInputDevice(this.InputDevice());
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<52>";
	bb_audio_SetAudioDevice(this.AudioDevice());
	pop_err();
	return this;
}
function bb_app_AppDevice_new2(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<46>";
	pop_err();
	return this;
}
bb_app_AppDevice.prototype.OnCreate=function(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<56>";
	bb_graphics_SetFont(null,32);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<57>";
	var t_=this.f_app.m_OnCreate();
	pop_err();
	return t_;
}
bb_app_AppDevice.prototype.OnUpdate=function(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<61>";
	var t_=this.f_app.m_OnUpdate();
	pop_err();
	return t_;
}
bb_app_AppDevice.prototype.OnSuspend=function(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<65>";
	var t_=this.f_app.m_OnSuspend();
	pop_err();
	return t_;
}
bb_app_AppDevice.prototype.OnResume=function(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<69>";
	var t_=this.f_app.m_OnResume();
	pop_err();
	return t_;
}
bb_app_AppDevice.prototype.OnRender=function(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<73>";
	bb_graphics_BeginRender();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<74>";
	var t_r=this.f_app.m_OnRender();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<75>";
	bb_graphics_EndRender();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<76>";
	pop_err();
	return t_r;
}
bb_app_AppDevice.prototype.OnLoading=function(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<80>";
	bb_graphics_BeginRender();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<81>";
	var t_r=this.f_app.m_OnLoading();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<82>";
	bb_graphics_EndRender();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<83>";
	pop_err();
	return t_r;
}
bb_app_AppDevice.prototype.SetUpdateRate=function(t_hertz){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<87>";
	gxtkApp.prototype.SetUpdateRate.call(this,t_hertz);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<88>";
	this.f_updateRate=t_hertz;
	pop_err();
	return 0;
}
var bb_graphics_device;
function bb_graphics_SetGraphicsDevice(t_dev){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<58>";
	bb_graphics_device=t_dev;
	pop_err();
	return 0;
}
var bb_input_device;
function bb_input_SetInputDevice(t_dev){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/input.monkey<16>";
	bb_input_device=t_dev;
	pop_err();
	return 0;
}
var bb_audio_device;
function bb_audio_SetAudioDevice(t_dev){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/audio.monkey<17>";
	bb_audio_device=t_dev;
	pop_err();
	return 0;
}
var bb_app_device;
function bb_screenrender_ScreenRender(){
	Object.call(this);
	this.f_mazeAreaX=0;
	this.f_mazeAreaY=0;
	this.f_mazeAreaWidth=0;
	this.f_mazeAreaHeight=0;
	this.f_uiAreaX=0;
	this.f_uiAreaY=0;
	this.f_uiAreaWidth=0;
	this.f_uiAreaHeight=0;
	this.f_blocksImg=null;
	this.f_uiPiecesImg=null;
	this.f_itemIconImg=null;
	this.f_digitsImg=null;
	this.f_treasureImg=null;
	this.f_consumableImg=null;
	this.f_enemyImg=null;
	this.f_timeUpImg=null;
	this.f_deadImg=null;
	this.f_howToPlayImg=null;
	this.f_hitAnimImg=null;
	this.f_highScoreImg=null;
	this.f_digitsYellowImg=null;
	this.f_difficultiesImg=null;
	this.f_difficultiesYellowImg=null;
	this.f_winnerScreenImg=null;
	this.f_blackImg=null;
	this.f_winnerboyImg=null;
}
function bb_screenrender_ScreenRender_new(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<67>";
	this.f_mazeAreaX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<68>";
	this.f_mazeAreaY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<69>";
	this.f_mazeAreaWidth=640;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<70>";
	this.f_mazeAreaHeight=480;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<71>";
	this.f_uiAreaX=512;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<72>";
	this.f_uiAreaY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<73>";
	this.f_uiAreaWidth=128;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<74>";
	this.f_uiAreaHeight=320;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<76>";
	this.f_blocksImg=bb_graphics_LoadImage("blocks.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<77>";
	this.f_uiPiecesImg=bb_graphics_LoadImage("ui.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<78>";
	this.f_itemIconImg=bb_graphics_LoadImage("itemicons.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<79>";
	this.f_digitsImg=bb_graphics_LoadImage("digits.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<80>";
	this.f_treasureImg=bb_graphics_LoadImage("treasure.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<81>";
	this.f_consumableImg=bb_graphics_LoadImage("consumables.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<82>";
	this.f_enemyImg=bb_graphics_LoadImage("enemies.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<83>";
	this.f_timeUpImg=bb_graphics_LoadImage("gameovertime.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<84>";
	this.f_deadImg=bb_graphics_LoadImage("gameoverdied.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<85>";
	this.f_howToPlayImg=bb_graphics_LoadImage("howtoplay.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<86>";
	this.f_hitAnimImg=bb_graphics_LoadImage("hitanim.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<87>";
	this.f_highScoreImg=bb_graphics_LoadImage("highscore.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<88>";
	this.f_digitsYellowImg=bb_graphics_LoadImage("digitsyellow.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<89>";
	this.f_difficultiesImg=bb_graphics_LoadImage("difficulties.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<90>";
	this.f_difficultiesYellowImg=bb_graphics_LoadImage("difficultiesyellow.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<91>";
	this.f_winnerScreenImg=bb_graphics_LoadImage("winner.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<92>";
	this.f_blackImg=bb_graphics_LoadImage("black.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<93>";
	this.f_winnerboyImg=bb_graphics_LoadImage("winnerboy.png",1,bb_graphics_Image_DefaultFlags);
	pop_err();
	return this;
}
bb_screenrender_ScreenRender.prototype.m_renderSplashScreen=function(t_ssm){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<176>";
	var t_img=t_ssm.m_getBackground();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<177>";
	var t_positions=t_ssm.m_getBarPositions();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<179>";
	bb_graphics_Cls(255.0,255.0,255.0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<181>";
	if(t_ssm.m_drawMainSplash()==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<182>";
		bb_graphics_SetAlpha(t_ssm.m_getSplashAlpha());
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<183>";
		bb_graphics_DrawImage(t_img,0.0,0.0,0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<184>";
		if(t_ssm.m_getSplashAlpha()<=0.94999999999999996){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<185>";
			t_ssm.m_setSplashAlpha(t_ssm.m_getSplashAlpha()+0.04);
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<187>";
		bb_graphics_SetAlpha(1.0);
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<191>";
	bb_graphics_DrawImageRect(t_img,(dbg_array(t_positions,0)[dbg_index]),0.0,0,0,640,40,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<192>";
	bb_graphics_DrawImageRect(t_img,(dbg_array(t_positions,1)[dbg_index]),440.0,0,440,640,40,0);
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderTitleScreen=function(t_tmm){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<198>";
	var t_img=t_tmm.m_getBackground();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<199>";
	var t_boyMini=t_tmm.m_getSprite();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<200>";
	var t_playerPos=t_tmm.m_getPlayerPosition();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<203>";
	bb_graphics_DrawImage(t_img,0.0,0.0,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<206>";
	for(var t_i=0;t_i<=31;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<207>";
		for(var t_j=0;t_j<=19;t_j=t_j+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<208>";
			if(t_tmm.m_isHidden(t_i,t_j)==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<209>";
				bb_graphics_DrawImageRect(this.f_blocksImg,(64+16*t_i),(32+16*t_j),192,0,16,16,0);
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<215>";
	if(dbg_array(t_playerPos,3)[dbg_index]>0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<216>";
		bb_graphics_DrawImageRect(t_boyMini,(64+16*dbg_array(t_playerPos,0)[dbg_index]),(32+16*dbg_array(t_playerPos,1)[dbg_index]),16*dbg_array(t_playerPos,2)[dbg_index],0,16,16,0);
	}
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderDifficultySelect=function(t_tmm,t_dsm,t_difficulty){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<223>";
	var t_backImg=null;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<224>";
	var t_diffImg=null;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<225>";
	var t_icon=null;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<227>";
	this.m_renderTitleScreen(t_tmm);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<230>";
	t_backImg=t_dsm.m_getBackground();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<231>";
	bb_graphics_DrawImage(t_backImg,208.0,80.0,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<234>";
	t_diffImg=t_dsm.m_getDifficultyImg(t_difficulty);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<235>";
	bb_graphics_DrawImage(t_diffImg,224.0,240.0,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<238>";
	t_icon=t_dsm.m_getSelectIcon();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<239>";
	bb_graphics_DrawImage(t_icon,256.0,(136+t_difficulty*16),0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<240>";
	bb_graphics_DrawImage(t_icon,372.0,(136+t_difficulty*16),0);
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_drawEnemy=function(t_e,t_i,t_j,t_x1,t_y1,t_scrollXOff,t_scrollYOff,t_dir){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<686>";
	var t_xOffset=t_e.m_getCurrentFrame()*48;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<687>";
	var t_yOffset=t_e.m_getType2()*48;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<688>";
	var t_offsets=t_e.m_getSmoothOffsets();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<689>";
	var t_drawPos=t_e.m_getDrawPosition();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<690>";
	var t_shiftXOffset=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<691>";
	var t_shiftYOffset=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<692>";
	var t_hitFrame=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<693>";
	var t_hp=t_e.m_getHp();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<694>";
	var t_colorOffset=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<696>";
	if(t_x1==dbg_array(t_drawPos,0)[dbg_index]){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<697>";
		t_shiftXOffset=0;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<698>";
		if(t_x1<dbg_array(t_drawPos,0)[dbg_index]){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<699>";
			t_shiftXOffset=1;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<701>";
			t_shiftXOffset=-1;
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<704>";
	if(t_y1==dbg_array(t_drawPos,1)[dbg_index]){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<705>";
		t_shiftYOffset=0;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<706>";
		if(t_y1<dbg_array(t_drawPos,1)[dbg_index]){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<707>";
			t_shiftYOffset=1;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<709>";
			t_shiftYOffset=-1;
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<712>";
	if(t_hp>=3){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<713>";
		t_colorOffset=0;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<714>";
		if(t_hp==2){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<715>";
			t_colorOffset=1;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<717>";
			t_colorOffset=2;
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<720>";
	if(t_dir==0 || t_dir==3){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<727>";
		bb_graphics_DrawImageRect(this.f_enemyImg,((t_j+t_shiftXOffset)*48+t_scrollXOff+dbg_array(t_offsets,0)[dbg_index]),((t_i+t_shiftYOffset)*48+t_scrollYOff+dbg_array(t_offsets,1)[dbg_index]),t_xOffset,t_yOffset,48,48,0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<728>";
		if(t_e.m_getShowHitAnim()==true){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<729>";
			t_hitFrame=t_e.m_getHitAnimFrame();
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<736>";
			bb_graphics_DrawImageRect(this.f_hitAnimImg,((t_j+t_shiftXOffset)*48+t_scrollXOff+dbg_array(t_offsets,0)[dbg_index]),((t_i+t_shiftYOffset)*48+t_scrollYOff+dbg_array(t_offsets,1)[dbg_index]),t_hitFrame*48,t_colorOffset*48,48,48,0);
		}
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<738>";
		if(t_dir==1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<745>";
			bb_graphics_DrawImageRect(this.f_enemyImg,((t_j-1+t_shiftXOffset)*48+(48-t_scrollXOff)+dbg_array(t_offsets,0)[dbg_index]),((t_i+t_shiftYOffset)*48+t_scrollYOff+dbg_array(t_offsets,1)[dbg_index]),t_xOffset,t_yOffset,48,48,0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<746>";
			if(t_e.m_getShowHitAnim()==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<747>";
				t_hitFrame=t_e.m_getHitAnimFrame();
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<754>";
				bb_graphics_DrawImageRect(this.f_hitAnimImg,((t_j-1+t_shiftXOffset)*48+(48-t_scrollXOff)+dbg_array(t_offsets,0)[dbg_index]),((t_i+t_shiftYOffset)*48+t_scrollYOff+dbg_array(t_offsets,1)[dbg_index]),t_hitFrame*48,t_colorOffset*48,48,48,0);
			}
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<763>";
			bb_graphics_DrawImageRect(this.f_enemyImg,((t_j+t_shiftXOffset)*48+dbg_array(t_offsets,0)[dbg_index]),((t_i-1+t_shiftYOffset)*48+(48-t_scrollYOff)+dbg_array(t_offsets,1)[dbg_index]),t_xOffset,t_yOffset,48,48,0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<764>";
			if(t_e.m_getShowHitAnim()==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<765>";
				t_hitFrame=t_e.m_getHitAnimFrame();
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<772>";
				bb_graphics_DrawImageRect(this.f_hitAnimImg,((t_j+t_shiftXOffset)*48+dbg_array(t_offsets,0)[dbg_index]),((t_i-1+t_shiftYOffset)*48+(48-t_scrollYOff)+dbg_array(t_offsets,1)[dbg_index]),t_hitFrame*48,t_colorOffset*48,48,48,0);
			}
		}
	}
	pop_err();
}
bb_screenrender_ScreenRender.prototype.m_renderMazeViewport=function(t_m,t_p){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<512>";
	var t_w=((this.f_mazeAreaWidth/48)|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<513>";
	var t_h=((this.f_mazeAreaHeight/48)|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<514>";
	var t_wm=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<515>";
	var t_hm=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<516>";
	var t_we=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<517>";
	var t_he=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<518>";
	var t_wm1=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<519>";
	var t_hm1=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<520>";
	var t_we1=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<521>";
	var t_he1=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<522>";
	var t_type=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<523>";
	var t_px=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<524>";
	var t_py=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<525>";
	var t_scrollXOff=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<526>";
	var t_scrollYOff=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<528>";
	var t_scroll=t_m.m_getScroll();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<529>";
	var t_d=t_m.m_getScrollDirection();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<530>";
	if(t_d==0 || t_d==2){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<531>";
		t_scrollXOff=0;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<532>";
		t_scrollYOff=t_scroll;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<534>";
		t_scrollXOff=t_scroll;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<535>";
		t_scrollYOff=0;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<543>";
	var t_cx=t_p.m_getPosition();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<544>";
	var t_halfXA=((t_w/2)|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<545>";
	var t_halfXB=t_w-t_halfXA;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<546>";
	var t_halfYA=((t_h/2)|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<547>";
	var t_halfYB=t_h-t_halfYA;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<549>";
	t_px=dbg_array(t_cx,0)[dbg_index];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<550>";
	t_py=dbg_array(t_cx,1)[dbg_index];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<553>";
	t_wm=t_halfXA-t_px;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<554>";
	t_wm1=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<555>";
	if(t_wm<0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<557>";
		if(t_d==3){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<558>";
			t_wm=-1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<559>";
			t_wm1=t_px-t_halfXA-1;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<561>";
			t_wm=0;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<562>";
			t_wm1=t_px-t_halfXA;
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<567>";
	t_hm=t_halfYA-t_py;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<568>";
	t_hm1=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<569>";
	if(t_hm<0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<571>";
		if(t_d==0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<572>";
			t_hm=-1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<573>";
			t_hm1=t_py-t_halfYA-1;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<575>";
			t_hm=0;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<576>";
			t_hm1=t_py-t_halfYA;
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<582>";
	t_we=t_halfXA+(t_m.m_getWidth()-t_px)-1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<583>";
	t_we1=t_m.m_getWidth()-2;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<584>";
	if(t_we>=t_w){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<586>";
		if(t_d==1 && t_px+t_halfXB+2<t_m.m_getWidth()-2){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<587>";
			t_we=t_w+1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<588>";
			t_we1=t_px+t_halfXB+2;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<590>";
			t_we=t_w;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<591>";
			t_we1=t_px+t_halfXB+1;
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<595>";
	t_he=t_halfYA+(t_m.m_getHeight()-t_py)-1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<596>";
	t_he1=t_m.m_getHeight()-1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<597>";
	if(t_he>=t_h){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<598>";
		if(t_d==2){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<599>";
			t_he=t_h;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<600>";
			t_he1=t_py+t_halfYB+1;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<602>";
			t_he=t_h-1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<603>";
			t_he1=t_py+t_halfYB;
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<607>";
	var t_x1=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<608>";
	var t_y1=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<609>";
	var t_it=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<610>";
	var t_gt=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<611>";
	var t_eh=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<612>";
	var t_en=null;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<613>";
	var t_ep=[];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<616>";
	for(var t_j=t_wm;t_j<=t_we;t_j=t_j+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<617>";
		for(var t_i=t_hm;t_i<=t_he;t_i=t_i+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<618>";
			t_x1=t_j-t_wm+t_wm1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<619>";
			t_y1=t_i-t_hm+t_hm1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<620>";
			t_it=t_m.m_getItem(t_x1,t_y1);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<621>";
			t_gt=t_m.m_getType(t_x1,t_y1);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<623>";
			if(t_m.m_isHidden(t_x1,t_y1)==false){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<624>";
				if(t_d==0 || t_d==3){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<625>";
					bb_graphics_DrawImageRect(this.f_blocksImg,(t_j*48+t_scrollXOff),(t_i*48+t_scrollYOff),t_gt*48,0,48,48,0);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<626>";
					if(t_it!=-1){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<627>";
						if(t_it>=64){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<628>";
							bb_graphics_DrawImageRect(this.f_consumableImg,(t_j*48+t_scrollXOff),(t_i*48+t_scrollYOff),(t_it-64)*48,0,48,48,0);
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<630>";
							bb_graphics_DrawImageRect(this.f_treasureImg,(t_j*48+t_scrollXOff),(t_i*48+t_scrollYOff),t_it*48,0,48,48,0);
						}
					}
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<633>";
					if(t_d==1){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<634>";
						bb_graphics_DrawImageRect(this.f_blocksImg,((t_j-1)*48+(48-t_scrollXOff)),(t_i*48+t_scrollYOff),t_gt*48,0,48,48,0);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<635>";
						if(t_it!=-1){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<636>";
							if(t_it>=64){
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<637>";
								bb_graphics_DrawImageRect(this.f_consumableImg,((t_j-1)*48+(48-t_scrollXOff)),(t_i*48+t_scrollYOff),(t_it-64)*48,0,48,48,0);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<639>";
								bb_graphics_DrawImageRect(this.f_treasureImg,((t_j-1)*48+(48-t_scrollXOff)),(t_i*48+t_scrollYOff),t_it*48,0,48,48,0);
							}
						}
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<643>";
						bb_graphics_DrawImageRect(this.f_blocksImg,(t_j*48),((t_i-1)*48+(48-t_scrollYOff)),t_gt*48,0,48,48,0);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<644>";
						if(t_it!=-1){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<645>";
							if(t_it>=64){
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<646>";
								bb_graphics_DrawImageRect(this.f_consumableImg,(t_j*48),((t_i-1)*48+(48-t_scrollYOff)),(t_it-64)*48,0,48,48,0);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<648>";
								bb_graphics_DrawImageRect(this.f_treasureImg,(t_j*48),((t_i-1)*48+(48-t_scrollYOff)),t_it*48,0,48,48,0);
							}
						}
					}
				}
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<656>";
	for(var t_j2=t_wm;t_j2<=t_we;t_j2=t_j2+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<657>";
		for(var t_i2=t_hm;t_i2<=t_he;t_i2=t_i2+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<658>";
			t_x1=t_j2-t_wm+t_wm1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<659>";
			t_y1=t_i2-t_hm+t_hm1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<660>";
			t_eh=t_m.m_isEnemyHere(t_x1,t_y1);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<661>";
			if(t_eh!=-1){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<662>";
				t_en=t_m.m_getEnemy(t_x1,t_y1);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<663>";
				t_ep=t_en.m_getPosition();
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<665>";
			if(t_m.m_isHidden(t_x1,t_y1)==false){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<666>";
				if(t_eh!=-1){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<668>";
					this.m_drawEnemy(t_en,t_i2,t_j2,t_x1,t_y1,t_scrollXOff,t_scrollYOff,t_d);
				}
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<672>";
				if(t_d==0 || t_d==3){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<673>";
					bb_graphics_DrawImageRect(this.f_blocksImg,(t_j2*48+t_scrollXOff),(t_i2*48+t_scrollYOff),192,0,48,48,0);
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<674>";
					if(t_d==1){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<675>";
						bb_graphics_DrawImageRect(this.f_blocksImg,((t_j2-1)*48+(48-t_scrollXOff)),(t_i2*48+t_scrollYOff),192,0,48,48,0);
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<677>";
						bb_graphics_DrawImageRect(this.f_blocksImg,(t_j2*48),((t_i2-1)*48+(48-t_scrollYOff)),192,0,48,48,0);
					}
				}
			}
		}
	}
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderUiItems=function(t_p){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<394>";
	var t_count=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<395>";
	var t_count2=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<396>";
	var t_count3=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<397>";
	var t_count4=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<398>";
	var t_tmp=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<401>";
	if(t_p.m_getHp()>5){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<402>";
		t_count=5;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<403>";
		t_count2=t_p.m_getHp()-5;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<405>";
		t_count=t_p.m_getHp();
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<406>";
		t_count2=0;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<409>";
	for(var t_i=1;t_i<=t_count;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<410>";
		bb_graphics_DrawImageRect(this.f_itemIconImg,(532+t_i*16),96.0,0,0,16,16,0);
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<413>";
	if(t_count2>0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<414>";
		for(var t_i2=1;t_i2<=t_count2;t_i2=t_i2+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<415>";
			bb_graphics_DrawImageRect(this.f_itemIconImg,(532+t_i2*16),112.0,0,0,16,16,0);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<420>";
	t_tmp=t_p.m_getSwords();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<421>";
	if(t_tmp<=5){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<422>";
		t_count=t_tmp;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<423>";
		t_count2=0;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<424>";
		t_count3=0;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<425>";
		t_count4=0;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<426>";
		if(t_tmp>5 && t_tmp<=10){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<427>";
			t_count=5;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<428>";
			t_count2=t_tmp-5;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<429>";
			t_count3=0;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<430>";
			t_count4=0;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<431>";
			if(t_tmp>10 && t_tmp<=15){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<432>";
				t_count=5;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<433>";
				t_count2=5;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<434>";
				t_count3=t_tmp-10;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<435>";
				t_count4=0;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<436>";
				if(t_tmp>15 && t_tmp<=20){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<437>";
					t_count=5;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<438>";
					t_count2=5;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<439>";
					t_count3=5;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<440>";
					t_count4=t_tmp-15;
				}
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<443>";
	for(var t_i3=1;t_i3<=t_count;t_i3=t_i3+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<444>";
		bb_graphics_DrawImageRect(this.f_itemIconImg,(532+t_i3*16),144.0,16,0,16,16,0);
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<447>";
	if(t_count2>0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<448>";
		for(var t_i4=1;t_i4<=t_count2;t_i4=t_i4+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<449>";
			bb_graphics_DrawImageRect(this.f_itemIconImg,(532+t_i4*16),160.0,16,0,16,16,0);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<453>";
	if(t_count3>0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<454>";
		for(var t_i5=1;t_i5<=t_count3;t_i5=t_i5+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<455>";
			bb_graphics_DrawImageRect(this.f_itemIconImg,(532+t_i5*16),176.0,16,0,16,16,0);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<459>";
	if(t_count4>0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<460>";
		for(var t_i6=1;t_i6<=t_count4;t_i6=t_i6+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<461>";
			bb_graphics_DrawImageRect(this.f_itemIconImg,(532+t_i6*16),192.0,16,0,16,16,0);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<466>";
	if(t_p.m_getStrength()>5){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<467>";
		t_count=5;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<468>";
		t_count2=t_p.m_getStrength()-5;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<470>";
		t_count=t_p.m_getStrength();
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<471>";
		t_count2=0;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<474>";
	for(var t_i7=1;t_i7<=t_count;t_i7=t_i7+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<475>";
		bb_graphics_DrawImageRect(this.f_itemIconImg,(532+t_i7*16),224.0,32,0,16,16,0);
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<478>";
	if(t_count2>0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<479>";
		for(var t_i8=1;t_i8<=t_count2;t_i8=t_i8+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<480>";
			bb_graphics_DrawImageRect(this.f_itemIconImg,(532+t_i8*16),240.0,32,0,16,16,0);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<485>";
	if(t_p.m_getBombs()>5){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<486>";
		t_count=5;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<487>";
		t_count2=t_p.m_getBombs()-5;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<489>";
		t_count=t_p.m_getBombs();
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<490>";
		t_count2=0;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<493>";
	for(var t_i9=1;t_i9<=t_count;t_i9=t_i9+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<494>";
		bb_graphics_DrawImageRect(this.f_itemIconImg,(532+t_i9*16),272.0,48,0,16,16,0);
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<497>";
	if(t_count2>0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<498>";
		for(var t_i10=1;t_i10<=t_count2;t_i10=t_i10+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<499>";
			bb_graphics_DrawImageRect(this.f_itemIconImg,(532+t_i10*16),288.0,48,0,16,16,0);
		}
	}
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderNumber=function(t_number,t_x,t_y,t_rightJust,t_leadingZeros,t_yellow){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<253>";
	var t_str="";
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<254>";
	var t_len=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<255>";
	var t_tmp=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<257>";
	if(t_leadingZeros>0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<258>";
		for(var t_i=1;t_i<=t_leadingZeros;t_i=t_i+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<259>";
			t_str=t_str+"0";
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<263>";
	t_str=t_str+String(t_number);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<264>";
	t_len=t_str.length;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<266>";
	if(t_rightJust==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<267>";
		for(var t_i2=t_len-1;t_i2>=0;t_i2=t_i2+-1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<268>";
			t_tmp=t_str.charCodeAt(t_i2)-48;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<269>";
			if(t_yellow==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<270>";
				bb_graphics_DrawImageRect(this.f_digitsYellowImg,(t_x-10*(t_len-1-t_i2)),(t_y),t_tmp*10,0,10,12,0);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<272>";
				bb_graphics_DrawImageRect(this.f_digitsImg,(t_x-10*(t_len-1-t_i2)),(t_y),t_tmp*10,0,10,12,0);
			}
		}
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<276>";
		for(var t_i3=0;t_i3<=t_len-1;t_i3=t_i3+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<277>";
			t_tmp=t_str.charCodeAt(t_i3)-48;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<278>";
			if(t_yellow==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<279>";
				bb_graphics_DrawImageRect(this.f_digitsYellowImg,(t_x+10*t_i3),(t_y),t_tmp*10,0,10,12,0);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<281>";
				bb_graphics_DrawImageRect(this.f_digitsImg,(t_x+10*t_i3),(t_y),t_tmp*10,0,10,12,0);
			}
		}
	}
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderTime=function(t_time){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<370>";
	var t_minutes=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<371>";
	var t_seconds=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<372>";
	var t_leadingZeros=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<375>";
	t_minutes=((Math.floor((t_time/60)|0))|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<376>";
	t_seconds=t_time-t_minutes*60;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<377>";
	if(t_seconds<10){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<378>";
		t_leadingZeros=1;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<381>";
	this.m_renderNumber(t_minutes,588,74,true,0,false);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<382>";
	this.m_renderNumber(t_seconds,618,74,true,t_leadingZeros,false);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<383>";
	bb_graphics_DrawImageRect(this.f_digitsImg,598.0,74.0,100,0,10,12,0);
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderPlayer=function(t_p){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<345>";
	var t_pos=t_p.m_getPosition();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<346>";
	var t_dir=dbg_array(t_pos,2)[dbg_index];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<347>";
	var t_xPos=((((this.f_mazeAreaWidth/48)|0)/2)|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<348>";
	var t_yPos=((((this.f_mazeAreaHeight/48)|0)/2)|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<349>";
	var t_hitFrame=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<351>";
	bb_graphics_DrawImageRect(t_p.m_getSprite(),(t_xPos*48),(t_yPos*48),t_p.m_getFrame()*t_p.m_getSpriteWidth(),t_dir*t_p.m_getSpriteWidth(),t_p.m_getSpriteWidth(),t_p.m_getSpriteWidth(),0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<353>";
	if(t_p.m_getShowHitAnim()==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<354>";
		t_hitFrame=t_p.m_getHitAnimFrame();
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<361>";
		bb_graphics_DrawImageRect(this.f_hitAnimImg,(t_xPos*48),(t_yPos*48),t_hitFrame*48,0,48,48,0);
	}
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderItemScore=function(t_p){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<332>";
	if(t_p.m_isAnimScoreDisplaying()==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<333>";
		var t_score=t_p.m_getAnimScore();
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<334>";
		var t_scorePos=t_p.m_getAnimScorePos();
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<335>";
		var t_xPos=((((this.f_mazeAreaWidth/48)|0)/2)|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<336>";
		var t_yPos=((((this.f_mazeAreaHeight/48)|0)/2)|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<337>";
		this.m_renderNumber(t_score,t_xPos*48+24,t_yPos*48+t_scorePos+24,true,0,false);
	}
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderUi=function(t_p,t_floor,t_time){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<291>";
	bb_graphics_DrawImageRect(this.f_uiPiecesImg,(this.f_uiAreaX),(this.f_uiAreaY),224,0,128,32,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<294>";
	bb_graphics_DrawImageRect(this.f_uiPiecesImg,(this.f_uiAreaX),(this.f_uiAreaY+this.f_uiAreaHeight-32),480,0,128,32,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<297>";
	for(var t_i=this.f_uiAreaY+32;t_i<=this.f_uiAreaY+this.f_uiAreaHeight-64;t_i=t_i+32){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<298>";
		bb_graphics_DrawImageRect(this.f_uiPiecesImg,(this.f_uiAreaX),(t_i),352,0,128,32,0);
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<302>";
	bb_graphics_DrawImageRect(this.f_uiPiecesImg,(this.f_uiAreaX+10),(this.f_uiAreaY+26),0,0,32,32,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<303>";
	bb_graphics_DrawImageRect(this.f_uiPiecesImg,(this.f_uiAreaX+10),(this.f_uiAreaY+50),32,0,32,32,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<304>";
	bb_graphics_DrawImageRect(this.f_uiPiecesImg,(this.f_uiAreaX+10),(this.f_uiAreaY+74),64,0,32,32,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<305>";
	bb_graphics_DrawImageRect(this.f_uiPiecesImg,(this.f_uiAreaX+10),(this.f_uiAreaY+106),96,0,32,32,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<306>";
	bb_graphics_DrawImageRect(this.f_uiPiecesImg,(this.f_uiAreaX+10),(this.f_uiAreaY+170),128,0,32,32,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<307>";
	bb_graphics_DrawImageRect(this.f_uiPiecesImg,(this.f_uiAreaX+10),(this.f_uiAreaY+234),160,0,32,32,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<308>";
	bb_graphics_DrawImageRect(this.f_uiPiecesImg,(this.f_uiAreaX+10),(this.f_uiAreaY+282),192,0,32,32,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<310>";
	this.m_renderUiItems(t_p);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<311>";
	this.m_renderNumber(t_p.m_getScore(),618,26,true,0,false);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<312>";
	this.m_renderNumber(t_floor,618,50,true,0,false);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<313>";
	this.m_renderTime(t_time);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<314>";
	this.m_renderPlayer(t_p);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<315>";
	this.m_renderItemScore(t_p);
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderDialog=function(t_dialog){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<321>";
	if(t_dialog==0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<322>";
		bb_graphics_DrawImageRect(this.f_timeUpImg,192.0,184.0,0,0,256,112,0);
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<323>";
		if(t_dialog==1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<324>";
			bb_graphics_DrawImageRect(this.f_howToPlayImg,72.0,32.0,0,0,368,416,0);
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<325>";
			if(t_dialog==2){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<326>";
				bb_graphics_DrawImageRect(this.f_deadImg,192.0,184.0,0,0,256,112,0);
			}
		}
	}
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderWinnerScreen=function(t_frame,t_pos,t_dir){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<104>";
	var t_frameOffset=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<106>";
	if(t_dir==1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<107>";
		t_frameOffset=0;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<109>";
		t_frameOffset=1;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<112>";
	bb_graphics_DrawImage(this.f_winnerScreenImg,0.0,0.0,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<113>";
	bb_graphics_DrawImageRect(this.f_winnerboyImg,(t_pos),306.0,t_frame*48,t_frameOffset*48,48,48,0);
	pop_err();
}
bb_screenrender_ScreenRender.prototype.m_renderHighScoreScreen=function(t_difficulties,t_depths,t_items,t_scores,t_newRank){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<119>";
	bb_graphics_DrawImage(this.f_highScoreImg,0.0,0.0,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<121>";
	for(var t_i=0;t_i<=9;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<122>";
		if(dbg_array(t_difficulties,t_i)[dbg_index]!=-1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<124>";
			if(t_i==t_newRank){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<125>";
				this.m_renderNumber(t_i+1,dbg_array(bb_globals_HIGH_SCORE_RANK_X_POSITIONS,0)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_Y_POSITIONS,t_i)[dbg_index],true,0,true);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<127>";
				this.m_renderNumber(t_i+1,dbg_array(bb_globals_HIGH_SCORE_RANK_X_POSITIONS,0)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_Y_POSITIONS,t_i)[dbg_index],true,0,false);
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<131>";
			if(t_i==t_newRank){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<138>";
				bb_graphics_DrawImageRect(this.f_difficultiesYellowImg,(dbg_array(bb_globals_HIGH_SCORE_RANK_X_POSITIONS,1)[dbg_index]),(dbg_array(bb_globals_HIGH_SCORE_RANK_Y_POSITIONS,t_i)[dbg_index]),0,dbg_array(t_difficulties,t_i)[dbg_index]*12,86,12,0);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<146>";
				bb_graphics_DrawImageRect(this.f_difficultiesImg,(dbg_array(bb_globals_HIGH_SCORE_RANK_X_POSITIONS,1)[dbg_index]),(dbg_array(bb_globals_HIGH_SCORE_RANK_Y_POSITIONS,t_i)[dbg_index]),0,dbg_array(t_difficulties,t_i)[dbg_index]*12,86,12,0);
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<150>";
			if(t_i==t_newRank){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<151>";
				this.m_renderNumber(dbg_array(t_depths,t_i)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_X_POSITIONS,2)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_Y_POSITIONS,t_i)[dbg_index],true,0,true);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<153>";
				this.m_renderNumber(dbg_array(t_depths,t_i)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_X_POSITIONS,2)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_Y_POSITIONS,t_i)[dbg_index],true,0,false);
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<157>";
			if(t_i==t_newRank){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<158>";
				this.m_renderNumber(dbg_array(t_items,t_i)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_X_POSITIONS,3)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_Y_POSITIONS,t_i)[dbg_index],true,0,true);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<160>";
				this.m_renderNumber(dbg_array(t_items,t_i)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_X_POSITIONS,3)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_Y_POSITIONS,t_i)[dbg_index],true,0,false);
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<164>";
			if(t_i==t_newRank){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<165>";
				this.m_renderNumber(dbg_array(t_scores,t_i)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_X_POSITIONS,4)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_Y_POSITIONS,t_i)[dbg_index],true,0,true);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<167>";
				this.m_renderNumber(dbg_array(t_scores,t_i)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_X_POSITIONS,4)[dbg_index],dbg_array(bb_globals_HIGH_SCORE_RANK_Y_POSITIONS,t_i)[dbg_index],true,0,false);
			}
		}
	}
	pop_err();
	return;
}
bb_screenrender_ScreenRender.prototype.m_renderTransitionBars=function(t_width){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<98>";
	bb_graphics_DrawImageRect(this.f_blackImg,0.0,0.0,0,0,t_width,480,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/screenrender.monkey<99>";
	bb_graphics_DrawImageRect(this.f_blackImg,(640-t_width),0.0,0,0,t_width,480,0);
	pop_err();
	return;
}
function bb_graphics_Image(){
	Object.call(this);
	this.f_surface=null;
	this.f_width=0;
	this.f_height=0;
	this.f_frames=[];
	this.f_flags=0;
	this.f_tx=.0;
	this.f_ty=.0;
	this.f_source=null;
}
var bb_graphics_Image_DefaultFlags;
function bb_graphics_Image_new(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<65>";
	pop_err();
	return this;
}
bb_graphics_Image.prototype.m_SetHandle=function(t_tx,t_ty){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<109>";
	dbg_object(this).f_tx=t_tx;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<110>";
	dbg_object(this).f_ty=t_ty;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<111>";
	dbg_object(this).f_flags=dbg_object(this).f_flags&-2;
	pop_err();
	return 0;
}
bb_graphics_Image.prototype.m_ApplyFlags=function(t_iflags){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<178>";
	this.f_flags=t_iflags;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<180>";
	if((this.f_flags&2)!=0){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<181>";
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<181>";
		var t_=this.f_frames;
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<181>";
		var t_2=0;
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<181>";
		while(t_2<t_.length){
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<181>";
			var t_f=dbg_array(t_,t_2)[dbg_index];
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<181>";
			t_2=t_2+1;
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<182>";
			dbg_object(t_f).f_x+=1;
		}
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<184>";
		this.f_width-=2;
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<187>";
	if((this.f_flags&4)!=0){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<188>";
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<188>";
		var t_3=this.f_frames;
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<188>";
		var t_4=0;
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<188>";
		while(t_4<t_3.length){
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<188>";
			var t_f2=dbg_array(t_3,t_4)[dbg_index];
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<188>";
			t_4=t_4+1;
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<189>";
			dbg_object(t_f2).f_y+=1;
		}
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<191>";
		this.f_height-=2;
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<194>";
	if((this.f_flags&1)!=0){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<195>";
		this.m_SetHandle((this.f_width)/2.0,(this.f_height)/2.0);
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<198>";
	if(this.f_frames.length==1 && dbg_object(dbg_array(this.f_frames,0)[dbg_index]).f_x==0 && dbg_object(dbg_array(this.f_frames,0)[dbg_index]).f_y==0 && this.f_width==this.f_surface.Width() && this.f_height==this.f_surface.Height()){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<199>";
		this.f_flags|=65536;
	}
	pop_err();
	return 0;
}
bb_graphics_Image.prototype.m_Init=function(t_surf,t_nframes,t_iflags){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<136>";
	this.f_surface=t_surf;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<138>";
	this.f_width=((this.f_surface.Width()/t_nframes)|0);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<139>";
	this.f_height=this.f_surface.Height();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<141>";
	this.f_frames=new_object_array(t_nframes);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<142>";
	for(var t_i=0;t_i<t_nframes;t_i=t_i+1){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<143>";
		dbg_array(this.f_frames,t_i)[dbg_index]=bb_graphics_Frame_new.call(new bb_graphics_Frame,t_i*this.f_width,0)
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<146>";
	this.m_ApplyFlags(t_iflags);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<147>";
	pop_err();
	return this;
}
bb_graphics_Image.prototype.m_Grab=function(t_x,t_y,t_iwidth,t_iheight,t_nframes,t_iflags,t_source){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<151>";
	dbg_object(this).f_source=t_source;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<152>";
	this.f_surface=dbg_object(t_source).f_surface;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<154>";
	this.f_width=t_iwidth;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<155>";
	this.f_height=t_iheight;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<157>";
	this.f_frames=new_object_array(t_nframes);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<159>";
	var t_ix=t_x;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<159>";
	var t_iy=t_y;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<161>";
	for(var t_i=0;t_i<t_nframes;t_i=t_i+1){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<162>";
		if(t_ix+this.f_width>dbg_object(t_source).f_width){
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<163>";
			t_ix=0;
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<164>";
			t_iy+=this.f_height;
		}
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<166>";
		if(t_ix+this.f_width>dbg_object(t_source).f_width || t_iy+this.f_height>dbg_object(t_source).f_height){
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<167>";
			error("Image frame outside surface");
		}
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<169>";
		dbg_array(this.f_frames,t_i)[dbg_index]=bb_graphics_Frame_new.call(new bb_graphics_Frame,t_ix+dbg_object(dbg_array(dbg_object(t_source).f_frames,0)[dbg_index]).f_x,t_iy+dbg_object(dbg_array(dbg_object(t_source).f_frames,0)[dbg_index]).f_y)
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<170>";
		t_ix+=this.f_width;
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<173>";
	this.m_ApplyFlags(t_iflags);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<174>";
	pop_err();
	return this;
}
bb_graphics_Image.prototype.m_GrabImage=function(t_x,t_y,t_width,t_height,t_frames,t_flags){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<104>";
	if(dbg_object(this).f_frames.length!=1){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<104>";
		pop_err();
		return null;
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<105>";
	var t_=(bb_graphics_Image_new.call(new bb_graphics_Image)).m_Grab(t_x,t_y,t_width,t_height,t_frames,t_flags,this);
	pop_err();
	return t_;
}
function bb_data_FixDataPath(t_path){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/data.monkey<3>";
	var t_i=t_path.indexOf(":/",0);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/data.monkey<4>";
	if(t_i!=-1 && t_path.indexOf("/",0)==t_i+1){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/data.monkey<4>";
		pop_err();
		return t_path;
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/data.monkey<5>";
	if(string_startswith(t_path,"./") || string_startswith(t_path,"/")){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/data.monkey<5>";
		pop_err();
		return t_path;
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/data.monkey<6>";
	var t_="monkey://data/"+t_path;
	pop_err();
	return t_;
}
function bb_graphics_Frame(){
	Object.call(this);
	this.f_x=0;
	this.f_y=0;
}
function bb_graphics_Frame_new(t_x,t_y){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<18>";
	dbg_object(this).f_x=t_x;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<19>";
	dbg_object(this).f_y=t_y;
	pop_err();
	return this;
}
function bb_graphics_Frame_new2(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<13>";
	pop_err();
	return this;
}
function bb_graphics_LoadImage(t_path,t_frameCount,t_flags){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<229>";
	var t_surf=bb_graphics_device.LoadSurface(bb_data_FixDataPath(t_path));
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<230>";
	if((t_surf)!=null){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<230>";
		var t_=(bb_graphics_Image_new.call(new bb_graphics_Image)).m_Init(t_surf,t_frameCount,t_flags);
		pop_err();
		return t_;
	}
	pop_err();
	return null;
}
function bb_graphics_LoadImage2(t_path,t_frameWidth,t_frameHeight,t_frameCount,t_flags){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<234>";
	var t_atlas=bb_graphics_LoadImage(t_path,1,0);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<235>";
	if((t_atlas)!=null){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<235>";
		var t_=t_atlas.m_GrabImage(0,0,t_frameWidth,t_frameHeight,t_frameCount,t_flags);
		pop_err();
		return t_;
	}
	pop_err();
	return null;
}
function bb_titlemazemanager_TitleMazeManager(){
	Object.call(this);
	this.f_bg=null;
	this.f_sprite=null;
	this.f_hiddenSquares=[];
	this.f_currentMovement=0;
	this.f_motionWaitTimer=0;
	this.f_readyToDraw=false;
	this.f_movements=[0,1,2,4,0,2,2,4,0,3,2,4,0,4,2,4,0,5,2,4,0,6,2,4,0,7,2,4,0,8,2,4,0,9,2,4,0,10,1,4,1,10,1,4,2,10,1,4,3,10,1,4,4,10,0,4,4,9,0,4,4,8,0,4,4,7,0,4,4,6,0,4,4,5,2,4,4,6,2,4,4,7,1,4,5,7,1,4,6,7,2,4,6,8,2,4,6,9,2,4,6,10,3,4,5,10,3,4,4,10,3,4,3,10,3,4,2,10,2,4,2,11,2,4,2,12,2,4,2,13,2,4,2,14,1,4,3,14,2,4,3,15,3,4,2,15,2,4,2,16,2,4,2,17,2,4,2,18,2,4,2,19,1,4,3,19,1,4,4,19,1,4,5,19,1,4,6,19,1,4,7,19,1,4,8,19,1,4,9,19,1,4,10,19,1,4,11,19,0,4,11,18,0,4,11,17,0,4,11,16,0,4,11,15,0,4,11,14,3,4,10,14,1,4,11,14,0,4,11,13,0,4,11,12,0,4,11,11,0,4,11,10,0,4,11,9,3,4,10,9,3,4,9,9,0,4,9,8,0,4,9,7,0,4,9,6,0,4,9,5,0,4,9,4,0,4,9,3,0,4,9,2,0,4,9,1,0,4,9,0,1,4,10,0,1,4,11,0,1,4,12,0,1,4,13,0,1,4,14,0,1,4,15,0,2,4,15,1,1,4,16,1,2,4,16,2,2,4,16,3,2,4,16,4,2,4,16,5,2,4,16,6,2,4,16,7,2,4,16,8,2,4,16,9,2,4,16,10,1,4,17,10,1,4,18,10,1,4,19,10,1,4,20,10,2,4,20,11,2,4,20,12,2,4,20,13,2,4,20,14,2,4,20,15,2,4,20,16,1,4,21,16,2,4,21,17,2,4,21,18,2,4,21,19,1,4,22,19,1,4,23,19,1,4,24,19,1,4,25,19,1,4,26,19,1,4,27,19,1,4,28,19,0,4,28,18,0,4,28,17,0,4,28,16,0,4,28,15,0,4,28,14,0,4,28,13,0,4,28,12,0,4,28,11,0,4,28,10,1,4,29,10,1,4,30,10,1,4,31,10,0,4,31,9,0,4,31,8,0,4,31,7,0,4,31,6,0,4,31,5,0,4,31,4,0,4,31,3,0,4,31,2,0,4,31,1,0,4,31,0,3,4,30,0,3,4,29,0,3,4,28,0,3,4,27,0,3,4,26,0,3,4,25,0,3,4,24,0,2,4,24,1,2,4,24,2,2,4,24,3,2,4,24,4,2,4,24,5,2,4,24,6,2,4,24,7,2,4,24,8,2,4,24,9,3,4,23,9,3,4,22,9,3,4,21,9,3,4,20,9,3,4,19,9,3,4,18,9,3,4,17,9,0,4,17,8,0,4,17,7,0,4,17,6,0,4,17,5,0,4,17,4,0,4,17,3,0,4,17,2,0,4,17,1,0,4,17,0,3,4,16,0,3,4,15,0,3,4,14,0,3,4,13,0,3,4,12,0,3,4,11,0,3,4,10,0,3,4,9,0,3,4,8,0,3,4,7,0,3,4,6,0,3,4,5,0,3,4,4,0,3,4,3,0,3,4,2,0,3,4,1,0,3,4,0,0,2,4];
	this.f_frameTimer=0;
}
function bb_titlemazemanager_TitleMazeManager_new(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<341>";
	this.f_bg=bb_graphics_LoadImage("title.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<342>";
	this.f_sprite=bb_graphics_LoadImage("boymini.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<343>";
	this.f_hiddenSquares=new_bool_array(640);
	pop_err();
	return this;
}
bb_titlemazemanager_TitleMazeManager.prototype.m_exposeMazePieces=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<302>";
	var t_px=dbg_array(this.f_movements,this.f_currentMovement*4)[dbg_index];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<303>";
	var t_py=dbg_array(this.f_movements,this.f_currentMovement*4+1)[dbg_index];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<304>";
	var t_lighting=dbg_array(this.f_movements,this.f_currentMovement*4+3)[dbg_index];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<307>";
	var t_xStart=t_px-t_lighting;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<308>";
	var t_xEnd=t_px+t_lighting;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<309>";
	var t_yStart=t_py-t_lighting;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<310>";
	var t_yEnd=t_py+t_lighting;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<314>";
	if(t_xStart<0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<315>";
		t_xStart=0;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<317>";
	if(t_xEnd>31){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<318>";
		t_xEnd=31;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<320>";
	if(t_yStart<0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<321>";
		t_yStart=0;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<323>";
	if(t_yEnd>19){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<324>";
		t_yEnd=19;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<328>";
	for(var t_i=t_xStart;t_i<=t_xEnd;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<329>";
		for(var t_j=t_yStart;t_j<=t_yEnd;t_j=t_j+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<330>";
			dbg_array(this.f_hiddenSquares,t_j*32+t_i)[dbg_index]=false
		}
	}
	pop_err();
	return;
}
bb_titlemazemanager_TitleMazeManager.prototype.m_init=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<277>";
	this.f_currentMovement=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<278>";
	this.f_motionWaitTimer=bb_app_Millisecs()+300;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<279>";
	this.f_readyToDraw=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<280>";
	for(var t_i=0;t_i<=31;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<281>";
		for(var t_j=0;t_j<=19;t_j=t_j+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<282>";
			dbg_array(this.f_hiddenSquares,t_j*32+t_i)[dbg_index]=true
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<285>";
	this.m_exposeMazePieces();
	pop_err();
}
bb_titlemazemanager_TitleMazeManager.prototype.m_processAnimation=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<251>";
	if(this.f_readyToDraw==false){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<252>";
		if(bb_app_Millisecs()>=this.f_motionWaitTimer){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<253>";
			this.f_readyToDraw=true;
		}
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<255>";
		if(this.f_readyToDraw==true){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<256>";
			if(bb_app_Millisecs()>=this.f_frameTimer){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<257>";
				this.f_currentMovement=this.f_currentMovement+1;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<258>";
				if(this.f_currentMovement>=182){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<259>";
					this.f_currentMovement=0;
				}
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<261>";
				this.m_exposeMazePieces();
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<262>";
				this.f_frameTimer=bb_app_Millisecs()+50;
			}
		}
	}
	pop_err();
	return;
}
bb_titlemazemanager_TitleMazeManager.prototype.m_getBackground=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<269>";
	pop_err();
	return this.f_bg;
}
bb_titlemazemanager_TitleMazeManager.prototype.m_getSprite=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<273>";
	pop_err();
	return this.f_sprite;
}
bb_titlemazemanager_TitleMazeManager.prototype.m_getPlayerPosition=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<244>";
	var t_=[dbg_array(this.f_movements,this.f_currentMovement*4)[dbg_index],dbg_array(this.f_movements,this.f_currentMovement*4+1)[dbg_index],dbg_array(this.f_movements,this.f_currentMovement*4+2)[dbg_index],dbg_array(this.f_movements,this.f_currentMovement*4+3)[dbg_index]];
	pop_err();
	return t_;
}
bb_titlemazemanager_TitleMazeManager.prototype.m_isHidden=function(t_x,t_y){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/titlemazemanager.monkey<293>";
	var t_=dbg_array(this.f_hiddenSquares,t_y*32+t_x)[dbg_index];
	pop_err();
	return t_;
}
function bb_splashscreenmanager_SplashScreenManager(){
	Object.call(this);
	this.f_splash=null;
	this.f_topXPosition=0;
	this.f_bottomXPosition=0;
	this.f_frameTimer=0;
	this.f_frameSpeed=0;
	this.f_showMainSplash=false;
	this.f_splashAlpha=.0;
	this.f_secondarySplashTimer=0;
}
function bb_splashscreenmanager_SplashScreenManager_new(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<108>";
	this.f_splash=bb_graphics_LoadImage("holygoat.png",1,bb_graphics_Image_DefaultFlags);
	pop_err();
	return this;
}
bb_splashscreenmanager_SplashScreenManager.prototype.m_init=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<96>";
	this.f_topXPosition=640;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<97>";
	this.f_bottomXPosition=-640;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<98>";
	this.f_frameTimer=bb_app_Millisecs()+20;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<99>";
	this.f_frameSpeed=8;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<100>";
	this.f_showMainSplash=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<101>";
	this.f_splashAlpha=0.0;
	pop_err();
}
bb_splashscreenmanager_SplashScreenManager.prototype.m_processAnimation=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<61>";
	if(this.f_showMainSplash==false){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<62>";
		if(bb_app_Millisecs()>=this.f_frameTimer){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<63>";
			this.f_topXPosition=this.f_topXPosition-this.f_frameSpeed;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<64>";
			this.f_bottomXPosition=this.f_bottomXPosition+this.f_frameSpeed;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<65>";
			if(this.f_topXPosition<0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<66>";
				this.f_topXPosition=0;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<67>";
				this.f_showMainSplash=true;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<68>";
				this.f_secondarySplashTimer=bb_app_Millisecs()+500;
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<70>";
			if(this.f_bottomXPosition>0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<71>";
				this.f_bottomXPosition=0;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<72>";
				this.f_showMainSplash=true;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<73>";
				this.f_secondarySplashTimer=bb_app_Millisecs()+500;
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<75>";
			this.f_frameSpeed=this.f_frameSpeed+3;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<76>";
			this.f_frameTimer=bb_app_Millisecs()+20;
		}
	}
	pop_err();
	return;
}
bb_splashscreenmanager_SplashScreenManager.prototype.m_getBackground=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<92>";
	pop_err();
	return this.f_splash;
}
bb_splashscreenmanager_SplashScreenManager.prototype.m_getBarPositions=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<47>";
	var t_=[this.f_topXPosition,this.f_bottomXPosition];
	pop_err();
	return t_;
}
bb_splashscreenmanager_SplashScreenManager.prototype.m_drawMainSplash=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<51>";
	if(bb_app_Millisecs()>=this.f_secondarySplashTimer){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<52>";
		pop_err();
		return this.f_showMainSplash;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<54>";
	pop_err();
	return false;
}
bb_splashscreenmanager_SplashScreenManager.prototype.m_getSplashAlpha=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<83>";
	pop_err();
	return this.f_splashAlpha;
}
bb_splashscreenmanager_SplashScreenManager.prototype.m_setSplashAlpha=function(t_f){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/splashscreenmanager.monkey<87>";
	this.f_splashAlpha=t_f;
	pop_err();
	return;
}
function bb_difficultyselectmanager_DifficultySelectManager(){
	Object.call(this);
	this.f_descBox=[];
	this.f_selectBox=null;
	this.f_selectIcon=null;
}
function bb_difficultyselectmanager_DifficultySelectManager_new(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<71>";
	this.f_descBox=new_object_array(5);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<73>";
	this.f_selectBox=bb_graphics_LoadImage("difficultybox.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<74>";
	this.f_selectIcon=bb_graphics_LoadImage("selecticon.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<75>";
	dbg_array(this.f_descBox,0)[dbg_index]=bb_graphics_LoadImage("veryeasy.png",1,bb_graphics_Image_DefaultFlags)
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<76>";
	dbg_array(this.f_descBox,1)[dbg_index]=bb_graphics_LoadImage("easy.png",1,bb_graphics_Image_DefaultFlags)
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<77>";
	dbg_array(this.f_descBox,2)[dbg_index]=bb_graphics_LoadImage("normal.png",1,bb_graphics_Image_DefaultFlags)
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<78>";
	dbg_array(this.f_descBox,3)[dbg_index]=bb_graphics_LoadImage("hard.png",1,bb_graphics_Image_DefaultFlags)
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<79>";
	dbg_array(this.f_descBox,4)[dbg_index]=bb_graphics_LoadImage("veryhard.png",1,bb_graphics_Image_DefaultFlags)
	pop_err();
	return this;
}
bb_difficultyselectmanager_DifficultySelectManager.prototype.m_init=function(){
	push_err();
	pop_err();
	return;
}
bb_difficultyselectmanager_DifficultySelectManager.prototype.m_processAnimation=function(){
	push_err();
	pop_err();
	return;
}
bb_difficultyselectmanager_DifficultySelectManager.prototype.m_getBackground=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<52>";
	pop_err();
	return this.f_selectBox;
}
bb_difficultyselectmanager_DifficultySelectManager.prototype.m_getDifficultyImg=function(t_difficulty){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<60>";
	var t_=dbg_array(this.f_descBox,t_difficulty)[dbg_index];
	pop_err();
	return t_;
}
bb_difficultyselectmanager_DifficultySelectManager.prototype.m_getSelectIcon=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/difficultyselectmanager.monkey<56>";
	pop_err();
	return this.f_selectIcon;
}
function bbMain(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<946>";
	bb_MazeApp_MazeApp_new.call(new bb_MazeApp_MazeApp);
	err_info="E:/dropbox/Dropbox/MazeApp/MazeApp.monkey<947>";
	pop_err();
	return 0;
}
function bb_graphics_GraphicsContext(){
	Object.call(this);
	this.f_defaultFont=null;
	this.f_font=null;
	this.f_firstChar=0;
	this.f_matrixSp=0;
	this.f_ix=1.0;
	this.f_iy=.0;
	this.f_jx=.0;
	this.f_jy=1.0;
	this.f_tx=.0;
	this.f_ty=.0;
	this.f_tformed=0;
	this.f_matDirty=0;
	this.f_color_r=.0;
	this.f_color_g=.0;
	this.f_color_b=.0;
	this.f_alpha=.0;
	this.f_blend=0;
	this.f_scissor_x=.0;
	this.f_scissor_y=.0;
	this.f_scissor_width=.0;
	this.f_scissor_height=.0;
	this.f_matrixStack=new_number_array(192);
}
function bb_graphics_GraphicsContext_new(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<24>";
	pop_err();
	return this;
}
bb_graphics_GraphicsContext.prototype.m_Validate=function(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<35>";
	if((this.f_matDirty)!=0){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<36>";
		bb_graphics_renderDevice.SetMatrix(dbg_object(bb_graphics_context).f_ix,dbg_object(bb_graphics_context).f_iy,dbg_object(bb_graphics_context).f_jx,dbg_object(bb_graphics_context).f_jy,dbg_object(bb_graphics_context).f_tx,dbg_object(bb_graphics_context).f_ty);
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<37>";
		this.f_matDirty=0;
	}
	pop_err();
	return 0;
}
var bb_graphics_context;
function bb_graphics_SetFont(t_font,t_firstChar){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<524>";
	if(!((t_font)!=null)){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<525>";
		if(!((dbg_object(bb_graphics_context).f_defaultFont)!=null)){
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<526>";
			dbg_object(bb_graphics_context).f_defaultFont=bb_graphics_LoadImage("mojo_font.png",96,2);
		}
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<528>";
		t_font=dbg_object(bb_graphics_context).f_defaultFont;
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<529>";
		t_firstChar=32;
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<531>";
	dbg_object(bb_graphics_context).f_font=t_font;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<532>";
	dbg_object(bb_graphics_context).f_firstChar=t_firstChar;
	pop_err();
	return 0;
}
var bb_graphics_renderDevice;
function bb_graphics_SetMatrix(t_ix,t_iy,t_jx,t_jy,t_tx,t_ty){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<289>";
	dbg_object(bb_graphics_context).f_ix=t_ix;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<290>";
	dbg_object(bb_graphics_context).f_iy=t_iy;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<291>";
	dbg_object(bb_graphics_context).f_jx=t_jx;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<292>";
	dbg_object(bb_graphics_context).f_jy=t_jy;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<293>";
	dbg_object(bb_graphics_context).f_tx=t_tx;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<294>";
	dbg_object(bb_graphics_context).f_ty=t_ty;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<295>";
	dbg_object(bb_graphics_context).f_tformed=((t_ix!=1.0 || t_iy!=0.0 || t_jx!=0.0 || t_jy!=1.0 || t_tx!=0.0 || t_ty!=0.0)?1:0);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<296>";
	dbg_object(bb_graphics_context).f_matDirty=1;
	pop_err();
	return 0;
}
function bb_graphics_SetMatrix2(t_m){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<285>";
	bb_graphics_SetMatrix(dbg_array(t_m,0)[dbg_index],dbg_array(t_m,1)[dbg_index],dbg_array(t_m,2)[dbg_index],dbg_array(t_m,3)[dbg_index],dbg_array(t_m,4)[dbg_index],dbg_array(t_m,5)[dbg_index]);
	pop_err();
	return 0;
}
function bb_graphics_SetColor(t_r,t_g,t_b){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<244>";
	dbg_object(bb_graphics_context).f_color_r=t_r;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<245>";
	dbg_object(bb_graphics_context).f_color_g=t_g;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<246>";
	dbg_object(bb_graphics_context).f_color_b=t_b;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<247>";
	bb_graphics_renderDevice.SetColor(t_r,t_g,t_b);
	pop_err();
	return 0;
}
function bb_graphics_SetAlpha(t_alpha){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<255>";
	dbg_object(bb_graphics_context).f_alpha=t_alpha;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<256>";
	bb_graphics_renderDevice.SetAlpha(t_alpha);
	pop_err();
	return 0;
}
function bb_graphics_SetBlend(t_blend){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<264>";
	dbg_object(bb_graphics_context).f_blend=t_blend;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<265>";
	bb_graphics_renderDevice.SetBlend(t_blend);
	pop_err();
	return 0;
}
function bb_graphics_DeviceWidth(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<221>";
	var t_=bb_graphics_device.Width();
	pop_err();
	return t_;
}
function bb_graphics_DeviceHeight(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<225>";
	var t_=bb_graphics_device.Height();
	pop_err();
	return t_;
}
function bb_graphics_SetScissor(t_x,t_y,t_width,t_height){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<273>";
	dbg_object(bb_graphics_context).f_scissor_x=t_x;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<274>";
	dbg_object(bb_graphics_context).f_scissor_y=t_y;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<275>";
	dbg_object(bb_graphics_context).f_scissor_width=t_width;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<276>";
	dbg_object(bb_graphics_context).f_scissor_height=t_height;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<277>";
	bb_graphics_renderDevice.SetScissor(((t_x)|0),((t_y)|0),((t_width)|0),((t_height)|0));
	pop_err();
	return 0;
}
function bb_graphics_BeginRender(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<206>";
	if(!((bb_graphics_device.Mode())!=0)){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<206>";
		pop_err();
		return 0;
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<207>";
	bb_graphics_renderDevice=bb_graphics_device;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<208>";
	dbg_object(bb_graphics_context).f_matrixSp=0;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<209>";
	bb_graphics_SetMatrix(1.0,0.0,0.0,1.0,0.0,0.0);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<210>";
	bb_graphics_SetColor(255.0,255.0,255.0);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<211>";
	bb_graphics_SetAlpha(1.0);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<212>";
	bb_graphics_SetBlend(0);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<213>";
	bb_graphics_SetScissor(0.0,0.0,(bb_graphics_DeviceWidth()),(bb_graphics_DeviceHeight()));
	pop_err();
	return 0;
}
function bb_graphics_EndRender(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<217>";
	bb_graphics_renderDevice=null;
	pop_err();
	return 0;
}
function bb_app_LoadState(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<133>";
	var t_=bb_app_device.LoadState();
	pop_err();
	return t_;
}
function bb_player_Player(){
	Object.call(this);
	this.f_sprite=null;
	this.f_score=0;
	this.f_hp=0;
	this.f_swords=0;
	this.f_strength=0;
	this.f_bombs=0;
	this.f_mazeX=0;
	this.f_mazeY=0;
	this.f_frame=0;
	this.f_isAnimating=false;
	this.f_direction=0;
	this.f_isShowingScore=false;
	this.f_scorePosOffset=0;
	this.f_itemsCollected=0;
	this.f_maxDepth=0;
	this.f_showHitAnim=false;
	this.f_hitAnimFrame=0;
	this.f_hitAnimTimer=0;
	this.f_scoreShowTimer=0;
	this.f_scoreToShow=0;
	this.f_scorePosSpeed=.0;
	this.f_animStopTimer=0;
	this.f_animTimer=0;
}
bb_player_Player.prototype.m_init=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<81>";
	this.f_score=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<82>";
	this.f_hp=10;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<83>";
	this.f_swords=20;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<84>";
	this.f_strength=1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<85>";
	this.f_bombs=10;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<86>";
	this.f_mazeX=1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<87>";
	this.f_mazeY=1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<88>";
	this.f_frame=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<89>";
	this.f_isAnimating=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<90>";
	this.f_direction=2;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<91>";
	this.f_isShowingScore=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<92>";
	this.f_scorePosOffset=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<93>";
	this.f_itemsCollected=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<94>";
	this.f_maxDepth=1;
	pop_err();
	return;
}
function bb_player_Player_new(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<590>";
	this.f_sprite=bb_graphics_LoadImage("boy.png",1,bb_graphics_Image_DefaultFlags);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<591>";
	this.m_init();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<592>";
	pop_err();
	return this;
}
bb_player_Player.prototype.m_setPosition=function(t_xPos,t_yPos){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<433>";
	this.f_mazeX=t_xPos;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<434>";
	this.f_mazeY=t_yPos;
	pop_err();
	return;
}
bb_player_Player.prototype.m_setDirection=function(t_dir){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<445>";
	if(t_dir==0 || t_dir==2 || t_dir==1 || t_dir==3){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<446>";
		this.f_direction=t_dir;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<448>";
		this.f_direction=0;
	}
	pop_err();
	return;
}
bb_player_Player.prototype.m_exposeMazePieces2=function(t_m){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<463>";
	var t_xStart=this.f_mazeX-1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<464>";
	var t_xEnd=this.f_mazeX+1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<465>";
	var t_yStart=this.f_mazeY-1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<466>";
	var t_yEnd=this.f_mazeY+1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<470>";
	if(t_xStart<0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<471>";
		t_xStart=0;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<473>";
	if(t_xEnd>t_m.m_getWidth()-1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<474>";
		t_xEnd=t_m.m_getWidth()-1;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<476>";
	if(t_yStart<0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<477>";
		t_yStart=0;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<479>";
	if(t_yEnd>t_m.m_getHeight()-1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<480>";
		t_yEnd=t_m.m_getHeight()-1;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<484>";
	for(var t_i=t_xStart;t_i<=t_xEnd;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<485>";
		for(var t_j=t_yStart;t_j<=t_yEnd;t_j=t_j+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<486>";
			t_m.m_setHidden(t_i,t_j,false);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<494>";
	if(this.f_mazeX-1>0 && t_m.m_getType(this.f_mazeX-1,this.f_mazeY)!=1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<495>";
		t_m.m_setHidden(this.f_mazeX-2,this.f_mazeY,false);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<496>";
		if(this.f_mazeX-2>0 && t_m.m_getType(this.f_mazeX-2,this.f_mazeY)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<497>";
			t_m.m_setHidden(this.f_mazeX-3,this.f_mazeY,false);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<502>";
	if(this.f_mazeX+1<t_m.m_getWidth()-1 && t_m.m_getType(this.f_mazeX+1,this.f_mazeY)!=1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<503>";
		t_m.m_setHidden(this.f_mazeX+2,this.f_mazeY,false);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<504>";
		if(this.f_mazeX+2<t_m.m_getWidth()-1 && t_m.m_getType(this.f_mazeX+2,this.f_mazeY)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<505>";
			t_m.m_setHidden(this.f_mazeX+3,this.f_mazeY,false);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<510>";
	if(this.f_mazeY-1>0 && t_m.m_getType(this.f_mazeX,this.f_mazeY-1)!=1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<511>";
		t_m.m_setHidden(this.f_mazeX,this.f_mazeY-2,false);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<512>";
		if(this.f_mazeY-2>0 && t_m.m_getType(this.f_mazeX,this.f_mazeY-2)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<513>";
			t_m.m_setHidden(this.f_mazeX,this.f_mazeY-2,false);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<518>";
	if(this.f_mazeY+1<t_m.m_getWidth()-1 && t_m.m_getType(this.f_mazeX,this.f_mazeY+1)!=1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<519>";
		t_m.m_setHidden(this.f_mazeX,this.f_mazeY+2,false);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<520>";
		if(this.f_mazeY+2<t_m.m_getWidth()-1 && t_m.m_getType(this.f_mazeX,this.f_mazeY+2)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<521>";
			t_m.m_setHidden(this.f_mazeX,this.f_mazeY+3,false);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<540>";
	if(this.f_mazeX-1>0 && this.f_mazeY-1>0 && t_m.m_getType(this.f_mazeX-1,this.f_mazeY-1)!=1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<541>";
		t_m.m_setHidden(this.f_mazeX-2,this.f_mazeY-2,false);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<542>";
		if(t_m.m_getType(this.f_mazeX,this.f_mazeY-1)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<543>";
			t_m.m_setHidden(this.f_mazeX-1,this.f_mazeY-2,false);
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<545>";
		if(t_m.m_getType(this.f_mazeX-1,this.f_mazeY)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<546>";
			t_m.m_setHidden(this.f_mazeX-2,this.f_mazeY-1,false);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<551>";
	if(this.f_mazeX+1<t_m.m_getWidth()-1 && this.f_mazeY-1>0 && t_m.m_getType(this.f_mazeX+1,this.f_mazeY-1)!=1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<552>";
		t_m.m_setHidden(this.f_mazeX+2,this.f_mazeY-2,false);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<553>";
		if(t_m.m_getType(this.f_mazeX,this.f_mazeY-1)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<554>";
			t_m.m_setHidden(this.f_mazeX+1,this.f_mazeY-2,false);
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<556>";
		if(t_m.m_getType(this.f_mazeX+1,this.f_mazeY)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<557>";
			t_m.m_setHidden(this.f_mazeX+2,this.f_mazeY-1,false);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<562>";
	if(this.f_mazeX-1>0 && this.f_mazeY+1<t_m.m_getHeight()-1 && t_m.m_getType(this.f_mazeX-1,this.f_mazeY+1)!=1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<563>";
		t_m.m_setHidden(this.f_mazeX-2,this.f_mazeY+2,false);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<564>";
		if(t_m.m_getType(this.f_mazeX-1,this.f_mazeY)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<565>";
			t_m.m_setHidden(this.f_mazeX-2,this.f_mazeY+1,false);
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<567>";
		if(t_m.m_getType(this.f_mazeX,this.f_mazeY+1)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<568>";
			t_m.m_setHidden(this.f_mazeX-1,this.f_mazeY+2,false);
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<573>";
	if(this.f_mazeX+1<t_m.m_getWidth()-1 && this.f_mazeY+1<t_m.m_getHeight()-1 && t_m.m_getType(this.f_mazeX+1,this.f_mazeY+1)!=1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<574>";
		t_m.m_setHidden(this.f_mazeX+2,this.f_mazeY+2,false);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<575>";
		if(t_m.m_getType(this.f_mazeX+1,this.f_mazeY)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<576>";
			t_m.m_setHidden(this.f_mazeX+2,this.f_mazeY+1,false);
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<578>";
		if(t_m.m_getType(this.f_mazeX,this.f_mazeY+1)!=1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<579>";
			t_m.m_setHidden(this.f_mazeX+1,this.f_mazeY+2,false);
		}
	}
	pop_err();
	return;
}
bb_player_Player.prototype.m_getScore=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<265>";
	pop_err();
	return this.f_score;
}
bb_player_Player.prototype.m_getMaxDepth=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<107>";
	pop_err();
	return this.f_maxDepth;
}
bb_player_Player.prototype.m_getItemsCollected=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<99>";
	pop_err();
	return this.f_itemsCollected;
}
bb_player_Player.prototype.m_getPosition=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<423>";
	var t_=[this.f_mazeX,this.f_mazeY,this.f_direction];
	pop_err();
	return t_;
}
bb_player_Player.prototype.m_setMaxDepth=function(t_depth){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<111>";
	this.f_maxDepth=t_depth;
	pop_err();
}
bb_player_Player.prototype.m_injure=function(t_amount){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<350>";
	this.f_hp=this.f_hp-t_amount;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<351>";
	this.f_showHitAnim=true;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<352>";
	this.f_hitAnimFrame=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<353>";
	this.f_hitAnimTimer=bb_app_Millisecs()+50;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<354>";
	pop_err();
	return this.f_hp;
}
bb_player_Player.prototype.m_incrementItemsCollected=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<103>";
	this.f_itemsCollected=this.f_itemsCollected+1;
	pop_err();
}
bb_player_Player.prototype.m_startScoreAnimTimer=function(t_sc){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<278>";
	this.f_scoreShowTimer=bb_app_Millisecs()+30;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<279>";
	this.f_isShowingScore=true;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<280>";
	this.f_scoreToShow=t_sc;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<281>";
	this.f_scorePosOffset=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<282>";
	this.f_scorePosSpeed=2.0;
	pop_err();
	return;
}
bb_player_Player.prototype.m_adjustScore=function(t_adjustment){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<362>";
	this.f_score=this.f_score+t_adjustment;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<363>";
	this.m_incrementItemsCollected();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<364>";
	this.m_startScoreAnimTimer(t_adjustment);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<365>";
	pop_err();
	return this.f_score;
}
bb_player_Player.prototype.m_isDead=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<312>";
	if(this.f_hp<=0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<313>";
		pop_err();
		return true;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<315>";
		pop_err();
		return false;
	}
}
bb_player_Player.prototype.m_hasSwords=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<325>";
	if(this.f_swords>0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<326>";
		pop_err();
		return true;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<328>";
		pop_err();
		return false;
	}
}
bb_player_Player.prototype.m_removeSword=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<386>";
	if(this.m_hasSwords()==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<387>";
		this.f_swords=this.f_swords-1;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<388>";
		pop_err();
		return this.f_swords;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<390>";
		pop_err();
		return -1;
	}
}
bb_player_Player.prototype.m_turnOnAnimation=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<129>";
	if(this.f_isAnimating==false){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<130>";
		this.f_isAnimating=true;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<132>";
	this.f_animStopTimer=bb_app_Millisecs()+350;
	pop_err();
	return;
}
bb_player_Player.prototype.m_getBombs=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<258>";
	pop_err();
	return this.f_bombs;
}
bb_player_Player.prototype.m_hasBombs=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<338>";
	if(this.f_bombs>0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<339>";
		pop_err();
		return true;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<342>";
	pop_err();
	return false;
}
bb_player_Player.prototype.m_removeBomb=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<401>";
	if(this.m_hasBombs()==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<402>";
		this.f_bombs=this.f_bombs-1;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<403>";
		pop_err();
		return this.f_bombs;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<406>";
	pop_err();
	return -1;
}
bb_player_Player.prototype.m_isIdleTimerComplete=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<302>";
	if(bb_app_Millisecs()>this.f_animStopTimer){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<303>";
		pop_err();
		return true;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<305>";
	pop_err();
	return false;
}
bb_player_Player.prototype.m_turnOffAnimation=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<118>";
	if(this.f_isAnimating==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<119>";
		this.f_isAnimating=false;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<120>";
		this.f_frame=0;
	}
	pop_err();
	return;
}
bb_player_Player.prototype.m_isAnimTimerComplete=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<290>";
	if(bb_app_Millisecs()>this.f_animTimer){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<291>";
		pop_err();
		return true;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<293>";
	pop_err();
	return false;
}
bb_player_Player.prototype.m_startAnimTimer=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<273>";
	this.f_animTimer=bb_app_Millisecs()+250;
	pop_err();
	return;
}
bb_player_Player.prototype.m_processAnimation=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<149>";
	if(this.m_isIdleTimerComplete()==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<150>";
		this.m_turnOffAnimation();
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<152>";
	if(this.f_showHitAnim==true && bb_app_Millisecs()>this.f_hitAnimTimer){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<153>";
		this.f_hitAnimFrame=this.f_hitAnimFrame+1;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<154>";
		if(this.f_hitAnimFrame>=4){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<155>";
			this.f_showHitAnim=false;
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<157>";
		this.f_hitAnimTimer=bb_app_Millisecs()+50;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<159>";
	if(this.f_isShowingScore==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<160>";
		if(bb_app_Millisecs()>this.f_scoreShowTimer){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<161>";
			this.f_scorePosOffset=(((this.f_scorePosOffset)-this.f_scorePosSpeed)|0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<162>";
			this.f_scorePosSpeed=this.f_scorePosSpeed*1.25;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<163>";
			if(this.f_scorePosSpeed>5.333333333333333){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<164>";
				this.f_scorePosSpeed=5.333333333333333;
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<166>";
			if(this.f_scorePosOffset<-96){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<167>";
				this.f_isShowingScore=false;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<168>";
				this.f_scorePosOffset=0;
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<170>";
			this.f_scoreShowTimer=bb_app_Millisecs()+30;
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<173>";
	if(this.m_isAnimTimerComplete()==true && this.f_isAnimating==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<174>";
		this.f_frame=this.f_frame+1;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<175>";
		if(this.f_frame>=4){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<176>";
			this.f_frame=0;
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<178>";
		this.m_startAnimTimer();
	}
	pop_err();
	return;
}
bb_player_Player.prototype.m_getHp=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<209>";
	pop_err();
	return this.f_hp;
}
bb_player_Player.prototype.m_getSwords=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<244>";
	pop_err();
	return this.f_swords;
}
bb_player_Player.prototype.m_getStrength=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<251>";
	pop_err();
	return this.f_strength;
}
bb_player_Player.prototype.m_setHp=function(t_hpPlus){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<213>";
	this.f_hp=t_hpPlus;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<214>";
	if(this.f_hp>10){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<215>";
		this.f_hp=10;
	}
	pop_err();
}
bb_player_Player.prototype.m_setSwords=function(t_swordsPlus){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<220>";
	this.f_swords=t_swordsPlus;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<221>";
	if(this.f_swords>20){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<222>";
		this.f_swords=20;
	}
	pop_err();
}
bb_player_Player.prototype.m_setStrength=function(t_strengthPlus){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<227>";
	this.f_strength=t_strengthPlus;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<228>";
	if(this.f_strength>10){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<229>";
		this.f_strength=10;
	}
	pop_err();
}
bb_player_Player.prototype.m_setBombs=function(t_bombsPlus){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<234>";
	this.f_bombs=t_bombsPlus;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<235>";
	if(this.f_bombs>10){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<236>";
		this.f_bombs=10;
	}
	pop_err();
}
bb_player_Player.prototype.m_getSprite=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<195>";
	pop_err();
	return this.f_sprite;
}
bb_player_Player.prototype.m_getFrame=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<202>";
	pop_err();
	return this.f_frame;
}
bb_player_Player.prototype.m_getSpriteWidth=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<188>";
	pop_err();
	return 48;
}
bb_player_Player.prototype.m_getShowHitAnim=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<141>";
	pop_err();
	return this.f_showHitAnim;
}
bb_player_Player.prototype.m_getHitAnimFrame=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<137>";
	pop_err();
	return this.f_hitAnimFrame;
}
bb_player_Player.prototype.m_isAnimScoreDisplaying=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<369>";
	pop_err();
	return this.f_isShowingScore;
}
bb_player_Player.prototype.m_getAnimScore=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<373>";
	pop_err();
	return this.f_scoreToShow;
}
bb_player_Player.prototype.m_getAnimScorePos=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/player.monkey<377>";
	pop_err();
	return this.f_scorePosOffset;
}
function bb_app_SetUpdateRate(t_hertz){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<145>";
	var t_=bb_app_device.SetUpdateRate(t_hertz);
	pop_err();
	return t_;
}
function bb_app_Millisecs(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<153>";
	var t_=bb_app_device.MilliSecs();
	pop_err();
	return t_;
}
var bb_random_Seed;
function bb_maze_Maze(){
	Object.call(this);
	this.f_engen=null;
	this.f_gen=null;
	this.f_origWidth=0;
	this.f_origHeight=0;
	this.f_width=0;
	this.f_height=0;
	this.f_scrollAmount=0;
	this.f_isScrolling=false;
	this.f_doneScrolling=false;
	this.f_blocks=[];
	this.f_hidden=[];
	this.f_items=[];
	this.f_enemyPresent=[];
	this.f_upstairLink=[];
	this.f_downstairLink=[];
	this.f_en=[];
	this.f_scrollDirection=0;
}
bb_maze_Maze.prototype.m_create=function(t_w,t_h,t_rooms,t_upstairs,t_downstairs){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<292>";
	this.f_gen=bb_mazegenerator_MazeGenerator_new.call(new bb_mazegenerator_MazeGenerator,t_w,t_h,t_rooms);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<293>";
	this.f_gen.m_generate2(1);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<295>";
	this.f_origWidth=t_w;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<296>";
	this.f_origHeight=t_h;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<297>";
	this.f_width=this.f_origWidth*2+1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<298>";
	this.f_height=this.f_origHeight*2+1;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<299>";
	this.f_scrollAmount=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<300>";
	this.f_isScrolling=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<301>";
	this.f_doneScrolling=false;
	pop_err();
	return;
}
bb_maze_Maze.prototype.m_markAllAsHidden=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<443>";
	for(var t_i=1;t_i<=this.f_height-2;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<444>";
		for(var t_j=1;t_j<=this.f_width-2;t_j=t_j+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<445>";
			dbg_array(this.f_hidden,t_i*this.f_width+t_j)[dbg_index]=true
		}
	}
	pop_err();
	return;
}
bb_maze_Maze.prototype.m_convertGeneratorToMaze=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<568>";
	this.f_blocks=new_number_array(this.f_width*this.f_height);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<569>";
	this.f_hidden=new_bool_array(this.f_width*this.f_height);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<570>";
	this.f_items=new_number_array(this.f_width*this.f_height);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<573>";
	for(var t_i=0;t_i<=this.f_height-1;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<574>";
		for(var t_j=0;t_j<=this.f_width-1;t_j=t_j+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<575>";
			dbg_array(this.f_blocks,t_i*this.f_width+t_j)[dbg_index]=2
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<579>";
	this.m_markAllAsHidden();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<582>";
	for(var t_i2=0;t_i2<=this.f_width-1;t_i2=t_i2+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<583>";
		dbg_array(this.f_blocks,t_i2)[dbg_index]=0
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<587>";
	for(var t_i3=0;t_i3<=this.f_height-1;t_i3=t_i3+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<588>";
		dbg_array(this.f_blocks,t_i3*this.f_width)[dbg_index]=0
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<626>";
	for(var t_i4=0;t_i4<=this.f_origWidth-1;t_i4=t_i4+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<627>";
		for(var t_j2=0;t_j2<=this.f_origHeight-1;t_j2=t_j2+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<628>";
			if(this.f_gen.m_isSet(t_i4,t_j2,1)){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<629>";
				dbg_array(this.f_blocks,(t_j2*2+1)*this.f_width+t_i4*2+2)[dbg_index]=1
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<631>";
			if(this.f_gen.m_isSet(t_i4,t_j2,2)){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<632>";
				dbg_array(this.f_blocks,(t_j2*2+2)*this.f_width+t_i4*2+1)[dbg_index]=1
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<634>";
			dbg_array(this.f_blocks,(t_j2*2+2)*this.f_width+t_i4*2+2)[dbg_index]=1
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<639>";
	for(var t_i5=0;t_i5<=this.f_width-1;t_i5=t_i5+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<640>";
		dbg_array(this.f_blocks,(this.f_height-1)*this.f_width+t_i5)[dbg_index]=0
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<644>";
	for(var t_i6=0;t_i6<=this.f_height-1;t_i6=t_i6+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<645>";
		dbg_array(this.f_blocks,t_i6*this.f_width+(this.f_width-1))[dbg_index]=0
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<650>";
	for(var t_i7=1;t_i7<=this.f_origWidth-2;t_i7=t_i7+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<651>";
		for(var t_j3=1;t_j3<=this.f_origHeight-2;t_j3=t_j3+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<655>";
			if(dbg_array(this.f_blocks,(t_j3*2+1)*this.f_width+t_i7*2+2)[dbg_index]==2 && dbg_array(this.f_blocks,(t_j3*2+2)*this.f_width+t_i7*2+1)[dbg_index]==2 && dbg_array(this.f_blocks,(t_j3*2+3)*this.f_width+t_i7*2+2)[dbg_index]==2 && dbg_array(this.f_blocks,(t_j3*2+2)*this.f_width+t_i7*2+3)[dbg_index]==2){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<656>";
				dbg_array(this.f_blocks,(t_j3*2+2)*this.f_width+t_i7*2+2)[dbg_index]=2
			}
		}
	}
	pop_err();
	return;
}
bb_maze_Maze.prototype.m_getType=function(t_x,t_y){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<812>";
	var t_=dbg_array(this.f_blocks,t_y*this.f_width+t_x)[dbg_index];
	pop_err();
	return t_;
}
bb_maze_Maze.prototype.m_setType=function(t_x,t_y,t_type){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<819>";
	dbg_array(this.f_blocks,t_y*this.f_width+t_x)[dbg_index]=t_type
	pop_err();
	return;
}
bb_maze_Maze.prototype.m_addStairs=function(t_quadrant,t_stairsType,t_index){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<873>";
	var t_minX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<874>";
	var t_minY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<875>";
	var t_maxX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<876>";
	var t_maxY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<877>";
	var t_stairsPlaced=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<878>";
	var t_x=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<879>";
	var t_y=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<886>";
	var t_=t_quadrant;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<887>";
	if(t_==1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<888>";
		t_minX=1;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<889>";
		t_maxX=((this.f_width/2)|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<890>";
		t_minY=1;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<891>";
		t_maxY=((this.f_height/2)|0);
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<892>";
		if(t_==2){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<893>";
			t_minX=((this.f_width/2)|0)+1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<894>";
			t_maxX=this.f_width-2;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<895>";
			t_minY=1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<896>";
			t_maxY=((this.f_height/2)|0);
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<897>";
			if(t_==3){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<898>";
				t_minX=1;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<899>";
				t_maxX=((this.f_width/2)|0);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<900>";
				t_minY=((this.f_height/2)|0)+1;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<901>";
				t_maxY=this.f_height-2;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<902>";
				if(t_==4){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<903>";
					t_minX=((this.f_width/2)|0);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<904>";
					t_maxX=this.f_width-2;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<905>";
					t_minY=((this.f_height/2)|0)+1;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<906>";
					t_maxY=this.f_height-2;
				}
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<911>";
	t_stairsPlaced=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<912>";
	while(t_stairsPlaced==false){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<913>";
		t_x=((bb_random_Rnd2((t_minX),(t_maxX)))|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<914>";
		t_y=((bb_random_Rnd2((t_minY),(t_maxY)))|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<915>";
		if(this.m_getType(t_x,t_y)==2){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<917>";
			if(this.m_getType(t_x-1,t_y)!=6 && this.m_getType(t_x-1,t_y)!=5){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<918>";
				if(this.m_getType(t_x+1,t_y)!=6 && this.m_getType(t_x+1,t_y)!=5){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<919>";
					if(this.m_getType(t_x,t_y-1)!=6 && this.m_getType(t_x,t_y-1)!=5){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<920>";
						if(this.m_getType(t_x,t_y+1)!=6 && this.m_getType(t_x,t_y+1)!=5){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<921>";
							this.m_setType(t_x,t_y,t_stairsType);
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<922>";
							t_stairsPlaced=true;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<923>";
							if(t_stairsType==6){
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<924>";
								dbg_array(this.f_upstairLink,t_index*2)[dbg_index]=t_x
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<925>";
								dbg_array(this.f_upstairLink,t_index*2+1)[dbg_index]=t_y
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<927>";
								dbg_array(this.f_downstairLink,t_index*2)[dbg_index]=t_x
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<928>";
								dbg_array(this.f_downstairLink,t_index*2+1)[dbg_index]=t_y
							}
						}
					}
				}
			}
		}
	}
	pop_err();
}
function bb_maze_Maze_new(t_w,t_h,t_rooms,t_upstairs,t_downstairs){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<63>";
	var t_count=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<64>";
	var t_quadrant=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<65>";
	var t_x=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<66>";
	var t_y=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<68>";
	this.f_engen=bb_enemy_EnemyGenerator_new.call(new bb_enemy_EnemyGenerator);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<70>";
	this.m_create(t_w,t_h,t_rooms,t_upstairs,t_downstairs);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<71>";
	this.m_convertGeneratorToMaze();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<73>";
	this.f_enemyPresent=new_number_array(this.f_width*this.f_height);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<74>";
	for(var t_i=0;t_i<=this.f_width-1;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<75>";
		for(var t_j=0;t_j<=this.f_height-1;t_j=t_j+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<76>";
			dbg_array(this.f_enemyPresent,t_j*this.f_width+t_i)[dbg_index]=-1
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<80>";
	this.f_upstairLink=new_number_array(8);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<81>";
	this.f_downstairLink=new_number_array(8);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<83>";
	for(t_count=1;t_count<=t_upstairs;t_count=t_count+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<84>";
		t_quadrant=((bb_random_Rnd2(0.0,4.0)+1.0)|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<85>";
		this.m_addStairs(t_quadrant,6,t_count-1);
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<88>";
	for(t_count=1;t_count<=t_downstairs;t_count=t_count+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<89>";
		t_quadrant=((bb_random_Rnd2(0.0,4.0)+1.0)|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<90>";
		this.m_addStairs(t_quadrant,5,t_count-1);
	}
	pop_err();
	return this;
}
function bb_maze_Maze_new2(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<33>";
	pop_err();
	return this;
}
bb_maze_Maze.prototype.m_initItemStruct=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<220>";
	for(var t_i=0;t_i<=this.f_width-1;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<221>";
		for(var t_j=0;t_j<=this.f_height-1;t_j=t_j+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<222>";
			dbg_array(this.f_items,this.f_width*t_j+t_i)[dbg_index]=-1
		}
	}
	pop_err();
}
bb_maze_Maze.prototype.m_generateItems=function(t_floor,t_nItems,t_consumables){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<233>";
	var t_randNum=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<234>";
	var t_lowEnd=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<235>";
	var t_highEnd=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<236>";
	var t_idx=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<237>";
	var t_foundLocation=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<238>";
	var t_x=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<239>";
	var t_y=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<240>";
	var t_itemType=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<243>";
	for(var t_count=0;t_count<=t_nItems-1;t_count=t_count+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<244>";
		t_foundLocation=false;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<245>";
		while(t_foundLocation==false){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<246>";
			t_x=((bb_random_Rnd2(0.0,(this.f_width)))|0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<247>";
			t_y=((bb_random_Rnd2(0.0,(this.f_height)))|0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<248>";
			if(this.m_getType(t_x,t_y)==2 && dbg_array(this.f_items,t_y*this.f_width+t_x)[dbg_index]==-1){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<249>";
				t_foundLocation=true;
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<255>";
		t_itemType=0;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<256>";
		t_randNum=((bb_random_Rnd2(0.0,1000.0))|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<257>";
		if(t_consumables==true){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<258>";
			if(t_randNum>=0 && t_randNum<dbg_array(bb_globals_CONSUMABLE_RARITY,0)[dbg_index]){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<259>";
				t_itemType=64;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<261>";
				for(t_idx=1;t_idx<=11;t_idx=t_idx+1){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<262>";
					t_lowEnd=dbg_array(bb_globals_CONSUMABLE_RARITY,t_idx-1)[dbg_index];
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<263>";
					t_highEnd=dbg_array(bb_globals_CONSUMABLE_RARITY,t_idx)[dbg_index];
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<264>";
					if(t_randNum>=t_lowEnd && t_randNum<t_highEnd){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<265>";
						t_itemType=64+t_idx;
					}
				}
			}
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<270>";
			if(t_randNum>=0 && t_randNum<dbg_array(bb_globals_ITEM_ODDS,t_floor*32)[dbg_index]){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<271>";
				t_itemType=0;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<273>";
				for(t_idx=1;t_idx<=31;t_idx=t_idx+1){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<274>";
					t_lowEnd=dbg_array(bb_globals_ITEM_ODDS,t_floor*32+(t_idx-1))[dbg_index];
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<275>";
					t_highEnd=dbg_array(bb_globals_ITEM_ODDS,t_floor*32+t_idx)[dbg_index];
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<276>";
					if(t_randNum>=t_lowEnd && t_randNum<t_highEnd){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<277>";
						t_itemType=t_idx;
					}
				}
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<282>";
		dbg_array(this.f_items,t_y*this.f_width+t_x)[dbg_index]=t_itemType
	}
	pop_err();
	return;
}
bb_maze_Maze.prototype.m_isEnemyHere=function(t_x,t_y){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<201>";
	var t_=dbg_array(this.f_enemyPresent,t_y*this.f_width+t_x)[dbg_index];
	pop_err();
	return t_;
}
bb_maze_Maze.prototype.m_generateEnemies=function(t_difficulty,t_floor){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<141>";
	var t_positionFound=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<142>";
	var t_x=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<143>";
	var t_y=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<144>";
	var t_dir=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<145>";
	var t_currentQuadrant=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<146>";
	var t_minX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<147>";
	var t_maxX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<148>";
	var t_minY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<149>";
	var t_maxY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<151>";
	this.f_en=new_object_array(dbg_array(bb_globals_MAX_ENEMIES_PER_FLOOR,t_difficulty)[dbg_index]);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<153>";
	for(var t_i=0;t_i<=dbg_array(bb_globals_MAX_ENEMIES_PER_FLOOR,t_difficulty)[dbg_index]-1;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<154>";
		dbg_array(this.f_en,t_i)[dbg_index]=this.f_engen.m_generate(t_difficulty,t_floor)
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<155>";
		t_positionFound=false;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<156>";
		while(t_positionFound==false){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<159>";
			var t_=t_currentQuadrant;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<160>";
			if(t_==0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<161>";
				t_minX=0;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<162>";
				t_maxX=((this.f_width/2)|0);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<163>";
				t_minY=0;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<164>";
				t_maxY=((this.f_height/2)|0);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<165>";
				if(t_==1){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<166>";
					t_minX=((this.f_width/2)|0)+1;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<167>";
					t_maxX=this.f_width;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<168>";
					t_minY=0;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<169>";
					t_maxY=((this.f_height/2)|0);
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<170>";
					if(t_==2){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<171>";
						t_minX=0;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<172>";
						t_maxX=((this.f_width/2)|0);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<173>";
						t_minY=((this.f_height/2)|0)+1;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<174>";
						t_maxY=this.f_height;
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<175>";
						if(t_==3){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<176>";
							t_minX=((this.f_width/2)|0)+1;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<177>";
							t_maxX=this.f_width;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<178>";
							t_minY=((this.f_height/2)|0)+1;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<179>";
							t_maxY=this.f_height;
						}
					}
				}
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<181>";
			t_x=((bb_random_Rnd2((t_minX),(t_maxX)))|0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<182>";
			t_y=((bb_random_Rnd2((t_minY),(t_maxY)))|0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<183>";
			t_dir=((bb_random_Rnd2(0.0,4.0))|0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<184>";
			if(this.m_isEnemyHere(t_x,t_y)==-1 && this.m_getType(t_x,t_y)==2){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<185>";
				t_positionFound=true;
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<188>";
		dbg_array(this.f_en,t_i)[dbg_index].m_setPosition2(t_x,t_y,t_dir);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<189>";
		dbg_array(this.f_enemyPresent,t_y*this.f_width+t_x)[dbg_index]=t_i
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<190>";
		t_currentQuadrant=t_currentQuadrant+1;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<191>";
		if(t_currentQuadrant>=4){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<192>";
			t_currentQuadrant=0;
		}
	}
	pop_err();
}
bb_maze_Maze.prototype.m_getWidth=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<827>";
	pop_err();
	return this.f_width;
}
bb_maze_Maze.prototype.m_getHeight=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<834>";
	pop_err();
	return this.f_height;
}
bb_maze_Maze.prototype.m_setHidden=function(t_x,t_y,t_state){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<849>";
	dbg_array(this.f_hidden,t_y*this.f_width+t_x)[dbg_index]=t_state
	pop_err();
}
bb_maze_Maze.prototype.m_getStairLink=function(t_x,t_y,t_stairType){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<355>";
	var t_count=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<357>";
	if(t_stairType==6){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<358>";
		for(t_count=0;t_count<=4;t_count=t_count+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<359>";
			if(dbg_array(this.f_upstairLink,t_count*2)[dbg_index]==t_x && dbg_array(this.f_upstairLink,t_count*2+1)[dbg_index]==t_y){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<360>";
				pop_err();
				return t_count;
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<365>";
	if(t_stairType==5){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<366>";
		for(t_count=0;t_count<=4;t_count=t_count+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<367>";
			if(dbg_array(this.f_downstairLink,t_count*2)[dbg_index]==t_x && dbg_array(this.f_downstairLink,t_count*2+1)[dbg_index]==t_y){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<368>";
				pop_err();
				return t_count;
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<373>";
	pop_err();
	return 0;
}
bb_maze_Maze.prototype.m_getStairLinkPos=function(t_idx,t_stairType){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<381>";
	var t_pos=new_number_array(2);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<383>";
	if(t_stairType==6){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<384>";
		dbg_array(t_pos,0)[dbg_index]=dbg_array(this.f_upstairLink,t_idx*2)[dbg_index]
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<385>";
		dbg_array(t_pos,1)[dbg_index]=dbg_array(this.f_upstairLink,t_idx*2+1)[dbg_index]
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<387>";
		dbg_array(t_pos,0)[dbg_index]=dbg_array(this.f_downstairLink,t_idx*2)[dbg_index]
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<388>";
		dbg_array(t_pos,1)[dbg_index]=dbg_array(this.f_downstairLink,t_idx*2+1)[dbg_index]
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<391>";
	pop_err();
	return t_pos;
}
bb_maze_Maze.prototype.m_processEnemyAnimation=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<99>";
	for(var t_i=0;t_i<=this.f_en.length-1;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<100>";
		if(dbg_array(this.f_en,t_i)[dbg_index].m_isDead()==false){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<101>";
			dbg_array(this.f_en,t_i)[dbg_index].m_processAnimation();
		}
	}
	pop_err();
}
bb_maze_Maze.prototype.m_canMoveHere=function(t_x,t_y){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<860>";
	if((dbg_array(this.f_blocks,t_y*this.f_width+t_x)[dbg_index]==2 || dbg_array(this.f_blocks,t_y*this.f_width+t_x)[dbg_index]==3 || dbg_array(this.f_blocks,t_y*this.f_width+t_x)[dbg_index]==6 || dbg_array(this.f_blocks,t_y*this.f_width+t_x)[dbg_index]==5) && this.m_isEnemyHere(t_x,t_y)==-1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<861>";
		pop_err();
		return true;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<864>";
	pop_err();
	return false;
}
bb_maze_Maze.prototype.m_setEnemyPresent=function(t_x,t_y,t_val){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<205>";
	dbg_array(this.f_enemyPresent,t_y*this.f_width+t_x)[dbg_index]=t_val
	pop_err();
}
bb_maze_Maze.prototype.m_isHidden=function(t_x,t_y){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<842>";
	var t_=dbg_array(this.f_hidden,t_y*this.f_width+t_x)[dbg_index];
	pop_err();
	return t_;
}
bb_maze_Maze.prototype.m_canSeeBetween=function(t_x1,t_y1,t_x2,t_y2,t_maxDistance){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<671>";
	var t_distance=Math.sqrt((t_x1-t_x2)*(t_x1-t_x2)+(t_y1-t_y2)*(t_y1-t_y2));
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<672>";
	var t_slope=.0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<673>";
	var t_startX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<674>";
	var t_endX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<675>";
	var t_currentY=.0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<676>";
	var t_currentX=.0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<677>";
	var t_startY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<678>";
	var t_endY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<679>";
	var t_pointType=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<680>";
	var t_flatY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<681>";
	var t_flatX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<684>";
	if(t_distance>t_maxDistance){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<685>";
		pop_err();
		return false;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<689>";
	if(t_x1==t_x2){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<691>";
		if(t_y1==t_y2){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<692>";
			pop_err();
			return true;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<694>";
			if(t_y1<t_y2){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<695>";
				t_startY=t_y1;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<696>";
				t_endY=t_y2;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<697>";
				if(t_y1>t_y2){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<698>";
					t_startY=t_y2;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<699>";
					t_endY=t_y1;
				}
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<704>";
		for(var t_i=t_startY;t_i<=t_endY;t_i=t_i+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<705>";
			t_pointType=this.m_getType(t_x1,t_i);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<706>";
			if(t_pointType==1 || t_pointType==0 || this.m_isHidden(t_x1,t_i)==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<707>";
				pop_err();
				return false;
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<710>";
		pop_err();
		return true;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<719>";
	t_slope=(t_y2-t_y1)/(t_x2-t_x1);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<728>";
	if(t_slope>1.0 || t_slope<-1.0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<729>";
		if(t_y2<t_y1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<730>";
			t_startY=t_y2;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<731>";
			t_endY=t_y1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<732>";
			t_startX=t_x2;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<733>";
			t_endX=t_x1;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<735>";
			t_startY=t_y1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<736>";
			t_endY=t_y2;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<737>";
			t_startX=t_x1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<738>";
			t_endX=t_x2;
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<744>";
		t_slope=1.0/t_slope;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<751>";
		for(var t_i2=(t_startY)+0.5;t_i2<=(t_endY)+0.5;t_i2=t_i2+1.0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<752>";
			t_currentX=(t_startX)+0.5+(t_i2-(t_startY)-0.5)*t_slope;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<753>";
			t_flatX=((Math.floor(t_currentX))|0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<754>";
			if(t_currentX-(t_flatX)>0.5){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<755>";
				t_pointType=this.m_getType(t_flatX+1,((t_i2)|0));
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<756>";
				if(t_pointType==1 || t_pointType==0 || this.m_isHidden(t_flatX+1,((t_i2)|0))==true){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<757>";
					pop_err();
					return false;
				}
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<760>";
			if(t_currentX-(t_flatX)<0.5){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<761>";
				t_pointType=this.m_getType(t_flatX-1,((t_i2)|0));
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<762>";
				if(t_pointType==1 || t_pointType==0 || this.m_isHidden(t_flatX-1,((t_i2)|0))==true){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<763>";
					pop_err();
					return false;
				}
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<766>";
			t_pointType=this.m_getType(t_flatX,((t_i2)|0));
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<767>";
			if(t_pointType==1 || t_pointType==0 || this.m_isHidden(t_flatX,((t_i2)|0))==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<768>";
				pop_err();
				return false;
			}
		}
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<772>";
		if(t_x2<t_x1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<773>";
			t_startX=t_x2;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<774>";
			t_endX=t_x1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<775>";
			t_startY=t_y2;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<776>";
			t_endY=t_y1;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<778>";
			t_startX=t_x1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<779>";
			t_endX=t_x2;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<780>";
			t_startY=t_y1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<781>";
			t_endY=t_y2;
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<784>";
		for(var t_i3=(t_startX)+0.5;t_i3<=(t_endX)+0.5;t_i3=t_i3+1.0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<785>";
			t_currentY=(t_startY)+0.5+(t_i3-(t_startX)-0.5)*t_slope;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<786>";
			t_flatY=((Math.floor(t_currentY))|0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<787>";
			if(t_currentY-(t_flatY)>0.5){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<788>";
				t_pointType=this.m_getType(((t_i3)|0),t_flatY+1);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<789>";
				if(t_pointType==1 || t_pointType==0 || this.m_isHidden(((t_i3)|0),t_flatY+1)==true){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<790>";
					pop_err();
					return false;
				}
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<793>";
			if(t_currentY-(t_flatY)<0.5){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<794>";
				t_pointType=this.m_getType(((t_i3)|0),t_flatY-1);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<795>";
				if(t_pointType==1 || t_pointType==0 || this.m_isHidden(((t_i3)|0),t_flatY-1)==true){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<796>";
					pop_err();
					return false;
				}
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<799>";
			t_pointType=this.m_getType(((t_i3)|0),t_flatY);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<800>";
			if(t_pointType==1 || t_pointType==0 || this.m_isHidden(((t_i3)|0),t_flatY)==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<801>";
				pop_err();
				return false;
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<805>";
	pop_err();
	return true;
}
bb_maze_Maze.prototype.m_processEnemyMovement=function(t_p,t_difficulty){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<110>";
	for(var t_i=0;t_i<=this.f_en.length-1;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<111>";
		if(dbg_array(this.f_en,t_i)[dbg_index].m_isDead()==false){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<112>";
			dbg_array(this.f_en,t_i)[dbg_index].m_processMovement(this,t_p,t_i,t_difficulty);
		}
	}
	pop_err();
	return;
}
bb_maze_Maze.prototype.m_processEnemyDeath=function(t_p,t_d,t_f){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<120>";
	var t_ep=[];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<122>";
	for(var t_i=0;t_i<=this.f_en.length-1;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<123>";
		if(dbg_array(this.f_en,t_i)[dbg_index].m_isDead()==true){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<124>";
			t_ep=dbg_array(this.f_en,t_i)[dbg_index].m_getPosition();
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<125>";
			if(dbg_array(t_ep,0)[dbg_index]!=-1 && dbg_array(t_ep,1)[dbg_index]!=-1){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<126>";
				t_p.m_adjustScore(dbg_array(bb_globals_ENEMY_SCORES,dbg_array(this.f_en,t_i)[dbg_index].m_getType2())[dbg_index]*(t_d+1)*t_f);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<127>";
				this.m_setEnemyPresent(dbg_array(t_ep,0)[dbg_index],dbg_array(t_ep,1)[dbg_index],-1);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<128>";
				dbg_array(this.f_en,t_i)[dbg_index].m_setPosition2(-1,-1,0);
			}
		}
	}
	pop_err();
	return;
}
bb_maze_Maze.prototype.m_getEnemy=function(t_x,t_y){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<213>";
	var t_=dbg_array(this.f_en,dbg_array(this.f_enemyPresent,t_y*this.f_width+t_x)[dbg_index])[dbg_index];
	pop_err();
	return t_;
}
bb_maze_Maze.prototype.m_getIsScrolling=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<405>";
	pop_err();
	return this.f_isScrolling;
}
bb_maze_Maze.prototype.m_setScrollDirection=function(t_dir){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<334>";
	this.f_scrollDirection=t_dir;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<335>";
	var t_=t_dir;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<336>";
	if(t_==0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<337>";
		this.f_scrollAmount=6;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<338>";
		if(t_==2){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<339>";
			this.f_scrollAmount=-6;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<340>";
			if(t_==1){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<341>";
				this.f_scrollAmount=-6;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<342>";
				if(t_==3){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<343>";
					this.f_scrollAmount=6;
				}
			}
		}
	}
	pop_err();
	return;
}
bb_maze_Maze.prototype.m_startScroll=function(t_dir){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<316>";
	this.f_isScrolling=true;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<317>";
	this.f_doneScrolling=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<318>";
	this.m_setScrollDirection(t_dir);
	pop_err();
	return;
}
bb_maze_Maze.prototype.m_incrementScroll=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<428>";
	if(this.f_isScrolling==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<429>";
		this.f_scrollAmount=this.f_scrollAmount+6;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<430>";
		if(this.f_scrollAmount>48){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<431>";
			this.f_scrollAmount=0;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<432>";
			this.f_isScrolling=false;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<433>";
			this.f_doneScrolling=true;
		}
	}
	pop_err();
}
bb_maze_Maze.prototype.m_getDoneScrolling=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<412>";
	pop_err();
	return this.f_doneScrolling;
}
bb_maze_Maze.prototype.m_setDoneScrolling=function(t_state){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<419>";
	this.f_doneScrolling=t_state;
	pop_err();
	return;
}
bb_maze_Maze.prototype.m_checkForItem=function(t_p,t_floor,t_difficulty){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<457>";
	var t_pos=t_p.m_getPosition();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<458>";
	var t_offset=dbg_array(t_pos,1)[dbg_index]*this.f_width+dbg_array(t_pos,0)[dbg_index];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<459>";
	var t_curStr=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<461>";
	if(dbg_array(this.f_items,t_offset)[dbg_index]!=-1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<462>";
		if(dbg_array(this.f_items,t_offset)[dbg_index]<32){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<463>";
			t_p.m_adjustScore(dbg_array(bb_globals_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index])[dbg_index]*t_floor*t_difficulty);
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<464>";
			if(dbg_array(this.f_items,t_offset)[dbg_index]>=64){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<465>";
				var t_hp=t_p.m_getHp();
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<466>";
				var t_bo=t_p.m_getBombs();
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<467>";
				var t_sw=t_p.m_getSwords();
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<468>";
				var t_st=t_p.m_getStrength();
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<470>";
				var t_=dbg_array(this.f_items,t_offset)[dbg_index];
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<471>";
				if(t_==64){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<472>";
					if(t_hp>=10){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<473>";
						t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<475>";
						t_p.m_setHp(t_hp+1);
					}
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<477>";
					if(t_==65){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<478>";
						if(t_hp>=10){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<479>";
							t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<481>";
							t_p.m_setHp(t_hp+2);
						}
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<483>";
						if(t_==66){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<484>";
							if(t_hp>=10){
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<485>";
								t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<487>";
								t_p.m_setHp(t_hp+3);
							}
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<489>";
							if(t_==67){
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<490>";
								if(t_sw>=20){
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<491>";
									t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
								}else{
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<493>";
									t_p.m_setSwords(t_sw+1);
								}
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<495>";
								if(t_==68){
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<496>";
									if(t_sw>=20){
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<497>";
										t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
									}else{
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<499>";
										t_p.m_setSwords(t_sw+2);
									}
								}else{
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<501>";
									if(t_==69){
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<502>";
										if(t_sw>=20){
											err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<503>";
											t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
										}else{
											err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<505>";
											t_p.m_setSwords(t_sw+3);
										}
									}else{
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<507>";
										if(t_==70){
											err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<508>";
											if(t_st>=10){
												err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<509>";
												t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
											}else{
												err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<511>";
												t_p.m_setStrength(t_st+1);
												err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<512>";
												t_curStr=t_p.m_getStrength();
												err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<513>";
												for(var t_i=0;t_i<=this.f_en.length-1;t_i=t_i+1){
													err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<514>";
													dbg_array(this.f_en,t_i)[dbg_index].m_setCurHp(t_difficulty,t_curStr);
												}
											}
										}else{
											err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<517>";
											if(t_==71){
												err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<518>";
												if(t_st>=10){
													err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<519>";
													t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
												}else{
													err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<521>";
													t_p.m_setStrength(t_st+2);
													err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<522>";
													t_curStr=t_p.m_getStrength();
													err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<523>";
													for(var t_i2=0;t_i2<=this.f_en.length-1;t_i2=t_i2+1){
														err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<524>";
														dbg_array(this.f_en,t_i2)[dbg_index].m_setCurHp(t_difficulty,t_curStr);
													}
												}
											}else{
												err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<527>";
												if(t_==72){
													err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<528>";
													if(t_st>=10){
														err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<529>";
														t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
													}else{
														err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<531>";
														t_p.m_setStrength(t_st+3);
														err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<532>";
														t_curStr=t_p.m_getStrength();
														err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<533>";
														for(var t_i3=0;t_i3<=this.f_en.length-1;t_i3=t_i3+1){
															err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<534>";
															dbg_array(this.f_en,t_i3)[dbg_index].m_setCurHp(t_difficulty,t_curStr);
														}
													}
												}else{
													err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<537>";
													if(t_==73){
														err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<538>";
														if(t_bo>=10){
															err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<539>";
															t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
														}else{
															err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<541>";
															t_p.m_setBombs(t_bo+1);
														}
													}else{
														err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<543>";
														if(t_==74){
															err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<544>";
															if(t_bo>=10){
																err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<545>";
																t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
															}else{
																err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<547>";
																t_p.m_setBombs(t_bo+2);
															}
														}else{
															err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<549>";
															if(t_==75){
																err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<550>";
																if(t_bo>=10){
																	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<551>";
																	t_p.m_adjustScore(dbg_array(bb_globals_CONSUMABLE_ITEM_VALUES,dbg_array(this.f_items,t_offset)[dbg_index]-64)[dbg_index]*t_floor*t_difficulty);
																}else{
																	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<553>";
																	t_p.m_setBombs(t_bo+3);
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<557>";
		dbg_array(this.f_items,dbg_array(t_pos,1)[dbg_index]*this.f_width+dbg_array(t_pos,0)[dbg_index])[dbg_index]=-1
	}
	pop_err();
}
bb_maze_Maze.prototype.m_getScroll=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<398>";
	pop_err();
	return this.f_scrollAmount;
}
bb_maze_Maze.prototype.m_getScrollDirection=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<326>";
	pop_err();
	return this.f_scrollDirection;
}
bb_maze_Maze.prototype.m_getItem=function(t_x,t_y){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/maze.monkey<309>";
	var t_=dbg_array(this.f_items,t_y*this.f_width+t_x)[dbg_index];
	pop_err();
	return t_;
}
function bb_enemy_EnemyGenerator(){
	Object.call(this);
}
function bb_enemy_EnemyGenerator_new(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<173>";
	pop_err();
	return this;
}
bb_enemy_EnemyGenerator.prototype.m_generate=function(t_difficulty,t_floor){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<176>";
	var t_type=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<177>";
	var t_randNum=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<178>";
	var t_e=null;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<179>";
	var t_lowEnd=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<180>";
	var t_highEnd=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<181>";
	var t_idx=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<184>";
	t_randNum=((bb_random_Rnd2(0.0,1000.0))|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<186>";
	if(t_randNum>=0 && t_randNum<dbg_array(bb_enemy_ENEMY_ODDS,t_floor*14)[dbg_index]){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<187>";
		t_type=0;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<189>";
		for(t_idx=1;t_idx<=13;t_idx=t_idx+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<190>";
			t_lowEnd=dbg_array(bb_enemy_ENEMY_ODDS,t_floor*14+t_idx-1)[dbg_index];
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<191>";
			t_highEnd=dbg_array(bb_enemy_ENEMY_ODDS,t_floor*14+t_idx)[dbg_index];
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<192>";
			if(t_randNum>=t_lowEnd && t_randNum<t_highEnd){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<193>";
				t_type=t_idx;
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<199>";
	t_e=bb_enemy_Enemy_new.call(new bb_enemy_Enemy);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<200>";
	t_e.m_init2(t_type,t_difficulty);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<201>";
	pop_err();
	return t_e;
}
function bb_mazegenerator_MazeGenerator(){
	Object.call(this);
	this.f_walls=[];
	this.f_roomSquares=[];
	this.f_width=0;
	this.f_height=0;
}
bb_mazegenerator_MazeGenerator.prototype.m_setWall=function(t_x,t_y,t_dir){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<284>";
	dbg_array(this.f_walls,t_y*(this.f_width*4)+t_x*4+t_dir)[dbg_index]=1
	pop_err();
}
bb_mazegenerator_MazeGenerator.prototype.m_clearWall=function(t_x,t_y,t_dir){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<291>";
	dbg_array(this.f_walls,t_y*(this.f_width*4)+t_x*4+t_dir)[dbg_index]=0
	pop_err();
}
bb_mazegenerator_MazeGenerator.prototype.m_carveRoom=function(t_minX,t_minY,t_w,t_h){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<332>";
	for(var t_j=t_minY;t_j<=t_minY+t_h-1;t_j=t_j+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<333>";
		for(var t_i=t_minX;t_i<=t_minX+t_w-2;t_i=t_i+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<334>";
			this.m_clearWall(t_i,t_j,1);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<335>";
			dbg_array(this.f_roomSquares,t_j*this.f_width+t_i)[dbg_index]=1
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<338>";
		for(var t_i2=t_minX+1;t_i2<=t_minX+t_w-1;t_i2=t_i2+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<339>";
			this.m_clearWall(t_i2,t_j,3);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<340>";
			dbg_array(this.f_roomSquares,t_j*this.f_width+t_i2)[dbg_index]=1
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<344>";
	for(var t_j2=t_minX;t_j2<=t_minX+t_w-1;t_j2=t_j2+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<345>";
		for(var t_i3=t_minY;t_i3<=t_minY+t_h-2;t_i3=t_i3+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<346>";
			this.m_clearWall(t_j2,t_i3,2);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<347>";
			dbg_array(this.f_roomSquares,t_i3*this.f_width+t_j2)[dbg_index]=1
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<349>";
		for(var t_i4=t_minY+1;t_i4<=t_minY+t_h-1;t_i4=t_i4+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<350>";
			this.m_clearWall(t_j2,t_i4,0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<351>";
			dbg_array(this.f_roomSquares,t_i4*this.f_width+t_j2)[dbg_index]=1
		}
	}
	pop_err();
	return;
}
function bb_mazegenerator_MazeGenerator_new(t_w,t_h,t_rooms){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<247>";
	this.f_walls=new_number_array(t_w*t_h*4);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<248>";
	this.f_roomSquares=new_number_array(t_w*t_h);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<250>";
	this.f_width=t_w;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<251>";
	this.f_height=t_h;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<255>";
	for(var t_i=0;t_i<=this.f_width-1;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<256>";
		for(var t_j=0;t_j<=this.f_height-1;t_j=t_j+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<257>";
			dbg_array(this.f_roomSquares,t_j*this.f_width+t_i)[dbg_index]=0
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<258>";
			for(var t_k=0;t_k<=3;t_k=t_k+1){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<259>";
				this.m_setWall(t_i,t_j,t_k);
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<264>";
	for(var t_i2=0;t_i2<=t_rooms;t_i2=t_i2+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<265>";
		var t_roomWidth=((bb_random_Rnd2(2.0,4.0))|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<266>";
		var t_roomHeight=((bb_random_Rnd2(2.0,4.0))|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<267>";
		this.m_carveRoom(((bb_random_Rnd2(1.0,(this.f_width-(t_roomWidth+2))))|0),((bb_random_Rnd2(1.0,(this.f_height-(t_roomHeight+2))))|0),t_roomWidth,t_roomHeight);
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<270>";
	pop_err();
	return this;
}
function bb_mazegenerator_MazeGenerator_new2(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<30>";
	pop_err();
	return this;
}
bb_mazegenerator_MazeGenerator.prototype.m_isSet=function(t_x,t_y,t_dir){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<299>";
	if(t_x<0 || t_x>=this.f_width || t_y<0 || t_y>=this.f_height){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<300>";
		pop_err();
		return false;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<303>";
	if(dbg_array(this.f_walls,t_y*(this.f_width*4)+t_x*4+t_dir)[dbg_index]==1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<304>";
		pop_err();
		return true;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<306>";
		pop_err();
		return false;
	}
}
bb_mazegenerator_MazeGenerator.prototype.m_isCarved=function(t_x,t_y){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<321>";
	if(this.m_isSet(t_x,t_y,0)==false || this.m_isSet(t_x,t_y,2)==false || this.m_isSet(t_x,t_y,1)==false || this.m_isSet(t_x,t_y,3)==false){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<322>";
		pop_err();
		return true;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<324>";
		pop_err();
		return false;
	}
}
bb_mazegenerator_MazeGenerator.prototype.m_calculateCarvedSpace=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<360>";
	var t_carved=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<362>";
	for(var t_i=0;t_i<=this.f_width-1;t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<363>";
		for(var t_j=0;t_j<=this.f_height-1;t_j=t_j+1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<364>";
			if(this.m_isCarved(t_i,t_j)==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<365>";
				t_carved=t_carved+1;
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<370>";
	pop_err();
	return t_carved;
}
bb_mazegenerator_MazeGenerator.prototype.m_generateAldousBroder=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<39>";
	var t_rndX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<40>";
	var t_rndY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<41>";
	var t_curX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<42>";
	var t_curY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<43>";
	var t_newX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<44>";
	var t_newY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<45>";
	var t_direction=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<46>";
	var t_visited=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<47>";
	var t_total=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<48>";
	var t_directionIsBad=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<52>";
	t_rndX=((bb_random_Rnd2(0.0,(this.f_width)))|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<53>";
	t_rndY=((bb_random_Rnd2(0.0,(this.f_height)))|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<54>";
	t_curX=t_rndX;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<55>";
	t_curY=t_rndY;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<56>";
	t_visited=1+this.m_calculateCarvedSpace();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<58>";
	t_total=this.f_width*this.f_height;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<60>";
	while(t_visited<t_total){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<62>";
		t_directionIsBad=true;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<63>";
		while(t_directionIsBad==true){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<64>";
			t_direction=((bb_random_Rnd2(0.0,4.0))|0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<65>";
			if(t_direction==0 && t_curY>0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<66>";
				t_directionIsBad=false;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<67>";
				if(t_direction==2 && t_curY<this.f_height-1){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<68>";
					t_directionIsBad=false;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<69>";
					if(t_direction==1 && t_curX<this.f_width-1){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<70>";
						t_directionIsBad=false;
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<71>";
						if(t_direction==3 && t_curX>0){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<72>";
							t_directionIsBad=false;
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<74>";
							t_directionIsBad=true;
						}
					}
				}
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<80>";
		var t_=t_direction;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<81>";
		if(t_==0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<82>";
			t_newX=t_curX;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<83>";
			t_newY=t_curY-1;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<84>";
			if(t_==2){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<85>";
				t_newX=t_curX;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<86>";
				t_newY=t_curY+1;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<87>";
				if(t_==1){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<88>";
					t_newX=t_curX+1;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<89>";
					t_newY=t_curY;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<90>";
					if(t_==3){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<91>";
						t_newX=t_curX-1;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<92>";
						t_newY=t_curY;
					}
				}
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<95>";
		if(this.m_isCarved(t_newX,t_newY)==false){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<96>";
			var t_2=t_direction;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<97>";
			if(t_2==0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<98>";
				this.m_clearWall(t_curX,t_curY,0);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<99>";
				this.m_clearWall(t_newX,t_newY,2);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<100>";
				if(t_2==2){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<101>";
					this.m_clearWall(t_curX,t_curY,2);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<102>";
					this.m_clearWall(t_newX,t_newY,0);
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<103>";
					if(t_2==1){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<104>";
						this.m_clearWall(t_curX,t_curY,1);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<105>";
						this.m_clearWall(t_newX,t_newY,3);
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<106>";
						if(t_2==3){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<107>";
							this.m_clearWall(t_curX,t_curY,3);
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<108>";
							this.m_clearWall(t_newX,t_newY,1);
						}
					}
				}
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<110>";
			t_visited=t_visited+1;
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<113>";
		t_curX=t_newX;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<114>";
		t_curY=t_newY;
	}
	pop_err();
	return;
}
bb_mazegenerator_MazeGenerator.prototype.m_generateRecursiveBacktracker=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<121>";
	var t_rndX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<122>";
	var t_rndY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<123>";
	var t_curX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<124>";
	var t_curY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<125>";
	var t_newX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<126>";
	var t_newY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<127>";
	var t_direction=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<128>";
	var t_visited=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<129>";
	var t_total=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<130>";
	var t_stack=new_number_array(this.f_width*this.f_height*2);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<131>";
	var t_adjacentStack=new_number_array(4);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<132>";
	var t_pointStackCounter=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<133>";
	var t_adjacentStackCounter=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<134>";
	var t_tmpDir=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<135>";
	var t_tmpX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<136>";
	var t_tmpY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<138>";
	t_curX=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<139>";
	t_curY=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<140>";
	t_visited=1+this.m_calculateCarvedSpace();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<141>";
	t_total=this.f_width*this.f_height;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<143>";
	while(t_visited<t_total){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<144>";
		t_adjacentStackCounter=0;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<145>";
		if(t_curX>0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<146>";
			if(this.m_isCarved(t_curX-1,t_curY)==false && dbg_array(this.f_roomSquares,t_curY*this.f_width+t_curX-1)[dbg_index]==0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<147>";
				dbg_array(t_adjacentStack,t_adjacentStackCounter)[dbg_index]=3
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<148>";
				t_adjacentStackCounter=t_adjacentStackCounter+1;
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<151>";
		if(t_curX<this.f_width-1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<152>";
			if(this.m_isCarved(t_curX+1,t_curY)==false && dbg_array(this.f_roomSquares,t_curY*this.f_width+t_curX+1)[dbg_index]==0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<153>";
				dbg_array(t_adjacentStack,t_adjacentStackCounter)[dbg_index]=1
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<154>";
				t_adjacentStackCounter=t_adjacentStackCounter+1;
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<157>";
		if(t_curY>0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<158>";
			if(this.m_isCarved(t_curX,t_curY-1)==false && dbg_array(this.f_roomSquares,(t_curY-1)*this.f_width+t_curX)[dbg_index]==0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<159>";
				dbg_array(t_adjacentStack,t_adjacentStackCounter)[dbg_index]=0
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<160>";
				t_adjacentStackCounter=t_adjacentStackCounter+1;
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<163>";
		if(t_curY<this.f_height-1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<164>";
			if(this.m_isCarved(t_curX,t_curY+1)==false && dbg_array(this.f_roomSquares,(t_curY+1)*this.f_width+t_curX)[dbg_index]==0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<165>";
				dbg_array(t_adjacentStack,t_adjacentStackCounter)[dbg_index]=2
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<166>";
				t_adjacentStackCounter=t_adjacentStackCounter+1;
			}
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<170>";
		if(t_adjacentStackCounter>0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<171>";
			t_direction=((bb_random_Rnd2(0.0,(t_adjacentStackCounter)))|0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<172>";
			dbg_array(t_stack,t_pointStackCounter)[dbg_index]=t_curX
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<173>";
			dbg_array(t_stack,t_pointStackCounter+1)[dbg_index]=t_curY
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<174>";
			t_pointStackCounter=t_pointStackCounter+2;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<175>";
			t_visited=t_visited+1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<177>";
			var t_=dbg_array(t_adjacentStack,t_direction)[dbg_index];
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<178>";
			if(t_==0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<179>";
				this.m_clearWall(t_curX,t_curY,0);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<180>";
				this.m_clearWall(t_curX,t_curY-1,2);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<181>";
				t_curY=t_curY-1;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<182>";
				if(t_==2){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<183>";
					this.m_clearWall(t_curX,t_curY,2);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<184>";
					this.m_clearWall(t_curX,t_curY+1,0);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<185>";
					t_curY=t_curY+1;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<186>";
					if(t_==1){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<187>";
						this.m_clearWall(t_curX,t_curY,1);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<188>";
						this.m_clearWall(t_curX+1,t_curY,3);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<189>";
						t_curX=t_curX+1;
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<190>";
						if(t_==3){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<191>";
							this.m_clearWall(t_curX,t_curY,3);
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<192>";
							this.m_clearWall(t_curX-1,t_curY,1);
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<193>";
							t_curX=t_curX-1;
						}
					}
				}
			}
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<196>";
			if(t_pointStackCounter<=0){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<197>";
				t_visited=t_total;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<199>";
				t_pointStackCounter=t_pointStackCounter-2;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<200>";
				t_curX=dbg_array(t_stack,t_pointStackCounter)[dbg_index];
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<201>";
				t_curY=dbg_array(t_stack,t_pointStackCounter+1)[dbg_index];
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<207>";
	for(var t_i=0;t_i<=((this.f_width*this.f_height/4)|0);t_i=t_i+1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<208>";
		t_tmpDir=((bb_random_Rnd3(4.0))|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<209>";
		t_tmpX=((bb_random_Rnd3(this.f_width-2)+1.0)|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<210>";
		t_tmpY=((bb_random_Rnd3(this.f_height-2)+1.0)|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<212>";
		if(t_tmpDir==0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<213>";
			this.m_clearWall(t_tmpX,t_tmpY,0);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<214>";
			this.m_clearWall(t_tmpX,t_tmpY-1,2);
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<215>";
			if(t_tmpDir==2){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<216>";
				this.m_clearWall(t_tmpX,t_tmpY,2);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<217>";
				this.m_clearWall(t_tmpX,t_tmpY+1,0);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<218>";
				if(t_tmpDir==1){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<219>";
					this.m_clearWall(t_tmpX,t_tmpY,1);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<220>";
					this.m_clearWall(t_tmpX+1,t_tmpY,3);
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<222>";
					this.m_clearWall(t_tmpX,t_tmpY,3);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<223>";
					this.m_clearWall(t_tmpX-1,t_tmpY,1);
				}
			}
		}
	}
	pop_err();
	return;
}
bb_mazegenerator_MazeGenerator.prototype.m_generatePrim=function(){
	push_err();
	pop_err();
	return;
}
bb_mazegenerator_MazeGenerator.prototype.m_generateKruskal=function(){
	push_err();
	pop_err();
	return;
}
bb_mazegenerator_MazeGenerator.prototype.m_generateWilson=function(){
	push_err();
	pop_err();
	return;
}
bb_mazegenerator_MazeGenerator.prototype.m_generateHuntAndKill=function(){
	push_err();
	pop_err();
	return;
}
bb_mazegenerator_MazeGenerator.prototype.m_generate2=function(t_genMethod){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<379>";
	var t_=t_genMethod;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<380>";
	if(t_==0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<381>";
		this.m_generateAldousBroder();
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<382>";
		if(t_==1){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<383>";
			this.m_generateRecursiveBacktracker();
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<384>";
			if(t_==2){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<385>";
				this.m_generatePrim();
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<386>";
				if(t_==3){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<387>";
					this.m_generateKruskal();
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<388>";
					if(t_==4){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<389>";
						this.m_generateWilson();
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<390>";
						if(t_==5){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<391>";
							this.m_generateHuntAndKill();
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/mazegenerator.monkey<393>";
							this.m_generateAldousBroder();
						}
					}
				}
			}
		}
	}
	pop_err();
	return;
}
function bb_random_Rnd(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/monkey/random.monkey<21>";
	bb_random_Seed=bb_random_Seed*1664525+1013904223|0;
	err_info="F:/Monkey/MonkeyPro66/modules/monkey/random.monkey<22>";
	var t_=(bb_random_Seed>>8&16777215)/16777216.0;
	pop_err();
	return t_;
}
function bb_random_Rnd2(t_low,t_high){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/monkey/random.monkey<30>";
	var t_=bb_random_Rnd3(t_high-t_low)+t_low;
	pop_err();
	return t_;
}
function bb_random_Rnd3(t_range){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/monkey/random.monkey<26>";
	var t_=bb_random_Rnd()*t_range;
	pop_err();
	return t_;
}
var bb_globals_CONSUMABLE_RARITY;
var bb_globals_ITEM_ODDS;
function bb_enemy_Enemy(){
	Object.call(this);
	this.f_enemyType=0;
	this.f_behaviorMode=0;
	this.f_curHp=0;
	this.f_numTimesHit=0;
	this.f_xPos=0;
	this.f_yPos=0;
	this.f_drawXPos=0;
	this.f_drawYPos=0;
	this.f_direction=0;
	this.f_currentFrame=0;
	this.f_isMoving=false;
	this.f_animationTime=0;
	this.f_movementTime=0;
	this.f_isStunned=false;
	this.f_markAsDead=false;
	this.f_showHitAnim=false;
	this.f_finallyDead=false;
	this.f_hitAnimTimer=0;
	this.f_hitAnimFrame=0;
	this.f_stunTimer=0;
	this.f_moveDirection=0;
	this.f_smoothYOffset=0;
	this.f_smoothXOffset=0;
}
function bb_enemy_Enemy_new(){
	push_err();
	pop_err();
	return this;
}
bb_enemy_Enemy.prototype.m_setCurHp=function(t_difficulty,t_strOffset){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<739>";
	var t_strOffAlt=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<741>";
	if(t_strOffset==0 || t_strOffset==1){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<742>";
		t_strOffAlt=0;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<743>";
		if(t_strOffset==2 || t_strOffset==3){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<744>";
			t_strOffAlt=1;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<745>";
			if(t_strOffset==4 || t_strOffset==5){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<746>";
				t_strOffAlt=2;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<747>";
				if(t_strOffset==6 || t_strOffset==7){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<748>";
					t_strOffAlt=3;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<749>";
					if(t_strOffset==8 || t_strOffset==9){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<750>";
						t_strOffAlt=4;
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<752>";
						t_strOffAlt=5;
					}
				}
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<755>";
	this.f_curHp=dbg_array(bb_enemy_ENEMY_HP,this.f_enemyType*5*6+t_difficulty*6+t_strOffAlt)[dbg_index];
	pop_err();
}
bb_enemy_Enemy.prototype.m_init2=function(t_type,t_difficulty){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<777>";
	this.f_enemyType=t_type;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<778>";
	this.f_behaviorMode=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<779>";
	this.m_setCurHp(t_difficulty,0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<780>";
	this.f_numTimesHit=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<781>";
	this.f_xPos=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<782>";
	this.f_yPos=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<783>";
	this.f_drawXPos=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<784>";
	this.f_drawYPos=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<785>";
	this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<786>";
	this.f_currentFrame=((bb_random_Rnd2(0.0,16.0))|0);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<787>";
	this.f_isMoving=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<788>";
	this.f_animationTime=bb_app_Millisecs()+100;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<789>";
	this.f_movementTime=bb_app_Millisecs()+dbg_array(bb_enemy_ENEMY_SPEEDS,t_difficulty*14*2+this.f_enemyType)[dbg_index];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<790>";
	this.f_isStunned=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<791>";
	this.f_markAsDead=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<792>";
	this.f_showHitAnim=false;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<793>";
	this.f_finallyDead=false;
	pop_err();
}
bb_enemy_Enemy.prototype.m_setPosition2=function(t_x,t_y,t_d){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<282>";
	this.f_xPos=t_x;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<283>";
	this.f_yPos=t_y;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<284>";
	this.f_drawXPos=t_x;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<285>";
	this.f_drawYPos=t_y;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<286>";
	this.f_direction=t_d;
	pop_err();
}
bb_enemy_Enemy.prototype.m_isDead=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<759>";
	if(this.f_curHp-this.f_numTimesHit<=0){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<760>";
		if(this.f_markAsDead==false){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<761>";
			this.f_markAsDead=true;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<762>";
			this.f_finallyDead=false;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<763>";
			pop_err();
			return false;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<764>";
			if(this.f_finallyDead==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<765>";
				pop_err();
				return true;
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<769>";
	pop_err();
	return false;
}
bb_enemy_Enemy.prototype.m_processAnimation=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<311>";
	if(this.f_isStunned==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<312>";
		if(this.f_showHitAnim==true && bb_app_Millisecs()>this.f_hitAnimTimer){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<313>";
			this.f_hitAnimFrame=this.f_hitAnimFrame+1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<314>";
			if(this.f_hitAnimFrame>=4){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<315>";
				this.f_showHitAnim=false;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<316>";
				this.f_finallyDead=true;
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<318>";
			this.f_hitAnimTimer=bb_app_Millisecs()+50;
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<320>";
		if(bb_app_Millisecs()>this.f_stunTimer){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<321>";
			this.f_isStunned=false;
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<325>";
	if(this.f_isMoving==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<326>";
		var t_=this.f_moveDirection;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<327>";
		if(t_==0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<328>";
			this.f_smoothYOffset=this.f_smoothYOffset-3;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<329>";
			if(this.f_smoothYOffset<-48){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<330>";
				this.f_isMoving=false;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<331>";
				this.f_smoothYOffset=0;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<332>";
				this.f_drawYPos=this.f_yPos;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<333>";
				this.f_drawXPos=this.f_xPos;
			}
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<335>";
			if(t_==2){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<336>";
				this.f_smoothYOffset=this.f_smoothYOffset+3;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<337>";
				if(this.f_smoothYOffset>48){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<338>";
					this.f_isMoving=false;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<339>";
					this.f_smoothYOffset=0;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<340>";
					this.f_drawYPos=this.f_yPos;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<341>";
					this.f_drawXPos=this.f_xPos;
				}
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<343>";
				if(t_==1){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<344>";
					this.f_smoothXOffset=this.f_smoothXOffset+3;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<345>";
					if(this.f_smoothXOffset>48){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<346>";
						this.f_isMoving=false;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<347>";
						this.f_smoothXOffset=0;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<348>";
						this.f_drawYPos=this.f_yPos;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<349>";
						this.f_drawXPos=this.f_xPos;
					}
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<351>";
					if(t_==3){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<352>";
						this.f_smoothXOffset=this.f_smoothXOffset-3;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<353>";
						if(this.f_smoothXOffset<-48){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<354>";
							this.f_isMoving=false;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<355>";
							this.f_smoothXOffset=0;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<356>";
							this.f_drawYPos=this.f_yPos;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<357>";
							this.f_drawXPos=this.f_xPos;
						}
					}
				}
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<362>";
	if(bb_app_Millisecs()>=this.f_animationTime){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<363>";
		this.f_currentFrame=this.f_currentFrame+1;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<364>";
		if(this.f_currentFrame>=16){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<365>";
			this.f_currentFrame=0;
		}
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<367>";
		this.f_animationTime=bb_app_Millisecs()+100;
	}
	pop_err();
}
bb_enemy_Enemy.prototype.m_doChaseMode=function(t_m,t_p,t_eid){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<476>";
	var t_pos=t_p.m_getPosition();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<477>";
	var t_px=dbg_array(t_pos,0)[dbg_index];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<478>";
	var t_py=dbg_array(t_pos,1)[dbg_index];
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<479>";
	var t_xDist=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<480>";
	var t_yDist=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<481>";
	var t_dir1=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<482>";
	var t_dir2=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<483>";
	var t_r=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<485>";
	if(t_m.m_canSeeBetween(this.f_xPos,this.f_yPos,t_px,t_py,(dbg_array(bb_enemy_ENEMY_SIGHT_RANGES,this.f_enemyType)[dbg_index])*1.5)==false){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<486>";
		this.f_behaviorMode=0;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<490>";
	if(t_px<this.f_xPos){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<491>";
		t_xDist=this.f_xPos-t_px;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<493>";
		t_xDist=t_px-this.f_xPos;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<495>";
	if(t_py<this.f_yPos){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<496>";
		t_yDist=this.f_yPos-t_py;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<498>";
		t_yDist=t_py-this.f_yPos;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<501>";
	if(t_xDist==t_yDist){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<502>";
		t_r=((bb_random_Rnd2(0.0,2.0))|0);
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<503>";
		if(t_r==0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<504>";
			if(t_px<this.f_xPos){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<505>";
				t_dir1=3;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<506>";
				if(t_py<this.f_yPos){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<507>";
					t_dir2=0;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<509>";
					t_dir2=2;
				}
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<512>";
				t_dir1=1;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<513>";
				if(t_py<this.f_yPos){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<514>";
					t_dir2=0;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<516>";
					t_dir2=2;
				}
			}
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<520>";
			if(t_py<this.f_yPos){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<521>";
				t_dir1=0;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<522>";
				if(t_px<this.f_xPos){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<523>";
					t_dir2=1;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<525>";
					t_dir2=3;
				}
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<528>";
				t_dir1=2;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<529>";
				if(t_px<this.f_xPos){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<530>";
					t_dir2=1;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<532>";
					t_dir2=3;
				}
			}
		}
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<536>";
		if(t_xDist>t_yDist){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<537>";
			if(t_px<this.f_xPos){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<538>";
				t_dir1=3;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<539>";
				if(t_py<this.f_yPos){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<540>";
					t_dir2=0;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<542>";
					t_dir2=2;
				}
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<545>";
				t_dir1=1;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<546>";
				if(t_py<this.f_yPos){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<547>";
					t_dir2=0;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<549>";
					t_dir2=2;
				}
			}
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<553>";
			if(t_py<this.f_yPos){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<554>";
				t_dir1=0;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<555>";
				if(t_px<this.f_xPos){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<556>";
					t_dir2=1;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<558>";
					t_dir2=3;
				}
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<561>";
				t_dir1=2;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<562>";
				if(t_px<this.f_xPos){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<563>";
					t_dir2=1;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<565>";
					t_dir2=3;
				}
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<570>";
	if(this.f_isMoving==false){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<571>";
		this.f_drawXPos=this.f_xPos;
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<572>";
		this.f_drawYPos=this.f_yPos;
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<575>";
	if(t_dir1==0 && t_m.m_canMoveHere(this.f_xPos,this.f_yPos-1)==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<576>";
		if(this.f_xPos==dbg_array(t_pos,0)[dbg_index] && this.f_yPos-1==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<577>";
			t_p.m_injure(1);
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<579>";
			t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<580>";
			this.f_direction=t_dir1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<581>";
			this.f_yPos=this.f_yPos-1;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<582>";
			t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<583>";
			if(t_m.m_canMoveHere(this.f_xPos,this.f_yPos-1)==false){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<584>";
				this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<585>";
				this.f_behaviorMode=0;
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<587>";
			this.f_isMoving=true;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<588>";
			this.f_moveDirection=0;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<589>";
			this.f_smoothXOffset=0;
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<590>";
			this.f_smoothYOffset=0;
		}
		pop_err();
		return;
	}else{
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<593>";
		if(t_dir1==2 && t_m.m_canMoveHere(this.f_xPos,this.f_yPos+1)==true){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<594>";
			if(this.f_xPos==dbg_array(t_pos,0)[dbg_index] && this.f_yPos+1==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<595>";
				t_p.m_injure(1);
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<597>";
				t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<598>";
				this.f_direction=t_dir1;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<599>";
				this.f_yPos=this.f_yPos+1;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<600>";
				t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<601>";
				if(t_m.m_canMoveHere(this.f_xPos,this.f_yPos+1)==false){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<602>";
					this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<603>";
					this.f_behaviorMode=0;
				}
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<605>";
				this.f_isMoving=true;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<606>";
				this.f_moveDirection=2;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<607>";
				this.f_smoothXOffset=0;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<608>";
				this.f_smoothYOffset=0;
			}
			pop_err();
			return;
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<611>";
			if(t_dir1==1 && t_m.m_canMoveHere(this.f_xPos+1,this.f_yPos)==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<612>";
				if(this.f_xPos+1==dbg_array(t_pos,0)[dbg_index] && this.f_yPos==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<613>";
					t_p.m_injure(1);
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<615>";
					t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<616>";
					this.f_direction=t_dir1;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<617>";
					this.f_xPos=this.f_xPos+1;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<618>";
					t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<619>";
					if(t_m.m_canMoveHere(this.f_xPos+1,this.f_yPos)==false){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<620>";
						this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<621>";
						this.f_behaviorMode=0;
					}
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<623>";
					this.f_isMoving=true;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<624>";
					this.f_moveDirection=1;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<625>";
					this.f_smoothXOffset=0;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<626>";
					this.f_smoothYOffset=0;
				}
				pop_err();
				return;
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<629>";
				if(t_dir1==3 && t_m.m_canMoveHere(this.f_xPos-1,this.f_yPos)==true){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<630>";
					if(this.f_xPos-1==dbg_array(t_pos,0)[dbg_index] && this.f_yPos==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<631>";
						t_p.m_injure(1);
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<633>";
						t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<634>";
						this.f_direction=t_dir1;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<635>";
						this.f_xPos=this.f_xPos-1;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<636>";
						t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<637>";
						if(t_m.m_canMoveHere(this.f_xPos-1,this.f_yPos)==false){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<638>";
							this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<639>";
							this.f_behaviorMode=0;
						}
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<641>";
						this.f_isMoving=true;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<642>";
						this.f_moveDirection=3;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<643>";
						this.f_smoothXOffset=0;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<644>";
						this.f_smoothYOffset=0;
					}
					pop_err();
					return;
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<647>";
					if(t_dir2==0 && t_m.m_canMoveHere(this.f_xPos,this.f_yPos-1)==true){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<648>";
						if(this.f_xPos==dbg_array(t_pos,0)[dbg_index] && this.f_yPos-1==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<649>";
							t_p.m_injure(1);
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<651>";
							t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<652>";
							this.f_direction=t_dir2;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<653>";
							this.f_yPos=this.f_yPos-1;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<654>";
							t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<655>";
							if(t_m.m_canMoveHere(this.f_xPos,this.f_yPos-1)==false){
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<656>";
								this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<657>";
								this.f_behaviorMode=0;
							}
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<659>";
							this.f_isMoving=true;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<660>";
							this.f_moveDirection=0;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<661>";
							this.f_smoothXOffset=0;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<662>";
							this.f_smoothYOffset=0;
						}
						pop_err();
						return;
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<665>";
						if(t_dir2==2 && t_m.m_canMoveHere(this.f_xPos,this.f_yPos+1)==true){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<666>";
							if(this.f_xPos==dbg_array(t_pos,0)[dbg_index] && this.f_yPos+1==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<667>";
								t_p.m_injure(1);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<669>";
								t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<670>";
								this.f_direction=t_dir2;
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<671>";
								this.f_yPos=this.f_yPos+1;
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<672>";
								t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<673>";
								if(t_m.m_canMoveHere(this.f_xPos,this.f_yPos+1)==false){
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<674>";
									this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<675>";
									this.f_behaviorMode=0;
								}
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<677>";
								this.f_isMoving=true;
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<678>";
								this.f_moveDirection=2;
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<679>";
								this.f_smoothXOffset=0;
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<680>";
								this.f_smoothYOffset=0;
							}
							pop_err();
							return;
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<683>";
							if(t_dir2==1 && t_m.m_canMoveHere(this.f_xPos+1,this.f_yPos)==true){
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<684>";
								if(this.f_xPos+1==dbg_array(t_pos,0)[dbg_index] && this.f_yPos==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<685>";
									t_p.m_injure(1);
								}else{
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<687>";
									t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<688>";
									this.f_direction=t_dir2;
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<689>";
									this.f_xPos=this.f_xPos+1;
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<690>";
									t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<691>";
									if(t_m.m_canMoveHere(this.f_xPos+1,this.f_yPos)==false){
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<692>";
										this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<693>";
										this.f_behaviorMode=0;
									}
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<695>";
									this.f_isMoving=true;
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<696>";
									this.f_moveDirection=1;
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<697>";
									this.f_smoothXOffset=0;
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<698>";
									this.f_smoothYOffset=0;
								}
								pop_err();
								return;
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<701>";
								if(t_dir2==3 && t_m.m_canMoveHere(this.f_xPos-1,this.f_yPos)==true){
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<702>";
									if(this.f_xPos-1==dbg_array(t_pos,0)[dbg_index] && this.f_yPos==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<703>";
										t_p.m_injure(1);
									}else{
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<705>";
										t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<706>";
										this.f_direction=t_dir2;
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<707>";
										this.f_xPos=this.f_xPos-1;
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<708>";
										t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<709>";
										if(t_m.m_canMoveHere(this.f_xPos-1,this.f_yPos)==false){
											err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<710>";
											this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
											err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<711>";
											this.f_behaviorMode=0;
										}
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<713>";
										this.f_isMoving=true;
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<714>";
										this.f_moveDirection=3;
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<715>";
										this.f_smoothXOffset=0;
										err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<716>";
										this.f_smoothYOffset=0;
									}
									pop_err();
									return;
								}else{
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<720>";
									this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<721>";
									this.f_behaviorMode=0;
								}
							}
						}
					}
				}
			}
		}
	}
	pop_err();
	return;
}
bb_enemy_Enemy.prototype.m_processMovement=function(t_m,t_p,t_eid,t_difficulty){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<373>";
	var t_pos=t_p.m_getPosition();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<374>";
	var t_n=t_m.m_getType(this.f_xPos,this.f_yPos-1);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<375>";
	var t_s=t_m.m_getType(this.f_xPos,this.f_yPos+1);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<376>";
	var t_e=t_m.m_getType(this.f_xPos+1,this.f_yPos);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<377>";
	var t_w=t_m.m_getType(this.f_xPos-1,this.f_yPos);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<378>";
	var t_en=t_m.m_isEnemyHere(this.f_xPos,this.f_yPos-1);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<379>";
	var t_es=t_m.m_isEnemyHere(this.f_xPos,this.f_yPos+1);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<380>";
	var t_ee=t_m.m_isEnemyHere(this.f_xPos+1,this.f_yPos);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<381>";
	var t_ew=t_m.m_isEnemyHere(this.f_xPos-1,this.f_yPos);
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<383>";
	if(bb_app_Millisecs()>=this.f_movementTime && this.f_isStunned==false){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<385>";
		if(this.f_behaviorMode==0){
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<391>";
			if(this.f_isMoving==false){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<392>";
				this.f_drawXPos=this.f_xPos;
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<393>";
				this.f_drawYPos=this.f_yPos;
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<396>";
			if(this.f_direction==0 && t_m.m_canMoveHere(this.f_xPos,this.f_yPos-1)==true){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<397>";
				if(this.f_xPos==dbg_array(t_pos,0)[dbg_index] && this.f_yPos-1==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<398>";
					t_p.m_injure(1);
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<400>";
					t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<401>";
					this.f_yPos=this.f_yPos-1;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<402>";
					t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<403>";
					if(t_m.m_canMoveHere(this.f_xPos,this.f_yPos-1)==false){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<404>";
						this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
					}
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<406>";
					this.f_isMoving=true;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<407>";
					this.f_moveDirection=0;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<408>";
					this.f_smoothXOffset=0;
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<409>";
					this.f_smoothYOffset=0;
				}
			}else{
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<411>";
				if(this.f_direction==2 && t_m.m_canMoveHere(this.f_xPos,this.f_yPos+1)==true){
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<412>";
					if(this.f_xPos==dbg_array(t_pos,0)[dbg_index] && this.f_yPos+1==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<413>";
						t_p.m_injure(1);
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<415>";
						t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<416>";
						this.f_yPos=this.f_yPos+1;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<417>";
						t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<418>";
						if(t_m.m_canMoveHere(this.f_xPos,this.f_yPos+1)==false){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<419>";
							this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
						}
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<421>";
						this.f_isMoving=true;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<422>";
						this.f_moveDirection=2;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<423>";
						this.f_smoothXOffset=0;
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<424>";
						this.f_smoothYOffset=0;
					}
				}else{
					err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<426>";
					if(this.f_direction==1 && t_m.m_canMoveHere(this.f_xPos+1,this.f_yPos)==true){
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<427>";
						if(this.f_xPos+1==dbg_array(t_pos,0)[dbg_index] && this.f_yPos==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<428>";
							t_p.m_injure(1);
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<430>";
							t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<431>";
							this.f_xPos=this.f_xPos+1;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<432>";
							t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<433>";
							if(t_m.m_canMoveHere(this.f_xPos+1,this.f_yPos)==false){
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<434>";
								this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
							}
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<436>";
							this.f_isMoving=true;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<437>";
							this.f_moveDirection=1;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<438>";
							this.f_smoothXOffset=0;
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<439>";
							this.f_smoothYOffset=0;
						}
					}else{
						err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<441>";
						if(this.f_direction==3 && t_m.m_canMoveHere(this.f_xPos-1,this.f_yPos)==true){
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<442>";
							if(this.f_xPos-1==dbg_array(t_pos,0)[dbg_index] && this.f_yPos==dbg_array(t_pos,1)[dbg_index] && this.f_isStunned==false){
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<443>";
								t_p.m_injure(1);
							}else{
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<445>";
								t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,-1);
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<446>";
								this.f_xPos=this.f_xPos-1;
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<447>";
								t_m.m_setEnemyPresent(this.f_xPos,this.f_yPos,t_eid);
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<448>";
								if(t_m.m_canMoveHere(this.f_xPos-1,this.f_yPos)==false){
									err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<449>";
									this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
								}
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<451>";
								this.f_isMoving=true;
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<452>";
								this.f_moveDirection=3;
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<453>";
								this.f_smoothXOffset=0;
								err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<454>";
								this.f_smoothYOffset=0;
							}
						}else{
							err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<457>";
							this.f_direction=((bb_random_Rnd2(0.0,4.0))|0);
						}
					}
				}
			}
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<459>";
			this.f_movementTime=bb_app_Millisecs()+dbg_array(bb_enemy_ENEMY_SPEEDS,this.f_enemyType)[dbg_index];
		}else{
			err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<460>";
			if(this.f_behaviorMode==1){
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<462>";
				this.m_doChaseMode(t_m,t_p,t_eid);
				err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<463>";
				this.f_movementTime=bb_app_Millisecs()+dbg_array(bb_enemy_ENEMY_SPEEDS,t_difficulty*14*2+14+this.f_enemyType)[dbg_index];
			}
		}
	}
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<468>";
	if(t_m.m_canSeeBetween(this.f_xPos,this.f_yPos,dbg_array(t_pos,0)[dbg_index],dbg_array(t_pos,1)[dbg_index],(dbg_array(bb_enemy_ENEMY_SIGHT_RANGES,this.f_enemyType)[dbg_index]))==true){
		err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<469>";
		this.f_behaviorMode=1;
	}
	pop_err();
	return;
}
bb_enemy_Enemy.prototype.m_getPosition=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<265>";
	var t_=[this.f_xPos,this.f_yPos,this.f_direction];
	pop_err();
	return t_;
}
bb_enemy_Enemy.prototype.m_getType2=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<261>";
	pop_err();
	return this.f_enemyType;
}
bb_enemy_Enemy.prototype.m_getDeadState=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<773>";
	pop_err();
	return this.f_markAsDead;
}
bb_enemy_Enemy.prototype.m_damage=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<727>";
	this.f_numTimesHit=this.f_numTimesHit+1;
	pop_err();
}
bb_enemy_Enemy.prototype.m_stun=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<269>";
	this.f_isStunned=true;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<270>";
	this.f_stunTimer=bb_app_Millisecs()+1000;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<271>";
	this.f_showHitAnim=true;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<272>";
	this.f_hitAnimFrame=0;
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<273>";
	this.f_hitAnimTimer=bb_app_Millisecs()+50;
	pop_err();
	return;
}
bb_enemy_Enemy.prototype.m_getCurrentFrame=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<290>";
	var t_=dbg_array(bb_enemy_ENEMY_FRAMES,this.f_enemyType*16+this.f_currentFrame)[dbg_index];
	pop_err();
	return t_;
}
bb_enemy_Enemy.prototype.m_getSmoothOffsets=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<294>";
	var t_=[this.f_smoothXOffset,this.f_smoothYOffset];
	pop_err();
	return t_;
}
bb_enemy_Enemy.prototype.m_getDrawPosition=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<298>";
	var t_=[this.f_drawXPos,this.f_drawYPos,this.f_direction];
	pop_err();
	return t_;
}
bb_enemy_Enemy.prototype.m_getHp=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<731>";
	var t_=this.f_curHp-this.f_numTimesHit;
	pop_err();
	return t_;
}
bb_enemy_Enemy.prototype.m_getShowHitAnim=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<306>";
	pop_err();
	return this.f_showHitAnim;
}
bb_enemy_Enemy.prototype.m_getHitAnimFrame=function(){
	push_err();
	err_info="E:/dropbox/Dropbox/MazeApp/mapp/enemy.monkey<302>";
	pop_err();
	return this.f_hitAnimFrame;
}
var bb_globals_MAX_ENEMIES_PER_FLOOR;
var bb_enemy_ENEMY_ODDS;
var bb_enemy_ENEMY_HP;
var bb_enemy_ENEMY_SPEEDS;
function bb_app_SaveState(t_state){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/app.monkey<137>";
	var t_=bb_app_device.SaveState(t_state);
	pop_err();
	return t_;
}
var bb_enemy_ENEMY_SIGHT_RANGES;
var bb_globals_ENEMY_SCORES;
function bb_input_GetChar(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/input.monkey<57>";
	var t_=bb_input_device.GetChar();
	pop_err();
	return t_;
}
function bb_input_MouseHit(t_button){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/input.monkey<80>";
	var t_=bb_input_device.KeyHit(1+t_button);
	pop_err();
	return t_;
}
function bb_input_TouchHit(t_index){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/input.monkey<97>";
	var t_=bb_input_device.KeyHit(384+t_index);
	pop_err();
	return t_;
}
function bb_input_KeyHit(t_key){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/input.monkey<53>";
	var t_=bb_input_device.KeyHit(t_key);
	pop_err();
	return t_;
}
function bb_input_KeyDown(t_key){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/input.monkey<49>";
	var t_=bb_input_device.KeyDown(t_key);
	pop_err();
	return t_;
}
var bb_globals_ITEM_VALUES;
var bb_globals_CONSUMABLE_ITEM_VALUES;
function bb_graphics_DebugRenderDevice(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<48>";
	if(!((bb_graphics_renderDevice)!=null)){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<48>";
		error("Rendering operations can only be performed inside OnRender");
	}
	pop_err();
	return 0;
}
function bb_graphics_Cls(t_r,t_g,t_b){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<354>";
	bb_graphics_DebugRenderDevice();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<356>";
	bb_graphics_renderDevice.Cls(t_r,t_g,t_b);
	pop_err();
	return 0;
}
function bb_graphics_PushMatrix(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<310>";
	var t_sp=dbg_object(bb_graphics_context).f_matrixSp;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<311>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+0)[dbg_index]=dbg_object(bb_graphics_context).f_ix
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<312>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+1)[dbg_index]=dbg_object(bb_graphics_context).f_iy
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<313>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+2)[dbg_index]=dbg_object(bb_graphics_context).f_jx
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<314>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+3)[dbg_index]=dbg_object(bb_graphics_context).f_jy
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<315>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+4)[dbg_index]=dbg_object(bb_graphics_context).f_tx
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<316>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+5)[dbg_index]=dbg_object(bb_graphics_context).f_ty
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<317>";
	dbg_object(bb_graphics_context).f_matrixSp=t_sp+6;
	pop_err();
	return 0;
}
function bb_graphics_Transform(t_ix,t_iy,t_jx,t_jy,t_tx,t_ty){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<331>";
	var t_ix2=t_ix*dbg_object(bb_graphics_context).f_ix+t_iy*dbg_object(bb_graphics_context).f_jx;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<332>";
	var t_iy2=t_ix*dbg_object(bb_graphics_context).f_iy+t_iy*dbg_object(bb_graphics_context).f_jy;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<333>";
	var t_jx2=t_jx*dbg_object(bb_graphics_context).f_ix+t_jy*dbg_object(bb_graphics_context).f_jx;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<334>";
	var t_jy2=t_jx*dbg_object(bb_graphics_context).f_iy+t_jy*dbg_object(bb_graphics_context).f_jy;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<335>";
	var t_tx2=t_tx*dbg_object(bb_graphics_context).f_ix+t_ty*dbg_object(bb_graphics_context).f_jx+dbg_object(bb_graphics_context).f_tx;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<336>";
	var t_ty2=t_tx*dbg_object(bb_graphics_context).f_iy+t_ty*dbg_object(bb_graphics_context).f_jy+dbg_object(bb_graphics_context).f_ty;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<337>";
	bb_graphics_SetMatrix(t_ix2,t_iy2,t_jx2,t_jy2,t_tx2,t_ty2);
	pop_err();
	return 0;
}
function bb_graphics_Transform2(t_m){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<327>";
	bb_graphics_Transform(dbg_array(t_m,0)[dbg_index],dbg_array(t_m,1)[dbg_index],dbg_array(t_m,2)[dbg_index],dbg_array(t_m,3)[dbg_index],dbg_array(t_m,4)[dbg_index],dbg_array(t_m,5)[dbg_index]);
	pop_err();
	return 0;
}
function bb_graphics_Translate(t_x,t_y){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<341>";
	bb_graphics_Transform(1.0,0.0,0.0,1.0,t_x,t_y);
	pop_err();
	return 0;
}
function bb_graphics_PopMatrix(){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<321>";
	var t_sp=dbg_object(bb_graphics_context).f_matrixSp-6;
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<322>";
	bb_graphics_SetMatrix(dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+0)[dbg_index],dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+1)[dbg_index],dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+2)[dbg_index],dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+3)[dbg_index],dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+4)[dbg_index],dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+5)[dbg_index]);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<323>";
	dbg_object(bb_graphics_context).f_matrixSp=t_sp;
	pop_err();
	return 0;
}
function bb_graphics_DrawImage(t_image,t_x,t_y,t_frame){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<417>";
	bb_graphics_DebugRenderDevice();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<419>";
	var t_f=dbg_array(dbg_object(t_image).f_frames,t_frame)[dbg_index];
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<421>";
	if((dbg_object(bb_graphics_context).f_tformed)!=0){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<422>";
		bb_graphics_PushMatrix();
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<424>";
		bb_graphics_Translate(t_x-dbg_object(t_image).f_tx,t_y-dbg_object(t_image).f_ty);
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<426>";
		bb_graphics_context.m_Validate();
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<428>";
		if((dbg_object(t_image).f_flags&65536)!=0){
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<429>";
			bb_graphics_renderDevice.DrawSurface(dbg_object(t_image).f_surface,0.0,0.0);
		}else{
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<431>";
			bb_graphics_renderDevice.DrawSurface2(dbg_object(t_image).f_surface,0.0,0.0,dbg_object(t_f).f_x,dbg_object(t_f).f_y,dbg_object(t_image).f_width,dbg_object(t_image).f_height);
		}
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<434>";
		bb_graphics_PopMatrix();
	}else{
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<436>";
		bb_graphics_context.m_Validate();
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<438>";
		if((dbg_object(t_image).f_flags&65536)!=0){
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<439>";
			bb_graphics_renderDevice.DrawSurface(dbg_object(t_image).f_surface,t_x-dbg_object(t_image).f_tx,t_y-dbg_object(t_image).f_ty);
		}else{
			err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<441>";
			bb_graphics_renderDevice.DrawSurface2(dbg_object(t_image).f_surface,t_x-dbg_object(t_image).f_tx,t_y-dbg_object(t_image).f_ty,dbg_object(t_f).f_x,dbg_object(t_f).f_y,dbg_object(t_image).f_width,dbg_object(t_image).f_height);
		}
	}
	pop_err();
	return 0;
}
function bb_graphics_Rotate(t_angle){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<349>";
	bb_graphics_Transform(Math.cos((t_angle)*D2R),-Math.sin((t_angle)*D2R),Math.sin((t_angle)*D2R),Math.cos((t_angle)*D2R),0.0,0.0);
	pop_err();
	return 0;
}
function bb_graphics_Scale(t_x,t_y){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<345>";
	bb_graphics_Transform(t_x,0.0,0.0,t_y,0.0,0.0);
	pop_err();
	return 0;
}
function bb_graphics_DrawImage2(t_image,t_x,t_y,t_rotation,t_scaleX,t_scaleY,t_frame){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<448>";
	bb_graphics_DebugRenderDevice();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<450>";
	var t_f=dbg_array(dbg_object(t_image).f_frames,t_frame)[dbg_index];
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<452>";
	bb_graphics_PushMatrix();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<454>";
	bb_graphics_Translate(t_x,t_y);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<455>";
	bb_graphics_Rotate(t_rotation);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<456>";
	bb_graphics_Scale(t_scaleX,t_scaleY);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<458>";
	bb_graphics_Translate(-dbg_object(t_image).f_tx,-dbg_object(t_image).f_ty);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<460>";
	bb_graphics_context.m_Validate();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<462>";
	if((dbg_object(t_image).f_flags&65536)!=0){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<463>";
		bb_graphics_renderDevice.DrawSurface(dbg_object(t_image).f_surface,0.0,0.0);
	}else{
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<465>";
		bb_graphics_renderDevice.DrawSurface2(dbg_object(t_image).f_surface,0.0,0.0,dbg_object(t_f).f_x,dbg_object(t_f).f_y,dbg_object(t_image).f_width,dbg_object(t_image).f_height);
	}
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<468>";
	bb_graphics_PopMatrix();
	pop_err();
	return 0;
}
function bb_graphics_DrawImageRect(t_image,t_x,t_y,t_srcX,t_srcY,t_srcWidth,t_srcHeight,t_frame){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<473>";
	bb_graphics_DebugRenderDevice();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<475>";
	var t_f=dbg_array(dbg_object(t_image).f_frames,t_frame)[dbg_index];
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<477>";
	if((dbg_object(bb_graphics_context).f_tformed)!=0){
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<478>";
		bb_graphics_PushMatrix();
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<481>";
		bb_graphics_Translate(-dbg_object(t_image).f_tx+t_x,-dbg_object(t_image).f_ty+t_y);
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<483>";
		bb_graphics_context.m_Validate();
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<485>";
		bb_graphics_renderDevice.DrawSurface2(dbg_object(t_image).f_surface,0.0,0.0,t_srcX+dbg_object(t_f).f_x,t_srcY+dbg_object(t_f).f_y,t_srcWidth,t_srcHeight);
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<487>";
		bb_graphics_PopMatrix();
	}else{
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<489>";
		bb_graphics_context.m_Validate();
		err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<491>";
		bb_graphics_renderDevice.DrawSurface2(dbg_object(t_image).f_surface,-dbg_object(t_image).f_tx+t_x,-dbg_object(t_image).f_ty+t_y,t_srcX+dbg_object(t_f).f_x,t_srcY+dbg_object(t_f).f_y,t_srcWidth,t_srcHeight);
	}
	pop_err();
	return 0;
}
function bb_graphics_DrawImageRect2(t_image,t_x,t_y,t_srcX,t_srcY,t_srcWidth,t_srcHeight,t_rotation,t_scaleX,t_scaleY,t_frame){
	push_err();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<497>";
	bb_graphics_DebugRenderDevice();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<499>";
	var t_f=dbg_array(dbg_object(t_image).f_frames,t_frame)[dbg_index];
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<501>";
	bb_graphics_PushMatrix();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<503>";
	bb_graphics_Translate(t_x,t_y);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<504>";
	bb_graphics_Rotate(t_rotation);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<505>";
	bb_graphics_Scale(t_scaleX,t_scaleY);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<506>";
	bb_graphics_Translate(-dbg_object(t_image).f_tx,-dbg_object(t_image).f_ty);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<508>";
	bb_graphics_context.m_Validate();
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<510>";
	bb_graphics_renderDevice.DrawSurface2(dbg_object(t_image).f_surface,0.0,0.0,t_srcX+dbg_object(t_f).f_x,t_srcY+dbg_object(t_f).f_y,t_srcWidth,t_srcHeight);
	err_info="F:/Monkey/MonkeyPro66/modules/mojo/graphics.monkey<512>";
	bb_graphics_PopMatrix();
	pop_err();
	return 0;
}
var bb_enemy_ENEMY_FRAMES;
var bb_globals_HIGH_SCORE_RANK_X_POSITIONS;
var bb_globals_HIGH_SCORE_RANK_Y_POSITIONS;
function bbInit(){
	bb_graphics_device=null;
	bb_input_device=null;
	bb_audio_device=null;
	bb_app_device=null;
	bb_graphics_Image_DefaultFlags=0;
	bb_graphics_context=bb_graphics_GraphicsContext_new.call(new bb_graphics_GraphicsContext);
	bb_graphics_renderDevice=null;
	bb_random_Seed=1234;
	bb_globals_CONSUMABLE_RARITY=[175,275,350,600,750,850,865,875,880,970,990,1000];
	bb_globals_ITEM_ODDS=[450,650,770,850,905,955,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1000,10,25,50,100,175,300,475,675,825,905,960,976,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1000,10,20,30,40,50,65,95,145,225,325,445,585,708,808,888,938,968,978,985,988,989,990,991,992,993,994,995,996,997,998,999,1000,10,20,30,40,50,60,70,82,97,112,132,162,212,282,382,482,602,702,802,872,932,972,987,992,993,994,995,996,997,998,999,1000,10,20,30,40,50,60,75,95,115,135,155,180,210,240,280,330,390,465,545,665,745,815,875,925,965,985,995,996,997,998,999,1000,10,20,30,40,50,60,75,95,125,155,185,215,245,275,305,345,385,425,465,505,555,605,658,718,778,838,888,928,958,978,998,1000];
	bb_globals_MAX_ENEMIES_PER_FLOOR=[15,25,30,35,40];
	bb_enemy_ENEMY_ODDS=[150,300,325,475,500,650,655,805,830,835,990,996,999,1000,131,262,322,453,513,644,654,785,845,855,986,996,999,1000,100,200,300,400,500,600,630,730,830,860,960,990,998,1000,60,120,260,320,460,520,590,650,790,860,920,990,998,1000,20,40,190,210,370,390,510,530,680,800,820,940,990,1000,1,2,152,153,303,304,454,455,605,755,756,906,986,1000];
	bb_enemy_ENEMY_HP=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,2,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,2,1,1,1,1,2,2,2,1,1,1,3,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,2,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,2,2,1,1,1,3,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,3,2,1,1,1,1,3,3,2,2,1,1,4,3,3,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,2,2,2,1,1,1,2,2,2,2,2,1,1,1,1,1,1,1,2,1,1,1,1,1,2,2,1,1,1,1,3,2,2,1,1,1,3,3,2,2,1,1,1,1,1,1,1,1,2,1,1,1,1,1,3,2,2,1,1,1,5,4,4,3,2,1,7,6,5,4,3,2,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,2,1,1,1,1,3,2,2,2,1,1,1,1,1,1,1,1,2,1,1,1,1,1,3,2,1,1,1,1,4,3,2,1,1,1,5,4,3,2,2,1,2,1,1,1,1,1,3,3,2,2,1,1,4,3,3,2,2,1,5,4,3,3,3,2,7,6,5,4,4,3,99,99,99,99,99,3,99,99,99,99,99,4,99,99,99,99,99,5,99,99,99,99,99,6,99,99,99,99,99,7];
	bb_enemy_ENEMY_SPEEDS=[1000,1200,900,1000,900,1000,1000,1200,1200,1200,1000,900,800,600,900,900,900,900,900,900,900,900,900,900,900,900,900,600,1000,1200,900,1000,900,1000,1000,1200,1200,1200,1000,900,800,600,800,800,800,800,800,800,800,800,800,800,800,800,800,600,1000,1200,900,1000,900,1000,1000,1200,1200,1200,1000,900,800,600,700,700,700,700,700,700,700,700,700,700,700,700,700,600,1000,1200,900,1000,900,1000,1000,1200,1200,1200,1000,900,800,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,1000,1200,900,1000,900,1000,1000,1200,1200,1200,1000,900,800,600,400,400,400,400,400,400,400,400,400,400,400,400,400,400];
	bb_enemy_ENEMY_SIGHT_RANGES=[4,4,4,4,4,4,4,4,4,4,4,4,4,4];
	bb_globals_ENEMY_SCORES=[25,50,100,50,100,50,250,25,100,500,50,250,1000,5000];
	bb_globals_ITEM_VALUES=[1,2,3,5,7,10,15,20,25,35,45,60,75,100,125,150,175,200,240,280,325,375,450,550,650,800,1000,1200,1500,1900,2400,10000];
	bb_globals_CONSUMABLE_ITEM_VALUES=[50,200,500,100,200,400,50,100,250,50,200,500];
	bb_enemy_ENEMY_FRAMES=[0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,0,0,0,0,0,0,1,2,3,4,5,6,7,0,0,0,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,0,0,0,1,2,3,4,5,6,7,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,0,0,0,0,0,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7];
	bb_globals_HIGH_SCORE_RANK_X_POSITIONS=[136,181,336,423,529];
	bb_globals_HIGH_SCORE_RANK_Y_POSITIONS=[132,154,176,198,220,242,264,286,308,330];
}
//${TRANSCODE_END}
