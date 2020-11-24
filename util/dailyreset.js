let resetTime = 0;

module.exports.run = (client, alicedb) => {
    const pointdb = alicedb.collection("playerpoints");
    const time = Math.floor(Date.now() / 1000);
    if (resetTime > time) {
        return;
    }
    pointdb.findOne({discordid: "386742340968120321"}, (err, res) => {
        if (err) {
            return console.log(err);
        }
        const dailyreset = res.dailyreset;
        if (!resetTime) {
            resetTime = dailyreset;
        }
        if (resetTime > time) {
            return;
        }
        console.log("Resetting daily claim");
        console.log("Running message analytics");
        client.utils.get("messageanalytics").run(client, alicedb, (resetTime - 86400) * 1000);
        resetTime += 86400;
        let updateVal = {
            $inc: {
                dailyreset: 86400
            }
        };
        pointdb.updateOne({discordid: "386742340968120321"}, updateVal, err => {
            if (err) {
                return console.log(err);
            }
            updateVal = {
                $set: {
                    hasSubmittedMapShare: false,
                    transferred: 0
                }
            };
            pointdb.updateMany({}, updateVal, err => {
                if (err) {
                    return console.log(err);
                }
                updateVal = {
                    $set: {
                        streak: 0
                    }
                };
                pointdb.updateMany({hasClaimedDaily: false}, updateVal, err => {
                    if (err) {
                        return console.log(err);
                    }
                    updateVal = {
                        $set: {
                            hasClaimedDaily: false
                        }
                    };
                    pointdb.updateMany({}, updateVal, err => {
                        if (err) {
                            return console.log(err);
                        }
                    });
                });
            });
        });
    });
};

module.exports.config = {
    name: "dailyreset"
};