let reset_time = 0;

module.exports.run = alicedb => {
    const pointdb = alicedb.collection("playerpoints");
    const time = Math.floor(Date.now() / 1000);
    if (reset_time > time) return;
    pointdb.findOne({discordid: "386742340968120321"}, (err, res) => {
        if (err) return console.log(err);
        const dailyreset = res.dailyreset;
        if (!reset_time) reset_time = dailyreset;
        if (dailyreset > time) return;
        console.log("Resetting daily claim");
        let updateVal = {
            $set: {
                dailyreset: dailyreset + 86400
            }
        };
        pointdb.updateOne({discordid: "386742340968120321"}, updateVal, err => {
            if (err) return console.log(err);
            updateVal = {
                $set: {
                    hasSubmittedMapShare: false,
                    transferred: 0
                }
            };
            pointdb.updateMany({}, updateVal, err => {
                if (err) return console.log(err);
                updateVal = {
                    $set: {
                        streak: 0
                    }
                };
                pointdb.updateMany({hasClaimedDaily: false}, updateVal, err => {
                    if (err) return console.log(err);
                    updateVal = {
                        $set: {
                            hasClaimedDaily: false
                        }
                    };
                    pointdb.updateMany({}, updateVal, err => {
                        if (err) return console.log(err)
                    })
                })
            })
        })
    })
};

module.exports.config = {
    name: "dailyreset"
};
