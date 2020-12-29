const { getKelvin, getMired } = require('./utils');

module.exports = {
    upgradeV1_2_0(config, actions, releaseActions, feedbacks) {
        let changed = false;

        const upgradeActions = (actions, changed) => {
            actions.forEach((action) => {
                if (action.action === 'colortemp') {
                    const kelvin = getKelvin(parseInt(action.options.temp));
                    const mired = getMired(kelvin);

                    if (action.options.temp !== mired) {
                        action.options.temp = mired;
                        changed = true;
                    }
                }
            });

            return changed;
        };

        changed = upgradeActions(actions);
        changed = upgradeActions(releaseActions);

        return changed;
    },

    upgrade() {
        this.addUpgradeScript(this.upgradeV1_2_0);
    }
}
