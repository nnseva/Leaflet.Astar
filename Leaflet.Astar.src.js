(function() {
    // Interface for Astar-capable object
    L.AstarCapableMixin = {
        // gets unique node id
        getNodeId: function(node) {
        },
        // gets list of nodes near to latlng passed
        getNearTo: function(ll) {
        },
        // gets list of nodes following to passed node
        getNextTo: function(node) {
        },
        // evaluates the criterion (less is better) for node relatively to from_node, distance f.e.
        getDistanceBetween: function(from_node,node) {
        },
        // evaluates the draft criterion (less is better) for node relatively to ll latlng, distance f.e.
        getDistanceTo: function(node,ll) {
        },
    };
    // Astar implementation
    L.Astar = L.Class.extend({
        __version__:"0.0.1",
        options: {
            max_depth:15,
            max_steps:150,
        },
        // initializes Astar on AstarCapable obj, making max_depth steps and returning the best path from ll_from to ll_to found
        initialize: function(obj,ll_from,ll_to,max_distance,options) {
            L.Util.setOptions(this,options);
            this.obj = obj;
            this.ll_from = ll_from;
            this.ll_to = ll_to;
            this.max_distance = max_distance;
            this._closed = this._makeVertexMap([]);
            this._open = this._makeVertexMap(this.obj.getNearTo(this.ll_from));
            var that = this;
            $.each(this._open,function(id,o) {
                o.distance = o.fromStart = that.obj.getDistanceTo(o.node,that.ll_from);
            });
            this._target = this._makeVertexMap(this.obj.getNearTo(this.ll_to));
            this._found = null;
            this._draft_path = null;
        },
        // evaluates Astar using parameters passed while init, making loop of astarStep's and returning the path found
        run: function() {
            var r;
            for(var i=0; true ;i++ ) {
                var r = this.step();
                if( r )
                    break;
                if( this.options.max_steps ) {
                    if( i >= this.options.max_steps ) {
                        if( !this.termination_reason ) {
                            this.termination_reason = "max_steps:"+this.options.max_steps;
                        }
                        break;
                    }
                }
            }
            return this.path();
        },
        // makes one step of algorithm, returns true if the algorithm has been finished successfully
        step: function() {
            if( $.isEmptyObject(this._open) ) {
                    if( $.isEmptyObject(this._closed) ) {
                        this.termination_reason = "no start nodes";
                    } else {
                        this.termination_reason = "graph exhausted";
                    }
                return true;
            }
            var that = this;
            var cheapest = this._pickCheapest();
            if( !cheapest ) {
                this.termination_reason = "graph exhausted";
                return true;
            }
            if( cheapest.id in this._target ) {
                this._found = cheapest;
                this._draft_path = cheapest;
                    this.termination_reason = "found";
                return true;
            }
            if( !this._draft_path ) {
                this._draft_path = cheapest;
            } else {
                if( this._draft_path.toEnd > cheapest.toEnd ) {
                    this._draft_path = cheapest;
                } else if(this._draft_path.toEnd == cheapest.toEnd ) {
                    if( this._draft_path.fromStart > cheapest.fromStart ) {
                        this._draft_path = cheapest;
                    }
                }
            }
            var successors = this.obj.getNextTo(cheapest.node);
            var nonclosed = [];
            $.each(successors,function(i,s) {
                if( that.obj.getNodeId(s) in that._closed )
                    return;
                nonclosed.push(s);
            });
            this._open = this._makeVertexMap(nonclosed,this._open,cheapest);
            this._closed[cheapest.id] = cheapest;
            return false;
        },
        // returns the best path found
        path: function() {
            var v = this._found ? this._found:this._draft_path;
            var path = [];
            while( v ) {
                path.unshift(v.node);
                v = v.from;
            }
            return path;
        },

        _getCheapest: function() {
            var d = null;
            var that = this;
            $.each(this._open,function(k,v) {
                if( !d ) {
                    d = v;
                    return;
                }
                if( d.fromStart + d.toEnd > v.fromStart + d.toEnd )
                    d = v;
            });
            return d;
        },

        _pickCheapest: function() {
            var d = this._getCheapest();
            if( d ) {
                delete this._open[d.id];
            }
            return d;
        },

        _makeVertexMap: function(nodelist,vertexmap,from) {
            if( !vertexmap )
                vertextmap = {};
            var that = this;
            var r = $.extend({},vertexmap);
            $.each(nodelist,function(i,n) {
                var v = that._makeVertex(n,from);
                if( v.id in r ) {
                    if( r[v.id].fromStart > v.fromStart )
                        r[v.id] = v;
                } else {
                    var skip = false;
                    if( that.max_distance ) {
                        if( v.fromStart > that.max_distance ) {
                            this.termination_reason = "max_distance:"+that.max_distance;
                            skip = true;
                        }
                    }
                    if( that.max_depth ) {
                        if( v.depth > that.max_depth ) {
                            this.termination_reason = "max_depth:"+that.max_depth;
                            skip = true;
                        }
                    }
                    if( !skip ) {
                        this.termination_reason = "";
                        r[v.id] = v;
                    }
                }
            });
            return r;
        },
        _makeVertex: function(n,from) {
            var fromStart = 0;
            var distance = 0;
            var depth = 0;
            if( from ) {
                fromStart = from.fromStart;
                distance = this.obj.getDistanceBetween(from.node,n);
                depth = from.depth + 1;
            }
            var id = this.obj.getNodeId(n);
            return {
                id:id,
                node:n,
                distance:distance,
                from:from,
                fromStart:fromStart + distance,
                depth: depth,
                toEnd: this.obj.getDistanceTo(n,this.ll_to),
            };
        },
    });
})();
