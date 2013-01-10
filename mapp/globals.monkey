'-----------------------------------------------------------------------------------------------
' globals.monkey
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

'
' The cardinal directions; used by the maze generator, player, and
' enemies.  
'
Const DIRECTION_NORTH:Int = 0
Const DIRECTION_EAST:Int  = 1
Const DIRECTION_SOUTH:Int = 2
Const DIRECTION_WEST:Int  = 3

'
' Wall status (wall present or wall not present), used while generating the
' maze
'
Const WALL_CLEAR:Int = 0
Const WALL_SET:Int   = 1

'
' In the final maze, these represent what each block in the maze is
' (wall, empty, bombed wall, etc.)
'
Const MAZE_TYPE_PERMANENT_WALL:Int = 0
Const MAZE_TYPE_WALL:Int           = 1
Const MAZE_TYPE_FLOOR:Int          = 2
Const MAZE_TYPE_DESTROYED_WALL:Int = 3
Const MAZE_TYPE_UNUSED:Int         = 4  ' a dummy value to match up with the UI indices (fog isn't a maze type)
Const MAZE_TYPE_DOWN_STAIRS:Int    = 5
Const MAZE_TYPE_UP_STAIRS:Int      = 6

'
' These represent the various algorithms that can be used to generate mazes.
'  Each has various advantages and disadvantages -- see 
'  http://www.astrolog.org/labyrnth/algrithm.htm for more information about
'  maze creation methods than you ever knew existed. 
'
Const MAZE_GEN_ALDOUS_BRODER:Int         = 0
Const MAZE_GEN_RECURSIVE_BACKTRACKER:Int = 1 ' Not implemented yet
Const MAZE_GEN_PRIM:Int                  = 2 ' Not implemented yet
Const MAZE_GEN_KRUSKAL:Int               = 3 ' Not implemented yet
Const MAZE_GEN_WILSON:Int                = 4 ' Not implemented yet
Const MAZE_GEN_HUNT_AND_KILL:Int         = 5 ' Not implemented yet
Const MAZE_MAX_GEN_TYPES:Int             = 6

'
' Strip offsets for the maze map blocks
'
Const UI_BLOCK_SIZE:Int          = 48
Const UI_BLOCK_PERMANENT_WALL:Int = 0
Const UI_BLOCK_WALL:Int           = 1
Const UI_BLOCK_GROUND:Int         = 2
Const UI_BLOCK_DESTROYED_WALL:Int = 3
Const UI_BLOCK_FOG:Int            = 4
Const UI_BLOCK_UP_STAIRS:Int      = 5
Const UI_BLOCK_DOWN_STAIRS:Int    = 6

'
' Location offsets for the status strings ('SC', 'FL', etc) in the UI bitmap strip
'
Const UI_INTERFACE_SC:Int     =  0
Const UI_INTERFACE_FL:Int     =  1
Const UI_INTERFACE_TI:Int     =  2
Const UI_INTERFACE_HP:Int     =  3
Const UI_INTERFACE_AT:Int     =  4
Const UI_INTERFACE_ST:Int     =  5
Const UI_INTERFACE_BO:Int     =  6

'
' Location offsets for the top/bottom/side elements of the UI in the bitmap strip
'
Const UI_INTERFACE_TOP:Int    =  7
Const UI_INTERFACE_MIDDLE:Int = 11
Const UI_INTERFACE_BOTTOM:Int = 15

'
' Location offsets for the items in the item status bitmap (these aren't used for the items
' found in the maze, only the items in the UI)
'
Const UI_ITEM_HEART_OFFSET:Int = 0
Const UI_ITEM_SWORD_OFFSET:Int = 1
Const UI_ITEM_STR_OFFSET:Int   = 2
Const UI_ITEM_BOMB_OFFSET:Int  = 3

' 
' Size of a sprite in the UI item bitmap
'
Const UI_ITEM_SIZE:Int         = 16

'
' The horizontal position of the text in the UI window
'
Const UI_TEXT_HORZ_POS:Int = 10

'
' The size of the digits in the UI strings.
'
Const UI_DIGIT_WIDTH:Int      = 10
Const UI_DIGIT_HEIGHT:Int     = 12

'
' The size of the UI element strings (the ones that say 'SC', 'FL', etc)
'
Const UI_ELEMENT_SIZE:Int     = 32

' 
' The physical locations of the UI element strings
'
Const UI_SC_VERT_POS:Int   = 26
Const UI_FL_VERT_POS:Int   = 50
Const UI_TI_VERT_POS:Int   = 74
Const UI_HP_VERT_POS:Int   = 106
Const UI_AT_VERT_POS:Int   = 170
Const UI_ST_VERT_POS:Int   = 234
Const UI_BO_VERT_POS:Int   = 282

