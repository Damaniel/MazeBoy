'-----------------------------------------------------------------------------------------------
' titlemazemanager.monkey
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

Class TitleMazeManager

Private

	'
	' The sequence of movements that the player sprite will make while exposing
	' the title screen.  Each set of numbers (this is actually a linear array)
	' represents the next square that the player will move to (x,y,dir).  If x is 
	' equal to 100, then z represents the direction that the player should face
	' and bomb (this is to reach the insides of the letters). The fourth field
	' represents the amount of 'lighted' area that should be drawn
	'
	Field movements:Int[] = [ 0, 1,  DIRECTION_SOUTH,  4,
							  0, 2,  DIRECTION_SOUTH,  4,
							  0, 3,  DIRECTION_SOUTH,  4,
							  0, 4,  DIRECTION_SOUTH,  4,
							  0, 5,  DIRECTION_SOUTH,  4,
							  0, 6,  DIRECTION_SOUTH,  4,
							  0, 7,  DIRECTION_SOUTH,  4,
							  0, 8,  DIRECTION_SOUTH,  4,
							  0, 9,  DIRECTION_SOUTH,  4,
							  0, 10, DIRECTION_EAST,   4,     ' 10
							  1, 10, DIRECTION_EAST,   4,
							  2, 10, DIRECTION_EAST,   4,
							  3, 10, DIRECTION_EAST,   4,
							  4, 10, DIRECTION_NORTH,  4,
							  4, 9,  DIRECTION_NORTH,  4,
							  4, 8,  DIRECTION_NORTH,  4,
							  4, 7,  DIRECTION_NORTH,  4,
							  4, 6,  DIRECTION_NORTH,  4,
							  4, 5,  DIRECTION_SOUTH,  4,
							  4, 6,  DIRECTION_SOUTH,  4,     ' 20
							  4, 7,  DIRECTION_EAST,   4,
							  5, 7,  DIRECTION_EAST,   4,
							  6, 7,  DIRECTION_SOUTH,  4,
							  6, 8,  DIRECTION_SOUTH,  4,
							  6, 9,  DIRECTION_SOUTH,  4,
							  6, 10, DIRECTION_WEST,   4,
							  5, 10, DIRECTION_WEST,   4,
							  4, 10, DIRECTION_WEST,   4,
							  3, 10, DIRECTION_WEST,   4,
							  2, 10, DIRECTION_SOUTH,  4,     ' 30
							  2, 11, DIRECTION_SOUTH,  4,
							  2, 12, DIRECTION_SOUTH,  4,
							  2, 13, DIRECTION_SOUTH,  4,
							  2, 14, DIRECTION_EAST,   4, 
							  3, 14, DIRECTION_SOUTH,  4,
							  3, 15, DIRECTION_WEST,   4,
							  2, 15, DIRECTION_SOUTH,  4,
							  2, 16, DIRECTION_SOUTH,  4,
							  2, 17, DIRECTION_SOUTH,  4,
							  2, 18, DIRECTION_SOUTH,  4,     ' 40
							  2, 19, DIRECTION_EAST,   4,
							  3, 19, DIRECTION_EAST,   4,     
							  4, 19, DIRECTION_EAST,   4,
							  5, 19, DIRECTION_EAST,   4,
							  6, 19, DIRECTION_EAST,   4,
							  7, 19, DIRECTION_EAST,   4,
							  8, 19, DIRECTION_EAST,   4,
							  9, 19, DIRECTION_EAST,   4,
							  10, 19, DIRECTION_EAST,  4,
							  11, 19, DIRECTION_NORTH, 4,     ' 50
							  11, 18, DIRECTION_NORTH, 4, 
							  11, 17, DIRECTION_NORTH, 4,     
							  11, 16, DIRECTION_NORTH, 4,
							  11, 15, DIRECTION_NORTH, 4,
							  11, 14, DIRECTION_WEST,  4,
							  10, 14, DIRECTION_EAST,  4,
							  11, 14, DIRECTION_NORTH, 4,
							  11, 13, DIRECTION_NORTH, 4,
							  11, 12, DIRECTION_NORTH, 4,
							  11, 11, DIRECTION_NORTH, 4,    ' 60
							  11, 10, DIRECTION_NORTH, 4,
							  11, 9,  DIRECTION_WEST,  4,       
							  10, 9, DIRECTION_WEST,   4,
							  9,  9, DIRECTION_NORTH,  4,
							  9,  8, DIRECTION_NORTH,  4,
							  9,  7, DIRECTION_NORTH,  4,
							  9,  6, DIRECTION_NORTH,  4,
							  9,  5, DIRECTION_NORTH,  4,
							  9,  4, DIRECTION_NORTH,  4, 
							  9,  3, DIRECTION_NORTH,  4,     ' 70
							  9,  2, DIRECTION_NORTH,  4,
							  9,  1, DIRECTION_NORTH,  4,        
							  9,  0, DIRECTION_EAST,   4,
							  10, 0, DIRECTION_EAST,   4,
							  11, 0, DIRECTION_EAST,   4,
							  12, 0, DIRECTION_EAST,   4,
							  13, 0, DIRECTION_EAST,   4,
							  14, 0, DIRECTION_EAST,   4,
							  15, 0, DIRECTION_SOUTH,  4, 
							  15, 1, DIRECTION_EAST,   4,     ' 80
							  16, 1, DIRECTION_SOUTH,  4,
							  16, 2, DIRECTION_SOUTH,  4,       
							  16, 3, DIRECTION_SOUTH,  4, 
							  16, 4, DIRECTION_SOUTH,  4,
							  16, 5, DIRECTION_SOUTH,  4,
							  16, 6, DIRECTION_SOUTH,  4,
							  16, 7, DIRECTION_SOUTH,  4,
							  16, 8, DIRECTION_SOUTH,  4,
							  16, 9, DIRECTION_SOUTH,  4,
							  16, 10, DIRECTION_EAST,  4,     ' 90
							  17, 10, DIRECTION_EAST,  4,
							  18, 10, DIRECTION_EAST,  4,
							  19, 10, DIRECTION_EAST,  4,
							  20, 10, DIRECTION_SOUTH, 4,
							  20, 11, DIRECTION_SOUTH, 4,
							  20, 12, DIRECTION_SOUTH, 4, 
							  20, 13, DIRECTION_SOUTH, 4,
							  20, 14, DIRECTION_SOUTH, 4, 
							  20, 15, DIRECTION_SOUTH, 4,
							  20, 16, DIRECTION_EAST,  4,    ' 100 
							  21, 16, DIRECTION_SOUTH, 4,
							  21, 17, DIRECTION_SOUTH, 4,
							  21, 18, DIRECTION_SOUTH, 4,
							  21, 19, DIRECTION_EAST,  4,
							  22, 19, DIRECTION_EAST,  4,
							  23, 19, DIRECTION_EAST,  4,
							  24, 19, DIRECTION_EAST,  4,
							  25, 19, DIRECTION_EAST,  4,
							  26, 19, DIRECTION_EAST,  4,
							  27, 19, DIRECTION_EAST,  4,    ' 110
							  28, 19, DIRECTION_NORTH, 4, 
							  28, 18, DIRECTION_NORTH, 4,
							  28, 17, DIRECTION_NORTH, 4,
							  28, 16, DIRECTION_NORTH, 4,	
							  28, 15, DIRECTION_NORTH, 4,	
							  28, 14, DIRECTION_NORTH, 4,	
							  28, 13, DIRECTION_NORTH, 4,	
							  28, 12, DIRECTION_NORTH, 4,	
							  28, 11, DIRECTION_NORTH, 4,	
							  28, 10, DIRECTION_EAST,  4,    ' 120
							  29, 10, DIRECTION_EAST,  4,
							  30, 10, DIRECTION_EAST,  4,
							  31, 10, DIRECTION_NORTH, 4,
							  31, 9, DIRECTION_NORTH,  4,
							  31, 8, DIRECTION_NORTH,  4,
							  31, 7, DIRECTION_NORTH,  4,
							  31, 6, DIRECTION_NORTH,  4,
							  31, 5, DIRECTION_NORTH,  4,
							  31, 4, DIRECTION_NORTH,  4,
							  31, 3, DIRECTION_NORTH,  4, 	 ' 130
							  31, 2, DIRECTION_NORTH,  4,
							  31, 1, DIRECTION_NORTH,  4,
							  31, 0, DIRECTION_WEST,   4,
							  30, 0, DIRECTION_WEST,   4,
							  29, 0, DIRECTION_WEST,   4,
							  28, 0, DIRECTION_WEST,   4,
							  27, 0, DIRECTION_WEST,   4,
							  26, 0, DIRECTION_WEST,   4,
							  25, 0, DIRECTION_WEST,   4,
							  24, 0, DIRECTION_SOUTH,  4,     ' 140 
							  24, 1, DIRECTION_SOUTH,  4, 
							  24, 2, DIRECTION_SOUTH,  4,
							  24, 3, DIRECTION_SOUTH,  4,
							  24, 4, DIRECTION_SOUTH,  4,
							  24, 5, DIRECTION_SOUTH,  4,
							  24, 6, DIRECTION_SOUTH,  4,
							  24, 7, DIRECTION_SOUTH,  4,
							  24, 8, DIRECTION_SOUTH,  4,
							  24, 9, DIRECTION_WEST,   4,
							  23, 9, DIRECTION_WEST,   4,     ' 150
							  22, 9, DIRECTION_WEST,   4,
							  21, 9, DIRECTION_WEST,   4,
							  20, 9, DIRECTION_WEST,   4,
							  19, 9, DIRECTION_WEST,   4,
							  18, 9, DIRECTION_WEST,   4,
							  17, 9, DIRECTION_NORTH,  4,
							  17, 8, DIRECTION_NORTH,  4,
							  17, 7, DIRECTION_NORTH,  4,
							  17, 6, DIRECTION_NORTH,  4,
							  17, 5, DIRECTION_NORTH,  4,     ' 160
							  17, 4, DIRECTION_NORTH,  4,
							  17, 3, DIRECTION_NORTH,  4,
							  17, 2, DIRECTION_NORTH,  4,
							  17, 1, DIRECTION_NORTH,  4,
							  17, 0, DIRECTION_WEST,   4,
							  16, 0, DIRECTION_WEST,   4,
							  15, 0, DIRECTION_WEST,   4,
							  14, 0, DIRECTION_WEST,   4,
							  13, 0, DIRECTION_WEST,   4,
							  12, 0, DIRECTION_WEST,   4,     ' 170
							  11, 0, DIRECTION_WEST,   4,
							  10, 0, DIRECTION_WEST,   4,
							  9, 0, DIRECTION_WEST,    4,
							  8, 0, DIRECTION_WEST,    4,
							  7, 0, DIRECTION_WEST,    4,
							  6, 0, DIRECTION_WEST,    4,
							  5, 0, DIRECTION_WEST,    4,
							  4, 0, DIRECTION_WEST,    4,
							  3, 0, DIRECTION_WEST,    4,
							  2, 0, DIRECTION_WEST,    4,     ' 180
							  1, 0, DIRECTION_WEST,    4,
							  0, 0, DIRECTION_SOUTH,   4]
							
	Field hiddenSquares:Bool[]
	Field currentMovement:Int
	Field frameTimer:Int
	Field sprite:Image
	Field bg:Image
	Field readyToDraw:Bool
	Field motionWaitTimer:Int
	
	
