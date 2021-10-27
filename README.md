# CIS 566 Homework 4: L-systemss
Sharon Dong (PennKey: sharondo)

![screenshot](christmastree.PNG)

![screenshot](lights.gif)

## L-system
- The tree is created using 5 different expansion rules and many, many drawing rules. I started with a set of rules from http://paulbourke.net/fractals/lsys/, and then modified it to what I wanted. Then I translated this into 3D.

Original            |  Modified
:-------------------------:|:-------------------------:
![](lsystem1.PNG)  |  ![](lsystem2.PNG)

- Many drawing operations use randomness to pick an angle that will control how to draw a branch or pine needle
- There are 3 different objs used for: trunk/branch, pine needle, light

## Modifiable Features
- Color of the lights
- Angle of the tree branches changes by setting the angle of drawing rules

Angle level 0             |  Angle level 5
:-------------------------:|:-------------------------:
![](treeAngle1.PNG)  |  ![](treeAngle2.PNG)

- Spareseness of the pine needles changes by adding symbols to expansion rules

Spareseness level 1        |  Spareseness level 2
:-------------------------:|:-------------------------:
![](treeSparse1.PNG)  |  ![](treeSparse2.PNG)

## Backdrop
- Stars placed with voronoi points
- Mountain range and horizon line sillouettes created with 1D fbm
- Sky and ground gradient interpolated with bias function
