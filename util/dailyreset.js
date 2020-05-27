module.exports.run = alicedb => {
    const pointdb = alicedb.collection("playerpoints");
    const time = Math.floor(Date.now() / 1000);
    pointdb.findOne({discordid: "386742340968120321"}, (err, res) => {
        if (err) return console.log(err);
        const dailyreset = res.dailyreset;
        if (dailyreset > time) return;
        let updateVal = {
            $set: {
                dailyreset: time + 86400
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
            pointdb.updateMany({transferred: {$gt: 0}}, updateVal, err => {
                if (err) return console.log(err)
            })
        })
    })
};

module.exports.config = {
    name: "dailyreset"
};