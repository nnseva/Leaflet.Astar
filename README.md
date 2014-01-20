Leaflet.Astar
=============

Astar (A*) algorithm implementation intended to be used in Leaflet-based applications.

The algorithm was implemented to be useable in almost any environment. It does not implement the graph itself, using user-defined graph implementation instead. The user should implement 4 simple methods, trivial more or less, for graph to be analized by the algorithm.

Moreover, graph data and coordinates are fully opaque for the algorithm. User can pass any type of coordinates, as well as any type of nodes to the algorithm. The algorithm uses no any implications for these parameters and passes them unmodified to correspondent methods of the user-defined graph object.

Requirements
============

The algorithm code uses Leaflet (L.Class) and jQuery (some number of utility functions).

Using
=====

Installation and deployment
---------------------------

1. Download the packet and copy the Leaflet.Astar.src.js file to your site static files repository.
2. Insert something like `<script src="/static/contrib/Leaflet.Astar/Leaflet.Astar.src.js"></script>` accordingly to the static file repository URL somewhere after Leaflet script loading code.

Prepare your code
-----------------

You should implement the Astar capable graph source which will correspond the L.AstarCapableMixin interface.

```javascript
    var MyAstarCapableGraph = L.Class.extend({
        // gets unique node id
        getNodeId: function(node) {...},
        // gets list of nodes near to ll coordinates passed
        getNearTo: function(ll) {...},
        // gets list of nodes following to passed node
        getNextTo: function(node) {...},
        // evaluates the criterion (less is better) for node relatively to from_node, distance f.e.
        getDistanceBetween: function(from_node,node) {...},
        // evaluates the draft criterion (less is better) for node relatively to ll coordinates, distance f.e.
        getDistanceTo: function(node,ll) {...},
        ...
    }
```

Call the algorithm
------------------

1. Create Astar instance passing graph source as a first parameter.
2. Call `run()` method of the algorithm and get path returned ...
3. ..., or call `step()` method repeatedly while it returns false, and get the path using `path()` method of the algorithm object. You can get the path after every `step()` call having the best found draft path on this step.

```javascript
    var algorithm = new L.Astar(graph,ll_from,ll_to,max_distance_you_like,options_you_like);
    ...
    var path = algorithm.run();
```

Astar algorithm parameters
--------------------------

1. Astar capable graph source object. Any object supporting `L.AstarCapableMixin` interface.
2. Coordinates where the algorithm should be started. Coordinates are opaque for the algorithm and passed to the `getNearTo()` method of the graph unmodified.
3. Coordinates where the algorithm should be finished. Coordinates are opaque for the algorithm and passed to the `getNearTo()` method of the graph unmodified.
4. Maximal distance along the path found. Zero value has a special meaning of no restrictions.
5. Algorithm options.

Astar algorithm options
-----------------------
* `max_depth` - maximal number of nodes along the path found. Zero value has a special meaning of no restrictions
* `max_steps` - maximal number of `step()` calls inside a `run()` method (only for `run()` method call). Zero value has a special meaning of no restrictions

Astar algorithm methods
-----------------------
* `step()` - evaluates one step of the algorithm, returns `true` if the algorithm has been finished for some reason
* `run()` - evaluates algorithm steps till the path found, or one of restrictions achieved, and returns the best path found
* `path()` - returns the best path found at this moment - the list of nodes along the path

Implementation Notes
--------------------

* `getNearTo()` and `getNextTo()` graph methods must return a list or list-like object, containing node objects
* node objects returned by graph methods are opaque for the algorithm and will be passed to other graph methods (as `node` parameters) unmodified
* coordinates (`ll` parameters) passed to the algorithm constructor are opaque for the algorithm and will be passed to graph methods unmodified
* `getDistanceBetween()` method of the graph will be called by the algorithm *only* for nodes immediately linked in the graph
* distances used and returned by the algorithm and graph methods should be numbers (integer or float) supporting arithmetics and compare operators
* path returned by `run()` and `path()` methods of the algorithm is a list of nodes

See also into the code to discover details.
