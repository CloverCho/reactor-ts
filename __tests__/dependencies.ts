import {TimeInstant} from '../src/reactor';
import {PrecedenceGraph, PrecedenceGraphNode, PrioritySetNode, PrioritySet} from '../src/util';


class Reaction implements PrecedenceGraphNode, PrioritySetNode<number,number> {
    _id: number;
    _next: Reaction;
    _priority: number;
    constructor(id: number) {
        this._id = id;
    }
    
    hasPrecedenceOver(node: PrioritySetNode<number,number>) {
        if (this._priority < node._priority) {
            return true;
        } else {
            return false;
        }
    }
}
// Mock up for event.
class Event implements PrioritySetNode<number,TimeInstant> {
    _id:number;
    _priority:TimeInstant;
    _next:PrioritySetNode<number,TimeInstant>|null;
    hasPrecedenceOver(node:PrioritySetNode<number,TimeInstant>) {
        return true;
    }

}

describe('Precedence Graph', () => {

    var nodes = [new Reaction(1), new Reaction(2), new Reaction(3), 
        new Reaction(4), new Reaction(5), new Reaction(6)];

    var r7 = new Reaction(7);

    var graph:PrecedenceGraph<Reaction> = new PrecedenceGraph();



    graph.addEdge(nodes[3], nodes[5]);
    graph.addEdge(nodes[4], nodes[3]);
    graph.addEdge(nodes[2], nodes[3]);
    graph.addEdge(nodes[1], nodes[2]);
    graph.addEdge(nodes[1], nodes[4]);
    graph.addEdge(nodes[0], nodes[1]);
    graph.addEdge(nodes[0], nodes[4]);

    graph.updatePriorities();

    it('priority of node 6', () => {
        expect(nodes[5]).toEqual({_id: 6, _priority: 0});
    });

    it('priority of node 4', () => {
        expect(nodes[3]).toEqual({_id: 4, _priority: 100});
    });

    it('priority of node 5', () => {
        expect(nodes[4]).toEqual({_id: 5, _priority: 200});
    });    

    it('priority of node 3', () => {
         expect(nodes[2]).toEqual({_id: 3, _priority: 300});
    });

    it('priority of node 2', () => {
        expect(nodes[1]).toEqual({_id: 2, _priority: 400});
    });

    it('priority of node 1', () => {
        expect(nodes[0]).toEqual({_id: 1, _priority: 500});
    });

    it('remove dependency 5 -> 4', () => {
        graph.removeEdge(nodes[4], nodes[3]);
        expect(graph.size()[0]).toEqual(6); // V
        expect(graph.size()[1]).toEqual(6); // E
    });

    it('remove node 2', () => {
        graph.removeNode(nodes[1]);
        expect(graph.size()[0]).toEqual(5); // V
        expect(graph.size()[1]).toEqual(3); // E
    });

    it('add node 7, put in front of 3', () => {
        graph.addNode(r7);
        graph.addEdges(nodes[2], new Set([r7, nodes[3]]));
        expect(graph.size()[0]).toEqual(6); // V
        expect(graph.size()[1]).toEqual(4); // E
    });

    it('reorder vertices', () => {
        graph.updatePriorities();
        
        expect(nodes[5]).toEqual({_id: 6, _priority: 0});
        expect(nodes[4]).toEqual({_id: 5, _priority: 100});
        expect(r7).toEqual({_id: 7, _priority: 200});
        expect(nodes[3]).toEqual({_id: 4, _priority: 300});
        expect(nodes[0]).toEqual({_id: 1, _priority: 400});
        expect(nodes[2]).toEqual({_id: 3, _priority: 500});
    });

    it('introduce a cycle', () => {
        graph.addEdge(nodes[5], nodes[2]);
        expect(graph.updatePriorities()).toBeFalsy();
    });

});


describe('Priority Set', () => {
    var nodes = [new Reaction(1), new Reaction(2), new Reaction(3), 
        new Reaction(4), new Reaction(5), new Reaction(6)];
    
    var graph:PrecedenceGraph<Reaction> = new PrecedenceGraph();
    graph.addEdge(nodes[3], nodes[5]);
    graph.addEdge(nodes[4], nodes[3]);
    graph.addEdge(nodes[2], nodes[3]);
    graph.addEdge(nodes[1], nodes[2]);
    graph.addEdge(nodes[1], nodes[4]);
    graph.addEdge(nodes[0], nodes[1]);
    graph.addEdge(nodes[0], nodes[4]);
    graph.updatePriorities();
    
    var reactionQ = new PrioritySet<number, number>();
    
    for (let r of graph.nodes()) {
        reactionQ.push(r);
    }
    
    // duplicate insertion
    reactionQ.push(nodes[5]);

    it('first pop', () => {
         expect(reactionQ.pop()).toEqual({_id: 6, _next: null, _priority: 0});
    });

    it('second pop', () => {
        expect(reactionQ.pop()).toEqual({_id: 4, _next: null, _priority: 100});
    });

    it('third pop', () => {
        expect(reactionQ.pop()).toEqual({_id: 5, _next: null, _priority: 200});
    });

    it('fourth pop', () => {
        expect(reactionQ.pop()).toEqual({_id: 3, _next: null, _priority: 300});
    });

    it('fifth pop', () => {
        expect(reactionQ.pop()).toEqual({_id: 2, _next: null, _priority: 400});
    });
    
    it('sixth pop', () => {
        expect(reactionQ.pop()).toEqual({_id: 1, _next: null, _priority: 500});
    });



});