'-----------------------------------------------------------------------------------------------
' maze.monkey
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

Import globals
Import mazegenerator
Import player
Import enemy

Class Maze

Private

    Field blocks:Int[]
	Field hidden:Bool[]
	Field items:Int[]
	Field en:Enemy[]
	Field enemyPresent:Int[]
	Field engen:EnemyGenerator
		
	Field upstairLink:Int[]
	Field downstairLink:Int[]
	Field width:Int
	Field height:Int
	Field origWidth:Int
	Field origHeight:Int
	Field gen:MazeGenerator
	
	Field isScrolling:Bool
	Field scrollAmount:Int
	Field scrollDirection:Int
	Field doneScrolling:Bool
		
Public 
	
	'------------------------------------------------------------------------------------------
	' New - the constructor.  Creates the maze and adds the stairs
	'-------------------------------------------------------------------------------------------		
	Method New(w:Int, h:Int, rooms:Int, upstairs:Int=1, downstairs:Int=1)
		Local count:Int
		Local quadrant:Int
		Local x:Int
		Local y:Int
		
		engen = New EnemyGenerator()
		
		create(w, h, rooms, upstairs, downstairs)
		convertGeneratorToMaze()
		
		enemyPresent = New Int[width * height]
		For Local i:Int = 0 To width - 1
			For Local j:Int = 0 To height - 1
				enemyPresent[(j * width) + i] = ENEMY_NOT_PRESENT
			Next
		Next
		
		upstairLink = New Int[MAZE_STAIR_TYPE_PER_FLOOR * 2]
		downstairLink = New Int[MAZE_STAIR_TYPE_PER_FLOOR * 2]
		
		For count = 1 To upstairs
			quadrant = Rnd(0, 4) + 1
			addStairs(quadrant, MAZE_TYPE_UP_STAIRS, count - 1)
		Next
		
		For count = 1 To downstairs
			quadrant = Rnd(0, 4) + 1
			addStairs(quadrant, MAZE_TYPE_DOWN_STAIRS, count - 1)
		Next		
	
	End

	'------------------------------------------------------------------------------------------
	' processEnemyAnimation - advance animation frames for all enemies that are alive. 
	'------------------------------------------------------------------------------------------	
	Method processEnemyAnimation:Void()
		For Local i:Int = 0 To en.Length - 1
			If en[i].isDead() = False
				en[i].processAnimation()
			Endif
		Next
	End
	
	'------------------------------------------------------------------------------------------
	' processEnemyMovement
	'------------------------------------------------------------------------------------------	
	Method processEnemyMovement:Void(p:Player, difficulty:Int)
		For Local i:Int = 0 To en.Length - 1
			If en[i].isDead() = False				
				en[i].processMovement(Self, p, i, difficulty)
			Endif
		Next
		
		Return
	End	
	
	Method processEnemyDeath:Void(p:Player, d:Int, f:Int)
		Local ep:Int[]
		
		For Local i:Int = 0 To en.Length - 1
			If en[i].isDead() = True
				ep = en[i].getPosition()
				If ep[0] <> -1 And ep[1] <> -1
					p.adjustScore(ENEMY_SCORES[en[i].getType()] * (d + 1) * f)						
					setEnemyPresent(ep[0], ep[1], ENEMY_NOT_PRESENT)
					en[i].setPosition(-1, -1, DIRECTION_NORTH)
				Endif
			Endif
		Next
		
		Return
	End
									
	'------------------------------------------------------------------------------------------
	' generateEnemies - uses the enemy generator to place the correct number of dungeon floor
	' and difficulty-specific monsters inside the maze
	'------------------------------------------------------------------------------------------		
	Method generateEnemies:Void(difficulty:Int, floor:Int)
		Local positionFound:Bool
		Local x:Int
		Local y:Int
		Local dir:Int
		Local currentQuadrant:Int = 0
	    Local minX:Int
		Local maxX:Int
		Local minY:Int
		Local maxY:Int
		
		en = New Enemy[MAX_ENEMIES_PER_FLOOR[difficulty]]
				
		For Local i:Int = 0 To MAX_ENEMIES_PER_FLOOR[difficulty] - 1
			en[i] = engen.generate(difficulty, floor)
			positionFound = False
			While positionFound = False
				' Try to balance out enemy placement by cycling enemy creation
				' through successive quadrants of the maze
				Select currentQuadrant
					Case 0
						minX = 0
						maxX = width / 2
						minY = 0
						maxY = height / 2
					Case 1
						minX = width / 2 + 1
						maxX = width
						minY = 0
						maxY = height / 2
					Case 2
						minX = 0
						maxX = width / 2
						minY = height / 2 + 1
						maxY = height
					Case 3
						minX = width / 2 + 1
						maxX = width
						minY = height / 2 + 1
						maxY = height
				End Select							
				x = Rnd(minX, maxX)
				y = Rnd(minY, maxY)
				dir = Rnd(0, 4)
				If isEnemyHere(x, y) = ENEMY_NOT_PRESENT And getType(x, y) = MAZE_TYPE_FLOOR
					positionFound = True
				Endif
			Wend
			en[i].setPosition(x, y, dir)
			enemyPresent[(y * width) + x] = i
			currentQuadrant = currentQuadrant + 1
			If currentQuadrant >= 4
				currentQuadrant = 0
			Endif						
		Next
	End

	'------------------------------------------------------------------------------------------
	' isEnemyHere - checks to see if an enemy is present in the target square
	'------------------------------------------------------------------------------------------		
	Method isEnemyHere:Int(x:Int, y:Int)
		Return enemyPresent[(y * width) + x]
	End

	Method setEnemyPresent:Void(x:Int, y:Int, val:Int)
		enemyPresent[(y * width) + x] = val
	End
	
	'------------------------------------------------------------------------------------------
	' getEnemy - returns the enemy present in the target square.  Assumes that a check for
	'            isEnemyHere() was done in advance to make sure an enemy actually exists.  
	'------------------------------------------------------------------------------------------		
	Method getEnemy:Enemy(x:Int, y:Int)
		Return en[enemyPresent[(y * width) + x]]
	End
	
	'------------------------------------------------------------------------------------------
	' initItemStruct - marks the maze as containing no items.
	'------------------------------------------------------------------------------------------		
	Method initItemStruct:Void()
		For Local i:Int = 0 To width - 1
			For Local j:Int = 0 To height - 1
				items[(width * j) + i] = MAZE_NO_ITEM
			Next
		Next
	End
		
	'------------------------------------------------------------------------------------------
	' generateItems - creates the specified number of items, randomly placed throughout the
	'                 floor.  If consumables is set to True, then bombs/hearts/str/swords are
	'                 created.  If False, then treasure is created.  
	'------------------------------------------------------------------------------------------				
	Method generateItems:Void(floor:Int, nItems:Int, consumables:Bool)
		Local randNum:Int
		Local lowEnd:Int
		Local highEnd:Int
		Local idx:Int 
	    Local foundLocation:Bool
		Local x:Int
		Local y:Int
		Local itemType:Int
		
		' In theory, this loop might never end.  In practice, it will, and very quickly.
		For Local count:Int = 0 To nItems - 1
			foundLocation = False
			While foundLocation = False
				x = Rnd(0, width)
				y = Rnd(0, height)
				If getType(x, y) = MAZE_TYPE_FLOOR And items[(y * width) + x] = MAZE_NO_ITEM
					foundLocation = True
				Endif
			Wend
			
			' Pick a random number and consult the appropriate chart for the current floor
			' to decide what item to create.  
			itemType = 0
			randNum = Rnd(0, 1000)			
			If consumables = True
				If randNum >= 0 And randNum < CONSUMABLE_RARITY[0]
					itemType = ITEM_CONSUMABLE_OFFSET
				Else
					For idx = 1 To ITEM_NUM_CONSUMABLES - 1
   						lowEnd = CONSUMABLE_RARITY[idx - 1]
						highEnd = CONSUMABLE_RARITY[idx]
						If randNum >= lowEnd And randNum < highEnd
							itemType = ITEM_CONSUMABLE_OFFSET + idx
						Endif
					Next
				Endif			
			Else
				If randNum >= 0 And randNum < ITEM_ODDS[floor * ITEM_NUM_ITEMS]
					itemType = 0
				Else
					For idx = 1 To ITEM_NUM_ITEMS - 1
	   					lowEnd = ITEM_ODDS[floor * ITEM_NUM_ITEMS + (idx - 1)]
						highEnd = ITEM_ODDS[floor * ITEM_NUM_ITEMS + idx]
						If randNum >= lowEnd And randNum < highEnd
							itemType = idx
						Endif
					Next
				Endif
			Endif
			items[(y * width) + x] = itemType
		Next
		
		Return
	End
	
	'------------------------------------------------------------------------------------------
	' create - call the maze generator to construct the actual maze walls 
	'------------------------------------------------------------------------------------------		
	Method create:Void(w:Int, h:Int, rooms:Int, upstairs:Int=1, downstairs:Int=1)		
		gen = New MazeGenerator(w, h, rooms)
		gen.generate(MAZE_GEN_RECURSIVE_BACKTRACKER)
			
		origWidth = w
		origHeight = h
		width = (origWidth * 2) + 1
		height = (origHeight * 2) + 1
		scrollAmount = 0
		isScrolling = False
		doneScrolling = False
		Return
	End
	
	'------------------------------------------------------------------------------------------
	' getItem - accessor for the items[] array
	'------------------------------------------------------------------------------------------		
	Method getItem:Int(x:Int, y:Int)
		Return items[(y * width) + x]
	End
	
	'------------------------------------------------------------------------------------------
	' startScroll - starts the smooth scrolling process in the specified direction. 
	'------------------------------------------------------------------------------------------		
	Method startScroll:Void(dir:Int)
		isScrolling = True
		doneScrolling = False
		setScrollDirection(dir)
		Return
	End
	
	'------------------------------------------------------------------------------------------
	' getScrollDirection - accessor for scrollDirection
	'------------------------------------------------------------------------------------------		
	Method getScrollDirection:Int()
		Return scrollDirection
	End
	
	'------------------------------------------------------------------------------------------
	' setScrollDirection - sets the direction of the scroll, adjusting the 'scrollAmount' 
	'                      factor as necessary.
	'------------------------------------------------------------------------------------------		
	Method setScrollDirection:Void(dir:Int)
		scrollDirection = dir
		Select dir
			Case DIRECTION_NORTH
				scrollAmount = MAZE_SCROLL_SPEED
			Case DIRECTION_SOUTH
				scrollAmount = -1 * MAZE_SCROLL_SPEED
			Case DIRECTION_EAST
				scrollAmount = -1 * MAZE_SCROLL_SPEED
			Case DIRECTION_WEST
				scrollAmount = MAZE_SCROLL_SPEED
		End Select
	
		Return
		
	End
	
	'------------------------------------------------------------------------------------------
	' getStairLink - Find the stair id of the set of stairs positioned at the specified x,y
	'                location. 
	'------------------------------------------------------------------------------------------		
	Method getStairLink:Int(x:Int, y:Int, stairType:Int)
		Local count:Int
		
		If stairType = MAZE_TYPE_UP_STAIRS
			For count = 0 To MAZE_STAIR_TYPE_PER_FLOOR
				If upstairLink[count * 2] = x And upstairLink[count * 2 + 1] = y
					Return count
				Endif
			Next
		Endif

		If stairType = MAZE_TYPE_DOWN_STAIRS
			For count = 0 To MAZE_STAIR_TYPE_PER_FLOOR
				If downstairLink[count * 2] = x And downstairLink[count * 2 + 1] = y
					Return count
				Endif
			Next
		Endif
		
		Return 0
	End
		
	'------------------------------------------------------------------------------------------
	' getStairLinkPos - find the target location of the specified stairs (that is, the x,y 
	'                   location on the floor that the stairs will take you to. 
	'------------------------------------------------------------------------------------------			
	Method getStairLinkPos:Int[](idx:Int, stairType:Int)
		Local pos:Int[] = New Int[2]
		
		If stairType = MAZE_TYPE_UP_STAIRS
			pos[0] = upstairLink[idx * 2]
			pos[1] = upstairLink[idx * 2 + 1]
		Else
			pos[0] = downstairLink[idx * 2]
			pos[1] = downstairLink[idx * 2 + 1]
		Endif
		
		Return pos
	End
		
	'------------------------------------------------------------------------------------------
	' getScroll - accessor for scrollAmount
	'------------------------------------------------------------------------------------------			
	Method getScroll:Int()
		Return scrollAmount
	End

	'------------------------------------------------------------------------------------------
	' getIsScrolling - accessor for isScrolling
	'------------------------------------------------------------------------------------------				
	Method getIsScrolling:Bool()
		Return isScrolling
	End
	
	'------------------------------------------------------------------------------------------
	' getDoneScrolling - accessor for doneScrolling
	'------------------------------------------------------------------------------------------			
	Method getDoneScrolling:Bool()
		Return doneScrolling
	End
	
	'------------------------------------------------------------------------------------------
	' setDoneScrolling - set the doneScrolling flag
	'------------------------------------------------------------------------------------------				
	Method setDoneScrolling:Void(state:Bool)
		doneScrolling = state
		Return
	End 
	
	'------------------------------------------------------------------------------------------
	' incrementScroll - change the amount that the screen has scrolled.  If the amount scrolled
	'                   is equal to an entire block size, then stop scrolling.
	'------------------------------------------------------------------------------------------				
	Method incrementScroll:Void()
		If isScrolling = True
			scrollAmount = scrollAmount + MAZE_SCROLL_SPEED
			If scrollAmount > UI_BLOCK_SIZE
				scrollAmount = 0
				isScrolling = False
				doneScrolling = True
			Endif
		Endif
	End
	
	'------------------------------------------------------------------------------------------
	' markAllAsHidden - cover all squares with fog. 
	'------------------------------------------------------------------------------------------				
	Method markAllAsHidden:Void()
		' Mark all non-edge blocks as hidden
		For Local i:Int = 1 To (height - 2)
			For Local j:Int = 1 To (width - 2)
				hidden[(i * width) + j] = True	
			Next
		Next	
		Return
	End
	
	'------------------------------------------------------------------------------------------
	' checkForItem - looks to see if an item was found in the player's position.  If so,
	'                take it and perform the appropriate action, depending on whether the item
	'                is treasure or a consumable. 
	'------------------------------------------------------------------------------------------				
	Method checkForItem:Void(p:Player, floor:Int, difficulty:Int)
		Local pos:Int[] = p.getPosition()
		Local offset:Int = (pos[1] * width) + pos[0]
		Local curStr:Int
		
		If items[offset] <> MAZE_NO_ITEM
			If items[offset] < ITEM_NUM_ITEMS
	  			p.adjustScore( ITEM_VALUES[ items[ offset ] ] * floor * difficulty)
			Else If items[offset] >= ITEM_CONSUMABLE_OFFSET
				Local hp:Int = p.getHp()
				Local bo:Int = p.getBombs()
				Local sw:Int = p.getSwords()
				Local st:Int = p.getStrength()
				
				Select items[offset]
					Case ITEM_ONE_HEART
						If hp >= PLAYER_MAX_HP
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else
							p.setHp(hp + 1)
						Endif
					Case ITEM_TWO_HEARTS
						If hp >= PLAYER_MAX_HP
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else
							p.setHp(hp + 2)
						Endif
					Case ITEM_THREE_HEARTS
						If hp >= PLAYER_MAX_HP
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else
							p.setHp(hp + 3)
						Endif
					Case ITEM_ONE_SWORD
						If sw >= PLAYER_MAX_SWORDS
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else						
							p.setSwords(sw + 1)
						Endif
					Case ITEM_TWO_SWORDS
						If sw >= PLAYER_MAX_SWORDS
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else						
							p.setSwords(sw + 2)
						Endif
					Case ITEM_THREE_SWORDS
						If sw >= PLAYER_MAX_SWORDS
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else						
							p.setSwords(sw + 3)
						Endif
					Case ITEM_ONE_STR
						If st >= PLAYER_MAX_STRENGTH
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else						
							p.setStrength(st + 1)
							curStr = p.getStrength()
							For Local i:Int = 0 To en.Length - 1
								en[i].setCurHp(difficulty, curStr)
							Next
						Endif
					Case ITEM_TWO_STRS
						If st >= PLAYER_MAX_STRENGTH
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else						
							p.setStrength(st + 2)
							curStr = p.getStrength()
							For Local i:Int = 0 To en.Length - 1
								en[i].setCurHp(difficulty, curStr)
							Next
						Endif		
					Case ITEM_THREE_STRS
						If st >= PLAYER_MAX_STRENGTH
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else						
							p.setStrength(st + 3)
							curStr = p.getStrength()
							For Local i:Int = 0 To en.Length - 1
								en[i].setCurHp(difficulty, curStr)
							Next
						Endif
					Case ITEM_ONE_BOMB
						If bo >= PLAYER_MAX_BOMBS
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else
							p.setBombs(bo + 1)
						Endif
					Case ITEM_TWO_BOMBS
						If bo >= PLAYER_MAX_BOMBS
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else
							p.setBombs(bo + 2)
						Endif
					Case ITEM_THREE_BOMBS
						If bo >= PLAYER_MAX_BOMBS
							p.adjustScore( CONSUMABLE_ITEM_VALUES[ (items[offset] - ITEM_CONSUMABLE_OFFSET) ] * floor * difficulty)
						Else
							p.setBombs(bo + 3)
						Endif
				End Select
			Endif
			items[(pos[1] * width) + pos[0]] = MAZE_NO_ITEM
		Endif
	End
	
	'------------------------------------------------------------------------------------------
	' convertGeneratorToMaze - takes a generated maze (consisting of a series of blocks 
	'                          with up to four walls), and 'expands' it so that each wall
	'                          is represented by a block in the maze as presented to the
	'                          player.  
	'------------------------------------------------------------------------------------------				
	Method convertGeneratorToMaze:Void()
		blocks = New Int[width * height]
		hidden = New Bool[width * height]
		items = New Int[width * height]

		' Set the whole maze to floor
		For Local i:Int = 0 To (height - 1)
			For Local j:Int = 0 To (width - 1)
				blocks[(i * width) + j] = MAZE_TYPE_FLOOR
			Next
		Next

		markAllAsHidden()
		
		' Set the entire first row to permanent wall
		For Local i:Int = 0 To (width - 1)
			blocks[i] = MAZE_TYPE_PERMANENT_WALL
		Next

		' Set the entire first column to permanent wall
		For Local i:Int = 0 To (height - 1)
			blocks[(i * width)] = MAZE_TYPE_PERMANENT_WALL
		Next
		
		' If you have to ask... ugh.  I can hardly explain it myself.
		' This would be much easier with multi-dimensional arrays...
		'
		' Briefly:
		'  When expanding a set of 4 walls to a set of blocks representing
		'  those walls, the expansion looks like this:
		'                                           _     XXX
		'  _      XXX     _     XXX    _    XXX      |      X     
		' | |  =  X X ,  |   =  X   ,     =      ,  -  =  XXX etc.
		'  -      XXX     -     XXX    -    XXX    |      X
		'                                           -     XXX 
		'                                                 
		' In this case, a block of 9 squares (representing one cell of the 
		' original maze, always contains an 'X' in each of the 4 corners,
		' and contains up to 4 additional Xs depending on which walls are
		' destroyed.  Since each cell contains a list of destroyed walls,
		' adjacent cells both document the same destroyed wall (i.e. if a
		' cell at (3,2) is missing an East wall, the cell at (4,2) is missing
		' a West wall.  
		'  
		' Because of this, we can get away with only checking the East and 
		' South directions for all squares other than the last.  Drawing a
		' set of solid walls around the entire maze accounts for the row of
		' squares that are ignored.
		'
		' The actual code itself is ugly because it implements the maze using
		' a single 1D array, so most of the math is calculating offsets into
		' that array.  The '+1' and '+2' represent the fact that one cell is
		' expanded into a 4x4 cell attached to a previous one (creating a net
		' 9x9 cell that represents all 4 walls.  0 represents the existing 
		' walls -- 1 represents the 2nd row and column of Xs from above, and +2
		' the third.  
		' 
		' Again, ugh.  Sorry for the ugly.
		'
		For Local i:Int = 0 To (origWidth - 1)
			For Local j:Int = 0 To (origHeight - 1)
				If gen.isSet(i, j, DIRECTION_EAST)
					blocks[((j * 2 + 1) * width) + (i * 2) + 2] = MAZE_TYPE_WALL
				Endif
				If gen.isSet(i, j, DIRECTION_SOUTH)
					blocks[((j * 2 + 2) * width) + (i * 2) + 1] = MAZE_TYPE_WALL
				Endif
				blocks[((j * 2 + 2) * width) + (i * 2) + 2] = MAZE_TYPE_WALL
			Next
		Next
		
		' Set the last row to permanent wall
		For Local i:Int = 0 To (width - 1)
			blocks[((height - 1) * width) + i] = MAZE_TYPE_PERMANENT_WALL
		Next
		
		' Set the last column to permanent wall
		For Local i:Int = 0 To (height - 1)
		    blocks[(i * width) + (width - 1)] = MAZE_TYPE_PERMANENT_WALL
		Next
		
		' Finally, scan for any squares that are totally surrounded by floor.
		' These can be removed. 
		For Local i:Int = 1 To (origWidth - 2)
			For Local j:Int = 1 To (origHeight - 2)
				If blocks[((j * 2 + 1) * width) + (i * 2) + 2] = MAZE_TYPE_FLOOR And
				   blocks[((j * 2 + 2) * width) + (i * 2) + 1] = MAZE_TYPE_FLOOR And
				   blocks[((j * 2 + 3) * width) + (i * 2) + 2] = MAZE_TYPE_FLOOR And
				   blocks[((j * 2 + 2) * width) + (i * 2) + 3] = MAZE_TYPE_FLOOR
						blocks[((j * 2 + 2) * width) + (i * 2) + 2] = MAZE_TYPE_FLOOR
				Endif
			Next
		Next
		
		Return
	End

	'------------------------------------------------------------------------------------------
	' canSeeBetween
	'   Determines if a wall or fog (or just excessive distance) is blocking two 
	'   points in the maze.  If so, the two targets (generally the player and 
	'   an enemy) can't see each other.  
	'------------------------------------------------------------------------------------------				
	Method canSeeBetween:Bool(x1:Int, y1:Int, x2:Int, y2:Int, maxDistance:Float=999.99)
		Local distance:Float = Sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)))
		Local slope:Float
		Local startX:Int
		Local endX:Int
		Local currentY:Float
		Local currentX:Float
		Local startY:Int
		Local endY:Int
		Local pointType:Int
		Local flatY:Int
 		Local flatX:Int		
				
		' If they're too far apart, return (before all the nasty math starts...)
		If distance > maxDistance
			Return False
		Endif
				
		' If the two targets are separated only vertically...
		If x1 = x2
			' ...this is a special case, can't divide by zero.  Do a different kind of check.
			If y1 = y2
				Return True ' The two points are the same location
			' Find the object with the lower Y value and make it the starting object
			Elseif y1 < y2
				startY = y1
				endY = y2
			Elseif y1 > y2
				startY = y2
				endY = y1
			Endif
			
			' Starting from the first target, check to see if a wall or fog intersects the vertical
			' line extending toward the second target.  If there is an obstruction, return False.  
			For Local i:Int = startY To endY
				pointType = getType(x1, i)
				If pointType =  MAZE_TYPE_WALL Or pointType = MAZE_TYPE_PERMANENT_WALL Or isHidden(x1, i) = True
					Return False
				Endif
			Next						
			Return True
		Endif
		
		' The two targets are separated either horizontally, or by an arbitrary angle.  
		'
		' Steps:
		'  - Determine the slope.  The slope will be the same, regardless of which
		'    points we check first.
		'
		slope = Float(Float(y2 - y1) / Float(x2 - x1))
		
		' In all of the following cases, we act as if the line extends from the center of
		' the first target's square to the center of the second target's square.  The player's
		' eyes aren't at the top left corner of the square, so this will make the line of 
		' sight calculations a little more accurate. 
		
		' If the slope is very steep, start with the object that has the lowest Y value
		' (we'll be moving along the vertical axis)		
		If slope > 1.0 Or slope < -1.0
			If y2 < y1
				startY = y2
				endY = y1
				startX = x2
				endX = x1
			Else
				startY = y1
				endY = y2
				startX = x1
				endX = x2
			Endif

			' since the slope is steep, move along the y axis instead of the x axis.  This
			' requires us to use the slope's reciprocal to get the correct amount of movement
			' per unit of vertical travel.  			
			slope = 1.0 / slope
			
			' Use the center of each square when doing calculations.
			' There are two additional calculations done - depending on which half of the
			' square the line intersects, we choose to add the adjacent square in that direction
			' to the search, since, in theory, the range of sight one block wide centered at
			' the line's location covers the additional, adjacent square.  
			For Local i:Float = (startY + 0.5) To (endY + 0.5) Step 1.0
				currentX = (startX + 0.5) + ((i - startY - 0.5) * slope)
				flatX = Floor(currentX)
				If currentX - flatX > 0.5
					pointType = getType(flatX + 1, i)
					If pointType =  MAZE_TYPE_WALL Or pointType = MAZE_TYPE_PERMANENT_WALL Or isHidden(flatX + 1, i) = True
						Return False
					Endif				
				Endif
				If currentX - flatX < 0.5
					pointType = getType(flatX - 1, i)
					If pointType =  MAZE_TYPE_WALL Or pointType = MAZE_TYPE_PERMANENT_WALL Or isHidden(flatX - 1, i) = True
						Return False
					Endif
				Endif
				pointType = getType(flatX, i)
				If pointType =  MAZE_TYPE_WALL Or pointType = MAZE_TYPE_PERMANENT_WALL Or isHidden(flatX, i) = True
					Return False
				Endif
			Next		
		Else
			If x2 < x1
				startX = x2
				endX = x1
				startY = y2
				endY = y1
			Else
				startX = x1
				endX = x2	
				startY = y1
				endY = y2
			Endif
			
			For Local i:Float = startX + 0.5 To endX + 0.5 Step 1.0
				currentY = (startY + 0.5) + ((i - startX - 0.5) * slope)
				flatY = Floor(currentY)
				If currentY - flatY > 0.5
					pointType = getType(i, flatY + 1)
					If pointType =  MAZE_TYPE_WALL Or pointType = MAZE_TYPE_PERMANENT_WALL Or isHidden(i, flatY + 1) = True
						Return False
					Endif	
				Endif			
				If currentY - flatY < 0.5
			 	pointType = getType(i, flatY - 1)
					If pointType =  MAZE_TYPE_WALL Or pointType = MAZE_TYPE_PERMANENT_WALL Or isHidden(i, flatY - 1) = True
						Return False
					Endif
				Endif
				pointType = getType(i, flatY)
				If pointType =  MAZE_TYPE_WALL Or pointType = MAZE_TYPE_PERMANENT_WALL Or isHidden(i, flatY) = True
					Return False
				Endif
			Next
		Endif				
		Return True
	End
	
	'------------------------------------------------------------------------------------------
	' getType - accessor for the blocks[] square type array
	'------------------------------------------------------------------------------------------		
	Method getType:Int(x:Int, y:Int)
		Return blocks[(y * width) + x]
	End

	'------------------------------------------------------------------------------------------
	' getType - sets the target square to the specified type (wall, floor, etc.)
	'------------------------------------------------------------------------------------------			
	Method setType:Void(x:Int, y:Int, type:Int)
		blocks[(y * width) + x] = type
		Return
	End
	
	'------------------------------------------------------------------------------------------
	' getWidth - accessor for width
	'------------------------------------------------------------------------------------------			
	Method getWidth:Int()
		Return width
	End

	'------------------------------------------------------------------------------------------
	' getHeight - accessor for height
	'------------------------------------------------------------------------------------------				
	Method getHeight:Int()
		Return height
	End
	
	'------------------------------------------------------------------------------------------
	' isHidden - accessor for the hidden[] array (determines whether the player has 'seen' the
	'            square before. 
	'------------------------------------------------------------------------------------------				
	Method isHidden:Bool(x:Int, y:Int)
		Return hidden[(y * width) + x]
	End
	
	'------------------------------------------------------------------------------------------
	' setHidden - changes the isHidden state for the target square
	'------------------------------------------------------------------------------------------				
	Method setHidden:Void(x:Int, y:Int, state:Bool)
		hidden[(y * width) + x] = state
	End
	
	'------------------------------------------------------------------------------------------
	' canMoveHere - returns True if the target square is not a wall or other impassible object.
	'------------------------------------------------------------------------------------------			
	Method canMoveHere:Bool(x:Int, y:Int)
		If (blocks[(y * width) + x] = MAZE_TYPE_FLOOR Or
		   blocks[(y * width) + x] = MAZE_TYPE_DESTROYED_WALL Or
		   blocks[(y * width) + x] = MAZE_TYPE_UP_STAIRS Or
		   blocks[(y * width) + x] = MAZE_TYPE_DOWN_STAIRS) And
		   isEnemyHere(x, y) = ENEMY_NOT_PRESENT
				Return True
		Endif
		
		Return False
	End
	
	'------------------------------------------------------------------------------------------
	' addStairs - places the specified type of stairs in the target quadrant.  A quadrant
	'             is used because we want to avoid placing all of the stairs in the same
	'             area (if possible)
	'------------------------------------------------------------------------------------------				
	Method addStairs:Void(quadrant:Int, stairsType:Int, index:Int)
		Local minX:Int
		Local minY:Int
		Local maxX:Int
		Local maxY:Int
		Local stairsPlaced:Bool
		Local x:Int
		Local y:Int
		
		' Pick the appropriate quadrant:
		'   1|2
		'   -+-
		'   3|4
		'
		Select quadrant
			Case 1
				minX = 1
				maxX = width / 2
				minY = 1
				maxY = height / 2
			Case 2
				minX = width / 2 + 1
				maxX = width - 2
				minY = 1
				maxY = height / 2
			Case 3
				minX = 1
				maxX = width / 2
				minY = height / 2 + 1
				maxY = height - 2
			Case 4
				minX = width / 2
				maxX = width - 2
				minY = height / 2 + 1
				maxY = height - 2
		End Select
		
		' Find a random location, and place stairs if the space is empty, and no immediately adjacent set
		' of stairs is found.  
		stairsPlaced = False
		While stairsPlaced = False
			x = Rnd(minX, maxX)
			y = Rnd(minY, maxY)
			If getType(x, y) = MAZE_TYPE_FLOOR
				' Only place the stairs if there aren't any adjacent ones. 
				If getType(x - 1, y) <> MAZE_TYPE_UP_STAIRS And getType(x - 1, y) <> MAZE_TYPE_DOWN_STAIRS
					If getType(x + 1, y) <> MAZE_TYPE_UP_STAIRS And getType(x + 1, y) <> MAZE_TYPE_DOWN_STAIRS
						If getType(x, y - 1) <> MAZE_TYPE_UP_STAIRS And getType(x, y - 1) <> MAZE_TYPE_DOWN_STAIRS
							If getType(x, y + 1) <> MAZE_TYPE_UP_STAIRS And getType(x, y + 1) <> MAZE_TYPE_DOWN_STAIRS
								setType(x, y ,stairsType)
								stairsPlaced = True
								If stairsType = MAZE_TYPE_UP_STAIRS
									upstairLink[(index * 2)] = x
									upstairLink[(index * 2) + 1] = y
								Else
									downstairLink[(index * 2)] = x
									downstairLink[(index * 2) + 1] = y
								Endif								
							Endif
						Endif
					Endif
				Endif
			Endif
		Wend
							
						
	End
End
