/*jslint white: true */
/*global
alert, confirm, console, Debug, opera, prompt, WSH
*/

/**
 * Initialisation of global variables
 */
var g_points, //Contains parsed points and calculated gradients
    g_startGradient,
    g_endGradient,
    g_step;
/**
 * Resizes both canvasses
 * Todo: Redraw content
 */
function resizeCanvas(){
    var c2,
        c1,
        s1,
        s2;
    c1 = document.getElementById("Canvas-Path");
    c2 = document.getElementById("Canvas-Hud");
    
    //Added to stop canvas growing to max flexbox|predefined size
    c1.width = undefined;
    c1.height = undefined;
    c2.width = undefined;
    c2.height = undefined;
    
    s1 = c1.getBoundingClientRect();
    s2 = c2.getBoundingClientRect();
    
    c1.width = s1.width;
    c1.height = s1.height;
    c2.width = s2.width;
    c2.height = s2.height;
    
    if (g_points !== undefined){
        plotPath("Canvas-Path",g_points);
    }
}
/**
 * To be called on load to initialise various things
 */
function initialise(){
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
}

/**
 * Constructor for the point object, containing information about a specific point
 * @param {float} xVal The x value of the point (this.x)
 * @param {float} yVal The y value of the point (this.y)
 * @param {float} gradient The gradient value of the point (this.m)
 */
function Point(xVal, yVal, gradient) {
    'use strict';
    this.x = xVal;
    this.y = yVal;
    this.m = gradient;
}

/**
 * Returns the gradient between two Points
 * @param {Point} point1 The first Point to use 
 * @param {Point} point2 The second Point to use 
 * @return {float} The gradient between the points
 */
function gradient(point1, point2) {
    'use strict';
    return (point2.y - point1.y) / (point2.x - point1.x);
}

/**
 * Processes a String in the format "x,y x,y" into an array of Points.
 * "y" may be used in the place of "x,y", in which case the x value is set to the previous value +1 (or 1 if it is the first point).
 * @param {String} input The text input of the sequence of points
 * @param {float} startGradient The gradient at the first point
 * @param {float} endGradient The gradient at the last point
 * @return {Point[]} An array of all Points in the order input
 */
function parseInputPoints(input, startGradient, endGradient) {
    'use strict';
    var i,
        j,
        pointFloatArray,
        pointArray;
   
    pointArray = [];
    pointFloatArray = [];
    
    //Converts the input to an array of float[] values each representing a point.
    pointFloatArray = input.split(" ");
    for (i = 0; i < pointFloatArray.length; i += 1) {
        pointFloatArray[i] = pointFloatArray[i].split(",");
        //Converts the point from string -> float
        for (j = 0; j < pointFloatArray[i].length; j += 1) {
            pointFloatArray[i][j] = parseFloat(pointFloatArray[i][j]);
        }
        //Fills in a missing x value
        if (pointFloatArray[i].length === 1) {
            pointFloatArray[i].unshift(i === 0 ? 1 : pointFloatArray[i - 1][0] + 1);
        }
    }
    
    //Converts float array elements to Points and adds to new array
    for (i = 0; i < pointFloatArray.length; i += 1) {
        //Adds new points
        pointArray.push(
            new Point(
                pointFloatArray[i][0],
                pointFloatArray[i][1],
                0
            )
        );
    }
    for (i = 0; i < pointFloatArray.length; i += 1) {
        //Sets Gradients
        switch (i) {
        case 0:
            pointArray[i].m = startGradient;
            break;
        case pointFloatArray.length-1:
            pointArray[i].m = endGradient;
            break;
        default:
            pointArray[i].m = gradient(pointArray[i - 1], pointArray[i + 1]);
        }
    }
    
    //TODO - remove this and put in main methods - added to test redraw
    g_points = pointArray;
    
    return pointArray;
}

/**
 * Solves the interpolating cubic between two Points, returning an array of coefficients such that the value at x is Σ(Math.pow(return[i]*x,i+1))
 * Uses solutions generated by Wolfram Mathematica,
 * For points A and B in the format P[x, y, m]
 * @param {Point} point1 The first Point to use 
 * @param {Point} point2 The second Point to use
 * @return {float[]} The array of coeffients of the solution
 */
