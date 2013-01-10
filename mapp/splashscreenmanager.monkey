'-----------------------------------------------------------------------------------------------
' splashscreenmanager.monkey
'-----------------------------------------------------------------------------------------------
' Copyright 2011 Holy Meatgoat Software. All rights reserved.
'
' Redistribution and use in source And binary forms, with or without modification, are
' permitted provided that the following conditions are met:
'
'   1. Redistributions of source code must retain the above copyright notice, this list of
'      conditions and the following disclaimer.
'
'   2. Redistributions in binary form must reproduce the above copyright notice, this list
'      of conditions and the following disclaimer in the documentation and/or other materials
'      provided with the distribution.
'
' THIS SOFTWARE IS PROVIDED BY HOLY MEATGOAT SOFTWARE ``AS IS'' AND ANY EXPRESS OR IMPLIED
' WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
' FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL HOLY MEATGOAT SOFTWARE OR
' CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
' CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
' SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
' ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
' NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
' ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
'-----------------------------------------------------------------------------------------------
Strict

Import mojo
Import globals

Class SplashScreenManager

Private

	Field topXPosition:Int
	Field bottomXPosition:Int
	Field frameTimer:Int
	Field splash:Image
	Field frameSpeed:Int
	Field showMainSplash:Bool
	Field secondarySplashTimer:Int
	Field splashAlpha:Float
	
Public

	Method getBarPositions:Int[]()
		Return [topXPosition, bottomXPosition]
	End
	
	Method drawMainSplash:Bool()
		If Millisecs() >= secondarySplashTimer
			Return showMainSplash
		Endif
		Return False
	End
	
	'----------------------------------------------------------------------------------
	' processAnimation - handle frame duration time and movement position
	'----------------------------------------------------------------------------------		
	Method processAnimation:Void()
		If showMainSplash = False
			If Millisecs() >= frameTimer
				topXPosition = topXPosition - frameSpeed
				bottomXPosition = bottomXPosition + frameSpeed
				If topXPosition < 0
					topXPosition = 0
					showMainSplash = True
					secondarySplashTimer = Millisecs() + SPLASH_SECONDARY_WAIT_TIME
				Endif
				If bottomXPosition > 0
					bottomXPosition = 0
					showMainSplash = True
					secondarySplashTimer = Millisecs() + SPLASH_SECONDARY_WAIT_TIME					
				Endif
				frameSpeed = frameSpeed + 3
				frameTimer = Millisecs() + SPLASH_SCREEN_BARS_FRAME_TIME
			Endif
		Endif
		Return
	End

    Method getSplashAlpha:Float()
		Return splashAlpha
	End
	
	Method setSplashAlpha:Void(f:Float)
		splashAlpha = f
		Return
	End
	
	Method getBackground:Image()
		Return splash
	End
	
	Method init:Void()
       topXPosition = SCREEN_WIDTH
	   bottomXPosition = -1 * SCREEN_WIDTH
   	   frameTimer = Millisecs() + SPLASH_SCREEN_BARS_FRAME_TIME
	   frameSpeed = 8
	   showMainSplash = False
	   splashAlpha = 0.0
	End
	
	'----------------------------------------------------------------------------------
	' New - constructor
	'----------------------------------------------------------------------------------	
	Method New()
		splash = LoadImage("holygoat.png")	
	End	
							
End


