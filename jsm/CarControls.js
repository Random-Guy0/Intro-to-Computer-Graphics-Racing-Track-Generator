class CarControls
{
    constructor(car)
    {
        this.car = car;

        window.addEventListener('keydown', this.onKeyDown);
    }

    onKeyDown(event)
    {
        switch(event.keyCode)
        {
            case 87:
            case 38:
                console.log("forward");
                break;
            case 83:
            case 40:
                console.log("backwards");
                break;
            case 65:
            case 37:
                console.log("left");
                break;
            case 68:
            case 39:
                console.log("right");
                break;
        }
    }
}

export default CarControls;