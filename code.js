// Here are some globals that are useful
var _response;
var finalResult;

function greedySetCover(universalSet, setOfSets, check, printUpdates) {
    if (typeof check == 'undefined') {
        check = false;
    }
    if (typeof printUpdates == 'undefined') {
        printUpdates = false;
    }
    if (check) {
        var union = _.union(universalSet);
        if (_.intersection(union, universalSet).length != universalSet.length) {
            throw "universalSet != union(universalSet) (in size at least)";
        }
        var outliers = _.reject(
            setOfSets,
            function(set) {return _.difference(set, universalSet).length == 0});
        if (outliers.length > 0) {
            throw "setOfSets contains a set whose contents weren't in universalSet";
        }
        if (printUpdates) {
            console.log("checks passed")
        }
    }

    // Shallow copy, universalSet is just an array of elements (strings, etc.)
    var uncovered = _.clone(universalSet);
    // Deep copy of setOfSets. Sets will be deleted from this.
    var arrayOfArrays = setOfSets.map(function(x) { return x; });

    // This will contain the set cover
    var cover = [];

    // While (we don't exhaust our supply of lists)
    while (arrayOfArrays.length != 0) {
        // for each set left in arrayOfArrays (which we're deleting from), find
        // its overlap with uncovered elements
        for (var i = 0, lst = arrayOfArrays[i], maxNewCover = -1,
                 argmaxNewCover;
             i < arrayOfArrays.length; i++, lst = arrayOfArrays[i]) {
            if (lst.length >= maxNewCover) {  // this is simply an optimization
                var overlap = _.intersection(lst, uncovered);
                if (overlap.length > maxNewCover) {
                    maxNewCover = overlap.length;
                    argmaxNewCover = i;
                }
            }
        }

        // No sets found that will extend cover
        if (maxNewCover <= 0) {
            break;
        }

        // Remove the maximally-coverage-expanding set from arrayOfArrays and
        // add it to the return list
        var toAdd = arrayOfArrays.splice(argmaxNewCover, 1)[0];
        cover.push(toAdd);

        // Delete the newly added set's contents from the set of uncovered
        // elements
        uncovered = _.difference(uncovered, toAdd);

        if (printUpdates) {
            console.log("uncovered length", uncovered.length,
                        "; sets remaining", arrayOfArrays.length);
        }
    }
    return cover;
}

function findCompounds(text, allowed) {
    var broadRe = XRegExp(
        '(?:^|[^\\p{Han}])([' + allowed + ']{2,25})(?:$|[^\\p{Han}])', 'g');
    var narrowRe = RegExp('[' + allowed + ']+');
    return text.match(broadRe)
        .map(function(s) { return s.match(narrowRe)[0]; });
}

d3.xhr('edict_sub.txt', 'text/plain', function(err, req) {
    if (err) {
        return console.error(err);
    }

    // Get the contents of EDICT
    _response = req.responseText;

    // Find all sequences of kanji that consist solely of RTK1
    var rtk1Compounds = findCompounds(_response, KANJI.slice(0, 2200));
    // var rtk13Compounds = findCompounds(_response, KANJI);

    // FOR DEBUG PURPOSES ONLY: run with just a few compounds to make sure
    // everything works. COMMENT THIS OUT FOR FULL LIST (will take a few
    // minutes).
    rtk1Compounds = rtk1Compounds.slice(0, 50);

    // Find an approximation to the set cover problem (finding the smallest
    // subset of compounds that, taken together, contain all kanji in RTK1)
    var cover = greedySetCover(
        KANJI.slice(0, 2200).split(""),
        rtk1Compounds.map(function(s) { return s.split(""); }), true, true);

    // Display the results as text in the browser
    d3.select("#cont").selectAll("p").data(cover).enter().append("p").text(
        function(d, i) {return d.join("")});
});

// Tester helper only.
function getOnline(url) {
    d3.xhr(url, 'text/plain', function(err, req) {
        if (err) {
            return console.error(err);
        }
        _response = req.responseText;
    });
}