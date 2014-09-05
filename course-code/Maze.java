/**
 * Your task is to provide specifications for a class implementing a maze game.
 * A maze is described as a two dimensional array, where all rows have the same
 * number of columns.
 *
 * The class Maze declares
 *  - constants MOVE_X encoding different move directions (up, down, left, 
 *    right).
 *  - constants EXIT, FREE and WALL encoding the kind of a maze cell, i.e., if 
 *    it is occupied by a wall, the exit or free.
 *  - two integer fields playerRow and playerCol with the current position of 
 *    the player.
 *  - a two-dimensional array field of integer type maze representing the maze 
 *    itself. 
 *
 * Your task is now to provide
 *
 * A) JML invariants specifying that:
 *    1) the maze is non-null (i.e., the field itself is not null and so are its 
 *       elements).
 *    2) each row of the maze has the same number of columns (i.e., the maze has
 *       rectangular shape).
 *    3) the player position is inside the maze and not occupied by a wall.
 *    4) each cell inside the maze is either free, a wall or an exit.
 *    5) there is at most one exit. 
 * B) normal_behavior method specifications for each method which reflect the 
 *    natural language comment as complete as possible. 
 **/
public class Maze {

    // CONSTANTS -- MOVE
    public final static int MOVE_UP    = 0;
    public final static int MOVE_DOWN  = 1;
    public final static int MOVE_LEFT  = 2;
    public final static int MOVE_RIGHT = 3;

    // CONSTANTS -- FIELDS    
    public final static int FREE = 0;
    public final static int WALL = 1;
    public final static int EXIT = 2;

    // PLAYFIELD
    /**
     * The playfield is given as a rectangle where
     * 	- walls are represented by entries of value Maze.WALL ('1')
     * 	- the exit is represented as an entry of value Maze.EXIT ('2')
     *  - all other entries are MAZE.FREE ('0')
     *  - A playfield has exactly one exit.
     * 	- The first number determines the column, the second determines the row.
     * 	  Row and column numbers start at 0. 
     *  - Each row has the same number of columns.        
 	   */
    private int[][] maze;
    
    /** 
     * Player Position:
     *   the position of a player must always denote a field inside the maze
     *   which is not a wall.
     */
    private int playerRow, playerCol;
   
    
    public Maze(int[][] maze, int startRow, int startCol) {
    
	    this.maze = maze;
	    // set player on her start position
	    this.playerRow = startRow;
	    this.playerCol = startCol;	
    }

    /**
     * returns true if the player has reached the exit field; 
     * the method does not affect the state 
     */
    public boolean won() {
	    // TO BE IMPLEMENTED
	    throw new RuntimeException();
    }
   
    /** 
     * A move to position (newRow,newCol) is possible iff. the
     * field is inside the maze and free (i.e. not a wall); 
     * the method does not affect the state 
     */    
    public boolean isPossible(int newRow, int newCol) {
	    // TO BE IMPLEMENTED
	    throw new RuntimeException();
    }


    /**
     * takes a direction and performs the move if possible, otherwise
     * the player stays at the current position; the direction must be
     * one of the defined move directions (see constants
     * MOVE_xyz). The return value indicates if the move was successful.
     */
    public boolean move(int direction) {
	    // TO BE IMPLEMENTED
	    throw new RuntimeException();
    }

}

