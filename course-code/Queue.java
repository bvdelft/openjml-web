/**
 * Give a JML specification of the Queue. It should consist of: 
 * - class invariant(s), and 
 * - pre- and post-conditions for each method. 
 **/
public class Queue {

    Object[] arr;
    int size;
    int first;
    int next;

    Queue( int max ) {
        // ...
    }

    public int size() {
        // ...
    }

    public void enqueue( Object x ) {
        // ...
    }

    public Object dequeue() {
        // ...
    }
}