'
' The physical locations of the 2 rows of hearts that represent the player's HP
'
Const UI_HP_ROW1_Y:Int     = 96
Const UI_HP_ROW2_Y:Int     = 112
Const UI_HP_X:Int          = 532

'
' The physical locations of the 4 rows of swords that represent the player's AT
'
Const UI_AT_ROW1_Y:Int     = 144
Const UI_AT_ROW2_Y:Int     = 160
Const UI_AT_ROW3_Y:Int     = 176
Const UI_AT_ROW4_Y:Int     = 192
Const UI_AT_X:Int          = 532

'
' The physical locations of the two rows of spheres that represent the player's ST
'
Const UI_ST_ROW1_Y:Int     = 224
Const UI_ST_ROW2_Y:Int     = 240
Const UI_ST_X:Int          = 532

'
' The physical locations of the two rows of bombs that represent the player's BO
'
Const UI_BO_ROW1_Y:Int     = 272
Const UI_BO_ROW2_Y:Int     = 288
Const UI_BO_X:Int          = 532

'
' The physical location of the floor number string
'
Const UI_FLOOR_X:Int       = 618
Const UI_FLOOR_Y:Int       = 50

'
' The physical location of the score string
'
Const UI_SCORE_X:Int       = 618
Const UI_SCORE_Y:Int       = 26

'
' The physical location of the minute portion of the time remaining string
'
Const UI_TIME_MINUTES_X:Int = 588
Const UI_TIME_MINUTES_Y:Int = 74

'
' The physical location of the second portion of the time remaining string
'
Const UI_TIME_SECONDS_X:Int = 618
Const UI_TIME_SECONDS_Y:Int = 74

'
' The physical location and tile strip offset of the colon between the minutes
' and seconds portion of the time remaining
'
Const UI_TIME_COLON_X:Int      = 598
Const UI_TIME_COLON_Y:Int      = 74
Const UI_TIME_COLON_OFFSET:Int = 10

Const UI_TIME_UP_X:Int         = 192
Const UI_TIME_UP_Y:Int         = 184
Const UI_TIME_UP_WIDTH:Int     = 256
Const UI_TIME_UP_HEIGHT:Int    = 112

Const UI_DEAD_X:Int         = 192
Const UI_DEAD_Y:Int         = 184
Const UI_DEAD_WIDTH:Int     = 256
Const UI_DEAD_HEIGHT:Int    = 112

Const UI_HOW_TO_PLAY_X:Int     = 72
Const UI_HOW_TO_PLAY_Y:Int     = 32
Const UI_HOW_TO_PLAY_WIDTH:Int = 368
Const UI_HOW_TO_PLAY_HEIGHT:Int = 416

Const UI_DIALOG_TIME_UP:Int      = 0
Const UI_DIALOG_HOW_TO_PLAY:Int  = 1
Const UI_DIALOG_DEAD:Int         = 2

'
' The maximum number of the various components that the player can have/carry
'
Const PLAYER_MAX_HP:Int       = 10
Const PLAYER_MAX_SWORDS:Int   = 20
Const PLAYER_MAX_STRENGTH:Int = 10
Const PLAYER_MAX_BOMBS:Int    = 10

Const BOY_ANIM_DURATION:Int = 250
Const BOY_Y_POSITION:Int = 306

'
' The maximum number of maze floors.  Used to initialize the large array representing all
' potential game floors.
'
Const MAZE_MAX_FLOORS:Int     = 6

'
' In-game difficulty levels.  Higher difficulty levels have larger floors, more total floors,
' and tougher enemies. 
'
Const DIFFICULTY_VERY_EASY:Int = 0
Const DIFFICULTY_EASY:Int      = 1
Const DIFFICULTY_NORMAL:Int    = 2
Const DIFFICULTY_HARD:Int      = 3
Const DIFFICULTY_INSANE:Int    = 4

Const DIFFICULTY_NUM_DIFFICULTIES:Int = 5

Const NUM_STRENGTH_LEVELS:Int = 6

'
' Valid states in the main game state machine. 
'
Const STATE_NULL:Int              = -1
Const STATE_SPLASH_SCREEN:Int     = 0
Const STATE_TITLE_SCREEN:Int      = 1
Const STATE_DIFFICULTY_SELECT:Int = 2
Const STATE_GAME:Int              = 4
Const STATE_WINNER:Int            = 5
Const STATE_HIGH_SCORE:Int        = 6
Const STATE_TIME_GONE:Int         = 7
Const STATE_DEAD:Int              = 8

