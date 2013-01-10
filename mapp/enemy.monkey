'-----------------------------------------------------------------------------------------------
' enemy.monkey
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
Import player

' This table is a single dimensional representation of a 3-
' dimensional array.  The first dimension is the enemy number,
' the second is the difficulty level, and the third is the 
' player's strength (0-1, 2-3, 4-5, 6-7, 8-9, 10)

Global ENEMY_HP:Int[] = [ 1, 1, 1, 1, 1, 1,        ' ENEMY_BLUE_JELLY,   DIFFICULTY_VERY_EASY
                          1, 1, 1, 1, 1, 1,        ' ENEMY_BLUE_JELLY,   DIFFICULTY_EASY
                          1, 1, 1, 1, 1, 1,        ' ENEMY_BLUE_JELLY,   DIFFICULTY_NORMAL
                          2, 1, 1, 1, 1, 1,        ' ENEMY_BLUE_JELLY,   DIFFICULTY_HARD
                          2, 2, 1, 1, 1, 1,        ' ENEMY_BLUE_JELLY,   DIFFICULTY_INSANE
 
  		 				  1, 1, 1, 1, 1, 1,        ' ENEMY_RED_JELLY,    DIFFICULTY_VERY_EASY
  						  1, 1, 1, 1, 1, 1,        ' ENEMY_RED_JELLY,    DIFFICULTY_EASY
						  2, 1, 1, 1, 1, 1,        ' ENEMY_RED_JELLY,    DIFFICULTY_NORMAL
						  2, 2, 1, 1, 1, 1,        ' ENEMY_RED_JELLY,    DIFFICULTY_HARD
						  2, 2, 2, 1, 1, 1,        ' ENEMY_RED_JELLY,    DIFFICULTY_INSANE
						
						  1, 1, 1, 1, 1, 1,        ' ENEMY_YELLOW_JELLY, DIFFICULTY_VERY_EASY
						  2, 1, 1, 1, 1, 1,        ' ENEMY_YELLOW_JELLY, DIFFICULTY_EASY
						  2, 2, 1, 1, 1, 1,        ' ENEMY_YELLOW_JELLY, DIFFICULTY_NORMAL
						  2, 2, 2, 1, 1, 1,        ' ENEMY_YELLOW_JELLY, DIFFICULTY_HARD
						  3, 2, 2, 2, 1, 1,        ' ENEMY_YELLOW_JELLY, DIFFICULTY_INSANE
						
						  1, 1, 1, 1, 1, 1,        ' ENEMY_PINWHEEL,     DIFFICULTY_VERY_EASY
						  1, 1, 1, 1, 1, 1,        ' ENEMY_PINWHEEL,     DIFFICULTY_EASY
						  2, 1, 1, 1, 1, 1,        ' ENEMY_PINWHEEL,     DIFFICULTY_NORMAL
						  2, 2, 1, 1, 1, 1,        ' ENEMY_PINWHEEL,     DIFFICULTY_HARD
						  2, 2, 2, 1, 1, 1,        ' ENEMY_PINWHEEL,     DIFFICULTY_INSANE
						
						  1, 1, 1, 1, 1, 1,        ' ENEMY_BOULDER,      DIFFICULTY_VERY_EASY
						  1, 1, 1, 1, 1, 1,        ' ENEMY_BOULDER,      DIFFICULTY_EASY
						  2, 1, 1, 1, 1, 1,        ' ENEMY_BOULDER,      DIFFICULTY_NORMAL
						  2, 2, 2, 1, 1, 1,        ' ENEMY_BOULDER,      DIFFICULTY_HARD
						  3, 2, 2, 2, 1, 1,        ' ENEMY_BOULDER,      DIFFICULTY_INSANE
						
						  1, 1, 1, 1, 1, 1,        ' ENEMY_MOTH,         DIFFICULTY_VERY_EASY
						  1, 1, 1, 1, 1, 1,        ' ENEMY_MOTH,         DIFFICULTY_EASY 
						  1, 1, 1, 1, 1, 1,        ' ENEMY_MOTH,         DIFFICULTY_NORMAL
						  2, 2, 1, 1, 1, 1,        ' ENEMY_MOTH,         DIFFICULTY_HARD
						  2, 2, 2, 1, 1, 1,        ' ENEMY_MOTH,         DIFFICULTY_INSANE
						
						  1, 1, 1, 1, 1, 1,        ' ENEMY_DEATH_MOTH,   DIFFICULTY_VERY_EASY
						  2, 1, 1, 1, 1, 1,        ' ENEMY_DEATH_MOTH,   DIFFICULTY_EASY
						  3, 2, 1, 1, 1, 1,        ' ENEMY_DEATH_MOTH,   DIFFICULTY_NORMAL
						  3, 3, 2, 2, 1, 1,        ' ENEMY_DEATH_MOTH,   DIFFICULTY_HARD
						  4, 3, 3, 2, 2, 1,        ' ENEMY_DEATH_MOTH,   DIFFICULTY_INSANE
						
						  1, 1, 1, 1, 1, 1,        ' ENEMY_SKULL,        DIFFICULTY_VERY_EASY
						  1, 1, 1, 1, 1, 1,        ' ENEMY_SKULL,        DIFFICULTY_EASY
						  2, 2, 1, 1, 1, 1,        ' ENEMY_SKULL,        DIFFICULTY_NORMAL
						  2, 2, 2, 1, 1, 1,        ' ENEMY_SKULL,        DIFFICULTY_HARD
						  2, 2, 2, 2, 2, 1,        ' ENEMY_SKULL,        DIFFICULTY_INSANE
						
						  1, 1, 1, 1, 1, 1,        ' ENEMY_RED_SKULL,    DIFFICULTY_VERY_EASY
						  2, 1, 1, 1, 1, 1,        ' ENEMY_RED_SKULL,    DIFFICULTY_EASY
						  2, 2, 1, 1, 1, 1,        ' ENEMY_RED_SKULL,    DIFFICULTY_NORMAL
						  3, 2, 2, 1, 1, 1,        ' ENEMY_RED_SKULL,    DIFFICULTY_HARD
						  3, 3, 2, 2, 1, 1,        ' ENEMY_RED_SKULL,    DIFFICULTY_INSANE
						
						  1, 1, 1, 1, 1, 1,        ' ENEMY_BLACK_SKULL,  DIFFICULTY_VERY_EASY
						  2, 1, 1, 1, 1, 1,        ' ENEMY_BLACK_SKULL,  DIFFICULTY_EASY
						  3, 2, 2, 1, 1, 1,        ' ENEMY_BLACK_SKULL,  DIFFICULTY_NORMAL
						  5, 4, 4, 3, 2, 1,        ' ENEMY_BLACK_SKULL,  DIFFICULTY_HARD
					      7, 6, 5, 4, 3, 2,        ' ENEMY_BLACK_SKULL,  DIFFICULTY_INSANE
					
					      1, 1, 1, 1, 1, 1,        ' ENEMY_BLUE_EYE,     DIFFICULTY_VERY_EASY
					      1, 1, 1, 1, 1, 1,        ' ENEMY_BLUE_EYE,     DIFFICULTY_EASY
					      2, 1, 1, 1, 1, 1,        ' ENEMY_BLUE_EYE,     DIFFICULTY_NORMAL
						  2, 2, 1, 1, 1, 1,        ' ENEMY_BLUE_EYE,     DIFFICULTY_HARD
						  3, 2, 2, 2, 1, 1,        ' ENEMY_BLUE_EYE,     DIFFICULTY_INSANE
						
						  1, 1, 1, 1, 1, 1,        ' ENEMY_RED_EYE,      DIFFICULTY_VERY_EASY
						  2, 1, 1, 1, 1, 1,        ' ENEMY_RED_EYE,      DIFFICULTY_EASY
						  3, 2, 1, 1, 1, 1,        ' ENEMY_RED_EYE,      DIFFICULTY_NORMAL
						  4, 3, 2, 1, 1, 1,        ' ENEMY_RED_EYE,      DIFFICULTY_HARD
						  5, 4, 3, 2, 2, 1,        ' ENEMY_RED_EYE,      DIFFICULTY_INSANE
						
						  2, 1, 1, 1, 1, 1,        ' ENEMY_GLOWING_EYE,  DIFFICULTY_VERY_EASY
						  3, 3, 2, 2, 1, 1,        ' ENEMY_GLOWING_EYE,  DIFFICULTY_EASY
						  4, 3, 3, 2, 2, 1,        ' ENEMY_GLOWING_EYE,  DIFFICULTY_NORMAL
					      5, 4, 3, 3, 3, 2,        ' ENEMY_GLOWING_EYE,  DIFFICULTY_HARD
					      7, 6, 5, 4, 4, 3,        ' ENEMY_GLOWING_EYE,  DIFFICULTY_INSANE
					
					     99,99,99,99,99, 3,        ' ENEMY_DEATH,        DIFFICULTY_VERY_EASY
					     99,99,99,99,99, 4,        ' ENEMY_DEATH,        DIFFICULTY_EASY
					     99,99,99,99,99, 5,        ' ENEMY_DEATH,        DIFFICULTY_NORMAL
					     99,99,99,99,99, 6,        ' ENEMY_DEATH,        DIFFICULTY_HARD
					     99,99,99,99,99, 7 ]       ' ENEMY_DEATH,        DIFFICULTY_INSANE


