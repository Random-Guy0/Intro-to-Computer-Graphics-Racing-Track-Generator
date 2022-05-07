import { EventDispatcher } from "../build/three.module.js";

class Car extends EventDispatcher
{
    constructor()
    {
        super();
        this.test();
    }

    test()
    {
        console.log("hello");
    }
}

export default Car;