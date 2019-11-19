import {Reactor, OutPort, InPort, App} from '../src/reactor';

class Component extends Reactor {
    a: InPort<string> = new InPort(this);
    b: OutPort<string> = new OutPort(this);

    child: Reactor;
}

describe('Container to Contained', () => {

    var container = new Component("Container");
    var contained = new Component("Contained");
    var grandcontained = new Component("Grandcontained");

    container.child = contained;
    contained.child = grandcontained;

    var container2 = new Component("Container2");
    var contained2 = new Component("Contained2");

    container2.child = contained2;

    // Normally _setAllParents would be called as part of the initialization
    // process for starting an app, but we call it directly here to set
    // parent attributes needed for this test.
    container._setAllParents(null);
    container2._setAllParents(null);

    it('reactor with self as child', () => {
        expect(() => {
            let loopy = new Component("loopy");
            loopy.child = loopy;
            loopy._setAllParents(null);
        }).toThrowError();
    });

    it('reactor with a port constructed with the wrong parent', () => {
        expect(() => {
            let badPortComponent = new Component("hasBadPort");
            let otherComponent = new Component("otherComponent");

            // this port has been incorrectly constructed because it
            // is an attribute of badPortComponent, but is set in the constructor
            // with otherComponent as its parent 
            badPortComponent.a = new InPort(otherComponent);

            // _setAllParents should throw an error
            badPortComponent._setAllParents(null);
        }).toThrowError();
    });

    
    it('contained reactor name', () => {
        // expect(contained._getName()).toBe("Contained");
        expect(contained.toString()).toBe("Container/Contained");
    });

    it('container reactor name', () =>{
        // expect(container._getName()).toBe("Container");
        expect(container.toString()).toBe("Container");

    })

    it('get container name from contained', () =>{
        let obtainedContainer = contained._getParent();
        if(obtainedContainer){
            // expect(obtainedContainer._getName()).toBe("Container");
            expect(obtainedContainer.toString()).toBe("Container");
        } else {
            throw new Error("contained._getParent() returns null");
        } 
    })

    it('get contained name from container', () =>{

        //This test assumes contained to be the only child
        let children = container._getChildren();
        for(let child of children){
            if(child){
                expect(child.toString()).toBe("Container/Contained");
            } else {
                throw new Error("Container has no children");
            }
        }
    })

    it('testing canConnect', () => {
        expect(container.a.canConnect(contained.a)).toBe(true);
        expect(contained.a.canConnect(container.a)).toBe(false);
        expect(contained.a.canConnect(contained.b)).toBe(false);
        expect(contained.b.canConnect(contained.a)).toBe(true);

        expect(container.a.canConnect(contained.b)).toBe(false);
        expect(contained.b.canConnect(container.a)).toBe(false);

        expect(container.b.canConnect(contained.a)).toBe(false);
        expect(contained.a.canConnect(container.b)).toBe(false);

        expect(container.b.canConnect(contained.b)).toBe(false);
        expect(contained.b.canConnect(container.b)).toBe(true);

        expect(contained.a.canConnect(contained2.a)).toBe(false);
        expect(contained.a.canConnect(contained2.b)).toBe(false);
        expect(contained2.a.canConnect(contained.a)).toBe(false);
        expect(contained2.a.canConnect(contained.a)).toBe(false);

        expect(contained2.a.canConnect(container.b)).toBe(false);
        expect(contained2.a.canConnect(container.a)).toBe(false);
       
        expect(grandcontained.a.canConnect(contained.a)).toBe(false);
        expect(grandcontained.b.canConnect(contained.b)).toBe(true);
        expect(grandcontained.a.canConnect(container.a)).toBe(false);
        expect(grandcontained.b.canConnect(container.b)).toBe(false);
        expect(grandcontained.a.canConnect(container2.a)).toBe(false);
        expect(grandcontained.b.canConnect(container2.b)).toBe(false);
        expect(grandcontained.a.canConnect(contained2.a)).toBe(false);
        expect(grandcontained.b.canConnect(contained2.b)).toBe(false);
        

    });
});