function solveSegment(point1, point2) {
    'use strict';
    //An array holding coefficients for the equation ax^3 + bx^2 + cx + d
    var cubic = [];
    /*
    Solves for d
    d -> -((-3 A[1] A[2] B[1]^2 + A[1]^2 A[3] B[1]^2 + A[2] B[1]^3 - A[1] A[3] B[1]^3 - A[1]^3 B[2] + 3 A[1]^2 B[1] B[2] + A[1]^3 B[1] B[3] - A[1]^2 B[1]^2 B[3])/(A[1] - B[1])^3)
    */
    cubic.push(
        -((-3 * point1.x * point1.y * Math.pow(point2.x, 2) + Math.pow(point1.x, 2) * point1.m * Math.pow(point2.x, 2) + point1.y * Math.pow(point2.x, 3) - point1.x * point1.m * Math.pow(point2.x, 3) - Math.pow(point1.x, 3) * point2.y + 3 * Math.pow(point1.x, 2) * point2.x * point2.y + Math.pow(point1.x, 3) * point2.x * point2.m - Math.pow(point1.x, 2) * Math.pow(point2.x, 2) * point2.m) / Math.pow((point1.x - point2.x), 3))
    );
    /*
    Solves for c
    c -> -((6 A[1] A[2] B[1] - 2 A[1]^2 A[3] B[1] + A[1] A[3] B[1]^2 + A[3] B[1]^3 - 6 A[1] B[1] B[2] - A[1]^3 B[3] - A[1]^2 B[1] B[3] + 2 A[1] B[1]^2 B[3])/(A[1] - B[1])^3)
    */
    cubic.push(
        -((6 * point1.x * point1.y * point2.x - 2 * Math.pow(point1.x, 2) * point1.m * point2.x + point1.x * point1.m * Math.pow(point2.x, 2) + point1.m * Math.pow(point2.x, 3) - 6 * point1.x * point2.x * point2.y - Math.pow(point1.x, 3) * point2.m - Math.pow(point1.x, 2) * point2.x * point2.m + 2 * point1.x * Math.pow(point2.x, 2) * point2.m) / Math.pow((point1.x - point2.x), 3))
    );
    /*
    Solves for b
    b -> -((-3 A[1] A[2] + A[1]^2 A[3] - 3 A[2] B[1] + A[1] A[3] B[1] - 2 A[3] B[1]^2 + 3 A[1] B[2] + 3 B[1] B[2] + 2 A[1]^2 B[3] - A[1] B[1] B[3] - B[1]^2 B[3])/(A[1] - B[1])^3)
    */
    cubic.push(
        -((-3 * point1.x * point1.y + Math.pow(point1.x, 2) * point1.m - 3 * point1.y * point2.x + point1.x * point1.m * point2.x - 2 * point1.m * Math.pow(point2.x, 2) + 3 * point1.x * point2.y + 3 * point2.x * point2.y + 2 * Math.pow(point1.x, 2) * point2.m - point1.x * point2.x * point2.m - Math.pow(point2.x, 2) * point2.m) / Math.pow((point1.x - point2.x), 3))
    );
    /*
    Solves for a
    a -> -((2 A[2] - A[1] A[3] + A[3] B[1] - 2 B[2] - A[1] B[3] + B[1] B[3])/(A[1] - B[1])^3)
    */
    cubic.push(
        -((2 * point1.y - point1.x * point1.m + point1.m * point2.x - 2 * point2.y - point1.x * point2.m + point2.x * point2.m) / Math.pow((point1.x - point2.x), 3))
    );
    return cubic;
}

/**
 * Solves the interpolating spline for a data set at a particular point
 * Uses code adapted from CSPL.js.
 * @param {Point[]} point The Points to use 
 * @param {float} x The value of x to calculate at
 * @return {float} The value of the interpolating function at that point
 */
function evalSpline(points, x){
    var i = 1;
    while(points[i].x<x) i++;
    
    var t = (x - points[i-1].x) / (points[i].x - points[i-1].x);
		
    var a =  points[i-1].m*(points[i].x-points[i-1].x) - (points[i].y-points[i-1].y);
    var b = -points[i].m*(points[i].x-points[i-1].x) + (points[i].y-points[i-1].y);
		
    var q = (1-t)*points[i-1].y + t*points[i].y + t*(1-t)*(a*(1-t)+b*t);
    return q;
}

