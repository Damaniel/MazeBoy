'-----------------------------------------------------------------------------------------------
' screenrender.monkey
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
Import titlemazemanager
Import splashscreenmanager
Import difficultyselectmanager

Class ScreenRender
	Field mazeAreaX:Int
	Field mazeAreaY:Int
	Field mazeAreaWidth:Int
	Field mazeAreaHeight:Int
	Field uiAreaX:Int
	Field uiAreaY:Int
	Field uiAreaWidth:Int
	Field uiAreaHeight:Int
	
	Field blocksImg:Image
    Field uiPiecesImg:Image
	Field holyGoatImg:Image
	Field itemIconImg:Image
	Field digitsImg:Image
	Field treasureImg:Image
	Field consumableImg:Image
	Field enemyImg:Image
	Field timeUpImg:Image
	Field deadImg:Image
	Field howToPlayImg:Image
	Field hitAnimImg:Image
	Field highScoreImg:Image
	Field digitsYellowImg:Image
	Field difficultiesImg:Image
	Field difficultiesYellowImg:Image
	Field winnerScreenImg:Image
	Field blackImg:Image
	Field winnerboyImg:Image
	
	Method New()
		mazeAreaX = 0
		mazeAreaY = 0
		mazeAreaWidth = 640
		mazeAreaHeight = 480
		uiAreaX = 512
		uiAreaY = 0
		uiAreaWidth = 128
		uiAreaHeight = 320
			
		blocksImg = LoadImage("blocks.png")
		uiPiecesImg = LoadImage("ui.png")
		itemIconImg = LoadImage("itemicons.png")
	    digitsImg = LoadImage("digits.png")
		treasureImg  = LoadImage("treasure.png")
		consumableImg = LoadImage("consumables.png")
		enemyImg = LoadImage("enemies.png")
		timeUpImg = LoadImage("gameovertime.png")
		deadImg = LoadImage("gameoverdied.png")
		howToPlayImg = LoadImage("howtoplay.png")
		hitAnimImg = LoadImage("hitanim.png")
		highScoreImg = LoadImage("highscore.png")
		digitsYellowImg = LoadImage("digitsyellow.png")
		difficultiesImg = LoadImage("difficulties.png")
		difficultiesYellowImg = LoadImage("difficultiesyellow.png")
		winnerScreenImg = LoadImage("winner.png")
		blackImg = LoadImage("black.png")
		winnerboyImg = LoadImage("winnerboy.png")
		
	End
	
	Method renderTransitionBars:Void(width:Int)
		DrawImageRect(blackImg, 0, 0, 0, 0, width, SCREEN_HEIGHT)
		DrawImageRect(blackImg, SCREEN_WIDTH - width, 0, 0, 0, width, SCREEN_HEIGHT)
		Return
	End
	
	Method renderWinnerScreen:Void(frame:Int, pos:Int, dir:Int)
		Local frameOffset:Int
		
		If dir = DIRECTION_EAST
			frameOffset = 0
		Else
			frameOffset = 1
		Endif
		
		DrawImage(winnerScreenImg, 0, 0)
		DrawImageRect(winnerboyImg, pos, BOY_Y_POSITION, frame * UI_BLOCK_SIZE, frameOffset * UI_BLOCK_SIZE, UI_BLOCK_SIZE, UI_BLOCK_SIZE)		
	End
	
	Method renderHighScoreScreen:Void(difficulties:Int[], depths:Int[], items:Int[], scores:Int[], newRank:Int)
			
		' Draw the main high score dialog
		DrawImage(highScoreImg, 0, 0)
		
		For Local i:Int = 0 To NUM_HIGH_SCORE_ENTRIES - 1
			If difficulties[i] <> -1
				' Draw the rank digits
				If i = newRank
					renderNumber(i+1, HIGH_SCORE_RANK_X_POSITIONS[0], HIGH_SCORE_RANK_Y_POSITIONS[i], True, 0, True)
				Else
					renderNumber(i+1, HIGH_SCORE_RANK_X_POSITIONS[0], HIGH_SCORE_RANK_Y_POSITIONS[i], True, 0, False)
				Endif
				
				' Draw the difficulty level
				If i = newRank
					DrawImageRect(difficultiesYellowImg, 
					              HIGH_SCORE_RANK_X_POSITIONS[1], 
					              HIGH_SCORE_RANK_Y_POSITIONS[i], 
								  0, 
								  difficulties[i] * UI_DIGIT_HEIGHT,
								  HIGH_SCORE_DIFFICULTIES_WIDTH,
								  UI_DIGIT_HEIGHT)
				Else
					DrawImageRect(difficultiesImg, 
					              HIGH_SCORE_RANK_X_POSITIONS[1], 
					              HIGH_SCORE_RANK_Y_POSITIONS[i], 
								  0, 
								  difficulties[i] * UI_DIGIT_HEIGHT,
								  HIGH_SCORE_DIFFICULTIES_WIDTH,
								  UI_DIGIT_HEIGHT)			
				Endif
			
				' Draw the max depth
				If i = newRank
					renderNumber(depths[i], HIGH_SCORE_RANK_X_POSITIONS[2], HIGH_SCORE_RANK_Y_POSITIONS[i], True, 0, True)
				Else
					renderNumber(depths[i], HIGH_SCORE_RANK_X_POSITIONS[2], HIGH_SCORE_RANK_Y_POSITIONS[i], True, 0, False)			
				Endif
			
				' Draw the number of collected items
				If i = newRank
					renderNumber(items[i], HIGH_SCORE_RANK_X_POSITIONS[3], HIGH_SCORE_RANK_Y_POSITIONS[i], True, 0, True)			
				Else
						renderNumber(items[i], HIGH_SCORE_RANK_X_POSITIONS[3], HIGH_SCORE_RANK_Y_POSITIONS[i], True, 0, False)			
				Endif
			
				' Draw the score
				If i = newRank
					renderNumber(scores[i], HIGH_SCORE_RANK_X_POSITIONS[4], HIGH_SCORE_RANK_Y_POSITIONS[i], True, 0, True)			
				Else
					renderNumber(scores[i], HIGH_SCORE_RANK_X_POSITIONS[4], HIGH_SCORE_RANK_Y_POSITIONS[i], True, 0, False)			
				Endif
			Endif		
		Next
		
		Return
	End
	
	Method renderSplashScreen:Void(ssm:SplashScreenManager)
		Local img:Image = ssm.getBackground()
		Local positions:Int[] = ssm.getBarPositions()
		
		Cls 255, 255, 255
		
		If ssm.drawMainSplash() = True
			SetAlpha(ssm.getSplashAlpha())
			DrawImage(img, 0, 0)
			If(ssm.getSplashAlpha() <= SPLASH_ALPHA_THRESHOLD)
				ssm.setSplashAlpha(ssm.getSplashAlpha() + SPLASH_ALPHA_ADJUST)
			Endif
			SetAlpha(1.0)
		Endif

		' draw bars	
		DrawImageRect(img, positions[0], 0, 0, 0, SCREEN_WIDTH, SPLASH_SCREEN_BAR_HEIGHT)
		DrawImageRect(img, positions[1], SCREEN_HEIGHT - SPLASH_SCREEN_BAR_HEIGHT, 0, SCREEN_HEIGHT - SPLASH_SCREEN_BAR_HEIGHT, SCREEN_WIDTH, SPLASH_SCREEN_BAR_HEIGHT)
	
		Return		
	End

	Method renderTitleScreen:Void(tmm:TitleMazeManager)
		Local img:Image = tmm.getBackground()
		Local boyMini:Image = tmm.getSprite()
		Local playerPos:Int[] = tmm.getPlayerPosition()
		
		' Draw the background
		DrawImage(img, 0, 0)
		
		' Draw the visible and hidden parts of the screen
		For Local i:Int = 0 To TITLE_TILES_WIDTH - 1
			For Local j:Int = 0 To TITLE_TILES_HEIGHT - 1
				If tmm.isHidden(i, j) = True
					DrawImageRect(blocksImg, TITLE_SPRITE_INIT_X_OFFSET + (TITLE_SPRITE_SIZE * i), TITLE_SPRITE_INIT_Y_OFFSET + (TITLE_SPRITE_SIZE * j), UI_BLOCK_FOG * UI_BLOCK_SIZE, 0, TITLE_SPRITE_SIZE, TITLE_SPRITE_SIZE)
				Endif
			Next
		Next

		' Draw the player
		If playerPos[3] > 0
			DrawImageRect(boyMini, TITLE_SPRITE_INIT_X_OFFSET + TITLE_SPRITE_SIZE * playerPos[0], TITLE_SPRITE_INIT_Y_OFFSET + TITLE_SPRITE_SIZE * playerPos[1], TITLE_SPRITE_SIZE * playerPos[2], 0, TITLE_SPRITE_SIZE, TITLE_SPRITE_SIZE)
		Endif
		Return
	End
	
	Method renderDifficultySelect:Void(tmm:TitleMazeManager, dsm:DifficultySelectManager, difficulty:Int)
	
		Local backImg:Image
		Local diffImg:Image
		Local icon:Image
		
		renderTitleScreen(tmm)
		
		' Render back part
		backImg = dsm.getBackground()
		DrawImage(backImg, DIFFICULTY_SELECT_X, DIFFICULTY_SELECT_Y)		
		
		' Render description
		diffImg = dsm.getDifficultyImg(difficulty)
		DrawImage(diffImg, DIFFICULTY_SELECT_DESC_X, DIFFICULTY_SELECT_DESC_Y)
		
		' Render icons next to appropriate difficulty
		icon = dsm.getSelectIcon()
		DrawImage(icon, DIFFICULTY_ICON_LEFT_X, DIFFICULTY_ICON_Y + (difficulty * DIFFICULTY_ICON_SIZE))		
		DrawImage(icon, DIFFICULTY_ICON_RIGHT_X, DIFFICULTY_ICON_Y + (difficulty * DIFFICULTY_ICON_SIZE))

		Return
	End
	
	'
	' renderNumber - draws a number to the screen at the specified point.
	'  If rightJust is set to True, then the number will be right-justified.
	'  In this case, x and y should be set to the position of the *last*
	'  digit to be placed. 
	'
	Method renderNumber:Void(number:Int, x:Int, y:Int, rightJust:Bool=False, leadingZeros:Int=0, yellow:Bool=False)
	
		Local str:String
		Local len:Int   
		Local tmp:Int
		
		If leadingZeros > 0
			For Local i:Int = 1 To leadingZeros
				str = str + "0"
			Next
		Endif
		
		str = str + number
		len = str.Length()
			
		If(rightJust = True)
			For Local i:Int = len - 1 To 0 Step -1
				tmp = str[i] - 48
				If yellow = True
					DrawImageRect(digitsYellowImg, x - (UI_DIGIT_WIDTH * (len - 1 -i)), y, tmp * UI_DIGIT_WIDTH, 0, UI_DIGIT_WIDTH, UI_DIGIT_HEIGHT)
				Else
					DrawImageRect(digitsImg, x - (UI_DIGIT_WIDTH * (len - 1 -i)), y, tmp * UI_DIGIT_WIDTH, 0, UI_DIGIT_WIDTH, UI_DIGIT_HEIGHT)				
				Endif
			Next		
		Else
			For Local i:Int = 0 To len - 1
				tmp = str[i] - 48
				If yellow = True
					DrawImageRect(digitsYellowImg, x + (UI_DIGIT_WIDTH * i), y, tmp * UI_DIGIT_WIDTH, 0, UI_DIGIT_WIDTH, UI_DIGIT_HEIGHT)
				Else
					DrawImageRect(digitsImg, x + (UI_DIGIT_WIDTH * i), y, tmp * UI_DIGIT_WIDTH, 0, UI_DIGIT_WIDTH, UI_DIGIT_HEIGHT)
				Endif			
			Next
		Endif
		Return
	End
		
	Method renderUi:Void(p:Player, floor:Int, time:Int)

 		' Top	
		DrawImageRect(uiPiecesImg, uiAreaX, uiAreaY, UI_INTERFACE_TOP * UI_ELEMENT_SIZE, 0, 4 * UI_ELEMENT_SIZE, UI_ELEMENT_SIZE)
		
		' Bottom
		DrawImageRect(uiPiecesImg, uiAreaX, uiAreaY + uiAreaHeight - UI_ELEMENT_SIZE, UI_INTERFACE_BOTTOM * UI_ELEMENT_SIZE, 0, 4 * UI_ELEMENT_SIZE, UI_ELEMENT_SIZE)
		
		' Middle
		For Local i:Int = uiAreaY + UI_ELEMENT_SIZE To uiAreaY + uiAreaHeight - (UI_ELEMENT_SIZE * 2) Step UI_ELEMENT_SIZE
			DrawImageRect(uiPiecesImg, uiAreaX, i, UI_INTERFACE_MIDDLE * UI_ELEMENT_SIZE, 0, 4 * UI_ELEMENT_SIZE, UI_ELEMENT_SIZE)
		Next
		
		' Interface text (SC, FL, TI, HP, AT, ST, BO)
		DrawImageRect(uiPiecesImg, uiAreaX + UI_TEXT_HORZ_POS, uiAreaY + UI_SC_VERT_POS, UI_INTERFACE_SC * UI_ELEMENT_SIZE, 0, UI_ELEMENT_SIZE, UI_ELEMENT_SIZE)
		DrawImageRect(uiPiecesImg, uiAreaX + UI_TEXT_HORZ_POS, uiAreaY + UI_FL_VERT_POS, UI_INTERFACE_FL * UI_ELEMENT_SIZE, 0, UI_ELEMENT_SIZE, UI_ELEMENT_SIZE)
		DrawImageRect(uiPiecesImg, uiAreaX + UI_TEXT_HORZ_POS, uiAreaY + UI_TI_VERT_POS, UI_INTERFACE_TI * UI_ELEMENT_SIZE, 0, UI_ELEMENT_SIZE, UI_ELEMENT_SIZE)
		DrawImageRect(uiPiecesImg, uiAreaX + UI_TEXT_HORZ_POS, uiAreaY + UI_HP_VERT_POS, UI_INTERFACE_HP * UI_ELEMENT_SIZE, 0, UI_ELEMENT_SIZE, UI_ELEMENT_SIZE)
		DrawImageRect(uiPiecesImg, uiAreaX + UI_TEXT_HORZ_POS, uiAreaY + UI_AT_VERT_POS, UI_INTERFACE_AT * UI_ELEMENT_SIZE, 0, UI_ELEMENT_SIZE, UI_ELEMENT_SIZE)
		DrawImageRect(uiPiecesImg, uiAreaX + UI_TEXT_HORZ_POS, uiAreaY + UI_ST_VERT_POS, UI_INTERFACE_ST * UI_ELEMENT_SIZE, 0, UI_ELEMENT_SIZE, UI_ELEMENT_SIZE)
		DrawImageRect(uiPiecesImg, uiAreaX + UI_TEXT_HORZ_POS, uiAreaY + UI_BO_VERT_POS, UI_INTERFACE_BO * UI_ELEMENT_SIZE, 0, UI_ELEMENT_SIZE, UI_ELEMENT_SIZE)
					
		renderUiItems(p)
		renderNumber(p.getScore(), UI_SCORE_X, UI_SCORE_Y, True, 0, False)
		renderNumber(floor, UI_FLOOR_X, UI_FLOOR_Y, True, 0, False)
		renderTime(time)
		renderPlayer(p)
		renderItemScore(p)
		
		Return
	End
	
	Method renderDialog:Void(dialog:Int)
		If dialog = UI_DIALOG_TIME_UP
			DrawImageRect(timeUpImg, UI_TIME_UP_X, UI_TIME_UP_Y, 0, 0, UI_TIME_UP_WIDTH, UI_TIME_UP_HEIGHT)
		Elseif dialog = UI_DIALOG_HOW_TO_PLAY
			DrawImageRect(howToPlayImg, UI_HOW_TO_PLAY_X, UI_HOW_TO_PLAY_Y, 0, 0, UI_HOW_TO_PLAY_WIDTH, UI_HOW_TO_PLAY_HEIGHT)
		Elseif dialog = UI_DIALOG_DEAD
			DrawImageRect(deadImg, UI_DEAD_X, UI_DEAD_Y, 0, 0, UI_DEAD_WIDTH, UI_DEAD_HEIGHT)
		Endif	
		Return
	End
	
	Method renderItemScore:Void(p:Player)
		If p.isAnimScoreDisplaying() = True
			Local score:Int = p.getAnimScore()
			Local scorePos:Int = p.getAnimScorePos()	
			Local xPos:Int = mazeAreaWidth / UI_BLOCK_SIZE / 2
			Local yPos:Int = mazeAreaHeight / UI_BLOCK_SIZE / 2			
			renderNumber(score, xPos * UI_BLOCK_SIZE + (UI_BLOCK_SIZE / 2), (yPos * UI_BLOCK_SIZE) + scorePos + (UI_BLOCK_SIZE / 2), True, 0, False)
		Endif	
		
		Return	
	End
	
	Method renderPlayer:Void(p:Player)
	
		Local pos:Int[] = p.getPosition()
		Local dir:Int = pos[2]
		Local xPos:Int = mazeAreaWidth / UI_BLOCK_SIZE / 2
		Local yPos:Int = mazeAreaHeight / UI_BLOCK_SIZE / 2
		Local hitFrame:Int
		
		DrawImageRect(p.getSprite(), (xPos * UI_BLOCK_SIZE), yPos * UI_BLOCK_SIZE, p.getFrame() * p.getSpriteWidth(), dir * p.getSpriteWidth(), p.getSpriteWidth(), p.getSpriteWidth())
		
		If p.getShowHitAnim() = True
			hitFrame = p.getHitAnimFrame()
			DrawImageRect(hitAnimImg, 
			              xPos * UI_BLOCK_SIZE, 
			              yPos * UI_BLOCK_SIZE, 
			              hitFrame * UI_BLOCK_SIZE, 
		    	          0, 
		        	      UI_BLOCK_SIZE, 
		            	  UI_BLOCK_SIZE)	
		Endif					

		Return
	End
	
	
	Method renderTime:Void(time:Int)
	
		Local minutes:Int
		Local seconds:Int
		Local leadingZeros:Int = 0
		
		' Convert the time to minutes and seconds
		minutes = Floor(time / 60)
		seconds = time - (minutes * 60)
		If seconds < 10
			leadingZeros = 1
		Endif
		
		renderNumber(minutes, UI_TIME_MINUTES_X, UI_TIME_MINUTES_Y, True, 0, False)
		renderNumber(seconds, UI_TIME_SECONDS_X, UI_TIME_SECONDS_Y, True, leadingZeros, False)
		DrawImageRect(digitsImg, UI_TIME_COLON_X, UI_TIME_COLON_Y, UI_TIME_COLON_OFFSET * UI_DIGIT_WIDTH, 0, UI_DIGIT_WIDTH, UI_DIGIT_HEIGHT)		
		Return
	End
		
	'
	' renderUiItems - renders the individual icons representing the player's HP, 
	'  swords, bombs and strength.  This function is probably pretty expensive,
	'  processing-wise, especially since it gets called once per call to OnRender()
	'
	Method renderUiItems:Void(p:Player)
	
	    Local count:Int      = 0
	    Local count2:Int     = 0
		Local count3:Int     = 0
		Local count4:Int     = 0
		Local tmp:Int        = 0
		
		' Render hearts
		If(p.getHp() > 5)
	    	count = 5
		 	count2 = p.getHp() - 5
		Else
			count = p.getHp()
			count2 = 0
		Endif
		
		For Local i:Int = 1 To count
			DrawImageRect(itemIconImg, UI_HP_X + (i * UI_ITEM_SIZE), UI_HP_ROW1_Y, UI_ITEM_HEART_OFFSET * UI_ITEM_SIZE, 0, UI_ITEM_SIZE, UI_ITEM_SIZE)
		Next
		
		If count2 > 0
			For Local i:Int = 1 To count2
				DrawImageRect(itemIconImg, UI_HP_X + (i * UI_ITEM_SIZE), UI_HP_ROW2_Y, UI_ITEM_HEART_OFFSET * UI_ITEM_SIZE, 0, UI_ITEM_SIZE, UI_ITEM_SIZE)
			Next
		Endif
		
		' Render swords
		tmp = p.getSwords()
		If tmp <= 5
	    	count = tmp
			count2 = 0
			count3 = 0
			count4 = 0
		Elseif tmp > 5 And tmp <= 10
			count = 5
			count2 = tmp - 5
			count3 = 0
			count4 = 0 
		Elseif tmp > 10 And tmp <= 15
			count = 5
			count2 = 5
			count3 = tmp - 10
			count4 = 0
		Elseif tmp > 15 And tmp <= 20
			count = 5
			count2 = 5
			count3 = 5
			count4 = tmp - 15
		Endif
		
		For Local i:Int = 1 To count
			DrawImageRect(itemIconImg, UI_AT_X + (i * UI_ITEM_SIZE), UI_AT_ROW1_Y, UI_ITEM_SWORD_OFFSET * UI_ITEM_SIZE, 0, UI_ITEM_SIZE, UI_ITEM_SIZE)
		Next
		
		If count2 > 0
			For Local i:Int = 1 To count2
				DrawImageRect(itemIconImg, UI_AT_X + (i * UI_ITEM_SIZE), UI_AT_ROW2_Y, UI_ITEM_SWORD_OFFSET * UI_ITEM_SIZE, 0, UI_ITEM_SIZE, UI_ITEM_SIZE)
			Next
		Endif		

		If count3 > 0
			For Local i:Int = 1 To count3
				DrawImageRect(itemIconImg, UI_AT_X + (i * UI_ITEM_SIZE), UI_AT_ROW3_Y, UI_ITEM_SWORD_OFFSET * UI_ITEM_SIZE, 0, UI_ITEM_SIZE, UI_ITEM_SIZE)
			Next
		Endif		

		If count4 > 0
			For Local i:Int = 1 To count4
				DrawImageRect(itemIconImg, UI_AT_X + (i * UI_ITEM_SIZE), UI_AT_ROW4_Y, UI_ITEM_SWORD_OFFSET * UI_ITEM_SIZE, 0, UI_ITEM_SIZE, UI_ITEM_SIZE)
			Next
		Endif		

		' Render strengh dots
		If(p.getStrength() > 5)
	    	count = 5
		 	count2 = p.getStrength() - 5
		Else
			count = p.getStrength()
			count2 = 0
		Endif
		
		For Local i:Int = 1 To count
			DrawImageRect(itemIconImg, UI_ST_X + (i * UI_ITEM_SIZE), UI_ST_ROW1_Y, UI_ITEM_STR_OFFSET * UI_ITEM_SIZE, 0, UI_ITEM_SIZE, UI_ITEM_SIZE)
		Next
		
		If count2 > 0
			For Local i:Int = 1 To count2
				DrawImageRect(itemIconImg, UI_ST_X + (i * UI_ITEM_SIZE), UI_ST_ROW2_Y, UI_ITEM_STR_OFFSET * UI_ITEM_SIZE, 0, UI_ITEM_SIZE, UI_ITEM_SIZE)
			Next
		Endif
				
		' Render bombs
		If(p.getBombs() > 5)
	    	count = 5
		 	count2 = p.getBombs() - 5
		Else
			count = p.getBombs()
			count2 = 0
		Endif
		
		For Local i:Int = 1 To count
			DrawImageRect(itemIconImg, UI_BO_X + (i * UI_ITEM_SIZE), UI_BO_ROW1_Y, UI_ITEM_BOMB_OFFSET * UI_ITEM_SIZE, 0, UI_ITEM_SIZE, UI_ITEM_SIZE)
		Next
		
		If count2 > 0
			For Local i:Int = 1 To count2
				DrawImageRect(itemIconImg, UI_BO_X + (i * UI_ITEM_SIZE), UI_BO_ROW2_Y, UI_ITEM_BOMB_OFFSET * UI_ITEM_SIZE, 0, UI_ITEM_SIZE, UI_ITEM_SIZE)
			Next
		Endif
		Return
	End
	
	'
	' renderMazeViewport - draws the portion of the maze that is visible on the
	'  screen, including the parts that are still covered by fog of war.  The
	'  latter are drawn using a special tile. 
	'
	Method renderMazeViewport:Void(m:Maze, p:Player)
	
		Local w:Int = (mazeAreaWidth / UI_BLOCK_SIZE)
		Local h:Int = (mazeAreaHeight / UI_BLOCK_SIZE)
		Local wm:Int
		Local hm:Int
		Local we:Int
		Local he:Int
		Local wm1:Int
		Local hm1:Int
		Local we1:Int
		Local he1:Int
		Local type:Int
		Local px:Int
		Local py:Int
		Local scrollXOff:Int
		Local scrollYOff:Int
		
		Local scroll:Int = m.getScroll()
		Local d:Int = m.getScrollDirection()
		If d = DIRECTION_NORTH Or d = DIRECTION_SOUTH
			scrollXOff = 0
			scrollYOff = scroll
		Else
			scrollXOff = scroll		
			scrollYOff = 0
		Endif
		
		' The player is always rendered in the center of the screen (i.e. the maze
		' moves when the player does.  This means that at any time, any subset of
		' the maze might be on display.  The following calculations make sure that
		' only the appropriate parts of the maze are drawn in the right places. 
		' Calculate viewport extents
		Local cx:Int[] = p.getPosition()          ' player position in maze
		Local halfXA:Int = w / 2                  ' size of left half of screen, equal to center x pos
		Local halfXB:Int = w - halfXA             ' size of the right half of the screen
		Local halfYA:Int = h / 2                  ' size of the top half of the screen, equal to center y pos
		Local halfYB:Int = h - halfYA             ' size of the bottom half of the screen
		
		px = cx[0]
		py = cx[1] 
		
		' Horizontal start
		wm = halfXA - px                  ' start point on screen = center - player position
		wm1 = 0                           ' start point in maze is 0
		If wm < 0        		          ' if the start point is left of the edge of the screen
			' If the screen is scrolling west, start drawing one square sooner.  Only part of this will show up on-screen.
			If d = DIRECTION_WEST
				wm = - 1
				wm1 = px - halfXA - 1
			Else
				wm = 0                        ' start point on screen is 0
				wm1 = px - halfXA             ' start point in maze is the player's position - half the screen width
			Endif
		Endif
		
		' Vertical start
		hm = halfYA - py                  ' start point on screen = center - player position
		hm1 = 0                           ' start point in maze is 0
		If hm < 0                		  ' if the start point is above the edge of the screen
			' If the screen is scrolling north, start drawing one square sooner.  Only part of this will show up on screen.
			If d = DIRECTION_NORTH
				hm = -1
				hm1 = py - halfYA - 1
			Else
				hm = 0                        ' start point on screen is 0
				hm1 = py - halfYA             ' start point in maze is the players' position - half the screen height
			Endif
		Endif
		
		' Horizontal end.  Note: a 640x480 screen doesn't hold an integer number of 48px squares horizontally, so
		'  by default we draw one extra square at the end to cover that extra third of a block worth of screen
		we = halfXA + (m.getWidth() - px) - 1
		we1 = m.getWidth() - 2
		If we >= w
			' If the screen is scrolling east, draw one more square to the right of the others.
			If d = DIRECTION_EAST And (px + halfXB + 2) < m.getWidth() - 2
				we = w + 1
				we1 = px + halfXB + 2
			Else
				we = w
				we1 = px + halfXB + 1
			Endif
		Endif
		
		he = halfYA + (m.getHeight() - py) - 1
		he1 = m.getHeight() - 1 
		If he >= h
			If d = DIRECTION_SOUTH 
				he = h
				he1 = py + halfYB + 1
			Else
				he = h - 1
				he1 = py + halfYB
			Endif
		Endif		

		Local x1:Int
		Local y1:Int
		Local it:Int
		Local gt:Int
		Local eh:Int
		Local en:Enemy
		Local ep:Int[]
		
		' Draw tiles
		For Local j:Int = wm To we                   ' From left extent to right extent
			For Local i:Int = hm To he               ' From top extent to bottom extent				
				x1 = (j - wm) + wm1
				y1 = (i - hm) + hm1
				it = m.getItem(x1, y1)
				gt = m.getType(x1, y1)
				
				If m.isHidden(x1, y1) = False
					If d = DIRECTION_NORTH Or d = DIRECTION_WEST
	  				   DrawImageRect(blocksImg, j * UI_BLOCK_SIZE + scrollXOff, i * UI_BLOCK_SIZE + scrollYOff, gt * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)				
					   If it <> MAZE_NO_ITEM
						  If it >= ITEM_CONSUMABLE_OFFSET
							  DrawImageRect(consumableImg, j * UI_BLOCK_SIZE + scrollXOff, i * UI_BLOCK_SIZE + scrollYOff, (it - ITEM_CONSUMABLE_OFFSET) * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)
						  Else							   					
							  DrawImageRect(treasureImg, j * UI_BLOCK_SIZE + scrollXOff, i * UI_BLOCK_SIZE + scrollYOff, it * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)   					
						  Endif
					   Endif
					Elseif d = DIRECTION_EAST
	  				   DrawImageRect(blocksImg, (j - 1) * UI_BLOCK_SIZE + (UI_BLOCK_SIZE - scrollXOff), i * UI_BLOCK_SIZE + scrollYOff, gt * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)
					   If it <> MAZE_NO_ITEM
						  If it >= ITEM_CONSUMABLE_OFFSET
							  DrawImageRect(consumableImg, (j - 1) * UI_BLOCK_SIZE + (UI_BLOCK_SIZE - scrollXOff), i * UI_BLOCK_SIZE + scrollYOff, (it - ITEM_CONSUMABLE_OFFSET) * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)   					
						  Else
							  DrawImageRect(treasureImg, (j - 1) * UI_BLOCK_SIZE + (UI_BLOCK_SIZE - scrollXOff), i * UI_BLOCK_SIZE + scrollYOff, it * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)   					
						  Endif
					   Endif				
					Else	
	  				   DrawImageRect(blocksImg, j * UI_BLOCK_SIZE, (i -1) * UI_BLOCK_SIZE + (UI_BLOCK_SIZE - scrollYOff), gt * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)
					   If it <> MAZE_NO_ITEM
						  If it >= ITEM_CONSUMABLE_OFFSET
							  DrawImageRect(consumableImg, j * UI_BLOCK_SIZE, (i - 1) * UI_BLOCK_SIZE + (UI_BLOCK_SIZE - scrollYOff), (it - ITEM_CONSUMABLE_OFFSET) * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)   					
						  Else
							  DrawImageRect(treasureImg, j * UI_BLOCK_SIZE, (i - 1) * UI_BLOCK_SIZE + (UI_BLOCK_SIZE - scrollYOff), it * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)   					
						  Endif	
					   Endif								
					Endif
				Endif			
			Next
		Next		
		
		For Local j:Int = wm To we                   ' From left extent to right extent
			For Local i:Int = hm To he               ' From top extent to bottom extent		
				x1 = (j - wm) + wm1
				y1 = (i - hm) + hm1					
				eh = m.isEnemyHere(x1, y1)
				If eh <> ENEMY_NOT_PRESENT
					en = m.getEnemy(x1, y1)
					ep = en.getPosition()
				End		
				If m.isHidden(x1, y1) = False
					If eh <> -1
						' If m.canSeeBetween(px, py, ep[0], ep[1])					
							drawEnemy(en, i, j, x1, y1, scrollXOff, scrollYOff, d)
						'Endif
					Endif
				Else
					If d = DIRECTION_NORTH Or d = DIRECTION_WEST
	  					DrawImageRect(blocksImg, j * UI_BLOCK_SIZE + scrollXOff, i * UI_BLOCK_SIZE + scrollYOff, UI_BLOCK_FOG * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)				
					Elseif d = DIRECTION_EAST
	  					DrawImageRect(blocksImg, (j - 1) * UI_BLOCK_SIZE + (UI_BLOCK_SIZE - scrollXOff), i * UI_BLOCK_SIZE + scrollYOff, UI_BLOCK_FOG * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)
					Else	
	  					DrawImageRect(blocksImg, j * UI_BLOCK_SIZE, (i -1) * UI_BLOCK_SIZE + (UI_BLOCK_SIZE - scrollYOff), UI_BLOCK_FOG * UI_BLOCK_SIZE, 0, UI_BLOCK_SIZE, UI_BLOCK_SIZE)
					Endif
				Endif			
			Next
		Next									
		Return
	End	
	
	Method drawEnemy:Void(e:Enemy, i:Int, j:Int, x1:Int, y1:Int, scrollXOff:Int, scrollYOff:Int, dir:Int)
		Local xOffset:Int = e.getCurrentFrame() * UI_BLOCK_SIZE
		Local yOffset:Int = e.getType() * UI_BLOCK_SIZE	
		Local offsets:Int[] = e.getSmoothOffsets()
		Local drawPos:Int[] = e.getDrawPosition()
		Local shiftXOffset:Int
		Local shiftYOffset:Int
		Local hitFrame:Int
		Local hp:Int = e.getHp()
		Local colorOffset:Int
		
		If x1 = drawPos[0]
			shiftXOffset = 0
		Elseif x1 < drawPos[0]
			shiftXOffset = 1
		Else
			shiftXOffset = -1
		Endif
		
		If y1 = drawPos[1]
			shiftYOffset = 0
		Elseif y1 < drawPos[1]
			shiftYOffset = 1
		Else
			shiftYOffset = -1
		Endif
		
		If hp >= 3 
			colorOffset = 0
		Else If hp = 2
			colorOffset = 1
		Else 
			colorOffset = 2
		Endif
		
		If dir = DIRECTION_NORTH Or dir = DIRECTION_WEST
			DrawImageRect(enemyImg, 
			              ((j + shiftXOffset) * UI_BLOCK_SIZE) + scrollXOff + offsets[0], 
			              ((i + shiftYOffset) * UI_BLOCK_SIZE) + scrollYOff + offsets[1], 
			              xOffset, 
			              yOffset, 
			              UI_BLOCK_SIZE, 
			              UI_BLOCK_SIZE)
			If e.getShowHitAnim() = True
				hitFrame = e.getHitAnimFrame()
				DrawImageRect(hitAnimImg, 
				              ((j + shiftXOffset) * UI_BLOCK_SIZE) + scrollXOff + offsets[0], 
				              ((i + shiftYOffset) * UI_BLOCK_SIZE) + scrollYOff + offsets[1], 
				              hitFrame * UI_BLOCK_SIZE, 
			    	          colorOffset * UI_BLOCK_SIZE, 
			        	      UI_BLOCK_SIZE, 
			            	  UI_BLOCK_SIZE)	
			Endif			
		Else If dir = DIRECTION_EAST
			DrawImageRect(enemyImg, 
			              ((j - 1 + shiftXOffset) * UI_BLOCK_SIZE) + (UI_BLOCK_SIZE - scrollXOff) + offsets[0], 
			              ((i + shiftYOffset) * UI_BLOCK_SIZE) + scrollYOff + offsets[1], 
			              xOffset, 
			              yOffset, 
			              UI_BLOCK_SIZE, 
			              UI_BLOCK_SIZE)
			If e.getShowHitAnim() = True
				hitFrame = e.getHitAnimFrame()
				DrawImageRect(hitAnimImg, 
			              ((j - 1 + shiftXOffset) * UI_BLOCK_SIZE) + (UI_BLOCK_SIZE - scrollXOff) + offsets[0], 
			              ((i + shiftYOffset) * UI_BLOCK_SIZE) + scrollYOff + offsets[1], 
				              hitFrame * UI_BLOCK_SIZE, 
			    	          colorOffset * UI_BLOCK_SIZE, 
			        	      UI_BLOCK_SIZE, 
			            	  UI_BLOCK_SIZE)	
			Endif					
		Else
			DrawImageRect(enemyImg, 
			              ((j + shiftXOffset) * UI_BLOCK_SIZE) + offsets[0], 
			              ((i - 1 + shiftYOffset) * UI_BLOCK_SIZE) + (UI_BLOCK_SIZE - scrollYOff) + offsets[1], 
			              xOffset, 
			              yOffset, 
			              UI_BLOCK_SIZE, 
			              UI_BLOCK_SIZE)		
			If e.getShowHitAnim() = True
				hitFrame = e.getHitAnimFrame()
				DrawImageRect(hitAnimImg, 
			              ((j + shiftXOffset) * UI_BLOCK_SIZE) + offsets[0], 
			              ((i - 1 + shiftYOffset) * UI_BLOCK_SIZE) + (UI_BLOCK_SIZE - scrollYOff) + offsets[1], 
				              hitFrame * UI_BLOCK_SIZE, 
			    	          colorOffset * UI_BLOCK_SIZE, 
			        	      UI_BLOCK_SIZE, 
			            	  UI_BLOCK_SIZE)	
			Endif					
		Endif
	End
End
	
	

