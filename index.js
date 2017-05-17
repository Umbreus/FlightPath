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