'-----------------------------------------------------------------------------------------------
' player.monkey
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
Import maze

'==================================================================================
' Player - represents the human-controlled player
'==================================================================================
Class Player

Private
	
	Field score:Int				' Current score
	Field itemsCollected:Int    ' Number of scored items collected, including scored consumable items.  
	Field maxDepth:Int
	Field hp:Int				' Current HP
	Field swords:Int			' Current AT
	Field strength:Int			' Current ST
	Field bombs:Int				' Current bombs
	Field mazeX:Int				' x position in the maze
	Field mazeY:Int				' y position in the maze
	Field direction:Int			' the direction the player is facing
	
	' sprite related stuff
	Field sprite:Image          ' the player's sprite strip
	Field frame:Int             ' the current frame of the animation
	Field animTimer:Int         ' the current timer for the animation frame
	Field isAnimating:Bool      ' determines whether the frame should animate or not
	Field animStopTimer:Int     ' timer representing how long of a delay there 
	                            ' should be between the last button press and the
	                            ' stopping of the animation
	
	Field isShowingScore:Bool   ' Is the score for the current item
	Field scorePosOffset:Int    ' The position of the score relative to the character
	Field scoreToShow:Int       ' The score to display
	Field scoreShowTimer:Int    ' The timer
	Field scorePosSpeed:Float
	
	Field hitAnimFrame:Int
	Field hitAnimTimer:Int
	Field showHitAnim:Bool	
	