Public

	'----------------------------------------------------------------------------------
	' getPlayerPosition - return the position and direction of the mini player sprite
	'----------------------------------------------------------------------------------		
	Method getPlayerPosition:Int[]()
		Return [ movements[currentMovement * 4], 
		         movements[currentMovement * 4 + 1], 
		         movements[currentMovement * 4 + 2],
		         movements[currentMovement * 4 + 3]]
	End
	
	'----------------------------------------------------------------------------------
	' processAnimation - handle frame duration time and movement position
	'----------------------------------------------------------------------------------		
	Method processAnimation:Void()
		If readyToDraw = False
			If Millisecs() > = motionWaitTimer
				readyToDraw = True
			Endif
		Elseif readyToDraw = True
			If Millisecs() >= frameTimer
				currentMovement = currentMovement + 1
				If currentMovement >= TITLE_NUM_SPRITE_MOVEMENTS
					currentMovement = 0
				Endif
				exposeMazePieces()
				frameTimer = Millisecs() + TITLE_SPRITE_TIME_PER_MOVEMENT
			Endif
		Endif
		Return
	End

	Method getBackground:Image()
		Return bg
	End
	
	Method getSprite:Image()
		Return sprite
	End
	
	Method init:Void()
		currentMovement = 0
		motionWaitTimer = Millisecs() + TITLE_MOTION_WAIT_TIMER
		readyToDraw = False
		For Local i:Int = 0 To TITLE_TILES_WIDTH - 1
			For Local j:Int = 0 To TITLE_TILES_HEIGHT - 1
				hiddenSquares[(j * TITLE_TILES_WIDTH) + i] = True
			Next
		Next
		exposeMazePieces()		
	End
	
	Method isReadyToDraw:Bool()
		Return readyToDraw
	End
	
	Method isHidden:Bool(x:Int, y:Int)
		Return hiddenSquares[(y * TITLE_TILES_WIDTH) + x]
	End
	
	'
	' This is almost an exact copy and paste of the method from the player class.
	' Bad, bad bad. 
	'
	Method exposeMazePieces:Void()

		Local px:Int = movements[currentMovement * 4]
		Local py:Int = movements[currentMovement * 4 + 1]
		Local lighting:Int = movements[currentMovement * 4 + 3]
		
		' used to mark the squares immediately surrounding the player
		Local xStart:Int = px - lighting
		Local xEnd:Int = px + lighting
		Local yStart:Int = py - lighting
		Local yEnd:Int = py + lighting
		
		' Check to make sure that the areas being checked are all in the maze.  Clip them if
		' they're not.
		If xStart < 0 
			xStart = 0
		Endif
		If xEnd > TITLE_TILES_WIDTH - 1
			xEnd = TITLE_TILES_WIDTH - 1
		Endif
		If yStart < 0
			yStart = 0
		Endif
		If yEnd > TITLE_TILES_HEIGHT - 1
			yEnd = TITLE_TILES_HEIGHT - 1
		Endif
		
		' Mark the squares immediately surrounding the player as visible
		For Local i:Int = xStart To xEnd
			For Local j:Int = yStart To yEnd
				hiddenSquares[(j * TITLE_TILES_WIDTH) + i] = False
			Next
		Next
		
		Return	
	End	
	
	'----------------------------------------------------------------------------------
	' New - constructor
	'----------------------------------------------------------------------------------	
	Method New()
		bg = LoadImage("title.png")
		sprite = LoadImage("boymini.png")
		hiddenSquares = New Bool[TITLE_TILES_WIDTH * TITLE_TILES_HEIGHT]
	End	
							
End