' This represents the particular odds (in 1/1000 increments) that a particular
' enemy type will show up on a given floor.  The 'rows' in this array represent
' individual floors, while the 'columns' represent enemy types:

' Relative strength for each monster:
' W  W  M  W  M  W  S  W  M  S  W  S  VS  VS

Global ENEMY_ODDS:Int[] = [ 150,  300,  325,  475,  500,  650,  655,  805,  830,  835,  990,  996,  999, 1000,
                            131,  262,  322,  453,  513,  644,  654,  785,  845,  855,  986,  996,  999, 1000,
                            100,  200,  300,  400,  500,  600,  630,  730,  830,  860,  960,  990,  998, 1000,
                             60,  120,  260,  320,  460,  520,  590,  650,  790,  860,  920,  990,  998, 1000,
                             20,   40,  190,  210,  370,  390,  510,  530,  680,  800,  820,  940,  990, 1000, 
                              1,    2,  152,  153,  303,  304,  454,  455,  605,  755,  756,  906,  986, 1000 ]

Global ENEMY_FRAMES:Int[] = [ 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7,           ' ENEMY_BLUE_JELLY
                              3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2,			' ENEMY_RED_JELLY
                              6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5,           ' ENEMY_YELLOW_JELLY
                              0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7,           ' ENEMY_PINWHEEL
                              0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7,           ' ENEMY_BOULDER
                              0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7,           ' ENEMY_MOTH
                              3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2,           ' ENEMY_DEATH_MOTH
                              0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7,           ' ENEMY_SKULL
                              0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 0, 0, 0,           ' ENEMY_RED_SKULL
                              0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7,           ' ENEMY_BLACK_SKULL
                              0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 0, 0, 0, 0, 0,           ' ENEMY_BLUE_EYE
                              0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 0, 0, 0, 0, 0,           ' ENEMY_RED_EYE
                              0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7,           ' ENEMY_GLOWING_EYE
                              0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7 ]          ' ENEMY_DEATH

