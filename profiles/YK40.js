
module.exports = {
  drNvar: [{
    value: 0,
    dref: 'sim/aircraft/parts/acf_gear_deploy[0]',
    freq: 1
  }, {
    value: 0,
    dref: 'sim/aircraft/parts/acf_gear_deploy[1]',
    freq: 1
  }, {
    value: 0,
    dref: 'sim/aircraft/parts/acf_gear_deploy[2]',
    freq: 1
  },
  {
    value: 3,
    process: (profile) => {
      if (profile.drNvar[0].value === profile.drNvar[1].value && profile.drNvar[1].value === profile.drNvar[2].value) {
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
  command: [
    null,
    'sim/flight_controls/landing_gear_up',
    'sim/flight_controls/landing_gear_down'
  ]
};
