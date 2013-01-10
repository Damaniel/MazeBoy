'-----------------------------------------------------------------------------------------------
' MazeApp.monkey
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
Import mapp.globals
Import mapp.player
Import mapp.maze
Import mapp.screenrender
Import mapp.titlemazemanager
Import mapp.splashscreenmanager
Import mapp.difficultyselectmanager
Import mapp.enemy

'=============================================================================
' MazeApp - the main game class
'=============================================================================
Class MazeApp Extends App

Private
	' Class definitions
	Field m:Maze[MAZE_MAX_FLOORS]
	Field sr:ScreenRender
	Field p:Player
	Field tmm:TitleMazeManager
	Field smm:SplashScreenManager
	Field dsm:DifficultySelectManager
		
	' High score related things
	Field difficulties:Int[]
	Field depths:Int[]
	Field items:Int[]
	Field scores:Int[]
			
	' Current game state (used by the state machine)
	Field state:Int
	
	' Timers
	Field timerRate:Int
	
	' game difficulty
	Field difficulty:Int = DIFFICULTY_VERY_EASY
	
	' flags to determine whether a maze has already been generated for a
	' given floor (the maze persists for the duration of the game)
	Field mazeExists:Bool[MAZE_MAX_FLOORS]
	
	' The size of the maze on each floor of the dungeon, based on the selected
	' difficulty level
	Field MAZE_SIZES:Int[] = [14, 20, 22, 24, 28]

	' The number of floors in the dungeon for each difficulty level
	Field MAZE_FLOORS:Int[] = [3, 4, 4, 5, 6]
	
	' The number of up/down stairs on each floor per difficulty level
	Field MAZE_STAIRS:Int[] = [3, 3, 3, 2, 1]
	
	' The time (in seconds) alloted for each difficulty level	
	Field GAME_TIMES:Int[] = [300, 480, 600, 900, 1200]
	
	Field NUM_GENERATED_ITEMS:Int[] = [25, 40, 50, 60, 60]
	
	' The current floor (expressed in the range from 1+, not 0+)
	Field currentFloor:Int = 1
	
	' Counters representing the time remaining in the dungeon. secondCount is checked
	' per refresh to check if a second has passed
	Field timeRemaining:Int
	Field secondCounter:Int

	' Holds the direction that the player will be moving as soon as the smooth scroll
	' to the adjacent square finishes.  	
	Field tmpDir:Int
	
	' This is used to show the 'how to play' dialog only the *first* time the game is run.
	Field howToPlayShown:Bool
	
	' Flags for various between-screen transition effects
	Field isTransitioning:Bool
	Field isFloorTransitioning:Bool
	Field floorDoneTransitioning:Bool
	Field isTransitioningIn:Bool
	Field stopTransitioning:Bool
	Field transitionWidth:Int
	Field transitionSpeed:Int
	Field targetState:Int
	Field finishTransitionUp:Bool
	Field finishTransitionDown:Bool
	
	' Flags for various animation effects
	Field boyPosition:Int
	Field boyDirection:Int
	Field boyFrame:Int
	Field isBoyShown:Bool
	Field boyFrameTimer:Int
	Field boySpeed:Int
	
	Field currentRank:Int
	
	Field allowKeyRepeat:Bool
	Field keyRepeatTimer:Int
	Field repeatedKey:Int
	
	Const KEY_REPEAT_TIME:Int = 200
	
	'----------------------------------------------------------------------------
	' OnCreate - called once when the object is first created.
	'----------------------------------------------------------------------------
	Method OnCreate:Int()	
	
		allowKeyRepeat = True
		keyRepeatTimer = 0
		repeatedKey = 0
		
		isTransitioning = False
		isTransitioningIn = False
		stopTransitioning = False
		transitionWidth = 0
		transitionSpeed = 8
		targetState = STATE_GAME
		
		isFloorTransitioning = False
		floorDoneTransitioning = False
		finishTransitionUp = False
		finishTransitionDown = False
		
		boyPosition = -32
		boyDirection = DIRECTION_EAST
		boyFrame = 0
		boyFrameTimer = 0
		isBoyShown = False
		boySpeed = 4
			
		currentRank = 99
		
		Local highScoreState:String
		
		difficulties = New Int[NUM_HIGH_SCORE_ENTRIES]
		depths = New Int[NUM_HIGH_SCORE_ENTRIES]
		items = New Int[NUM_HIGH_SCORE_ENTRIES]
		scores = New Int[NUM_HIGH_SCORE_ENTRIES]	
		
		' Load the high score table 
		highScoreState = LoadState()
		If highScoreState
			prepHighScoreTable(highScoreState)
		Else
			' If there isn't a high score table, initialize it.
			For Local i:Int = 0 To NUM_HIGH_SCORE_ENTRIES - 1
				difficulties[i] = -1
				depths[i] = -1
				items[i] = -1
				scores[i] = -1
			Next		
		Endif
		
		p = New Player()
		For Local i:Int = 0 To 5
			mazeExists[i] = False
		Next
		howToPlayShown = False
		SetUpdateRate 60			    ' Attempt 60fps
		setState(STATE_SPLASH_SCREEN)	' start from the beginning 
		Return 0
	End
		
	Method processTransition:Void()
		If isTransitioning = True
			If isTransitioningIn = True	
				transitionWidth = transitionWidth - transitionSpeed
				If transitionWidth <= 0
					If isFloorTransitioning = True
						floorDoneTransitioning = True
						isFloorTransitioning = False
						isTransitioning = False
						isTransitioningIn = False
						stopTransitioning = True
					Else
						stopTransition(False, targetState)
						stopTransitioning = True
					Endif
				Endif
			Else
				transitionWidth = transitionWidth + transitionSpeed
				If transitionWidth >= (SCREEN_WIDTH / 2) + (10 * transitionSpeed)
					If isFloorTransitioning = True
						isTransitioningIn = True
						If finishTransitionUp = True
							completeUpStairsAction()
							finishTransitionUp = False
							finishTransitionDown = True
						Else
							completeDownStairsAction()
							finishTransitionDown = False
							finishTransitionUp = True
						Endif
					Else
						stopTransition(True, targetState)
						'stopTransitioning = True
					Endif
				Endif
			Endif
		Endif
	End
			
	Method startTransition:Void(transitionIn:Bool)
	   	isTransitioning = True
		isTransitioningIn = transitionIn
		If isTransitioningIn = True
			transitionWidth = SCREEN_WIDTH / 2
		Endif
	End
	
	Method stopTransition:Void(changeState:Bool, s:Int=STATE_GAME)
		isTransitioning = False
		isTransitioningIn = False
		transitionWidth = 0
		If changeState = True And s <> STATE_NULL
			setState(s)
		Endif
	End
	

	Method prepHighScoreTable:Void(scoreTable:String)
		Local splitTable:String[] = scoreTable.Split("#")
		Local counter:Int
		
		' Split the tables
		counter = 0
		For Local i:Int = 0 To NUM_HIGH_SCORE_ENTRIES - 1
			difficulties[i] = Int(splitTable[counter])
			counter = counter + 1
			depths[i] = Int(splitTable[counter])
			counter = counter + 1
			items[i] = Int(splitTable[counter])
			counter = counter + 1
			scores[i] = Int(splitTable[counter])
			counter = counter + 1
		Next
		
		Return
	End		
	
	Method updateHighScoreTable:Void()
		' Starting with entry 0, go until we find one lower than us.
		' Then, move the rest down and drop the bottom one.
		Local counter:Int = 0
		Local finished:Bool = False
		Local stringList:String[] = New String[NUM_HIGH_SCORE_ENTRIES * 4]
		Local resultString:String 
		
		While finished = False And counter < 10
			If scores[counter] < p.getScore()
				currentRank = counter
				finished = True
			Else
				counter = counter + 1
			Endif
		Wend
		
		For Local i:Int = NUM_HIGH_SCORE_ENTRIES - 2 To counter Step - 1
			difficulties[i+1] = difficulties[i]
			depths[i+1] = depths[i]
			items[i+1] = items[i]
			scores[i+1] = scores[i]
		Next
		
		difficulties[counter] = difficulty
		depths[counter] = p.getMaxDepth()
		items[counter] = p.getItemsCollected()
		scores[counter] = p.getScore()
		
		For Local i:Int = 0 To NUM_HIGH_SCORE_ENTRIES - 1
			stringList[(i * 4)] = difficulties[i]
			stringList[(i * 4) + 1] = depths[i]
			stringList[(i * 4) + 2] = items[i]
			stringList[(i * 4) + 3] = scores[i]
		Next
		
		resultString = "#".Join(stringList)
		SaveState(resultString)
		
		Return
	End
	 
	'----------------------------------------------------------------------------------
	' makeMazeAtFloor - generates a dungeon in the appropriate part of the Maze array
	'----------------------------------------------------------------------------------
	Method makeMazeAtFloor:Void(floor:Int)
		If floor = MAZE_FLOORS[difficulty]
			m[floor - 1] = New Maze(MAZE_SIZES[difficulty], 
			                        MAZE_SIZES[difficulty], 
			                        MAZE_SIZES[difficulty] / 2, 
			                        MAZE_STAIRS[difficulty], 
			                        0)
		Else
			m[floor - 1] = New Maze(MAZE_SIZES[difficulty], 
			                        MAZE_SIZES[difficulty], 
			                        MAZE_SIZES[difficulty] / 2, 
			                        MAZE_STAIRS[difficulty], 
			                        MAZE_STAIRS[difficulty])
		Endif
		mazeExists[floor - 1] = True
	End
			
	'---------------------------------------------------------------------------------
	' OnUpdate - run once per update - the actual update rate is set by 
	'  SetUpdateRate in the OnCreate method, but the actual rate may be less
	'  if the hardware can't keep up with the requested value.
	'----------------------------------------------------------------------------------
	Method OnUpdate:Int()
	
		processTransition()	
		
		checkStateTimers()	' Various timers can exist in each game state,
		                    ' check if any have finished
		
		If p.isDead() = True And state = STATE_GAME
			setState(STATE_DEAD)
		Endif
		
		processInputs()
		p.processAnimation()			' update character sprite if needed
		
		' Handle the case where the current smooth scroll between squares is complete.
		' Move the character's 'official' position in the maze to the new square
		' and process lighting.
		If m[currentFloor - 1] <> Null
			m[currentFloor - 1].incrementScroll()		
			If m[currentFloor - 1].getDoneScrolling() = True
	 			Local pa:Int[] = p.getPosition()		
				Select tmpDir
					Case DIRECTION_NORTH
						p.setPosition(pa[0], pa[1] - 1)
						m[currentFloor - 1].setDoneScrolling(False)
					Case DIRECTION_SOUTH
						p.setPosition(pa[0], pa[1] + 1)				
						m[currentFloor - 1].setDoneScrolling(False)
					Case DIRECTION_EAST
						p.setPosition(pa[0] + 1, pa[1])				
						m[currentFloor - 1].setDoneScrolling(False)				
					Case DIRECTION_WEST			
						p.setPosition(pa[0] - 1, pa[1])				
						m[currentFloor - 1].setDoneScrolling(False)
				End Select
				p.exposeMazePieces(m[currentFloor - 1])
				m[currentFloor - 1].checkForItem(p, currentFloor, difficulty + 1)			
			Endif
		Endif
		Return 0
	End
	
	'----------------------------------------------------------------------------------
	' OnRender - run once per frame; draws the screen depending on the state.
	'            (The STATE_GAME, STATE_TIME_GONE, and STATE_DEAD states all draw
	'             the maze and UI every frame, so that any action in the background
	'             still occurs while the dialog is placed over it).  
	'----------------------------------------------------------------------------------
	Method OnRender:Int()
		Cls 5, 5, 54
		Select state
			Case STATE_SPLASH_SCREEN
				sr.renderSplashScreen(smm)
			Case STATE_TITLE_SCREEN
				sr.renderTitleScreen(tmm)
			Case STATE_DIFFICULTY_SELECT
				sr.renderDifficultySelect(tmm, dsm, difficulty)
			Case STATE_GAME
				sr.renderMazeViewport(m[currentFloor - 1], p)	
				sr.renderUi(p, currentFloor, timeRemaining)
				If howToPlayShown = False
					sr.renderDialog(UI_DIALOG_HOW_TO_PLAY)
				Endif
			Case STATE_TIME_GONE
				sr.renderMazeViewport(m[currentFloor - 1], p)	
				sr.renderUi(p, currentFloor, timeRemaining)	
				sr.renderDialog(UI_DIALOG_TIME_UP)		
			Case STATE_DEAD
				sr.renderMazeViewport(m[currentFloor - 1], p)	
				sr.renderUi(p, currentFloor, timeRemaining)	
				sr.renderDialog(UI_DIALOG_DEAD)	
			Case STATE_WINNER
				sr.renderWinnerScreen(boyFrame, boyPosition, boyDirection)
			Case STATE_HIGH_SCORE
				sr.renderWinnerScreen(boyFrame, boyPosition, boyDirection)
				sr.renderHighScoreScreen(difficulties, depths, items, scores, currentRank)							
		End Select
		If isTransitioning = True
			sr.renderTransitionBars(transitionWidth)
		Endif		
		Return 0
	End
	
	'----------------------------------------------------------------------------------
	' setState - change the current state of the state machine and perform
	'  basic actions based on the new state. Not all states are listed in this 
	'  method, since some take no action when they're entered. 
	'----------------------------------------------------------------------------------
	Method setState:Void(newState:Int)
		' Set the new state
		state = newState
		
		' Do the state machine thing
		Select state
			Case STATE_SPLASH_SCREEN
				smm.init()                         ' start up the splash screen manager
				timerRate = Millisecs() + 5000     ' 5 seconds of title screen
			Case STATE_TITLE_SCREEN
				tmm.init()                         ' start up the title screen manager
			Case STATE_DIFFICULTY_SELECT
				dsm.init()                         ' start up the difficulty select manager
			Case STATE_GAME
  	 			Seed = Millisecs()	 	           ' Initialize the random seed
				p.init()				           ' reset the player
				For Local i:Int = 1 To MAZE_MAX_FLOORS  
					makeMazeAtFloor(i)					' Make the mazes
					m[i - 1].initItemStruct()
					m[i - 1].generateItems(i - 1, NUM_GENERATED_ITEMS[difficulty], False)    ' populate the floor with items
					m[i - 1].generateItems(i - 1, NUM_GENERATED_ITEMS[difficulty] / 2, True) ' populate the floor with consumables
					m[i - 1].generateEnemies(difficulty, i - 1)
	 		 	Next				
				findStairs(MAZE_TYPE_UP_STAIRS)			' Put the player on some up stairs
				p.setDirection(DIRECTION_SOUTH) 		' Face him down so his face can be seen
				p.exposeMazePieces(m[currentFloor - 1])	' Light the immediate vicinity
				timeRemaining = GAME_TIMES[difficulty]	' start the initial time counter
				secondCounter = Millisecs() + 1000
			Case STATE_WINNER
				boyPosition = -32
				boyDirection = DIRECTION_EAST
				boyFrame = 0
				boySpeed = 4
				boyFrameTimer = Millisecs() + BOY_ANIM_DURATION
				isBoyShown = False		
				updateHighScoreTable()		
		End Select
		
		Return
	End

	'----------------------------------------------------------------------------------
	' findStairs - puts the player on a random set of stairs of the selected type
	'----------------------------------------------------------------------------------	
	Method findStairs:Void(stairType:Int)
		Local x:Int
		Local y:Int
		Local stairsFound:Bool
		
		stairsFound = False
		While stairsFound = False
			x = Rnd(0, m[currentFloor - 1].getWidth())
			y = Rnd(0, m[currentFloor - 1].getHeight())
			If m[currentFloor - 1].getType(x, y) = stairType
				stairsFound = True
				p.setPosition(x,y)
			Endif
		Wend
		
		Return
	End
	
	'----------------------------------------------------------------------------------
	' checkStateTimers - for each state, check if various key timers have 
	'  triggered. Note: most animation and logic timers are stored within instances
	'  of the sprite/enemy classes, and are checked here via function call too. 
	'----------------------------------------------------------------------------------			
	Method checkStateTimers:Void()	
		Select state
			Case STATE_SPLASH_SCREEN
				smm.processAnimation()
				If Millisecs() >= timerRate	        ' If the splash screen has been on long enough,
					targetState = STATE_TITLE_SCREEN
					stopTransitioning = False
					transitionSpeed = 8					
					startTransition(False) 
				Endif
			Case STATE_TITLE_SCREEN
				If stopTransitioning = False And isTransitioning = False
					transitionSpeed = 8				
					startTransition(True)
				Endif
				tmm.processAnimation()		        ' animate all the title screen stuff	
			Case STATE_DIFFICULTY_SELECT
				tmm.processAnimation()              ' show the difficulty select menu, but make
				dsm.processAnimation()				' sure the background stuff is still happening
			Case STATE_GAME
				' Check to see if arrow key repeat is allowed now.
				If Millisecs() >= keyRepeatTimer
					allowKeyRepeat = True
					keyRepeatTimer = Millisecs() + KEY_REPEAT_TIME
				Endif
				
				If stopTransitioning = False And isTransitioning = False
					transitionSpeed = 8				
					startTransition(True)
				Endif			
				m[currentFloor - 1].processEnemyAnimation()
				If howToPlayShown = True And stopTransitioning = True And isTransitioning = False
					m[currentFloor - 1].processEnemyMovement(p, difficulty)
				Endif
				m[currentFloor - 1].processEnemyDeath(p, difficulty + 1, currentFloor)
				If Millisecs() >= secondCounter			  ' take a second off the counter, *unless*
					If howToPlayShown = True And stopTransitioning = True And isTransitioning = False 
						timeRemaining = timeRemaining - 1						
						If timeRemaining < 0              ' If there's no time left, end the game 
							timeRemaining = 0
							setState(STATE_TIME_GONE)
						Endif
					Endif
					secondCounter = Millisecs() + 1000
				Endif
			Case STATE_WINNER
				If stopTransitioning = False And isTransitioning = False
					transitionSpeed = 8				
					startTransition(True)
				Endif			
				If boyDirection = DIRECTION_WEST
					boyPosition = boyPosition - boySpeed
					If boyPosition < -80
						boyDirection = DIRECTION_EAST
					Endif
				Else
					boyPosition = boyPosition + boySpeed
					If boyPosition > SCREEN_WIDTH + 32
						boyDirection = DIRECTION_WEST
					Endif
				Endif
				If Millisecs() > boyFrameTimer
					boyFrame = boyFrame + 1
					If boyFrame >=4 
						boyFrame = 0
					Endif
					boyFrameTimer = Millisecs() + BOY_ANIM_DURATION
				Endif
			Case STATE_HIGH_SCORE
				If stopTransitioning = False And isTransitioning = False
					transitionSpeed = 8				
					startTransition(True)
				Endif			
				If boyDirection = DIRECTION_WEST
					boyPosition = boyPosition - boySpeed
					If boyPosition < -80
						boyDirection = DIRECTION_EAST
					Endif
				Else
					boyPosition = boyPosition + boySpeed
					If boyPosition > SCREEN_WIDTH + 32
						boyDirection = DIRECTION_WEST
					Endif
				Endif
				If Millisecs() > boyFrameTimer
					boyFrame = boyFrame + 1
					If boyFrame >=4 
						boyFrame = 0
					Endif
					boyFrameTimer = Millisecs() + BOY_ANIM_DURATION
				Endif			
		End Select
	End
	
	Method completeUpStairsAction:Void()
		Local stPos:Int[]
		Local stairIndex:Int			' used to find a matching set of linked stairs		
		Local pa:Int[] = p.getPosition()		
		
		stairIndex = m[currentFloor - 1].getStairLink(pa[0], pa[1], MAZE_TYPE_UP_STAIRS)		
		' On the hardest difficulty, rehide all the visible squares
		If difficulty = DIFFICULTY_INSANE
			m[currentFloor - 1].markAllAsHidden()
		Endif
		currentFloor = currentFloor - 1
		stPos = m[currentFloor - 1].getStairLinkPos(stairIndex, MAZE_TYPE_DOWN_STAIRS)
		p.setPosition(stPos[0], stPos[1])
		p.setDirection(DIRECTION_SOUTH)
		p.exposeMazePieces(m[currentFloor - 1])	
	End
	
	Method completeDownStairsAction:Void()
		Local stPos:Int[]
		Local stairIndex:Int			' used to find a matching set of linked stairs		
		Local pa:Int[] = p.getPosition()
		
		stairIndex = m[currentFloor - 1].getStairLink(pa[0], pa[1], MAZE_TYPE_DOWN_STAIRS)
		If currentFloor < MAZE_FLOORS[difficulty]
		' On the hardest difficulty, rehide all the visible squares
			If difficulty = DIFFICULTY_INSANE
				m[currentFloor - 1].markAllAsHidden()
			Endif
			currentFloor = currentFloor + 1
			If currentFloor > p.getMaxDepth()
				p.setMaxDepth(currentFloor)
			Endif
		Endif		
		stPos = m[currentFloor - 1].getStairLinkPos(stairIndex, MAZE_TYPE_UP_STAIRS)
		p.setPosition(stPos[0], stPos[1])	
		p.setDirection(DIRECTION_SOUTH)
		p.exposeMazePieces(m[currentFloor - 1])		
	End
	
	'----------------------------------------------------------------------------------	
	' processInputs - for each state, check for various key presses / mouse 
	'  clicks / touch events that control the game
	'----------------------------------------------------------------------------------	
	Method processInputs:Void()
		Select state
			Case STATE_SPLASH_SCREEN
				If anyKeyPressed()
					targetState = STATE_TITLE_SCREEN				
					stopTransitioning = False
					transitionSpeed = 8					
					startTransition(False) 
				End
			Case STATE_TITLE_SCREEN
				If anyKeyPressed()
					setState(STATE_DIFFICULTY_SELECT)  ' If the player presses a key on the title screen, move on
				End
			Case STATE_DIFFICULTY_SELECT
				If KeyHit(KEY_ESCAPE)
					setState(STATE_TITLE_SCREEN)
				End				
				If KeyHit(KEY_UP)                      ' move up through the difficulty list
					difficulty = difficulty - 1
					If difficulty < 0
						difficulty = DIFFICULTY_NUM_DIFFICULTIES - 1
					Endif
				End
				If KeyHit(KEY_DOWN)                    ' move down through the difficulty list
					difficulty = difficulty + 1
					If difficulty >= DIFFICULTY_NUM_DIFFICULTIES
						difficulty = 0
					Endif
				End
				If KeyHit(KEY_ENTER) Or KeyHit(KEY_SPACE)   ' Go on to the game with the selected difficulty setting
					targetState = STATE_GAME
					stopTransitioning = False
					transitionSpeed = 8					
					startTransition(False) 				
				End
			Case STATE_GAME
				If howToPlayShown = False And anyKeyPressed()    ' Clear the how to play dialog if a key is pressed
					howToPlayShown = True
				Endif
				If KeyHit(KEY_ESCAPE)				             
				    setState(STATE_TITLE_SCREEN)
				End
				If KeyHit(KEY_A)
					Local pa:Int[] = p.getPosition()
					Local en:Enemy
					If m[currentFloor - 1].isEnemyHere(pa[0], pa[1] - 1) <> ENEMY_NOT_PRESENT And pa[2] = DIRECTION_NORTH And p.hasSwords() = True
						en = m[currentFloor - 1].getEnemy(pa[0], pa[1] - 1)
						If en.getDeadState() = False
							en.damage()
							en.stun()						
							p.removeSword()
						Endif
					Endif	
					If m[currentFloor - 1].isEnemyHere(pa[0], pa[1] + 1) <> ENEMY_NOT_PRESENT And pa[2] = DIRECTION_SOUTH And p.hasSwords() = True
						en = m[currentFloor - 1].getEnemy(pa[0], pa[1] + 1)
						If en.getDeadState() = False
							en.damage()
							en.stun()						
							p.removeSword()
						Endif
					Endif		
					If m[currentFloor - 1].isEnemyHere(pa[0] + 1, pa[1]) <> ENEMY_NOT_PRESENT And pa[2] = DIRECTION_EAST And p.hasSwords() = True
						en = m[currentFloor - 1].getEnemy(pa[0] + 1, pa[1])
						If en.getDeadState() = False
							en.damage()
							en.stun()						
							p.removeSword()
						Endif
					Endif
					If m[currentFloor - 1].isEnemyHere(pa[0] - 1, pa[1]) <> ENEMY_NOT_PRESENT And pa[2] = DIRECTION_WEST And p.hasSwords() = True
						en = m[currentFloor - 1].getEnemy(pa[0] - 1, pa[1])
						If en.getDeadState() = False
							en.damage()
							en.stun()						
							p.removeSword()
						Endif
					Endif																						
				Endif		
				
				If KeyDown(KEY_RIGHT) = False And repeatedKey = KEY_RIGHT And allowKeyRepeat = False
					allowKeyRepeat = True						
				Elseif KeyDown(KEY_RIGHT) = True And allowKeyRepeat = True
					If KeyDown(KEY_SHIFT)
						p.setDirection(DIRECTION_EAST)
					Else
						' If the player can move to the target square and the map isn't currently scrolling
						' (implying a move is already in progress), then start the scroll in preparation 
						' for the move.  
						Local pa:Int[] = p.getPosition()
						If pa[0] < m[currentFloor - 1].getWidth() - 1 And m[currentFloor - 1].canMoveHere(pa[0] + 1, pa[1]) = True And m[currentFloor -1].getIsScrolling() = False
							m[currentFloor -1].startScroll(DIRECTION_EAST)
							tmpDir = DIRECTION_EAST
						Endif
						' If an enemy is standing in the target square, take damage.									
						If m[currentFloor - 1].isEnemyHere(pa[0] + 1, pa[1]) <> ENEMY_NOT_PRESENT
							p.injure()
						Endif
						' Even if the player didn't move (due to a wall), then make the player face to
						' the right and advance the animation timer
						p.setDirection(DIRECTION_EAST)
						p.turnOnAnimation()
					Endif
					allowKeyRepeat = False
					keyRepeatTimer = Millisecs() + KEY_REPEAT_TIME
					repeatedKey = KEY_RIGHT					
				Endif
				
				If KeyDown(KEY_LEFT) = False And repeatedKey = KEY_LEFT And allowKeyRepeat = False
					allowKeyRepeat = True
				Elseif KeyDown(KEY_LEFT) = True And allowKeyRepeat = True
					If KeyDown(KEY_SHIFT)
						p.setDirection(DIRECTION_WEST)
					Else
						' If the player can move to the target square and the map isn't currently scrolling
						' (implying a move is already in progress), then start the scroll in preparation 
						' for the move.				
						Local pa:Int[] = p.getPosition()
						If pa[0] > 0 And m[currentFloor - 1].canMoveHere(pa[0] - 1, pa[1]) = True And m[currentFloor -1].getIsScrolling() = False
							m[currentFloor -1].startScroll(DIRECTION_WEST)							
							tmpDir = DIRECTION_WEST				
						Endif							
						' If an enemy is standing in the target square, take damage.									
						If m[currentFloor - 1].isEnemyHere(pa[0] - 1, pa[1]) <> ENEMY_NOT_PRESENT
							p.injure()
						Endif
						' Even if the player didn't move (due to a wall), then make the player face to
						' the left and advance the animation timer							
						p.setDirection(DIRECTION_WEST)
						p.turnOnAnimation()					
					Endif
					allowKeyRepeat = False
					keyRepeatTimer = Millisecs() + KEY_REPEAT_TIME		
					repeatedKey = KEY_LEFT								
				Endif
				
				If KeyDown(KEY_UP) = False And repeatedKey = KEY_UP And allowKeyRepeat = False
					allowKeyRepeat = True
				Elseif KeyDown(KEY_UP)   = True And allowKeyRepeat = True
					If KeyDown(KEY_SHIFT)
						p.setDirection(DIRECTION_NORTH)
					Else									
						' If the player can move to the target square and the map isn't currently scrolling
						' (implying a move is already in progress), then start the scroll in preparation 
						' for the move.				
						Local pa:Int[] = p.getPosition()
						If pa[1] > 0 And m[currentFloor - 1].canMoveHere(pa[0], pa[1] - 1) = True And m[currentFloor -1].getIsScrolling() = False
							m[currentFloor -1].startScroll(DIRECTION_NORTH)					
							tmpDir = DIRECTION_NORTH
						Endif			
						' If an enemy is standing in the target square, take damage.									
						If m[currentFloor - 1].isEnemyHere(pa[0], pa[1] - 1) <> ENEMY_NOT_PRESENT
							p.injure() 
						Endif					
						' Even if the player didn't move (due to a wall), then make the player face up
						' and advance the animation timer					
						p.setDirection(DIRECTION_NORTH)
						p.turnOnAnimation()
					Endif
					allowKeyRepeat = False
					keyRepeatTimer = Millisecs() + KEY_REPEAT_TIME		
					repeatedKey = KEY_UP								
				Endif
				
				If KeyDown(KEY_DOWN) = False And repeatedKey = KEY_DOWN And allowKeyRepeat = False
					allowKeyRepeat = True
				Elseif KeyDown(KEY_DOWN) = True And allowKeyRepeat = True
					If KeyDown(KEY_SHIFT)
						p.setDirection(DIRECTION_SOUTH)
					Else									
						' If the player can move to the target square and the map isn't currently scrolling
						' (implying a move is already in progress), then start the scroll in preparation 
						' for the move.								
						Local pa:Int[] = p.getPosition()
						If pa[1] < m[currentFloor - 1].getHeight() - 1 And m[currentFloor - 1].canMoveHere(pa[0], pa[1] + 1) = True And m[currentFloor -1].getIsScrolling() = False
							m[currentFloor -1].startScroll(DIRECTION_SOUTH)					
							tmpDir = DIRECTION_SOUTH
						Endif				
						' If an enemy is standing in the target square, take damage.									
						If m[currentFloor - 1].isEnemyHere(pa[0], pa[1] + 1) <> ENEMY_NOT_PRESENT
							p.injure()
						Endif					
						' Even if the player didn't move (due to a wall), then make the player face down
						' and advance the animation timer					
						p.setDirection(DIRECTION_SOUTH)
						p.turnOnAnimation()
					Endif
					allowKeyRepeat = False
					keyRepeatTimer = Millisecs() + KEY_REPEAT_TIME	
					repeatedKey = KEY_DOWN									
				Endif
				
				If KeyHit(KEY_SPACE)				' use the stairs
					Local pa:Int[] = p.getPosition()
			
					' If on a set of up stairs, move down a floor and find the matching set of linked
					' down stairs.  Put the player there.
					If m[currentFloor - 1].getType(pa[0], pa[1]) = MAZE_TYPE_UP_STAIRS
						If currentFloor = 1
							' Exited the maze, go to end of game
							targetState = STATE_WINNER
							stopTransitioning = False
							transitionSpeed = 8
							startTransition(False) 	
						Else
							isFloorTransitioning = True
							floorDoneTransitioning = False
							finishTransitionUp = True
							finishTransitionDown = False
							stopTransitioning = False
							transitionSpeed = 16
							startTransition(False)
						Endif											
					' If on a set of down stairs, move up a floor and find the matching set of linked
					' up stairs. Put the player there. 
					Elseif m[currentFloor - 1].getType(pa[0], pa[1]) = MAZE_TYPE_DOWN_STAIRS
						isFloorTransitioning = True
						floorDoneTransitioning = False
						finishTransitionUp = False
						finishTransitionDown = True
						stopTransitioning = False	
						transitionSpeed = 16					
						startTransition(False)																
					Endif
				Endif
				If KeyHit(KEY_B)						' place a bomb as long as at least one remains
					If p.getBombs() > 0						
						Local pa:Int[] = p.getPosition()
						' Check to see if a non-permanent block is immediately in front of the player. 
						' Destroy it if there, and take a player's bomb out the inventory.
						Select pa[2]
							Case DIRECTION_NORTH
								If pa[1] > 1 And m[currentFloor - 1].getType(pa[0], pa[1] - 1) = MAZE_TYPE_WALL
									m[currentFloor - 1].setType(pa[0], pa[1] - 1, MAZE_TYPE_DESTROYED_WALL)
									p.removeBomb()
								Endif							
							Case DIRECTION_SOUTH
								If pa[1] < m[currentFloor - 1].getHeight() - 1 And m[currentFloor - 1].getType(pa[0], pa[1] + 1) = MAZE_TYPE_WALL
									m[currentFloor - 1].setType(pa[0], pa[1] + 1, MAZE_TYPE_DESTROYED_WALL)
									p.removeBomb()
								Endif								
							Case DIRECTION_EAST
								If pa[0] < m[currentFloor - 1].getWidth() - 1 And m[currentFloor - 1].getType(pa[0] + 1, pa[1]) = MAZE_TYPE_WALL
									m[currentFloor - 1].setType(pa[0] + 1, pa[1], MAZE_TYPE_DESTROYED_WALL)
									p.removeBomb()
								Endif										
							Case DIRECTION_WEST
								If pa[0] > 1 And m[currentFloor - 1].getType(pa[0] - 1, pa[1]) = MAZE_TYPE_WALL
									m[currentFloor - 1].setType(pa[0] - 1, pa[1], MAZE_TYPE_DESTROYED_WALL)
									p.removeBomb()
								Endif	
						End Select			
						' Light the newly exposed area.
						p.exposeMazePieces(m[currentFloor - 1])												
					Endif
				Endif				
			Case STATE_TIME_GONE
				If KeyHit(KEY_ENTER)
					targetState = STATE_TITLE_SCREEN
					stopTransitioning = False
					transitionSpeed = 8						
					startTransition(False) 					
				End					
			Case STATE_DEAD
				If KeyHit(KEY_ENTER)
					targetState = STATE_TITLE_SCREEN
					stopTransitioning = False
					transitionSpeed = 8						
					startTransition(False) 					
				End		
			Case STATE_WINNER
				If KeyHit(KEY_ENTER)
					setState(STATE_HIGH_SCORE)
				End	
			Case STATE_HIGH_SCORE
				If anyKeyPressed()
					targetState = STATE_TITLE_SCREEN
					stopTransitioning = False
					transitionSpeed = 8						
					startTransition(False) 					
				End												
		End Select
	End	
	
	'----------------------------------------------------------------------------------	
	' anyKeyPressed - returns True if any key on the keyboard is pressed, or if
	'  the mouse button is clicked, or if the screen is touched (depending on 
	'  platform.
	'
	' NOTE: keypress behavior via GetChar() appears to be broken on the XNA
	'  target.
	'----------------------------------------------------------------------------------	
	Method anyKeyPressed:Bool()
		If GetChar() <> 0 Or MouseHit() Or TouchHit()
			' 'Burn off' any extra characters in the buffer (there probably aren't any, but it doesn't hurt to check)
			While GetChar() <> 0
			Wend
			Return True
		Endif
		Return False
	End
	
Public

	'----------------------------------------------------------------------------
	' New - the constructor
	'----------------------------------------------------------------------------
	Method New()
		sr = New ScreenRender()
		tmm = New TitleMazeManager()
		smm = New SplashScreenManager()
		dsm = New DifficultySelectManager()
	End	
	
End

'=============================================================================
' MAIN
'=============================================================================
Function Main:Int()

	New MazeApp	
	Return 0

End