' The speed of each enemy type.  The first row represents the 'patrol' speed, the second is the 'chase' speed. 
' Each pair of rows represents one of the difficulty levels.
Global ENEMY_SPEEDS:Int[] = [1000, 1200,  900, 1000,  900, 1000, 1000, 1200, 1200, 1200, 1000,  900,  800,  600,
                              900,  900,  900,  900,  900,  900,  900,  900,  900,  900,  900,  900,  900,  600,

							 1000, 1200,  900, 1000,  900, 1000, 1000, 1200, 1200, 1200, 1000,  900,  800,  600,
                              800,  800,  800,  800,  800,  800,  800,  800,  800,  800,  800,  800,  800,  600,

							 1000, 1200,  900, 1000,  900, 1000, 1000, 1200, 1200, 1200, 1000,  900,  800,  600,
                              700,  700,  700,  700,  700,  700,  700,  700,  700,  700,  700,  700,  700,  600,

							 1000, 1200,  900, 1000,  900, 1000, 1000, 1200, 1200, 1200, 1000,  900,  800,  600,
                              600,  600,  600,  600,  600,  600,  600,  600,  600,  600,  600,  600,  600,  600,

							 1000, 1200,  900, 1000,  900, 1000, 1000, 1200, 1200, 1200, 1000,  900,  800,  600,
                              400,  400,  400,  400,  400,  400,  400,  400,  400,  400,  400,  400,  400,  400]

