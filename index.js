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
 * @param {float} startGradient The gradient at the last point
 * @return {Point[]} An array of all Points in the order input
 */
function parseInputPoints(input, startGradient, endGradient) {
    'use strict';
    var i,
        j,
        thisGradient,
        pointFloatArray,
        pointArray;
    
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
        switch (i) {
        case 0:
            thisGradient = startGradient;
            break;
        case pointFloatArray.length:
            thisGradient = endGradient;
            break;
        default:
            thisGradient = gradient(pointArray[i - 1], pointArray[i + 1]);
        }
        pointArray.push(
            new Point(
                pointFloatArray[i][0],
                pointFloatArray[i][1],
                thisGradient
            )
        );
    }
    
    return pointArray;
}

/**
 * Solves the interpolating cubic between two Points, returning an array of coefficients such that the value at x is Σ(Math.pow(return[i],i+1))
 * Uses solutions generated by Wolfram Mathematica,
 * For points A and B in the format P[x, y, m]
 * @param {Point} point1 The first Point to use 
 * @param {Point} point2 The second Point to use
 * @return {float[]} The array of coeffients of the solution
 */
function solveSegment(point1, point2) {
    'use strict';
    //An array holding coefficients for the equation ax^3 + bx^2 + cx + d
    var cubic;
    /*
    Solves for d
    d -> -((-3 A[1] A[2] B[1]^2 + A[1]^2 A[3] B[1]^2 + A[2] B[1]^3 - A[1] A[3] B[1]^3 - A[1]^3 B[2] + 3 A[1]^2 B[1] B[2] + A[1]^3 B[1] B[3] - A[1]^2 B[1]^2 B[3])/(A[1] - B[1])^3)
    */
    cubic.push(
        -((-3 * point1.x * point1.y * Math.pow(point1.x, 2) +  Math.pow(point1.x, 2) * point1.m * Math.pow(point1.x, 2) + point1.y * Math.pow(point1.x, 3) - point1.x * point1.m * Math.pow(point1.x, 3) -  Math.pow(point1.x, 3) * point1.y + 3 * Math.pow(point1.x, 2) * point1.x * point1.y + Math.pow(point1.x, 3) * point1.x * point1.m - Math.pow(point1.x, 2) * Math.pow(point1.x, 2) * point1.m) / Math.pow((point1.x - point1.x), 3))
    );
    /*
    Solves for c
    c -> -((6 A[1] A[2] B[1] - 2 A[1]^2 A[3] B[1] + A[1] A[3] B[1]^2 + A[3] B[1]^3 - 6 A[1] B[1] B[2] - A[1]^3 B[3] - A[1]^2 B[1] B[3] + 2 A[1] B[1]^2 B[3])/(A[1] - B[1])^3)
    */
    cubic.push(
    );
    /*
    Solves for b
    b -> -((-3 A[1] A[2] + A[1]^2 A[3] - 3 A[2] B[1] + A[1] A[3] B[1] - 2 A[3] B[1]^2 + 3 A[1] B[2] + 3 B[1] B[2] + 2 A[1]^2 B[3] - A[1] B[1] B[3] - B[1]^2 B[3])/(A[1] - B[1])^3)
    */
    cubic.push(
    );
    /*
    Solves for a
    a -> -((2 A[2] - A[1] A[3] + A[3] B[1] - 2 B[2] - A[1] B[3] + B[1] B[3])/(A[1] - B[1])^3)
    */
    cubic.push(

    );
}