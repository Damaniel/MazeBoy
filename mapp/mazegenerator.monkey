'-----------------------------------------------------------------------------------------------
' mazegenerator.monkey
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

Class MazeGenerator

Private
	Field walls:Int[]
	Field width:Int
	Field height:Int
	Field roomSquares:Int[]
	
	Method generateAldousBroder:Void()
		Local rndX:Int		' Starting point
		Local rndY:Int		' Starting point
		Local curX:Int		' Current point
		Local curY:Int		' Current point
		Local newX:Int
		Local newY:Int
		Local direction:Int
		Local visited:Int = 0
		Local total:Int
		Local directionIsBad:Bool
		
		' Pick the initial spot and marked as visited, subtracting any
		' already-carved space		
		rndX = Rnd(0, width)
   	    rndY = Rnd(0, height)
		curX = rndX
		curY = rndY
		visited = 1 + calculateCarvedSpace()
		
		total = width * height
		
		While visited < total
			' Do all of the aldous-brodery stuff here
			directionIsBad = True
			While directionIsBad = True
				direction = Rnd(0, 4)
				If direction = DIRECTION_NORTH And curY > 0
					directionIsBad = False
				Else If direction = DIRECTION_SOUTH And curY < (height - 1)
					directionIsBad = False			
			   	Else If direction = DIRECTION_EAST And curX < (width - 1)
					directionIsBad = False			
				Else If direction = DIRECTION_WEST And curX > 0				
					directionIsBad = False
				Else
					directionIsBad = True
				Endif
			Wend
			
			' Go to the adjacent square and check to see if it's 
			' carved out
			Select direction
				Case DIRECTION_NORTH
					newX = curX
					newY = curY - 1
				Case DIRECTION_SOUTH
					newX = curX
					newY = curY + 1
				Case DIRECTION_EAST
					newX = curX + 1
					newY = curY
				Case DIRECTION_WEST
					newX = curX - 1
					newY = curY
			End Select
			
			If isCarved(newX, newY) = False
				Select direction
					Case DIRECTION_NORTH
						clearWall(curX, curY, DIRECTION_NORTH)
						clearWall(newX, newY, DIRECTION_SOUTH)
					Case DIRECTION_SOUTH
						clearWall(curX, curY, DIRECTION_SOUTH)
						clearWall(newX, newY, DIRECTION_NORTH)
					Case DIRECTION_EAST
						clearWall(curX, curY, DIRECTION_EAST)
						clearWall(newX, newY, DIRECTION_WEST)
					Case DIRECTION_WEST
						clearWall(curX, curY, DIRECTION_WEST)
						clearWall(newX, newY, DIRECTION_EAST)
				End Select
				visited = visited + 1											
			Endif
			
			curX = newX
			curY = newY
		Wend 
		
		Return
	End
	
	Method generateRecursiveBacktracker:Void()
		Local rndX:Int		' Starting point
		Local rndY:Int		' Starting point
		Local curX:Int		' Current point
		Local curY:Int		' Current point
		Local newX:Int
		Local newY:Int
		Local direction:Int
		Local visited:Int = 0
		Local total:Int
		Local stack:Int[] = New Int[width * height * 2]
		Local adjacentStack:Int[] = New Int[4]
		Local pointStackCounter:Int = 0
		Local adjacentStackCounter:Int = 0
		Local tmpDir:Int
		Local tmpX:Int
		Local tmpY:Int
		
		curX = 0
		curY = 0
		visited = 1 + calculateCarvedSpace()
		total = width * height
		
		While(visited < total)
			adjacentStackCounter = 0
			If(curX > 0)
				If isCarved(curX - 1, curY) = False And roomSquares[(curY * width) + curX - 1] = 0
					adjacentStack[adjacentStackCounter] = DIRECTION_WEST
					adjacentStackCounter = adjacentStackCounter + 1
				Endif
			Endif
			If(curX < (width - 1))
				If isCarved(curX + 1, curY) = False And roomSquares[(curY * width) + curX + 1] = 0
					adjacentStack[adjacentStackCounter] = DIRECTION_EAST
					adjacentStackCounter = adjacentStackCounter + 1
				Endif
			Endif
			If(curY > 0)
				If isCarved(curX, curY - 1) = False And roomSquares[((curY - 1) * width) + curX] = 0
					adjacentStack[adjacentStackCounter] = DIRECTION_NORTH
					adjacentStackCounter = adjacentStackCounter + 1
				Endif
			Endif
			If(curY < (height - 1))
				If isCarved(curX, curY + 1) = False And roomSquares[((curY + 1) * width) + curX] = 0
					adjacentStack[adjacentStackCounter] = DIRECTION_SOUTH
					adjacentStackCounter = adjacentStackCounter + 1
				Endif
			Endif										
		
			If adjacentStackCounter > 0
				direction = Rnd(0, adjacentStackCounter)
				stack[pointStackCounter] = curX
				stack[pointStackCounter + 1] = curY
				pointStackCounter = pointStackCounter + 2
				visited = visited + 1
				
				Select adjacentStack[direction]
					Case DIRECTION_NORTH
						clearWall(curX, curY, DIRECTION_NORTH)
						clearWall(curX, curY - 1, DIRECTION_SOUTH)						
						curY = curY - 1
					Case DIRECTION_SOUTH
						clearWall(curX, curY, DIRECTION_SOUTH)
						clearWall(curX, curY + 1, DIRECTION_NORTH)						
						curY = curY + 1
					Case DIRECTION_EAST
						clearWall(curX, curY, DIRECTION_EAST)
						clearWall(curX + 1, curY, DIRECTION_WEST)
						curX = curX + 1
					Case DIRECTION_WEST
						clearWall(curX, curY, DIRECTION_WEST)
						clearWall(curX - 1, curY, DIRECTION_EAST)
						curX = curX - 1
				End Select
			Else
				If pointStackCounter <= 0
					visited = total
				Else
					pointStackCounter = pointStackCounter - 2
					curX = stack[pointStackCounter]
					curY = stack[pointStackCounter + 1]
				Endif
			Endif
		Wend
		
		' Open up a bunch of new squares
		For Local i:Int = 0 To (width * height / 4)
			tmpDir = Rnd(4)
			tmpX = Rnd(width - 2) + 1
			tmpY = Rnd(height - 2) + 1
			
			If tmpDir = DIRECTION_NORTH
				clearWall(tmpX, tmpY, DIRECTION_NORTH)
				clearWall(tmpX, tmpY - 1, DIRECTION_SOUTH)
			Else If tmpDir = DIRECTION_SOUTH
				clearWall(tmpX, tmpY, DIRECTION_SOUTH)
				clearWall(tmpX, tmpY + 1, DIRECTION_NORTH)
			Else If tmpDir = DIRECTION_EAST
				clearWall(tmpX, tmpY, DIRECTION_EAST)
				clearWall(tmpX + 1, tmpY, DIRECTION_WEST)
			Else
				clearWall(tmpX, tmpY, DIRECTION_WEST)
				clearWall(tmpX - 1, tmpY, DIRECTION_EAST)
			Endif
		Next
		Return
	End
	
	Method generatePrim:Void()
		Return
	End
	
	Method generateKruskal:Void()
		Return
	End
	
	Method generateWilson:Void()
		Return
	End
	
	Method generateHuntAndKill:Void()
		Return
	End