' If the enemy and player are closer than this distance apart, then the enemy will enter chase mode.
Global ENEMY_SIGHT_RANGES:Int[] = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]


Class EnemyGenerator

	Method generate:Enemy(difficulty:Int, floor:Int)
		Local type:Int
		Local randNum:Int
		Local e:Enemy
		Local lowEnd:Int
		Local highEnd:Int
		Local idx:Int
		
		' Pick an enemy type appropriate for the current floor
		randNum = Rnd(0, 1000)

		If randNum >= 0 And randNum < ENEMY_ODDS[(floor * NUM_ENEMY_TYPES)]
			type = 0
		Else
			For idx = 1 To NUM_ENEMY_TYPES - 1
   				lowEnd = ENEMY_ODDS[(floor * NUM_ENEMY_TYPES) + idx - 1]
				highEnd = ENEMY_ODDS[(floor * NUM_ENEMY_TYPES) + idx]
				If randNum >= lowEnd And randNum < highEnd
					type = idx
				Endif
			Next
		Endif			
				
		' Make a new enemy
		e = New Enemy()
		e.init(type, difficulty)
		Return e
	End
	
End

Class Enemy

Private
	Field enemyType:Int
	Field curHp:Int           ' strength-adjusted
	Field numTimesHit:Int
	Field xPos:Int
	Field yPos:Int
	Field drawXPos:Int
	Field drawYPos:Int
	Field direction:Int
	Field currentFrame:Int
	Field animationTime:Int
	Field isMoving:Bool
	Field markAsDead:Bool
	Field finallyDead:Bool
	
	' Enemy behavior --
	'  Enemies can be in one of the following states at any given time:
	'    - Patrol (the default)
	'    - Chase (if it sees the player)
	'
	'  In patrol mode, the enemy will pick a random direction and walk until
	'   it hits a wall.  After that, it will pick another direction
	'   and repeat the process.
	'
	'  In chase mode, the enemy will follow the player.  It stores a list
	'  of all player moves made since the enemy saw him, and continues to
	'  store moves until the player can no longer be seen (maximum 32 in a circular buffer).  
	'  The enemy will position itself Until it gets To one of the squares that was 
	'  tracked, and then follow the remainder of the path.  If the player
	'  isn't visible when the enemy gets to the last spot, or if the player gets too far
	'  away (enemy type-specific), it will return to patrol mode, otherwise it will 
	'  start the chase again.
	'
	Field behaviorMode:Int
	Field movementTime:Int
	
	Field smoothXOffset:Int
	Field smoothYOffset:Int
	Field moveDirection:Int
	
	Field isStunned:Bool
	Field stunTimer:Int
	Field hitAnimFrame:Int
	Field hitAnimTimer:Int
	Field showHitAnim:Bool
