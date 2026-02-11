
module.exports = {
  drNvar: [{
    value: 0,
    dref: 'sim/cockpit2/annunciators/gear_unsafe',
    freq: 1
  }, {
    value: 1,
    dref: 'sim/custom/xap/An24_hydro/gear_rotary',
    process: (profile, value) => value + 1,
    freq: 1
  },
  {
    value: -1,
    process: (profile) => {
      if (profile.drNvar[0].value) {
        return 3;
      } else {
        return profile.drNvar[1].value;
      }
    },
    execute: (profile, vjDevice, commClient, drNvar) => {
      // console.log(drNvar.value)
      switch (drNvar.value) {
        case 0:
          commClient.gearPanel.send('UP&LOCKED');
          break;
        case 1:
          commClient.gearPanel.send('');
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
      udpClient.executeCommand('sim/flight_controls/landing_gear_up');
    },
    2: (profile, udpClient) => {
      udpClient.executeCommand('sim/flight_controls/landing_gear_down');
      udpClient.executeCommand('sim/flight_controls/landing_gear_down');
    },
    0: (profile, udpClient) => {
      if (profile.drNvar[1].value === 0) {
        udpClient.executeCommand('sim/flight_controls/landing_gear_down');
      } else if (profile.drNvar[1].value === 2) {
        udpClient.executeCommand('sim/flight_controls/landing_gear_up');
      }
    }
  }
};
