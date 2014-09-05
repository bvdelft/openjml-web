/**
 * This file is for testing the openjml behavior.
 * 
 * We left one syntactical error and one invariant violation in this file.
 * Let openjml find them and see if you can fix them.
 **/
public class JMLTest {

   /*@ public invariant x >= 0 @*/
   public int x;
   
   /*@ assignable x; @*/
   public JMLTest() {
     x = 1;
   }
   
   public void foo(){
     x = -1;
   }

   /*@ public normal_behaviour 
     @ requires true;
     @ ensures x == \old(x) + 1;
     @*/
   public void inc() {
     x = x + 1;
   }
}

