// Here are some globals that are useful
var _response;
var finalResult;

// The main workhorse
d3.xhr('edict_sub.txt', 'text/plain', function(err, req) {
    if (err) {
        return console.error(err);
    }

    // Get the contents of EDICT
    _response = req.responseText;

    // Make an array of all unique compounds in EDICT, where a "compound" is any
    // consecutive sequence of kanji---note that this definition might not be
    // ideal since it might treat two adjaced compounds (not separated by any
    // whitespace/punctuation/kana) as one compound.
    var compounds = _.unique(_response.match(XRegExp('\\p{Han}+', 'g')));
    /*
    var c2 = _.compact(_.unique(_.flatten(_response.split("\n").map(
        function(line) {return line.match(XRegExp('\\p{Han}+', 'g'))}))));
    var c3 = _.filter(_response.split("\n").map(
        function(line) {return line.match(XRegExp('\\p{Han}+', 'g'))}), 'length');
    */

    // Make a list of kanji with each element having one additional kanji than
    // the last. I.e., [1 2 3] --> [[1] [1 2] [1 2 3]], except with a few
    // thousand kanji instead of 1-3.
    var kanjiArr = KANJI.split("");
    var cumKanjiList =
        _.map(kanjiArr, function(k, i) { return kanjiArr.slice(0, i + 1); });

    // The workhorse: for each kanji, find the compounds that contain only kanji
    // up to that point. Delete those compounds found from the full list so they
    // don't appear in subsequent ones (and to speed up the process).
    var perKanji = _.map(cumKanjiList, function(kanjiList) {
        var matched = _.filter(compounds, function(compound) {
            var diff = _.difference(compound.split(""), kanjiList);
            return diff.length == 0;
        });
        compounds = _.difference(compounds, matched);
        return matched;
    });
    // finalResult = perKanji;

    // Display the results as text in the browser
    d3.select("#cont").selectAll("p").data(perKanji).enter().append("p").text(
        function(list, idx) { return kanjiArr[idx] + "," + list.join(","); });
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