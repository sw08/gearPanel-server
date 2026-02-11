
module.exports = {
  drNvar: [{
    value: 0,
    dref: 'Colimata/CON_A_LGEAR_main_strut_L_f',
    freq: 1
  }, {
    value: 0,
    dref: 'Colimata/CON_A_LGEAR_main_strut_R_f',
    freq: 1
  }, {
    value: 0,
    dref: 'Colimata/CON_A_LGEAR_nose_strut_f',
    freq: 1
  }, {
    value: 0,
    dref: 'Colimata/CON_A_LGEAR_tail_strut_f',
    freq: 1
  },
  {
    value: 3,
    process: (profile) => {
      if (profile.drNvar[0].value === profile.drNvar[1].value && profile.drNvar[1].value === profile.drNvar[2].value && profile.drNvar[2].value === profile.drNvar[3].value) {
        return profile.drNvar[0].value;
      } else {
        return 2;
      }
    },
    execute: (profile, vjDevice, commClient, drNvar) => {
      // console.log(drNvar.value)
      switch (drNvar.value) {
        case 0:
          commClient.gearPanel.send('');
          break;
        case 1:
          commClient.gearPanel.send('DN&LOCKED');
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
