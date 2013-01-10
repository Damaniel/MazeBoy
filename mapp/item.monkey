
' name, description, odds of spawning, minimum floor

' odds is an integer that represents 'x' in the equasion x/1000

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
' number generator will use to determine If the item is selected.  The 
' previous number is used as the lower end of the range.
'
' For example, the odds of item 1 on floor one is 450/1000 (0 - 449). 
'  The odds of item 2 is 200/1000 (450 - 649), etc.

Global itemOdds:Int[] = [ 450, 200, 120,  80,  55,  50,  20,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
                           10,  15,  25,  50,  75, 125, 175, 200, 150,  80,  55,  16,   5,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1, 
                            1,   1,   1,   1,   1,   1,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,
                            1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1, 
                            1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   1,   1,   1,   1,   1, 
                            1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   x,   1 ]
   
' Base value for each item.  Multiplied by the floor number the item was found on to make the actual score.  
Global itemValues:Int[]  = [ 1, 2, 3, 5, 7, 10, 15, 20, 25, 35, 45, 60, 75, 100, 125, 150, 175, 200, 240, 280, 325, 375, 450, 550, 650, 800, 1000, 1200, 1500, 1900, 2400, 10000 ]


Class Item

Private

	Field itemType:Int

Public

	Method getValue:Int(floor:Int)
		Return itemValues[itemType] * floor
	End
	
	' Generate a suitable item for the specified floor
	Method New(floor:Int)
		Local randNum:Int = Rnd(0, 1000)
		Local lowEnd:Int
		Local highEnd:Int
		Local idx:Int 
		
		idx = 0
		If randNum >= 0 And randNum < itemOdds[floor * ITEM_NUM_ITEMS + 0]
			itemType = 0
		Else
			idx = 1
			While idx < ITEM_NUM_ITEMS
   				lowEnd = itemOdds[floor * ITEM_NUM_ITEMS + (idx - 1)]
				highEnd = itemOdds[floor * ITEM_NUM_ITEMS + idx]
				If randNum >= lowEnd And randNum < highEnd
					itemType = idx
				Endif
			Wend
		Endif
	End
	
End
  