/**
 * Maps a coordinate pair {x,y} to the relevant position on a canvas using a canvasMap object
 * @param {Point} point The point to transform
 * @param {canvasMap} canvasMap The object containing data about the transformation
 *        :{canvas} .canvas The canvas to map to
 *        :{int} .maxX The maximum x value
 *        :{int} .maxY The maximum y value
 *        :{int} .minX The minimum x value
 *        :{int} .minY The minimum y value
 */
function map(point, canvasMap) {
    'use strict';
    var xPercent,
        yPercent;
    
    xPercent = (point.x - canvasMap.minX) / (canvasMap.maxX - canvasMap.minX);
    yPercent = (point.y - canvasMap.minY) / (canvasMap.maxY - canvasMap.minY);
    
    return new Point(
        xPercent * canvasMap.canvas.width,
        (1-yPercent) * canvasMap.canvas.height,
        null
    );
}

/**
 * Evaluates a given polynomial for a value of x
 * @param {float[]} poly The array of coeffients of the polynomial
 * @param {float} x The value of x to solve at
 * @return {float} The value of the polynomial at x
 */
function evalPolyn(poly, x){
    var i,
        answer = 0;
    for(i=0; i<poly.length; i+=1){
        answer += Math.pow(poly[i]*x, i+1);
    }
    return answer;
}

/**
 * Plots a list of points and their interpolation on a canvas
 * @param {String} canvasID The id of the canvas to use
 * @param {Point[]} points An array of points
 */
function plotPath(canvasID, points) {
    'use strict';
    var i,
        x,
        interpolation,
        canvas,
        canvas_2d,
        canvasMap,
        nextPoint;
    
    interpolation = [];
    canvas =  document.getElementById(canvasID);
    canvas_2d = canvas.getContext("2d");
    
    canvasMap = {
        canvas:canvas,
        maxX:points[0].x,
        minX:points[0].x,
        maxY:points[0].y,
        minY:points[0].y
    };
    
    //Solves the interpolation and collects mapping data.
    for (i = 0; i < points.length  - 1; i += 1) {
        interpolation.push(solveSegment(points[i], points[i + 1]));
        
        if (points[i+1].x > canvasMap.maxX) {
            canvasMap.maxX = points[i + 1].x;
        } else if(points[i+1].x < canvasMap.minX) {
            canvasMap.minX = points[i + 1].x;
        }
        if (points[i+1].y > canvasMap.maxY) {
            canvasMap.maxY = points[i+1].y;
        } else if(points[i+1].y < canvasMap.minY) {
            canvasMap.minY = points[i+1].y;
        }
    }
    
    //Clears the canvas
    canvas_2d.clearRect(0,0,canvas_2d.canvas.width,canvas_2d.canvas.height);
    
    //Draws straight line
    nextPoint = map(points[0],canvasMap);
    canvas_2d.beginPath();
    canvas_2d.moveTo(nextPoint.x,nextPoint.y);
    canvas_2d.setLineDash([5]);
    canvas_2d.lineWidth = 1;
    canvas_2d.strokeStyle = "black";
    for (i = 1; i < points.length; i += 1) {
        nextPoint = map(points[i],canvasMap);
        canvas_2d.lineTo(nextPoint.x,nextPoint.y);
    }
    canvas_2d.stroke();
    
    //Draws interpolation
    var step = 0.1;
    
    nextPoint = map(points[0],canvasMap);
    canvas_2d.beginPath();
    canvas_2d.moveTo(nextPoint.x,nextPoint.y);
    canvas_2d.setLineDash([0]);
    canvas_2d.lineWidth = 2;
    canvas_2d.strokeStyle = "blue";
    
    for (i = 0; i < points.length - 1; i += 1) {
        for (x = points[i].x; x <= points[i+1].x; x += step) {
            nextPoint = map(
                new Point(x,evalSpline(points, x),null),
                canvasMap
                );
            /* Native interpolation NOT WORKING
            nextPoint = map(
                new Point(x,evalPolyn(interpolation[i],x),null),
                canvasMap
            );
            */
            canvas_2d.lineTo(nextPoint.x,nextPoint.y);
        }
    }
    canvas_2d.stroke();
    
}

function test(){
    'use strict';
    var points,
        testcanvas;
    
    points = parseInputPoints(document.getElementById("Input-Sequence").value,0,0);
    plotPath("Canvas-Path", points);
    
    testcanvas = document.getElementById("Canvas-Path").getContext("2d");
    testcanvas.beginPath();
    testcanvas.rect(10,10,20,20);
    testcanvas.fillStyle = "red";
    testcanvas.fill();
}