Public

	Const AnimDuration:Int = 250            ' time between frame transitions
	Const AnimTimeoutDuration:Int = 350     ' idle time before animations stop
    Const AnimScoreDuration:Int = 30	    ' speed of score animation
	Const NumFrames:Int =  4                ' Number of frames of player animation 
	Const SpriteWidth:Int = 48              ' size of the sprite images
	
	'----------------------------------------------------------------------------------
	' init - reset all player attributes to their defaults
	'----------------------------------------------------------------------------------	
	Method init:Void()
		score = 0
		hp = PLAYER_MAX_HP
		swords = PLAYER_MAX_SWORDS
		strength = 1
		bombs = PLAYER_MAX_BOMBS
		mazeX = 1
		mazeY = 1
		frame = 0
		isAnimating = False
		direction = DIRECTION_SOUTH
		isShowingScore = False
		scorePosOffset = 0
		itemsCollected = 0
		maxDepth = 1
		Return 
	End
	
	Method getItemsCollected:Int()
		Return itemsCollected
	End
	
	Method incrementItemsCollected:Void()
		itemsCollected = itemsCollected + 1
	End
	
	Method getMaxDepth:Int()
		Return maxDepth
	End
	
	Method setMaxDepth:Void(depth:Int)
		maxDepth = depth
	End
	
	'----------------------------------------------------------------------------------
	' turnOffAnimation - turns the player's current animation off
	'----------------------------------------------------------------------------------		
	Method turnOffAnimation:Void()
		If isAnimating = True
			isAnimating = False
			frame = 0
		Endif		
		Return
	End

	'----------------------------------------------------------------------------------
	' turnOnAnimation - turns the player's current animation on
	'----------------------------------------------------------------------------------	
	Method turnOnAnimation:Void()
		If isAnimating = False
			isAnimating = True
		Endif		
		animStopTimer = Millisecs() + AnimTimeoutDuration ' set the initial frame timer
		Return
	End
	
	Method getHitAnimFrame:Int()
		Return hitAnimFrame
	End
	
	Method getShowHitAnim:Bool()
		Return showHitAnim
	End
		
	'----------------------------------------------------------------------------------
	' processAnimation - called by MazeApp's onUpdate function; used to update the
	'  player's current animation frame when needed.
	'----------------------------------------------------------------------------------		
	Method processAnimation:Void()
		If isIdleTimerComplete() = True
			turnOffAnimation()
		Endif
		If showHitAnim = True And Millisecs() > hitAnimTimer
			hitAnimFrame  = hitAnimFrame + 1
			If hitAnimFrame >= NUM_HIT_ANIM_FRAMES
				showHitAnim = False
			Endif
			hitAnimTimer = Millisecs() + PLAYER_HIT_FRAME_TIME
		Endif		
		If isShowingScore = True
			If Millisecs() > scoreShowTimer
				scorePosOffset = scorePosOffset - scorePosSpeed
				scorePosSpeed = scorePosSpeed * 1.25
				If(scorePosSpeed > (UI_BLOCK_SIZE / 9.0))
					scorePosSpeed = (UI_BLOCK_SIZE / 9.0)
				Endif
				If scorePosOffset < -1 * (UI_BLOCK_SIZE * 2)
					isShowingScore = False
					scorePosOffset = 0
				Endif
				scoreShowTimer = Millisecs() + AnimScoreDuration
			Endif
		Endif
		If isAnimTimerComplete() = True And isAnimating = True
			frame = frame + 1
			If frame >= NumFrames
				frame = 0
			Endif
			startAnimTimer()
		Endif		
		Return
	End
	
	
	'----------------------------------------------------------------------------------
	' getSpriteWidth - accessor for 'spriteWidth'
	'----------------------------------------------------------------------------------		
	Method getSpriteWidth:Int()
		Return SpriteWidth
	End

	'----------------------------------------------------------------------------------
	' getSprite - accessor for the 'sprite' Image object
	'----------------------------------------------------------------------------------				
	Method getSprite:Image()
		Return sprite
	End

	'----------------------------------------------------------------------------------
	' getFrame - accessor for 'frame'
	'----------------------------------------------------------------------------------					
	Method getFrame:Int()
		Return frame
	End

	'----------------------------------------------------------------------------------
	' getHp - accessor for 'hp'
	'----------------------------------------------------------------------------------	
	Method getHp:Int()
		Return hp
	End
	
	Method setHp:Void(hpPlus:Int)
		hp = hpPlus
		If hp > PLAYER_MAX_HP
			hp = PLAYER_MAX_HP
		Endif
	End
	
	Method setSwords:Void(swordsPlus:Int)
		swords = swordsPlus
		If swords > PLAYER_MAX_SWORDS
			swords = PLAYER_MAX_SWORDS
		Endif
	End

	Method setStrength:Void(strengthPlus:Int)
		strength = strengthPlus
		If strength > PLAYER_MAX_STRENGTH
			strength = PLAYER_MAX_STRENGTH
		Endif
	End

	Method setBombs:Void(bombsPlus:Int)
		bombs = bombsPlus
		If bombs > PLAYER_MAX_BOMBS
			bombs = PLAYER_MAX_BOMBS
		Endif
	End
	
	'----------------------------------------------------------------------------------
	' getSwords - accessor for 'swords'
	'----------------------------------------------------------------------------------		
	Method getSwords:Int()
		Return swords
	End
	
	'----------------------------------------------------------------------------------
	' getStrength - accessor for 'strength'
	'----------------------------------------------------------------------------------		
	Method getStrength:Int()
		Return strength
	End
	
	'----------------------------------------------------------------------------------
	' getBombs - accessor for 'bombs'
	'----------------------------------------------------------------------------------		
	Method getBombs:Int()
		Return bombs
	End
	
	'----------------------------------------------------------------------------------
	' getScore - accessor for 'score'
	'----------------------------------------------------------------------------------		
	Method getScore:Int()
		Return score
	End
	
	'----------------------------------------------------------------------------------
	' startAnimTimer - reinitialize the timer used to determine when to draw the next
	'  frame
	'----------------------------------------------------------------------------------						
	Method startAnimTimer:Void()
		animTimer = Millisecs()	+ AnimDuration	
		Return
	End
	
	Method startScoreAnimTimer:Void(sc:Int)
		scoreShowTimer = Millisecs() + AnimScoreDuration
		isShowingScore = True
		scoreToShow = sc
		scorePosOffset = 0
		scorePosSpeed = 2.0
		Return
	End
		
	'----------------------------------------------------------------------------------
	' isAnimComplete - checks to see if it's time to draw the next frame
	'----------------------------------------------------------------------------------		
	Method isAnimTimerComplete:Bool()
		If Millisecs() > animTimer
			Return True
		Endif		
		Return False
	End

    '----------------------------------------------------------------------------------
	' isIdleTimerComplete - checks to see if the 'dead man's switch' that's set after
	'  a key is pressed has been set.  This keeps the player's sprite from animating
	'  after the player has stopped pressing the keys for a short while. 
	'----------------------------------------------------------------------------------
	Method isIdleTimerComplete:Bool()
		If Millisecs() > animStopTimer
			Return True
		Endif		
		Return False
	End
	
    '----------------------------------------------------------------------------------
	' isDead - returns True if the player is dead, false otherwise
	'----------------------------------------------------------------------------------
	Method isDead:Bool()
		If hp <= 0
			Return True
		Else
			Return False
		Endif
		Return False
	End
	
	'----------------------------------------------------------------------------------
	' hasSwords - returns True if the player has at least one sword 
	'  remaining, False otherwise
	'----------------------------------------------------------------------------------
	Method hasSwords:Bool()
		If swords > 0
			Return True
		Else
			Return False
		Endif
		Return False
	End
	
	' ----------------------------------------------------------------------------------
	' hasBombs - returns True if the player has at least one bomb
	'  remaining, False otherwise
	'----------------------------------------------------------------------------------
	Method hasBombs:Bool()
		If bombs > 0
			Return True
		Endif
				
		Return False
	End
	
	'----------------------------------------------------------------------------------
	' injure - reduces the player's HP by the specified amount (1 by
	'  default)
	'----------------------------------------------------------------------------------
	Method injure:Int(amount:Int = 1)
		hp = hp - amount
		showHitAnim = True
		hitAnimFrame = 0
		hitAnimTimer = Millisecs() + PLAYER_HIT_FRAME_TIME
		Return hp
	End
	
	'----------------------------------------------------------------------------------
	' adjustScore - adds the amount specified in adjustment to the 
	'  current score and increment the 'items collected' counter. 
	'----------------------------------------------------------------------------------
	Method adjustScore:Int(adjustment:Int)
		score = score + adjustment
		incrementItemsCollected()
		startScoreAnimTimer(adjustment)
		Return score
	End
	
	Method isAnimScoreDisplaying:Bool()
		Return isShowingScore
	End
	
	Method getAnimScore:Int()
		Return scoreToShow
	End
	
	Method getAnimScorePos:Int()
		Return scorePosOffset
	End
	
	'----------------------------------------------------------------------------------
	' removeSword - takes a single sword out of the player's inventory.
	'  Returns the number of swords remaining, or -1 if there weren't
	'  any to begin with.
	'----------------------------------------------------------------------------------
	Method removeSword:Int()
		If hasSwords() = True
			swords = swords - 1
			Return swords
		Else
			Return -1
		Endif
		Return -1
	End
	
	'----------------------------------------------------------------------------------
	' removeBomb - takes a single bomb out of the player's inventory.
	'  Returns the number of bombs remaining, or -1 if there weren't
	'  any to begin with.
	'----------------------------------------------------------------------------------
	Method removeBomb:Int()
		If hasBombs() = True
			bombs = bombs - 1
			Return bombs
		Endif
		
		Return -1 
	End
	
	Method removeStr:Int()
		If strength > 0
			strength = strength - 1
			Return strength
		Endif
		
		Return -1
	End
	
	'----------------------------------------------------------------------------------
	' getPosition - retreives an array containing the player's x position,
	'  y position, and direction in the current maze.  
	'----------------------------------------------------------------------------------
	Method getPosition:Int[]()
		Return [mazeX, mazeY, direction]
	End
	
	'----------------------------------------------------------------------------------
	' setPosition - sets the player's current position in the maze.  Any
	'  caller of this function must make sure the position is valid
	'  (no walls, in bounds, etc.), since the player has no knowledge
	'  of the existence of a maze. 
	'----------------------------------------------------------------------------------
	Method setPosition:Void(xPos:Int, yPos:Int)
		mazeX = xPos
		mazeY = yPos
		Return 
	End
	
	'----------------------------------------------------------------------------------
	' setDirection - sets the player's current direction in the maze.
	'----------------------------------------------------------------------------------
	Method setDirection:Void(dir:Int)
		If dir = DIRECTION_NORTH Or
		   dir = DIRECTION_SOUTH Or
		   dir = DIRECTION_EAST  Or
		   dir = DIRECTION_WEST
				direction = dir
		Else
				direction = DIRECTION_NORTH   	' Default if an invalid value is set somehow
		Endif
		Return
	End
	
	'------------------------------------------------------------------------------------------
	' exposeMazePieces - 'light' the parts of the maze immediately surrounding the player,
	'  assuming those parts are visible (not behind walls, etc)
	'
	' (Note: This function is *really* brute force.  I should be drawing lines and calculating
	'  intersections, but I'm lazy.  There, I said it.  This is good enough.)
	'-------------------------------------------------------------------------------------------
	Method exposeMazePieces:Void(m:Maze)

		' used to mark the squares immediately surrounding the player
		Local xStart:Int = mazeX - 1	
		Local xEnd:Int = mazeX + 1
		Local yStart:Int = mazeY - 1
		Local yEnd:Int = mazeY + 1
		
		' Check to make sure that the areas being checked are all in the maze.  Clip them if
		' they're not.
		If xStart < 0 
			xStart = 0
		Endif
		If xEnd > m.getWidth() - 1
			xEnd = m.getWidth() - 1
		Endif
		If yStart < 0
			yStart = 0
		Endif
		If yEnd > m.getHeight() - 1
			yEnd = m.getHeight() - 1
		Endif
		
		' Mark the squares immediately surrounding the player as visible
		For Local i:Int = xStart To xEnd
			For Local j:Int = yStart To yEnd
				m.setHidden(i,j,False)
			Next
		Next
		
		' now extend two squares in each cardinal direction.  If the square in next to the
		' player in that direction isn't a wall, then he can 'see' it - mark it as visible.
		
		' West
		If mazeX - 1 > 0 And m.getType(mazeX - 1, mazeY) <> MAZE_TYPE_WALL
			m.setHidden(mazeX - 2, mazeY, False)
			If mazeX - 2 > 0 And m.getType(mazeX - 2, mazeY) <> MAZE_TYPE_WALL
				m.setHidden(mazeX - 3, mazeY, False)
			Endif			
		Endif
				
		' East
		If mazeX + 1 < m.getWidth() - 1 And m.getType(mazeX + 1, mazeY) <> MAZE_TYPE_WALL
			m.setHidden(mazeX + 2, mazeY, False)
			If mazeX + 2 < m.getWidth() - 1 And m.getType(mazeX + 2, mazeY) <> MAZE_TYPE_WALL
				m.setHidden(mazeX + 3, mazeY, False)
			Endif				
		Endif	
		
		' North
		If mazeY - 1 > 0 And m.getType(mazeX, mazeY - 1) <> MAZE_TYPE_WALL
			m.setHidden(mazeX, mazeY - 2, False)
			If mazeY - 2 > 0 And m.getType(mazeX, mazeY - 2) <> MAZE_TYPE_WALL
				m.setHidden(mazeX, mazeY - 2, False)
			Endif			
		Endif
				
		' South
		If mazeY + 1 < m.getWidth() - 1 And m.getType(mazeX, mazeY + 1) <> MAZE_TYPE_WALL
			m.setHidden(mazeX, mazeY + 2, False)
			If mazeY + 2 < m.getWidth() - 1 And m.getType(mazeX, mazeY + 2) <> MAZE_TYPE_WALL
				m.setHidden(mazeX, mazeY + 3, False)
			Endif			
		Endif
				
		'
		' extend one square in each of the four diagonal directions.  If no walls block the
		' way, then the square can be made visible.  If selected adjacent squares are walls
		' (see below), then the square is 'not' visible.
		' 
		' If looking to the northwest:
		'
		' ####
		' #.!#   - If the player is 'p', then the '.'s and '!' represent squraes that could
		' #..V     potentially be made visible by the check below.  If a wall is present at 'V',
		' #..P     then the tile marked '!' will not be visible, but will be if no wall is present.
		' ####
		'
		
		' Northwest
		If mazeX - 1 > 0 And mazeY - 1 > 0 And m.getType(mazeX - 1, mazeY - 1) <> MAZE_TYPE_WALL
			m.setHidden(mazeX - 2, mazeY - 2, False)
			If m.getType(mazeX, mazeY - 1) <> MAZE_TYPE_WALL
				m.setHidden(mazeX - 1, mazeY - 2, False)
			Endif
			If m.getType(mazeX - 1, mazeY) <> MAZE_TYPE_WALL
				m.setHidden(mazeX - 2, mazeY - 1, False)
			Endif
		Endif
		
		' Northeast
		If mazeX + 1 < m.getWidth() - 1 And mazeY - 1 > 0 And m.getType(mazeX + 1, mazeY - 1) <> MAZE_TYPE_WALL
			m.setHidden(mazeX + 2, mazeY - 2, False)
			If m.getType(mazeX, mazeY - 1) <> MAZE_TYPE_WALL
				m.setHidden(mazeX + 1, mazeY - 2, False)
			Endif
			If m.getType(mazeX + 1, mazeY) <> MAZE_TYPE_WALL
				m.setHidden(mazeX + 2, mazeY - 1, False)
			Endif
		Endif
		
		' Southwest
		If mazeX - 1 > 0 And mazeY + 1 < m.getHeight() - 1 And m.getType(mazeX - 1, mazeY + 1) <> MAZE_TYPE_WALL
			m.setHidden(mazeX - 2, mazeY + 2, False)
			If m.getType(mazeX - 1, mazeY) <> MAZE_TYPE_WALL
				m.setHidden(mazeX - 2, mazeY + 1, False)
			Endif
			If m.getType(mazeX, mazeY + 1) <> MAZE_TYPE_WALL
				m.setHidden(mazeX - 1, mazeY + 2, False)
			Endif
		Endif
		
		' Southeast
		If mazeX + 1 < m.getWidth() - 1 And mazeY + 1 < m.getHeight() - 1 And m.getType(mazeX + 1, mazeY + 1) <> MAZE_TYPE_WALL
			m.setHidden(mazeX + 2, mazeY + 2, False)
			If m.getType(mazeX + 1, mazeY) <> MAZE_TYPE_WALL
				m.setHidden(mazeX + 2, mazeY + 1, False)
			Endif
			If m.getType(mazeX, mazeY + 1) <> MAZE_TYPE_WALL				
				m.setHidden(mazeX + 1, mazeY + 2, False)
			Endif
		Endif		

		Return
	End
			
	'------------------------------------------------------------------------------------------
	' New - the constructor.  Just resets the player and loads the player sprite. 
	'-------------------------------------------------------------------------------------------			
	Method New()
		sprite = LoadImage("boy.png")
		init()		
		Return
	End
		
End