'
' The speed of scrolling when moving the maze.  Smaller values create slower but smoother scrolling
'
Const MAZE_SCROLL_SPEED:Int   = 6

'
' The number of up and down stairs per floor (MAZE_STAIR_TYPE_PER_FLOOR of each)
'
Const MAZE_STAIR_TYPE_PER_FLOOR:Int = 4

'
' On the title screen, the player sprite moves around really quickly in a
' predetermined pattern, exposing the name of the game.  This is the amount
' of time between each movement of the sprite. 
'
Const TITLE_SPRITE_TIME_PER_MOVEMENT:Int = 50
Const TITLE_NUM_SPRITE_MOVEMENTS:Int = 182
Const TITLE_SPRITE_INIT_X_OFFSET:Int = 64
Const TITLE_SPRITE_INIT_Y_OFFSET:Int = 32
Const TITLE_SPRITE_SIZE:Int = 16
Const TITLE_TILES_WIDTH:Int = 32
Const TITLE_TILES_HEIGHT:Int = 20
Const TITLE_MOTION_WAIT_TIMER:Int = 300

Const SCREEN_WIDTH:Int = 640
Const SCREEN_HEIGHT:Int = 480

Const SPLASH_SCREEN_BARS_FRAME_TIME:Int = 20
Const SPLASH_SCREEN_BAR_HEIGHT:Int = 40
Const SPLASH_SECONDARY_WAIT_TIME:Int = 500
Const SPLASH_ALPHA_ADJUST:Float = 0.04
Const SPLASH_ALPHA_THRESHOLD:Float = 0.99 - SPLASH_ALPHA_ADJUST

Const DIFFICULTY_SELECT_X:Int = 208
Const DIFFICULTY_SELECT_Y:Int = 80
Const DIFFICULTY_SELECT_DESC_X:Int = 224
Const DIFFICULTY_SELECT_DESC_Y:Int = 240
Const DIFFICULTY_ICON_LEFT_X:Int = DIFFICULTY_SELECT_X + 48
Const DIFFICULTY_ICON_RIGHT_X:Int = DIFFICULTY_SELECT_X + 164
Const DIFFICULTY_ICON_Y:Int = DIFFICULTY_SELECT_Y + 56
Const DIFFICULTY_ICON_SIZE:Int = 16

Const SCORE_ANIM_POS_MAX:Int = -1 * UI_BLOCK_SIZE

Const MAZE_NO_ITEM:Int = -1
Const ITEM_NUM_ITEMS:Int = 32

Const ITEM_CONSUMABLE_OFFSET:Int = 64 ' Non treasure items start from here
Const ITEM_ONE_HEART:Int = 64
Const ITEM_TWO_HEARTS:Int = 65
Const ITEM_THREE_HEARTS:Int = 66
Const ITEM_ONE_SWORD:Int = 67
Const ITEM_TWO_SWORDS:Int = 68
Const ITEM_THREE_SWORDS:Int = 69
Const ITEM_ONE_STR:Int = 70
Const ITEM_TWO_STRS:Int = 71
Const ITEM_THREE_STRS:Int = 72
Const ITEM_ONE_BOMB:Int = 73
Const ITEM_TWO_BOMBS:Int = 74
Const ITEM_THREE_BOMBS:Int = 75
Const ITEM_NUM_CONSUMABLES:Int = 12

' ranges (all floors have minimum 1/1000 odds for each item, but the bulk of items found
'  on a particular floor center around a range of items that varies for each floor.  The
'  rarity of the highest level items isn't that much greater on the lowest floors.

'  1 - 1 - 7
'  2 - 3 - 11
'  3 - 7 - 18
'  4 - 11 - 22
'  5 - 14 - 27
'  6 - 19 - 32

' Row 1 is floor 1, Row 2 is floor 2, etc.
'
' The actual value stored is the upper end of the range (- 1)that the random 
' number generator will use to determine if the item is selected.  The 
' previous number is used as the lower end of the range.
'
' For example, the odds of item 1 on floor one is 450/1000 (0 - 449). 
'  The odds of item 2 is 200/1000 (450 - 649), etc.

