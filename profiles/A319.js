
module.exports = {
  drNvar: [{
    value: 0,
    dref: 'AirbusFBW/NoseGearInd',
    freq: 1
  }, {
    value: 0,
    dref: 'AirbusFBW/LeftGearInd',
    freq: 1
  }, {
    value: 0,
    dref: 'AirbusFBW/RightGearInd',
    freq: 1
  },
  {
    value: -1,
    process: (profile) => {
      if (profile.drNvar[0].value === profile.drNvar[1].value && profile.drNvar[1].value === profile.drNvar[2].value) {
        return profile.drNvar[0].value;
      } else {
        return profile.drNvar[3].value;
      }
    },
    execute: (profile, vjDevice, commClient, drNvar) => {
      // console.log(drNvar.value)
      switch (drNvar.value) {
        case 0:
          commClient.gearPanel.send('');
          break;
        case 1:
          commClient.gearPanel.send('UNLOCKED');
          break;
        case 2:
          commClient.gearPanel.send('DN&LOCKED');
          break;
        case 3:
          commClient.gearPanel.send('IN TRANSIT');
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