Public

	' Calculate the distance between the enemy and an arbitrary point
	Method getDistanceTo:Float(destX:Int, destY:Int)
		Return Sqrt(((destX - xPos) * (destX - xPos)) + ((destY - yPos) * (destY - yPos)))
	End
	
	Method getType:Int()
		Return enemyType
	End
	
	Method getPosition:Int[]()
		Return [xPos, yPos, direction]
	End
	
	Method stun:Void()
		isStunned = True
		stunTimer = Millisecs() + ENEMY_STUN_DAMAGE_TIME
		showHitAnim = True
		hitAnimFrame = 0
		hitAnimTimer = Millisecs() + ENEMY_HIT_FRAME_TIME
		Return
	End
	
	Method getIsStunned:Bool()
		Return isStunned
	End
	
	Method setPosition:Void(x:Int, y:Int, d:Int)
		xPos = x
		yPos = y
		drawXPos = x
		drawYPos = y
		direction = d
	End
		
	Method getCurrentFrame:Int()
		Return ENEMY_FRAMES[(enemyType * ENEMY_ANIMATION_TOTAL_FRAMES) + currentFrame]
	End
	
	Method getSmoothOffsets:Int[]()
		Return [smoothXOffset, smoothYOffset]
	End
	
	Method getDrawPosition:Int[]()
		Return [drawXPos, drawYPos, direction]
	End
	
	Method getHitAnimFrame:Int()
		Return hitAnimFrame
	End
	
	Method getShowHitAnim:Bool()
		Return showHitAnim
	End
	
	Method processAnimation:Void()
		
		If isStunned = True
			If showHitAnim = True And Millisecs() > hitAnimTimer
				hitAnimFrame  = hitAnimFrame + 1
				If hitAnimFrame >= NUM_HIT_ANIM_FRAMES
					showHitAnim = False
					finallyDead = True
				Endif
				hitAnimTimer = Millisecs() + ENEMY_HIT_FRAME_TIME
			Endif
			If Millisecs() > stunTimer
				isStunned = False
			Endif
		Endif
		
		If isMoving = True
			Select moveDirection
				Case DIRECTION_NORTH
					smoothYOffset = smoothYOffset - ENEMY_MOVE_SPEED
					If smoothYOffset < -1 * UI_BLOCK_SIZE
						isMoving = False
						smoothYOffset = 0
						drawYPos = yPos
						drawXPos = xPos
					Endif
				Case DIRECTION_SOUTH
					smoothYOffset = smoothYOffset + ENEMY_MOVE_SPEED
					If smoothYOffset > UI_BLOCK_SIZE
						isMoving = False
						smoothYOffset = 0
						drawYPos = yPos
						drawXPos = xPos						
					Endif
				Case DIRECTION_EAST
					smoothXOffset = smoothXOffset + ENEMY_MOVE_SPEED
					If smoothXOffset > UI_BLOCK_SIZE
						isMoving = False
						smoothXOffset = 0
						drawYPos = yPos
						drawXPos = xPos						
					Endif
				Case DIRECTION_WEST
					smoothXOffset = smoothXOffset - ENEMY_MOVE_SPEED
					If smoothXOffset < -1 * UI_BLOCK_SIZE
						isMoving = False
						smoothXOffset = 0
						drawYPos = yPos
						drawXPos = xPos						
					Endif
			End Select
		Endif
		
		If Millisecs() >= animationTime
			currentFrame = currentFrame + 1
			If currentFrame >= ENEMY_ANIMATION_TOTAL_FRAMES
				currentFrame = 0
			Endif
			animationTime = Millisecs() + ENEMY_ANIMATION_FRAME_DURATION
		Endif
	End
	
    Method processMovement:Void(m:Maze, p:Player, eid:Int, difficulty:Int)

		Local pos:Int[] = p.getPosition()
		Local n:Int = m.getType(xPos, yPos - 1)
		Local s:Int = m.getType(xPos, yPos + 1)
		Local e:Int = m.getType(xPos + 1, yPos)
		Local w:Int = m.getType(xPos - 1, yPos)
		Local en:Int = m.isEnemyHere(xPos, yPos - 1)
		Local es:Int = m.isEnemyHere(xPos, yPos + 1)
		Local ee:Int = m.isEnemyHere(xPos + 1, yPos)
		Local ew:Int = m.isEnemyHere(xPos - 1, yPos)
		
		If Millisecs() >= movementTime And isStunned = False
			' process movement
			If behaviorMode = ENEMY_BEHAVIOR_PATROL
				' For each of the directions, check to see if the enemy can move to the new
				' location (i.e. no walls, no enemies).  If so, try to move. 
				' If the player is standing where the enemy is moving, injure him, but don't
				' move.  In any case where a non-player object isn't hit, pick another
				' random direction to travel in.
				If isMoving = False
					drawXPos = xPos
					drawYPos = yPos
				Endif
				
				If direction = DIRECTION_NORTH And m.canMoveHere(xPos, yPos - 1) = True
					If xPos = pos[0] And yPos - 1 = pos[1] And isStunned = False
						p.injure()
					Else
						m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)
						yPos = yPos - 1
						m.setEnemyPresent(xPos, yPos, eid)
						If m.canMoveHere(xPos, yPos - 1) = False
							direction = Rnd(0, 4)
						Endif
						isMoving = True
						moveDirection = DIRECTION_NORTH
						smoothXOffset = 0
						smoothYOffset = 0
					Endif
				Elseif direction = DIRECTION_SOUTH And m.canMoveHere(xPos, yPos + 1) = True
					If xPos = pos[0] And yPos + 1 = pos[1] And isStunned = False
						p.injure()
					Else
						m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)					
						yPos = yPos + 1
						m.setEnemyPresent(xPos, yPos, eid)
						If m.canMoveHere(xPos, yPos + 1) = False
							direction = Rnd(0, 4)
						Endif						
						isMoving = True
						moveDirection = DIRECTION_SOUTH
						smoothXOffset = 0
						smoothYOffset = 0						
					Endif
				Elseif direction = DIRECTION_EAST And m.canMoveHere(xPos + 1, yPos) = True
					If xPos + 1 = pos[0] And yPos = pos[1] And isStunned = False
						p.injure()
					Else
						m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)						
						xPos = xPos + 1
						m.setEnemyPresent(xPos, yPos, eid)
						If m.canMoveHere(xPos + 1, yPos) = False
							direction = Rnd(0, 4)
						Endif			
						isMoving = True	
						moveDirection = DIRECTION_EAST
						smoothXOffset = 0
						smoothYOffset = 0								
					Endif
				Elseif direction = DIRECTION_WEST And m.canMoveHere(xPos - 1, yPos) = True
					If xPos - 1 = pos[0] And yPos = pos[1] And isStunned = False
						p.injure()
					Else
						m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)						
						xPos = xPos - 1
						m.setEnemyPresent(xPos, yPos, eid)
						If m.canMoveHere(xPos - 1, yPos) = False
							direction = Rnd(0, 4)
						Endif	
						isMoving = True			
						moveDirection = DIRECTION_WEST
						smoothXOffset = 0
						smoothYOffset = 0												
					Endif
				Else
					direction = Rnd(0, 4)				
				Endif
				movementTime = Millisecs() + ENEMY_SPEEDS[enemyType]				
			Elseif behaviorMode = ENEMY_BEHAVIOR_CHASE
				' Call a dedicated function; this is non-trivial
				doChaseMode(m, p, eid)				
				movementTime = Millisecs() + ENEMY_SPEEDS[(difficulty * NUM_ENEMY_TYPES * 2) + NUM_ENEMY_TYPES + enemyType]
			Endif
		Endif
		
		' Check to see if enemy should go into chase mode for the next turn.  
		If m.canSeeBetween(xPos, yPos, pos[0], pos[1], ENEMY_SIGHT_RANGES[enemyType]) = True
			behaviorMode = ENEMY_BEHAVIOR_CHASE
		Endif
		
		Return
	End
		
	Method doChaseMode:Void(m:Maze, p:Player, eid:Int)
		Local pos:Int[] = p.getPosition()
		Local px:Int = pos[0]
		Local py:Int = pos[1]
		Local xDist:Int
		Local yDist:Int
		Local dir1:Int
		Local dir2:Int
		Local r:Int
		
		If m.canSeeBetween(xPos, yPos, px, py, ENEMY_SIGHT_RANGES[enemyType] * 1.5) = False
			behaviorMode = ENEMY_BEHAVIOR_PATROL
		Endif

		' Take a step necessary to get closer to the player		
		If px < xPos
			xDist = xPos - px
		Else
			xDist = px - xPos
		Endif
		If py < yPos
			yDist = yPos - py
		Else
			yDist = py - yPos
		Endif
		
		If xDist = yDist             ' diagonal
			r = Rnd(0, 2)
			If r = 0                 ' choose the appropriate left right direction
				If px < xPos
					dir1 = DIRECTION_WEST
					If py < yPos
						dir2 = DIRECTION_NORTH
					Else
						dir2 = DIRECTION_SOUTH
					Endif
				Else
					dir1 = DIRECTION_EAST
					If py < yPos
						dir2 = DIRECTION_NORTH
					Else
						dir2 = DIRECTION_SOUTH
					Endif					
				Endif
			Else
				If py < yPos
					dir1 = DIRECTION_NORTH
					If px < xPos
						dir2 = DIRECTION_EAST
					Else
						dir2 = DIRECTION_WEST
					Endif
				Else
					dir1 = DIRECTION_SOUTH
					If px < xPos
						dir2 = DIRECTION_EAST
					Else
						dir2 = DIRECTION_WEST
					Endif
				Endif
			Endif
		Elseif xDist > yDist
			If px < xPos
				dir1 = DIRECTION_WEST
				If py < yPos
					dir2 = DIRECTION_NORTH
				Else
					dir2 = DIRECTION_SOUTH
				Endif				
			Else
				dir1 = DIRECTION_EAST
				If py < yPos
					dir2 = DIRECTION_NORTH
				Else
					dir2 = DIRECTION_SOUTH
				Endif				
			Endif
		Else
			If py < yPos
				dir1 = DIRECTION_NORTH
				If px < xPos
					dir2 = DIRECTION_EAST
				Else
					dir2 = DIRECTION_WEST
				Endif			
			Else
				dir1 = DIRECTION_SOUTH
				If px < xPos
					dir2 = DIRECTION_EAST
				Else
					dir2 = DIRECTION_WEST
				Endif			
			Endif
		Endif
		
		If isMoving = False
			drawXPos = xPos
			drawYPos = yPos
		Endif
		
		If dir1 = DIRECTION_NORTH And m.canMoveHere(xPos, yPos - 1) = True
			If xPos = pos[0] And yPos - 1 = pos[1] And isStunned = False
				p.injure()
			Else
				m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)
				direction = dir1
				yPos = yPos - 1
				m.setEnemyPresent(xPos, yPos, eid)
				If m.canMoveHere(xPos, yPos - 1) = False
					direction = Rnd(0, 4)
					behaviorMode = ENEMY_BEHAVIOR_PATROL
				Endif
				isMoving = True			
				moveDirection = DIRECTION_NORTH
				smoothXOffset = 0
				smoothYOffset = 0					
			Endif
			Return
		Elseif dir1 = DIRECTION_SOUTH And m.canMoveHere(xPos, yPos + 1) = True
			If xPos = pos[0] And yPos + 1 = pos[1] And isStunned = False
				p.injure()
			Else
				m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)
				direction = dir1					
				yPos = yPos + 1
				m.setEnemyPresent(xPos, yPos, eid)
				If m.canMoveHere(xPos, yPos + 1) = False
					direction = Rnd(0, 4)
					behaviorMode = ENEMY_BEHAVIOR_PATROL							
				Endif	
				isMoving = True			
				moveDirection = DIRECTION_SOUTH
				smoothXOffset = 0
				smoothYOffset = 0										
			Endif
			Return			
		Elseif dir1 = DIRECTION_EAST And m.canMoveHere(xPos + 1, yPos) = True
			If xPos + 1 = pos[0] And yPos = pos[1] And isStunned = False
				p.injure()
			Else
				m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)	
				direction = dir1					
				xPos = xPos + 1
				m.setEnemyPresent(xPos, yPos, eid)
				If m.canMoveHere(xPos + 1, yPos) = False
					direction = Rnd(0, 4)
					behaviorMode = ENEMY_BEHAVIOR_PATROL							
				Endif		
				isMoving = True			
				moveDirection = DIRECTION_EAST
				smoothXOffset = 0
				smoothYOffset = 0									
			Endif
			Return			
		Elseif dir1 = DIRECTION_WEST And m.canMoveHere(xPos - 1, yPos) = True
			If xPos - 1 = pos[0] And yPos = pos[1] And isStunned = False
				p.injure()
			Else
				m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)	
				direction = dir1				
				xPos = xPos - 1
				m.setEnemyPresent(xPos, yPos, eid)
				If m.canMoveHere(xPos - 1, yPos) = False
					direction = Rnd(0, 4)
					behaviorMode = ENEMY_BEHAVIOR_PATROL							
				Endif	
				isMoving = True			
				moveDirection = DIRECTION_WEST
				smoothXOffset = 0
				smoothYOffset = 0														
			Endif
			Return	
		Elseif dir2 = DIRECTION_NORTH And m.canMoveHere(xPos, yPos - 1) = True
			If xPos = pos[0] And yPos - 1 = pos[1] And isStunned = False
				p.injure()
			Else
				m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)
				direction = dir2
				yPos = yPos - 1
				m.setEnemyPresent(xPos, yPos, eid)
				If m.canMoveHere(xPos, yPos - 1) = False
					direction = Rnd(0, 4)
					behaviorMode = ENEMY_BEHAVIOR_PATROL
				Endif
				isMoving = True			
				moveDirection = DIRECTION_NORTH
				smoothXOffset = 0
				smoothYOffset = 0					
			Endif
			Return
		Elseif dir2 = DIRECTION_SOUTH And m.canMoveHere(xPos, yPos + 1) = True
			If xPos = pos[0] And yPos + 1 = pos[1] And isStunned = False
				p.injure()
			Else
				m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)
				direction = dir2					
				yPos = yPos + 1
				m.setEnemyPresent(xPos, yPos, eid)
				If m.canMoveHere(xPos, yPos + 1) = False
					direction = Rnd(0, 4)
					behaviorMode = ENEMY_BEHAVIOR_PATROL							
				Endif	
				isMoving = True			
				moveDirection = DIRECTION_SOUTH
				smoothXOffset = 0
				smoothYOffset = 0										
			Endif
			Return			
		Elseif dir2 = DIRECTION_EAST And m.canMoveHere(xPos + 1, yPos) = True
			If xPos + 1 = pos[0] And yPos = pos[1] And isStunned = False
				p.injure()
			Else
				m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)	
				direction = dir2			
				xPos = xPos + 1
				m.setEnemyPresent(xPos, yPos, eid)
				If m.canMoveHere(xPos + 1, yPos) = False
					direction = Rnd(0, 4)
					behaviorMode = ENEMY_BEHAVIOR_PATROL							
				Endif		
				isMoving = True			
				moveDirection = DIRECTION_EAST
				smoothXOffset = 0
				smoothYOffset = 0									
			Endif
			Return			
		Elseif dir2 = DIRECTION_WEST And m.canMoveHere(xPos - 1, yPos) = True
			If xPos - 1 = pos[0] And yPos = pos[1] And isStunned = False
				p.injure()
			Else
				m.setEnemyPresent(xPos, yPos, ENEMY_NOT_PRESENT)	
				direction = dir2				
				xPos = xPos - 1
				m.setEnemyPresent(xPos, yPos, eid)
				If m.canMoveHere(xPos - 1, yPos) = False
					direction = Rnd(0, 4)
					behaviorMode = ENEMY_BEHAVIOR_PATROL							
				Endif	
				isMoving = True			
				moveDirection = DIRECTION_WEST
				smoothXOffset = 0
				smoothYOffset = 0														
			Endif
			Return					
		Else
			direction = Rnd(0, 4)			
			behaviorMode = ENEMY_BEHAVIOR_PATROL						
		Endif		
		Return
	End
	
	Method damage:Void()
		numTimesHit = numTimesHit + 1
	End
	
	Method getHp:Int()
		Return curHp - numTimesHit
	End
	
	Method getCurHp:Int()
		Return curHp
	End
	
	Method setCurHp:Void(difficulty:Int, strOffset:Int)
		Local strOffAlt:Int
		
		If strOffset = 0 Or strOffset = 1
			strOffAlt = 0
		Elseif strOffset = 2 Or strOffset = 3
			strOffAlt = 1
		Elseif strOffset = 4 Or strOffset = 5
			strOffAlt = 2
		Elseif strOffset = 6 Or strOffset = 7
			strOffAlt = 3
		Elseif strOffset = 8 Or strOffset = 9
			strOffAlt = 4
		Else
			strOffAlt = 5
		Endif
		
		curHp = ENEMY_HP[(enemyType * DIFFICULTY_NUM_DIFFICULTIES * NUM_STRENGTH_LEVELS) + (difficulty * NUM_STRENGTH_LEVELS) + strOffAlt]
	End
	
	Method isDead:Bool()
		If (curHp - numTimesHit) <= 0
			If markAsDead = False
				markAsDead = True
				finallyDead = False
				Return False
			Elseif finallyDead = True
				Return True
			Endif
		Endif					
		
		Return False
	End
	
	Method getDeadState:Bool()
		Return markAsDead
	End
	
	Method init:Void(type:Int, difficulty:Int)
		enemyType = type
		behaviorMode = ENEMY_BEHAVIOR_PATROL
		setCurHp(difficulty, 0)
		numTimesHit = 0
		xPos = 0
		yPos = 0
		drawXPos = 0
		drawYPos = 0
		direction = Rnd(0, 4)
		currentFrame = Rnd(0, ENEMY_ANIMATION_TOTAL_FRAMES)
		isMoving = False
		animationTime  = Millisecs() + ENEMY_ANIMATION_FRAME_DURATION
		movementTime = Millisecs() + ENEMY_SPEEDS[(difficulty * NUM_ENEMY_TYPES * 2) + enemyType]
		isStunned = False
		markAsDead = False
		showHitAnim = False
		finallyDead = False
	End
	
	Method New()
	End
	
End
