define(function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var TreeData = require("ace_tree/data_provider");
    var escapeHTML = require("ace/lib/lang").escapeHTML;
    
    var DataProvider = function(root) {
        TreeData.call(this, root);
        this.rowHeight = 18;
    };
    oop.inherits(DataProvider, TreeData);
    
    (function() {
            
        this.getChildren = function(node) {
            var children = node.variables || node.properties || node.items;
            if (!children && node.status === undefined)
                node.status = "pending";
            var ch = children && children[0] && children[0];
            if (ch) {
                var d = (node.$depth + 1) || 0;
                children.forEach(function(n) {
                    n.$depth = d;
                    n.parent = node;
                });
            }
    
            if (this.$sortNodes && !node.$sorted) {
                children && this.sort(children);
            }
            return children;
        };
        
        this.hasChildren = function(node) {
            return node.status === "loaded"
                ? (node.variables || node.properties || node.items || []).length
                : node.children || node.tagName == "scope";
        };
        
        this.getCaptionHTML = function(node) {
            if (node.tagName == "scope")
                return escapeHTML((node.name || "Scope") + "");
            return escapeHTML(node.name + "");
        };
        
        this.sort = function(children) {
            var compare = TreeData.alphanumCompare;
            return children.sort(function(a, b) {
                var aIsSpecial = a.tagName == "scope";
                var bIsSpecial = b.tagName == "scope";
                if (aIsSpecial && !bIsSpecial) return 1;
                if (!aIsSpecial && bIsSpecial) return -1;
                if (aIsSpecial && bIsSpecial) return a.index - b.index;
                
                return compare(a.name + "", b.name + "");
            });
        };
        
        this.updateNode = function(node) {
            var isOpen = node.isOpen;
            this.close(node, null, true);
            if (isOpen)
                this.open(node, null, true);
        };
        
        this.getIconHTML = function(node) {
            return node.isNew ? "" : "<span class='dbgVarIcon'></span>";
        };
        
        this.getClassName = function(node) {
            return (node.className || "")
                + (node.status == "loading" ? " loading" : "")
                + (node.error ? " watcherror" : "");
        };

    }).call(DataProvider.prototype);
 
    return DataProvider;
});

