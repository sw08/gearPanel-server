
module.exports = {
  drNvar: [{
    value: 0,
    dref: 'FJS/Q4XP/Annunciators/GearHandle_Lit[0]',
    freq: 1
  }, {
    value: 0,
    dref: 'FJS/Q4XP/Manips/GearDeployHandle_Ctl[0]',
    freq: 1
  },
  {
    value: 3,
    process: (profile) => {
      if (profile.drNvar[0].value) {
        return 2;
      } else {
        return profile.drNvar[1].value;
      }
    },
    execute: (profile, vjDevice, commClient, drNvar) => {
      // console.log(drNvar.value)
      switch (drNvar.value) {
        case 0:
          commClient.gearPanel.send('');
          break;
        case 1:
          commClient.gearPanel.send('DOWN&GREEN');
          break;
        case 2:
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
