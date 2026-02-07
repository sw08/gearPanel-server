
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
    execute: (profile, vjDevice, wsClient, drNvar) => {
      // console.log(drNvar.value)
      switch (drNvar.value) {
        case 0:
          wsClient.gearPanel.ws.send('');
          break;
        case 1:
          wsClient.gearPanel.ws.send('UNLOCKED');
          break;
        case 2:
          wsClient.gearPanel.ws.send('DN&LOCKED');
          break;
        case 3:
          wsClient.gearPanel.ws.send('IN TRANSIT');
          break;
      }
    },
    device: 'gearPanel',
    counter: 10,
    n: 0
  }

  ],
  command: [
    null,
    'sim/flight_controls/landing_gear_up',
    'sim/flight_controls/landing_gear_down'
  ]
};
