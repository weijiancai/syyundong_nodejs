exports.Sport = function() {
    var games = [];
    var activities = [];
    var venues = [];
    var pidGames = {};

    this.initData = function(data) {
        var length = data.length;

        for(var i = 0; i < length; i++) {
            var row = data[i];
            var level = row['level'];
            var type = row['sport_type'];
            if(type == 1) {
                var pid = row['pid'];
                if(pid == 0) {
                    row.child = [];
                    games.push(row);
                } else {
                    for(var j = 0; j < games.length; j++) {
                        if(games[j]['id'] == pid) {
                            games[j].child.push(row);
                        }
                    }
                }
            } else if(type == 2) {
                activities.push(row);
            } else if(type == 3) {
                venues.push(row);
            }
        }

        for(i = 0; i < games.length; i++) {
            pidGames[games[i]['id'] + ''] = games[i].child;
        }
    };

    this.getGames = function() {
        return games;
    };

    this.getActivities = function() {
        return activities;
    };

    this.getVenues = function() {
        return venues;
    };

    this.getGamesByPid = function(pid) {
        return pidGames[pid + ''];
    }
};