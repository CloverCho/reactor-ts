
import {Reactor, OutPort, Reaction, Timer, Writable, Variable, VarList, Present} from '../core/reactor';
class ProduceOutput<T, S> extends Reaction<T> {

    constructor(parent: Reactor, trigs:Variable[], args: VarList<T>, private payload:S) {
        super(parent, trigs, args);
    }

    /**
     * Produce an output event
     * @override
     */
    //@ts-ignore
    react(o: Writable<S>) {
        o.set(this.payload);

        // FIXME: create a test that actually tests double sets.
        // It's confusing to have SingleEvent be a DoubleEvent.
        // Duplicate sets for the same port is bad form,
        // but its worth checking that the correct value (from the last set)
        // is delivered.
        console.log("Writing payload to SingleEvent's output.");
    }
}

export class SingleEvent<T extends Present> extends Reactor {

    o: OutPort<T> = new OutPort<T>(this);
    t1: Timer = new Timer(this, 0, 0);

    constructor(parent:Reactor, private payload:T) {
        super(parent);
        this.addReaction(new ProduceOutput(this, [this.t1], this.check(this.getWritable(this.o)), payload));
    }
}