Public	
	Method New(w:Int, h:Int, rooms:Int=0)
		walls = New Int[w * h * 4]
		roomSquares = New Int[w * h]
		
		width = w
		height = h
				
		' Put up all of the walls in every direction - they'll be knocked
		' down later by the 'generate' method.
		For Local i:Int = 0 To width - 1
			For Local j:Int = 0 To height - 1
				roomSquares[(j * width) + i] = 0
				For Local k:Int = 0 To 3 
					setWall(i, j, k)
				Next
			Next
		Next

		For Local i:Int = 0 To rooms
			Local roomWidth:Int = Rnd(2, 4)
			Local roomHeight:Int = Rnd(2, 4)	
			carveRoom(Rnd(1, width - (roomWidth + 2)), Rnd(1, height - (roomHeight + 2)), roomWidth, roomHeight)
		Next
		
		Return
	End
	
	'
	' getWall - returns the wall state at the given position / direction
	'
	Method getWall:Int(x:Int, y:Int, dir:Int)
		Return walls[(y * (width * 4)) + (x * 4) + dir]
	End
	
	' 
	' setWall - builds a wall at the given position / direction
	'
	Method setWall:Void(x:Int, y:Int, dir:Int)
		walls[(y * (width * 4)) + (x * 4) + dir] = WALL_SET
	End
	
	'
	' clearWall - destroys a wall at the given position / direction
	'
	Method clearWall:Void(x:Int, y:Int, dir:Int)
	    walls[(y * (width * 4)) + (x * 4) + dir] = WALL_CLEAR
	End
	
	'
	' isSet - checks to see if a wall is present at the given position / 
	'  direction
	'
	Method isSet:Bool(x:Int, y:Int, dir:Int)
		If x < 0 Or x >= width Or y < 0 Or y >= height
			Return False
		Endif
		
		If walls[(y * (width * 4)) + (x * 4) + dir] = WALL_SET
			Return True
		Else
			Return False
		Endif
		
		Return False
	End
	
	'
	' isCarved - checks to see if any of the walls of the selected location
	'  have already been carved - returns True if one or more has, False
	'  otherwise. 
	'
	Method isCarved:Bool(x:Int, y:Int)
		If (isSet(x, y, DIRECTION_NORTH) = False) Or
		   (isSet(x, y, DIRECTION_SOUTH) = False) Or
		   (isSet(x, y, DIRECTION_EAST) = False) Or
		   (isSet(x, y, DIRECTION_WEST) = False)
			Return True
		Else
			Return False
		Endif
		
		Return False
	End
	
	Method carveRoom:Void(minX:Int, minY:Int, w:Int, h:Int)
		
		For Local j:Int = minY To (minY + h - 1)
 			For Local i:Int = minX To (minX + w - 2)
				clearWall(i, j, DIRECTION_EAST)
				roomSquares[(j * width) + i] = 1
				
			Next
			For Local i:Int = minX + 1 To (minX + w - 1)
				clearWall(i, j, DIRECTION_WEST)
				roomSquares[(j * width) + i] = 1				
			Next
		Next
		
		For Local j:Int = minX To (minX + w - 1)
			For Local i:Int = minY To (minY + h - 2)
				clearWall(j, i, DIRECTION_SOUTH)
				roomSquares[(i * width) + j] = 1				
			Next
			For Local i:Int = minY + 1 To (minY + h - 1)
				clearWall(j, i, DIRECTION_NORTH)
				roomSquares[(i * width) + j] = 1				
			Next
		Next		
		
		Return
	End
	
	Method calculateCarvedSpace:Int()
	
		Local carved:Int = 0
		
		For Local i:Int = 0 To width - 1
			For Local j:Int = 0 To height - 1
				If isCarved(i, j) = True
					carved = carved + 1
				Endif
			Next
		Next
		
		Return carved
	End
		
	
	'
	' generate - generates a new maze
	'
	Method generate:Void(genMethod:Int = MAZE_GEN_ALDOUS_BRODER)
	
		Select genMethod
			Case MAZE_GEN_ALDOUS_BRODER
				generateAldousBroder()
			Case MAZE_GEN_RECURSIVE_BACKTRACKER
				generateRecursiveBacktracker()
			Case MAZE_GEN_PRIM
				generatePrim()
			Case MAZE_GEN_KRUSKAL
				generateKruskal()
			Case MAZE_GEN_WILSON
				generateWilson()
			Case MAZE_GEN_HUNT_AND_KILL
				generateHuntAndKill()
			Default	
				generateAldousBroder()	
		End Select
		
		Return
	End
	
End

