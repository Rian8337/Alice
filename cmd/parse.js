
var Replay = function() {
	this.ReadArray = function(length) {
		var data = this.program.slice(this.position, this.position + length);
		this.position += length;
		return data;
	};

	this.ReadInt = function(length) {
		var data = this.program.slice(this.position, this.position + length);
		this.position += length;
		return toInt(data);
	};

	this.ReadULEB = function() {
		// thanks wikipedia
		var result = 0;
		var shift = 0;
		while (true) {
			var b = this.program[this.position++];
			result |= (b & 0x7F) << shift;
			if ((b & 0x80) == 0) {
				break;
			}
			shift += 7;
		}
		return result;
	};

	this.ReadUntil = function(bytes) {
		var stop = false;
		while (!stop) {
			var match = true;
			for(var i=0; i<bytes.length; i++) {
				if (bytes[i] != this.program[this.position+i]) {
					match = false;
					break;
				}
			}
			if (match) {
				stop = true;
			} else {
				this.position += 1;
			}
		}
	};

	this.ReadString = function(length) {
		var data = "";
		for(var i=this.position; i<this.position+length; i++) {
			data += String.fromCharCode(this.program[i]);
		}
		this.position += length;
		return data;
	}

	this.Continue = function(length) {
		var data = this.program[this.position];
		this.position += 1;
		return data == 0x0B;
	};

	this.ParseMods = function(mods) {
		return {
			NoFail: (mods & 1) == 1,
			Easy: (mods & 2) == 2,
			NoVideo: (mods & 4) == 4,
			Hidden: (mods & 8) == 8,
			HardRock: (mods & 16) == 16,
			SuddenDeath: (mods & 32) == 32,
			DoubleTime: (mods & 64) == 64,
			Relax: (mods & 128) == 128,
			HalfTime: (mods & 256) == 256,
			Nightcore: (mods & 512) == 512,
			Flashlight: (mods & 1024) == 1024,
			Autoplay: (mods & 2048) == 2048,
			SpunOut: (mods & 4096) == 4096,
			Autopilot: (mods & 8192) == 8192,
			Perfect: (mods & 16384) == 16384,
			// there's more, but for different modes
		};
	};

	this.ParseDate = function(date) {
		date /= Math.pow(10, 4);
		var long_ago = new Date("Jan 1, 0001 00:00:00");
		long_ago.setFullYear(1);
		date += long_ago.getTime();
		return new Date(date);
	};

	this.ParseReplayKeys = function(keys) {
		return {
			M1: (keys & 1) == 1,
			M2: (keys & 2) == 2,
			K1: (keys & 5) == 5,
			K2: (keys & 10) == 10
		};
	};

	this.ParseReplayData = function(data) {
		var result = [];
		var data2 = data.split(",");
		for(var i=0; i<data2.length; i++) {
			var parts = data2[i].split("|");
			result.push({
				w: parseInt(parts[0]),
				x: parseInt(parts[1]),
				y: parseInt(parts[2]),
				z: this.ParseReplayKeys(parseInt(parts[3])),
			});
		}
		return result;
	};

	this.ParseLZMAData = function(data, callback) {
		debug("<span id='decompress_percent'>Decompressing...</span>");
		LZMA.decompress(data, function(result) {
			callback(result);
		}, function(percent) {
			$("#decompress_percent").html("Decompressing " + Math.round(percent * 10000) / 100 + "%.");
		});
	};

	this.Parse = function(program, callback) {
		// thanks scott
		this.program = program;
		this.position = 0;

		this.Mode = this.ReadInt(1);
		this.Version = this.ReadInt(4);

		this.Continue();

		this.BeatmapHashLength = this.ReadULEB();
		this.BeatmapHash = this.ReadString(this.BeatmapHashLength);

		this.Continue();


		this.UsernameLength = this.ReadULEB();
		this.Username = this.ReadString(this.UsernameLength);

		this.Continue();

		this.ReplayHashLength = this.ReadULEB();
		this.ReplayHash = this.ReadString(this.ReplayHashLength);

		this.H300 = this.ReadInt(2);
		this.H100 = this.ReadInt(2);
		this.H50 = this.ReadInt(2);
		this.HGeki = this.ReadInt(2);
		this.HKatu = this.ReadInt(2);
		this.HMiss = this.ReadInt(2);

		this.Score = this.ReadInt(4);
		this.MaxCombo = this.ReadInt(2);
		this.FullCombo = this.ReadInt(1) == 1;

		this.Mods = this.ParseMods(this.ReadInt(4));

		this.Continue();

		this.PerformanceGraphDataLength = this.ReadULEB();
		this.PerformanceGraphData = this.ReadString(this.PerformanceGraphDataLength);

		this.Timestamp = this.ParseDate(this.ReadInt(8));

		this.ReplayDataLength = this.ReadULEB();
		this.ReadUntil([ 0x5D, 0x00, 0x00 ]);
		this.ParseLZMAData(this.program.slice(this.position), function(replayData) {
			console.log("Done parsing.");
			callback(replayData);
		});
	};
};

module.exports.run = (client, message, args) => {
	var R = new Replay;
	
}

module.exports.help = {
	name: "parse"
}
