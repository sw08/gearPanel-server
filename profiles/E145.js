
module.exports = {
  drNvar: [{
    value: 0,
    dref: 'sim/cockpit2/annunciators/gear_unsafe',
    freq: 1
  }, {
    value: 0,
    dref: 'sim/cockpit/switches/gear_handle_status',
    freq: 1
  },
  {
    value: -1,
    process: (profile) => {
      // console.log(profile.drNvar[0].value, profile.drNvar[1].value, profile.drNvar[2].value)
      if (profile.drNvar[0].value) {
        return 2;
      } else if (profile.drNvar[2].value === 3 || (profile.drNvar[2].value === -1 && !profile.drNvar[1].value)) {
        return 3;
      } else {
        return profile.drNvar[1].value;
      }
    },
    execute: (profile, vjDevice, commClient, drNvar) => {
      // console.log(drNvar.value)
      switch (drNvar.value) {
        case 0:
          commClient.gearPanel.send('UP');
          profile.drNvar[2].delay = setTimeout(() => {
            commClient.gearPanel.send('');
            profile.drNvar[2].value = 3;
            profile.drNvar[2].delay = undefined;
          }, 10000);
          break;
        case 1:
          clearTimeout(profile.drNvar[2].delay);
          profile.drNvar[2].delay = undefined;
          commClient.gearPanel.send('DOWN&GREEN');
          break;
        case 2:
          clearTimeout(profile.drNvar[2].delay);
          profile.drNvar[2].delay = undefined;
          commClient.gearPanel.send('IN TRANSIT');
          break;
        case 3:
          clearTimeout(profile.drNvar[2].delay);
          profile.drNvar[2].delay = undefined;
          commClient.gearPanel.send('');
          break;
      }
    },
    device: 'gearPanel'
  }

  ],
  command: {
    1: (profile, udpClient) => {
      udpClient.executeCommand('sim/flight_controls/landing_gear_up');
    },
    2: (profile, udpClient) => {
      udpClient.executeCommand('sim/flight_controls/landing_gear_down');
    }
  }
};
