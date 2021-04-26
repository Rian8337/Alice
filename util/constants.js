module.exports = {
    config: {
        name: "constants"
    },
    /**
     * @type {boolean}
     */
    maintenance: false,
    /**
     * @type {string}
     */
    maintenanceReason: "",
    /**
     * @type {string[]}
     */
    globallyDisabledCommands: [],
    /**
     * @type {{channelID: string, disabledCommands: string[]}[]}
     */
    channelDisabledCommands: [],
    /**
     * @type {{channelID: string, disabledUtils: string[]}[]}
     */
    channelDisabledUtils: [],
    /**
     * @type {[string, string][]}
     */
    currentMap: [],
    /**
     * @type {number}
     */
    commandCooldown: 0,

    /**
     * Called upon bot start.
     * 
     * @param {{channelID: string, disabledCommands: {name: string, cooldown: number}[], disabledUtils: string[]}[]} disabledCommandsAndUtils
     */
    setDisabledCommandsAndUtils(disabledCommandsAndUtils) {
        disabledCommandsAndUtils.forEach(d => {
            this.channelDisabledCommands.push({
                channelID: d.channelID,
                disabledCommands: d.disabledCommands
            });
    
            this.channelDisabledUtils.push({
                channelID: d.channelID,
                disabledUtils: d.disabledUtils
            });
        });
    },

    /**
     * Called when a command is disabled/enabled in a channel.
     * 
     * @param {{channelID: string, disabledCommands: {name: string, cooldown: number}[]}} disabledCommand 
     */
    setChannelDisabledCommands(disabledCommand) {
        const channelSettingIndex = this.channelDisabledCommands.findIndex(v => v.channelID === disabledCommand.channelID);
        if (channelSettingIndex === -1) {
            this.channelDisabledCommands.push(disabledCommand);
        } else {
            this.channelDisabledCommands[channelSettingIndex] = disabledCommand;
        }
    },

    /**
     * Called when a utility is disabled/enabled in a channel.
     * 
     * @param {{channelID: string, disabledUtils: string[]}} disabledUtil 
     */
    setChannelDisabledUtils(disabledUtil) {
        const channelSettingIndex = channel_disabled_utils.findIndex(v => v.channelID === disabledUtil.channelID);
        if (channelSettingIndex === -1) {
            this.channelDisabledUtils.push({
                channelID: disabledUtil.channelID,
                disabledUtils: disabledUtil.disabledUtils
            });
        } else {
            this.channelDisabledUtils[channelSettingIndex] = {
                channelID: disabledUtil.channelID,
                disabledUtils: disabledUtil.disabledUtils
            };
        }
    }
};