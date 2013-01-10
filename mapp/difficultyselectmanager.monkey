'-----------------------------------------------------------------------------------------------
' difficultyselectmanager.monkey
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

Class DifficultySelectManager

Private

	Field frameSpeed:Int       ' tbd
	Field frameTimer:Int       ' tbd
	
	Field selectBox:Image 
	Field selectIcon:Image
	Field descBox:Image[] 
	
Public

	'----------------------------------------------------------------------------------
	' processAnimation - handle frame duration time and movement position
	'----------------------------------------------------------------------------------		
	Method processAnimation:Void()
		Return
	End

	Method getBackground:Image()
		Return selectBox
	End
	
	Method getSelectIcon:Image()
		Return selectIcon
	End
	
	Method getDifficultyImg:Image(difficulty:Int)
		Return descBox[difficulty]
	End
	
	Method init:Void()
		Return
	End
	
	'----------------------------------------------------------------------------------
	' New - constructor
	'----------------------------------------------------------------------------------	
	Method New()
		descBox = New Image[DIFFICULTY_NUM_DIFFICULTIES]
		
		selectBox = LoadImage("difficultybox.png")
		selectIcon = LoadImage("selecticon.png")
		descBox[DIFFICULTY_VERY_EASY] = LoadImage("veryeasy.png")
		descBox[DIFFICULTY_EASY] = LoadImage("easy.png")
		descBox[DIFFICULTY_NORMAL] = LoadImage("normal.png")
		descBox[DIFFICULTY_HARD] = LoadImage("hard.png")
		descBox[DIFFICULTY_INSANE] = LoadImage("veryhard.png")
	End	
							
End



