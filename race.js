const carCanvas = document.getElementById("carCanvas");
carCanvas.width = window.innerWidth;
carCanvas.height = window.innerHeight;

const miniMapCanvas = document.getElementById("miniMapCanvas");
miniMapCanvas.width = 300;
miniMapCanvas.height = 300;

const carCtx = carCanvas.getContext("2d");



const viewport = new Viewport(carCanvas, world.zoom, world.offset);
const miniMap = new MiniMap(miniMapCanvas, world.graph, 300);

const N = 100;
const cars = generateCars(1, "KEYS").concat(generateCars(N, "AI"));
const  myCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
}


let roadBorders = [];

const target = world.markings.find((m) => m instanceof Target);
if (target) {
    world.generateCorridor(myCar, target.center);
    roadBorders = world.corridor.map((s) => [s.p1, s.p2]);
} else {
    roadBorders = world.roadBorders.map((s) => [s.p1, s.p2]);

}
animate();

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(myCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N, type) {
    const startPoints = world.markings.filter((m) => m instanceof Start);
    const startPoint = startPoints.length > 0
        ? startPoints[0].center
        : new Point(100, 100);
    const dir = startPoints.length > 0
        ? startPoints[0].directionVector
        : new Point(0, -1);
    const startAngle = - angle(dir) + Math.PI / 2;

    const cars = [];
    for (let i = 1; i <= N; i++) {
        const car = new Car(startPoint.x, startPoint.y, 30, 50, type, startAngle)
        car.load(carInfo);
        cars.push(car);
    }
    return cars;
}

function animate() {
   
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(roadBorders, []);
    }
    
    world.cars = cars;
    world.bestCar = myCar;

    viewport.offset.x = -myCar.x;
    viewport.offset.y = -myCar.y;

    viewport.reset();
    const viewPoint = scale(viewport.getOffset(), -1);
    world.draw(carCtx, viewPoint, false);
    miniMap.update(viewPoint);



    requestAnimationFrame(animate);
}