Global ITEM_ODDS:Int[] = [ 450, 650, 770, 850, 905, 955, 975, 976, 977, 978, 979, 980, 981, 982, 983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999, 1000,
                            10,  25,  50, 100, 175, 300, 475, 675, 825, 905, 960, 976, 981, 982, 983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999, 1000,
                            10,  20,  30,  40,  50,  65,  95, 145, 225, 325, 445, 585, 708, 808, 888, 938, 968, 978, 985, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999, 1000,
                            10,  20,  30,  40,  50,  60,  70,  82,  97, 112, 132, 162, 212, 282, 382, 482, 602, 702, 802, 872, 932, 972, 987, 992, 993, 994, 995, 996, 997, 998, 999, 1000,
                            10,  20,  30,  40,  50,  60,  75,  95, 115, 135, 155, 180, 210, 240, 280, 330, 390, 465, 545, 665, 745, 815, 875, 925, 965, 985, 995, 996, 997, 998, 999, 1000, 
                            10,  20,  30,  40,  50,  60,  75,  95, 125, 155, 185, 215, 245, 275, 305, 345, 385, 425, 465, 505, 555, 605, 658, 718, 778, 838, 888, 928, 958, 978, 998, 1000 ]
   
' Base value for each item.  Multiplied by the floor number the item was found on to make the actual score.  
Global ITEM_VALUES:Int[]  = [ 1, 2, 3, 5, 7, 10, 15, 20, 25, 35, 45, 60, 75, 100, 125, 150, 175, 200, 240, 280, 325, 375, 450, 550, 650, 800, 1000, 1200, 1500, 1900, 2400, 10000 ]

' When a consumable item is picked up, if the player's inventory of that item is 
' *completely* full, then the player will get a large bonus score as compensation
' for the permanent loss of the item. Since consumable items are relatively scarce,
' taking the score may not always be the best choice.  
Global CONSUMABLE_ITEM_VALUES:Int[] = [50, 200, 500, 100, 200, 400, 50, 100, 250, 50, 200, 500]
Global CONSUMABLE_RARITY:Int[] = [175, 275, 350, 600, 750, 850, 865, 875, 880, 970, 990, 1000]

' When a maze floor is generated, this is the number of enemies that will be placed
' in it, depending on the the difficulty level.  
Global MAX_ENEMIES_PER_FLOOR:Int[] = [15, 25, 30, 35, 40]

Const ENEMY_NOT_PRESENT:Int  = -1

Global ENEMY_SCORES:Int[] = [ 25, 50, 100, 50, 100, 50, 250, 25, 100, 500, 50, 250, 1000, 5000 ]

Const ENEMY_BLUE_JELLY:Int   = 0
Const ENEMY_RED_JELLY:Int    = 1
Const ENEMY_YELLOW_JELLY:Int = 2
Const ENEMY_PINWHEEL:Int     = 3
Const ENEMY_BOULDER:Int      = 4
Const ENEMY_MOTH:Int         = 5
Const ENEMY_DEATH_MOTH:Int   = 6
Const ENEMY_SKULL:Int        = 7
Const ENEMY_RED_SKULL:Int    = 8
Const ENEMY_BLACK_SKULL:Int  = 9
Const ENEMY_BLUE_EYE:Int     = 10
Const ENEMY_RED_EYE:Int      = 11
Const ENEMY_GLOWING_EYE:Int  = 12
Const ENEMY_DEATH:Int        = 13

Const NUM_ENEMY_TYPES:Int    = 14

Const ENEMY_BEHAVIOR_PATROL:Int = 0
Const ENEMY_BEHAVIOR_CHASE:Int  = 1

Const ENEMY_MOVE_SPEED:Int = 3

Const ENEMY_ANIMATION_TOTAL_FRAMES:Int = 16
Const ENEMY_ANIMATION_SPRITE_FRAMES:Int = 8
Const ENEMY_ANIMATION_FRAME_DURATION:Int = 100

Const ENEMY_STUN_DAMAGE_TIME:Int = 1000
Const ENEMY_HIT_FRAME_TIME:Int = 50
Const NUM_HIT_ANIM_FRAMES:Int = 4

Const PLAYER_HIT_FRAME_TIME:Int = 50

Const NUM_HIGH_SCORE_ENTRIES:Int = 10

Const HIGH_SCORE_DIFFICULTIES_WIDTH:Int = 86

' These values represent the y positions of the 10 ranks displayed in the high score screen
Global HIGH_SCORE_RANK_Y_POSITIONS:Int[] = [132, 154, 176, 198, 220, 242, 264, 286, 308, 330]

' These values represent the positions of the different fields of the high score table (rank, score, etc).
' The numeric columns (1, 3, 4, 5) use the value as the rightmost point of the field, but column 2 is a text
'  field which uses the position as the leftmost point of the text.  
'
' Columns:
'   1 - rank
'   2 - difficulty
'   3 - depth
'   4 - items
'   5 - score
'
Global HIGH_SCORE_RANK_X_POSITIONS:Int[] = [136, 181, 336, 423, 529]